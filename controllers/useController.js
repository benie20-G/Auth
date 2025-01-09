const transport = require("../middlewares/sendEmail");
const {
  signupSchema,
  loginSchema,
  changePasswordSchema,
  acceptCodeSchema,
} = require("../middlewares/validator");
const User = require("../models/userModel");
const { dohash, dohashcompare, hmacProcess } = require("../utils/hasher");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { err, value } = await signupSchema.validate({ email, password });
    if (err) {
      res
        .status(401)
        .json({ success: false, message: "failed to register a user" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(401).json({ success: false, message: "user already exists" });
    }

    const hashedPassword = await dohash(password, 15);
    const newUser = new User({ email, password: hashedPassword });
    const result = await newUser.save();
    result.password = undefined;
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.log(error);
    res
      .status(404)
      .json({ success: false, message: "failed to register a user" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { err, value } = await loginSchema.validate({ email, password });
    if (err) {
      res
        .status(401)
        .json({ success: false, message: "failed to login a user" });
    }

    const existingUser = await User.findOne({ email }).select("+password +_id");
    if (!existingUser) {
      res.status(401).json({ success: false, message: "user does not exist" });
    }

    const isPasswordValid = await dohashcompare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: "invalid credentials " });
    }

    const token = jwt.sign(
      {
        email: existingUser.email,
        userId: existingUser._id,
        isverified: existingUser.verified,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res
      .cookie("Authorization", "Bearer " + token, {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      })
      .json({
        success: true,
        token,
        data: existingUser,
        message: "user logged in successfully",
      });
  } catch (error) {
    console.log(error);
    res.status(404).json({ success: false, message: "failed to login a user" });
  }
};

exports.logout = async (req, res) => {
  res
    .clearCookie("Authorization")
    .json({ success: true, message: "user logged out successfully" })
    .status(200);
};

exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "user does not exist" });
    }

    if (existingUser.verified) {
      return res
        .status(400)
        .json({ success: false, message: "you are already verified" });
    }

    const codeValue = Math.floor(Math.random() * 1000000).toString();
    let info = await transport.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to: existingUser.email,
      subject: "Verificatio code",
      html: "<h1>" + codeValue + "</h1>",
    });
    if (info.accepted[0] === existingUser.email) {
      const hashedCodeValue = await hmacProcess(
        codeValue,
        process.env.HMAC_VERIFICATION_CODE_SECRET
      );
      existingUser.verificationCode = hashedCodeValue;
      existingUser.verificationCodeValidation = Date.now();
      const result = await existingUser.save();

      return res
        .status(200)
        .json({ success: true, message: "code sent", data: result });
    }
    res.status(400).json({ success: false, message: "failed to send code" });
  } catch (error) {
    console.log(error);
  }
};

exports.verifyVerificationCode = async (req, res) => {
  const { email, providedCode } = req.body;

  try {
    const { error, value } = acceptCodeSchema.validate({ email, providedCode });
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const codeValue = providedCode.toString();
    const existingUser = await User.findOne({ email }).select(
      "+verificationCode +verificationCodeValidation"
    );

    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "user does not exist" });
    }

    if (existingUser.verified) {
      return res
        .status(400)
        .json({ success: false, message: " your account is arleady verified" });
    }
    console.log(existingUser.verificationCode);
    console.log(existingUser.verificationCodeValidation);
    if (
      !existingUser.verificationCode ||
      !existingUser.verificationCodeValidation
    ) {
      return res
        .status(400)
        .json({ success: false, message: "somethin is wrong with the code" });
    }

    if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 10000) {
      return res
        .status(400)
        .json({ success: false, message: "code has been expired" });
    }

    const hashedCodeValue = hmacProcess(
      codeValue,
      process.env.HMAC_VERIFICATION_CODE_SECRET
    );

    if (hashedCodeValue === existingUser.verificationCode) {
      existingUser.verified = true;
      existingUser.verificationCode = undefined;
      existingUser.verificationCodeValidation = undefined;
      await existingUser.save();

      res
        .status(200)
        .json({ success: true, message: "your account has been verified" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "unexpected error occured" });
    }
  } catch (error) {
    console.log(error);
  }
};


