const express = require("express");
const { identifier } = require("../middlewares/identification");
const { verify } = require("../middlewares/sendEmail");
const { getPosts, getSinglePost, createPost, updatePost, deletePost } = require("../controllers/postsController");

const router = express.Router();

router.get("/all-posts", getPosts);
router.get("/single-post", getSinglePost);
router.post("/create-post",identifier, createPost);
router.put("/update-post", updatePost);
router.delete("/delete-post", deletePost);
module.exports = router;
