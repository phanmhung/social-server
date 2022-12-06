import Post from "./../models/post.js";
import cloudinary from "cloudinary";
import User from "./../models/user.js";

cloudinary.config({ 
    cloud_name: 'dn2iwzms1', 
    api_key: '346878672592918', 
    api_secret: 'fUf6Kes8VuUFn6YlZVVHTdPPTVI' 
});

const createPost = async(req,res)=>{
    const {content, image} = req.body;
    if (!content.length){
        return res.status(400).json({message:"Content is required"});
    }

    try{
        const post = await Post.create({
            content,
            postedBy: req.user._id,
            image,
        });

        //replace the postedBy with the user object
        const postWithUser = await Post.findById(post._id).populate(
            "postedBy",
            "-password -secret"
        );

        return res.status(200).json({post:postWithUser});
    } catch (err){
        console.log(err);
        return res.status(400).json({message:"err"});
    }
};

const uploadImage = async (req,res)=>{
    try{
        const path = req.files.image.path;

        const result = await cloudinary.v2.uploader.upload(path);
        return res.status(200).json({
            url:result.url,
            public_id:result.public_id
        });

    } catch (err){
        console.log(err);
        return res.status(400).json({msg:err});
    }
};


export {
    createPost,
    uploadImage,
}