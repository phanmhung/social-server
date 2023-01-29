import express from "express";
import formidable from "express-formidable";
import { addComment, addReplyComment, allPosts, createPost, deletePost, deleteReplyComment, editComment, getPostWithUserId, likeComment, likePost, likeReplyComment, newsFeed, removeComment, unlikeComment, unlikePost, unlikeReplyComment, uploadImage } from "../controllers/post.js";
import  isAdmin  from "../middleware/isAdmin.js";

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

//comment
router.route('/add-comment').put(addComment);
router.route('/remove-comment').put(removeComment);
router.route("/like-comment").put(likeComment);
router.route("/unlike-comment").put(unlikeComment);
router.route("/edit-comment").patch(editComment);
router.route("/add-reply-comment").put(addReplyComment);
router.route("/like-reply-comment").put(likeReplyComment);
router.route("/unlike-reply-comment").put(unlikeReplyComment);
router.route("/delete-reply-comment").put(deleteReplyComment);

//Admin priority
router.route("/all-posts").get(isAdmin, allPosts);
router.route("/admin/delete-post/:id").delete(isAdmin, deletePost);

export default router;