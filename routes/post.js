import express  from "express";
import formidable from "express-formidable";
import { createPost, uploadImage } from "../controllers/post.js";

const router = express.Router();

router.route('/').get( async(req,res)=>{
    res.json({msg: "post route"});
})

router.route('/create-post').post(createPost);

//upload image
router.route('/upload-image').post(formidable ,uploadImage);

export default router;