import express from 'express';
import { register,login} from './../controllers/auth.js';

const router = express.Router();
router.route('/').get(async (req,res)=>{
    res.json({msg: "Auth"});
})

router.route('/register').post(register);
router.route('/login').post(login);

export default router;