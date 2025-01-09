const mongoose = require('mongoose');

const postSchema = mongoose.schema({
    title:{
        type: String,
        required: [true, 'The title is required'],
        trim:true,
    },
     description:{
        type:String,
        required: [true, 'The description is required'],
        trim:true,
        maxlength:[500, 'Description should not exceed 500 characters']
     },
     userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'The user ID is required']
     }

},{
    timestamps: true
})

module.exports = mongoose.model('Post', postSchema)