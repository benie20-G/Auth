 const jwt = require('jsonwebtoken');

 exports.identifier = (req, res, next) => {
    let token;

    // Check if the request is from a non-browser client
    if (req.headers.client === 'not-browser') {
        token = req.headers['authorization'];
        console.log(token);
    } else {
        token = req.cookies?.Authorization;
        console.log(req.cookies) // Use optional chaining for safety
        console.log("Cookie Token:", token);
    }
    // If no token is found, return an unauthorized error
    if (!token) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    try {
        // Extract and verify the token
        const userToken = token.split(' ')[1]; // Assuming "Bearer <token>"
        const jwtVerified = jwt.verify(userToken, process.env.JWT_SECRET);

        if (jwtVerified) {
            req.user = jwtVerified; // Attach user data to the request
            return next();
        } else {
            throw new Error('Error in the token');
        }
    } catch (error) {
        console.error(error.message);
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

 exports.changePassword = (req, res)=>{
    const { userId, verified} =  req.user;
    const {oldPassword, newPassword} = req.body 

    try {
        
        
    } catch (error) {
        
    }
 }