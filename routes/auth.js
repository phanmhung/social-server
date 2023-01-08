import express from 'express';
import requireSignin from '../middleware/authentication.js';
import {
  register,
  login,
  addFollower,
  userFollower,
  getInformationUser,
  suggestUser,
} from './../controllers/auth.js';

const router = express.Router();
router.route('/').get(async (req, res) => {
  res.json({ msg: 'Auth' });
});

router.route('/register').post(register);
router.route('/login').post(login);

router.route('/user-follow').put(requireSignin, addFollower, userFollower);

router.route('/suggest-user').get(requireSignin, suggestUser);


router.route('/:id').get(requireSignin, getInformationUser);
export default router;
