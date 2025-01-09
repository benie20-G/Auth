const mongoose = require('mongoose');


const  userSchema = mongoose.Schema({
    email:{
        type:String,
        required: [true, "email is required"],
        uniquie: [true, " email must be uniquire"],
        trim:true,
    },
    password:{
        type:String,
        required: [true, "password is required"],
        length: [6,"password must be at least 6 characters long"],
        trim:true,
        select:false,

    },
    verified: {
        type:Boolean,
        default:false
    },
    verificationCode:{
        type: String,
        select: false
    },
    verificationCodeValidation:{
        type: String,
        select: false
    },
    forgotPasswordCode:{
        type: String,
        select: false
    },
    forgotPasswordCodeValidation:{
        type: String,
        select: false
    },

    
},{
    timestamps: true
})

module.exports = mongoose.model('User',userSchema)