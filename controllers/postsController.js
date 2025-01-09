const { postSchema } = require("../middlewares/validator");
const Post = require("../models/postModel");

exports.getPosts = async (req, res) => {

    const {page} = req.query
    const postsPerPage = 10;



    try {
        let pageNum = 0
        if(page<=1){
            pageNum = 0
        }
        else{
            pagNum= page-1
        }
        const posts = await Post.find().sort({createdAt: -1}).skip(pageNum*postsPerPage).limit(postsPerPage).populate({
            path: 'userId',
            select:"email",
        }); 

        return res.status(200).json({
            success: true,
            message:"ok",
            data: posts
        })  
    } catch (error) {
       console.log(error) 
    }   


}
exports.getSinglePost = async (req, res) => {
    const { _id } = req.query;
    try {
    const post = await Post.findOne({_id}).populate({
        path:'userId',
        select:'email'
    })
    return res.status(200).json({
        success: true,
        data: post
    })
    } catch (error) {
        console.log(error)
        
    }

}
exports.createPost = async (req, res) => {
    const {title, description } = req.body;
    const {userId} = req.user
    try {

        const {error, value} = await postSchema.validate({title, description,userId});
        if(error){
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            })
        }  
         
        
        const post = new Post({title, description, userId})
        const result = await post.save()
        return res.status(201).json({
            success:true,
            message:"post created successfully",
            data:result
        })

        
    } catch (error) {
        console.log(error);  
    }

}
