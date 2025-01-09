const express = require("express");
const {
  signup,
  login,
  logout,
  sendVerificationCode,
  verifyVerificationCode,
  changePassword,
  sendForgotPasswordCode,
  verifyForgotPasswordCode,
} = require("../controllers/useController");
const { identifier } = require("../middlewares/identification");
const { verify } = require("../middlewares/sendEmail");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", identifier, logout);
router.patch("/send-verification-code", sendVerificationCode);
router.patch("/verify-verification-code", identifier, verifyVerificationCode);
router.patch("/change-password", identifier, changePassword);
router.patch("/send-forgot-password-code", sendForgotPasswordCode);
router.patch("/verify-forgot-password-code", verifyForgotPasswordCode);
module.exports = router;
