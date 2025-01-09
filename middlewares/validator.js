const Joi = require('joi')

exports.signupSchema = Joi.object({
    email: Joi.string().min(6).max(50).required().email({
        tlds: { allow: ['com', 'net', 'org'] }
    }
    ),
    password: Joi.string().required().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$'))

})

exports.loginSchema = Joi.object({
    email: Joi.string().min(6).max(50).required().email(
        {
            tlds: { allow: ['com', 'net', 'org'] }
        }
    ),
    password: Joi.string().required().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$'))
})


exports.acceptCodeSchema = Joi.object({
    email: Joi.string().min(6).max(60).required().email(
        {
            tlds: {allows:['com','net']}
        }
    ),
    providedCode : Joi.number().required()
})

exports.changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required()
})