import express from 'express';
import { register} from './../controllers/auth.js';

const router = express.Router();
router.route('/').get(async (req,res)=>{
    res.json({msg: "Auth"});
})

router.route('/register').post(register);

export default router;