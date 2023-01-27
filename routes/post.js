import express from "express";
import formidable from "express-formidable";
import { addComment, createPost, getPostWithUserId, likePost, newsFeed, removeComment, unlikePost, uploadImage } from "../controllers/post.js";

const router = express.Router();

router.route('/').get( async(req,res)=>{
    res.json({msg: "post route"});
})

router.route('/create-post').post(createPost);
router.route('/news-feed/').get(newsFeed);
//upload image
router.route('/upload-image').post(formidable() ,uploadImage);

//interact
// like
router.route("/like-post").put(likePost);
router.route("/unlike-post").put(unlikePost);

router.route('/getPostWithUser/:userId').get(getPostWithUserId);

router.route('/add-comment').put(addComment);
router.route('/remove-comment').put(removeComment);
export default router;