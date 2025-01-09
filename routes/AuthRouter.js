const express = require('express');
const { signup,login, logout,sendVerificationCode,verifyVerificationCode,changePassword } = require('../controllers/useController');
const { identifier } = require('../middlewares/identification');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout',identifier ,logout)
router.patch('/send-verification-code', sendVerificationCode)
router.patch('/verify-verification-code',identifier,verifyVerificationCode)
router.patch('/change-password',identifier,changePassword)
module.exports = router;