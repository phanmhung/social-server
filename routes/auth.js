import express from 'express';
import requireSignin from '../middleware/authentication.js';
import isAdmin from '../middleware/isAdmin.js';
import {
  register,
  login,
  addFollower,
  userFollower,
  getInformationUser,
  suggestUser,
  listUserFollowing,
  listUserFollower,
  removeFollower,
  userUnfollower,
  forgotPassword,
  searchUser,
  allUsers,
  currentUser,
} from './../controllers/auth.js';

const router = express.Router();
router.route('/').get(async (req, res) => {
  res.json({ msg: 'Auth' });
});

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/forgot-password').post(forgotPassword);
router.route('/user-follow').put(requireSignin, addFollower, userFollower);
router.route('/user-unfollow').put(requireSignin, removeFollower, userUnfollower);

router.route('/search-user/:query').get(requireSignin,searchUser);

router.route('/list-following/:userId').get(requireSignin, listUserFollowing);
router.route('/list-follower/:userId').get(requireSignin, listUserFollower);
router.route('/suggest-user').get(requireSignin, suggestUser);

//Admin priority
router.route("/all-users").get(requireSignin, isAdmin, allUsers);
router.route("/current-admin").get(requireSignin, isAdmin, currentUser);

router.route('/:id').get(requireSignin, getInformationUser);
export default router;
