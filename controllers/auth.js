import User from "./../models/user.js";
import jwt from "jsonwebtoken";
import validator from "validator";
const regex = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

const register = async(req,res)=>{

}

const login = async(req,res)=>{
    const {email,password, rememberPassword} = req.body;

    if(!email || !password){
        return res.status(400).json({message:"All fields are required"});
    }

    if(password.length < 8){
        return res.status(400).json({message:"Password must be at leaast 8 characters"});   
    }

    if(!validator.isEmail(email)){
        return res.status(400).json({message:"Invalid email"});
    }
    
    const user = await User.findOne({email})
    if(!user){
        return res.status(400).json({message:"Invalid email or password"});
    }

    const isMatch = await user.matchPassword(password);
    if(!isMatch){
        return res.status(400).json({message:"Invalid email or password"});
    }

    const token = jwt.sign({_id:user._id},process.env.JWT_SECRET,{
        expiresIn: rememberPassword ? "365d" : process.env.JWT_LIFETIME
    });

    return res.status(200).json({message:"Login successful",token});
};

export {
    register,
    login
};