import Post from './../models/post.js';
import cloudinary from 'cloudinary';
import User from './../models/user.js';

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
    const { userId } = req.param.userId;
    const posts = await User.findById({ postedBy: { _id: userId } })
      .populate('postedBy', '-password -secret')
      .populate('comments.postedBy', '-password -secret')
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

export {
  createPost,
  uploadImage,
  newsFeed,
  getPostWithUserId,
  addComment,
  removeComment,
};