exports.changePassword = async (req, res) => {
    const { email, isverified} =  req.user;
    const {oldPassword, newPassword} = req.body;
    try {
        const {error, value} = await changePasswordSchema.validate({oldPassword, newPassword});
        if (error) {
            return res.status(400).json({success: false, message: error.details[0].message});
        }   
        
        console.log(isverified);
        if(!isverified){
            return res.status(400).json({success: false, message: "you are not verified user"});
        }
 
        const existingUser = await User.findOne({email}).select("+password");
         
        if(!existingUser){
            return res.status(404).json({success: false, message: "user does not exist"});
        }

        const result = await dohashcompare(oldPassword, existingUser.password);
        if(!result){
            return res.status(400).json({success: false, message: "invalid password"});
        }

        const hashedPassword = await dohash(newPassword, 15);   
        existingUser.password = hashedPassword;
        await existingUser.save();

        return  res.status(200).json({success: true, message: "password has been changed successfully"});
          

    } catch (error) {
        console.log(error);
        
    }
}


exports.sendForgotPasswordCode = async (req, res) => {
    const { email } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res
          .status(404)
          .json({ success: false, message: "user does not exist" });
      }
  
      if (existingUser.verified) {
        return res
          .status(400)
          .json({ success: false, message: "you are already verified" });
      }
  
      const codeValue = Math.floor(Math.random() * 1000000).toString();
      let info = await transport.sendMail({
        from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
        to: existingUser.email,
        subject: "Verificatio code",
        html: "<h1>" + codeValue + "</h1>",
      });
      if (info.accepted[0] === existingUser.email) {
        const hashedCodeValue = await hmacProcess(
          codeValue,
          process.env.HMAC_VERIFICATION_CODE_SECRET
        );
        existingUser.verificationCode = hashedCodeValue;
        existingUser.verificationCodeValidation = Date.now();
        const result = await existingUser.save();
  
        return res
          .status(200)
          .json({ success: true, message: "code sent", data: result });
      }
      res.status(400).json({ success: false, message: "failed to send code" });
    } catch (error) {
      console.log(error);
    }
  };
  
  exports.verifyForgotPasswordCode = async (req, res) => {
    const { email, providedCode } = req.body;
  
    try {
      const { error, value } = acceptCodeSchema.validate({ email, providedCode });
      if (error) {
        return res
          .status(400)
          .json({ success: false, message: error.details[0].message });
      }
  
      const codeValue = providedCode.toString();
      const existingUser = await User.findOne({ email }).select(
        "+verificationCode +verificationCodeValidation"
      );
  
      if (!existingUser) {
        return res
          .status(404)
          .json({ success: false, message: "user does not exist" });
      }
  
      if (existingUser.verified) {
        return res
          .status(400)
          .json({ success: false, message: " your account is arleady verified" });
      }
      console.log(existingUser.verificationCode);
      console.log(existingUser.verificationCodeValidation);
      if (
        !existingUser.verificationCode ||
        !existingUser.verificationCodeValidation
      ) {
        return res
          .status(400)
          .json({ success: false, message: "somethin is wrong with the code" });
      }
  
      if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 10000) {
        return res
          .status(400)
          .json({ success: false, message: "code has been expired" });
      }
  
      const hashedCodeValue = hmacProcess(
        codeValue,
        process.env.HMAC_VERIFICATION_CODE_SECRET
      );
  
      if (hashedCodeValue === existingUser.verificationCode) {
        existingUser.verified = true;
        existingUser.verificationCode = undefined;
        existingUser.verificationCodeValidation = undefined;
        await existingUser.save();
  
        res
          .status(200)
          .json({ success: true, message: "your account has been verified" });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "unexpected error occured" });
      }
    } catch (error) {
      console.log(error);
    }
  };




