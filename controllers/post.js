import Post from './../models/post.js';
import cloudinary from 'cloudinary';
import User from './../models/user.js';
import mongoose from 'mongoose';

cloudinary.config({
  cloud_name: 'dn2iwzms1',
  api_key: '346878672592918',
  api_secret: 'fUf6Kes8VuUFn6YlZVVHTdPPTVI',
});

const createPost = async (req, res) => {
  const { content, image } = req.body;
  if (!content.length) {
    return res.status(400).json({ message: 'Content is required' });
  }

  try {
    const post = await Post.create({
      content,
      postedBy: req.user.userId,
      image,
    });

    //replace the postedBy with the user object
    const postWithUser = await Post.findById(post._id).populate(
      'postedBy',
      '-password -secret'
    );

    return res.status(200).json({ post: postWithUser });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: 'err' });
  }
};

const uploadImage = async (req, res) => {
  console.log('uploading');
  try {
    const path = req.files.image.path;

    const result = await cloudinary.v2.uploader.upload(path, {
      width: 1000,
      crop: 'scale',
    });
    return res.status(200).json({
      url: result.url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const newsFeed = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    let { following } = user;
    following.push(req.user.userId);

    //pagination

    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.page) || 3;

    const posts = await Post.find({ postedBy: { $in: following } })
      .skip((page - 1) * perPage)
      .populate('postedBy', '-password -secret')
      .populate('comments.postedBy', '-password -secret')
      .populate('comments.reply.postedBy', '-password -secret')
      .sort('-createdAt')
      .limit(perPage);

    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: 'err' });
  }
};

const getPostWithUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const posts = await Post.find({ postedBy: {_id:userId} })
      .populate('postedBy', '-password -secret')
      .populate('comments.postedBy', '-password -secret')
      .populate('comments.reply.postedBy', '-password -secret')
      .sort({ createdAt: -1 });
    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: 'err' });
  }
};

const addComment = async (req, res) => {
  try {
    const { postId, comment } = req.body;

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            text: comment,
            postedBy: req.user.userId,
          },
        },
      },
      { new: true }
    )
      .populate('postedBy', '-password -secret')
      .populate('comments.postedBy', '-password -secret');

    return res.status(200).json({ msg: 'Added', post });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const editComment = async (req, res) => {
  try {
      const {postId, text, commentId, image} = req.body;
      let data = {"comments.$.text": text, "comments.$.image": image};
      const post = await Post.updateOne(
          {_id: postId, "comments._id": commentId},
          {
              $set: data,
          }
      );
      return res.status(200).json({post});
  } catch (error) {
      console.log(error);
      return res.status(400).json({msg: error});
  }
};

const removeComment = async (req, res) => {
  try {
    const { postId, commentId } = req.body;
    const post = Post.findByIdAndUpdate(
      postId,
      {
        $pull: {
          comments: { _id: commentId },
        },
      },
      {
        new: true,
      }
    )
      .populate('postedBy', '-password -secret')
      .populate('comments.postedBy', '-password -secret');

    res.status(200).json({ msg: 'Removed', post });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: err });
  }
};

const likePost = async (req, res) => {
  try {
    const postId = req.body.postId;
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $addToSet: { likes: req.user.userId },
      },
      {
        new: true,
      }
    );
  
    return res.status(200).json({ msg: 'Liked', post });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: err });
  }
};

const unlikePost = async (req, res) => {
  try {
    const postId = req.body.postId;
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: req.user.userId },
      },
      {
        new: true,
      }
    );
    return res.status(200).json({ msg: 'Unliked', post });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};
const likeComment = async (req, res) => {
  try {
      const {postId, commentId} = req.body;
      const post = await Post.findById(postId);
      let comment = post.comments.id(commentId);
      if (!comment["like"].includes(req.user.userId)) {
          comment["like"].push(req.user.userId);
      }
      await post.save();
      return res.status(200).json({comment});
  } catch (error) {
      console.log(error);
      return res.status(400).json({msg: error});
  }
};
const unlikeComment = async (req, res) => {
  try {
      const {postId, commentId} = req.body;
      const post = await Post.findById(postId);
      let comment = post.comments.id(commentId);
      if (comment["like"].includes(req.user.userId)) {
          comment["like"].splice(comment["like"].indexOf(req.user.userId), 1);
      }
      await post.save();
      return res.status(200).json({comment});
  } catch (error) {
      console.log(error);
      return res.status(400).json({msg: error});
  }
};

const addReplyComment = async (req, res) => {
  try {
      const {postId, commentId, image, text} = req.body;

      if (image) {
          data.image = image;
      }
      console.log("🚀 ~ file: post.js:247 ~ addReplyComment ~ data", data)
      const post = await Post.findById(postId)
          .populate("postedBy", "-password -secret")
          .populate("comments.postedBy", "-password -secret")
          .populate("comments.reply.postedBy", "-password -secret");
      let comment = post.comments.id(commentId);
      comment["reply"].push(data);
      await post.save();
      

      const newPost = await Post.findById(postId)
          .populate("postedBy", "-password -secret")
          .populate("comments.postedBy", "-password -secret")
          .populate("comments.reply.postedBy", "-password -secret");
      const newComment = newPost.comments.id(commentId);
      return res.status(200).json({comment: newComment});
  } catch (error) {
      console.log(error);
      return res.status(400).json({msg: error});
  }
};

const likeReplyComment = async (req, res) => {
  try {
      const {postId, commentId, replyId} = req.body;
      const post = await Post.findById(postId);
      let {reply} = post.comments.id(commentId);
      let currentReply = reply.id(replyId);
      if (!currentReply["like"].includes(req.user.userId)) {
          currentReply["like"].push(req.user.userId);
      }
      await post.save();
      return res.status(200).json({reply: currentReply});
  } catch (error) {
      console.log(error);
      return res.status(400).json({msg: error});
  }
};

const unlikeReplyComment = async (req, res) => {
  try {
      const {postId, commentId, replyId} = req.body;
      const post = await Post.findById(postId);
      let {reply} = post.comments.id(commentId);
      let currentReply = reply.id(replyId);
      if (currentReply["like"].includes(req.user.userId)) {
          currentReply["like"].splice(
              currentReply["like"].indexOf(req.user.userId),
              1
          );
      }
      await post.save();
      return res.status(200).json({reply: currentReply});
  } catch (error) {
      console.log(error);
      return res.status(400).json({msg: error});
  }
};

const deleteReplyComment = async (req, res) => {
  try {
      const {postId, commentId, replyId} = req.body;
      const post = await Post.findById(postId)
          .populate("postedBy", "-password -secret")
          .populate("comments.postedBy", "-password -secret")
          .populate("comments.reply.postedBy", "-password -secret");
      let {reply} = post.comments.id(commentId);
      let index = -1;
      reply.forEach((v, k) => {
          if (String(v._id) === replyId) {
              index = k;
          }
      });
      reply.splice(index, 1);
      await post.save();
      return res.status(200).json({reply});
  } catch (error) {
      console.log(error);
      return res.status(400).json({msg: error});
  }
};


export {
  createPost,
  uploadImage,
  newsFeed,
  getPostWithUserId,

  //post
  likePost,
  unlikePost,

  //comment
  addComment,
  removeComment,
  editComment,
  likeComment,
  unlikeComment,
  
  // reply comment
  addReplyComment,
  likeReplyComment,
  unlikeReplyComment,
  deleteReplyComment,

};
