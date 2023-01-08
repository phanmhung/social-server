import User from "./../models/user.js";
import jwt from "jsonwebtoken";
import validator from "validator";
import randomAvatar from "../middleware/randomAvatar.js";
import { nanoid } from "nanoid";

// regex for special characters
const regex = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/; 

const register = async(req,res)=>{
    const {name,email,password, rePassword, secret} = req.body;

    if(!name || !email || !password || !rePassword || !secret){
        return res.status(400).json({message:"All fields are required"});
    }

    if(name.length <3 || name.length > 20){
        return res.status(400).json({message:"Name must be between 3 and 20 characters"});
    }

    if (regex.test(name)){
        return res.status(400).json({message:"Name must not contain special characters"});
    }

    if (password !== rePassword){
        return res.status(400).json({message:"Passwords do not match"});
    }

    if (password.length < 8){
        return res.status(400).json({message:"Password must be at leaast 8 characters"});   
    }

    const isEmail = validator.isEmail(email);
    if(!isEmail){
        return res.status(400).json({message:"Invalid email"});
    }

    const exist = await User.findOne({email});
    
    if(exist){
        return res.status(400).json({message:"Email already exists"});
    }

    const image ={
        url: randomAvatar(),
        public_id: nanoid(),
    }

    const user = await User.create({
        name,
        email,
        password,
        secret,
        username: nanoid(),
        image,
    });
    
    return res.status(200).json({message:"Registration successful"});
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

    return res.status(200).json({token,user});
};

const addFollower = async (req, res,next ) => {
    try{
        const user = await User.findByIdAndUpdate(req.body.userId,{
            $addToSet: {
                followers: req.user.userId
            },
        });
        if(!user){
            res.status(400).json({msg:"User not found"});
        }
        next();
    }
    catch(err){
        return res.status(400).json({msg:err.message});
    }
};

const userFollower = async (req, res) => {
    try{
        const user = await User.findByIdAndUpdate(
            req.user.userId, 
            {
            $addToSet: {following: req.body.userId},
        },
        {new: true}
    );

    if(!user){
        return res.status(400).json({msg:"User not found"});
    }
    res.status(200).json({msg:"Followed successfully"});
    } catch(err){
        return res.status(400).json({msg:err.message});
    }
}

const getInformationUser = async (req, res) => {
    try{
        const _id = req.params.id;
        const user = await User.findById(_id).select("-password -secret");
        if(!user){
            return res.status(400).json({msg:"User not found"});
        }
        return res.status(200).json({user});
    } catch(error){
        console.log(error);
        return res.status(400).json({msg:error.message});
    }
}

const suggestUser = async (req, res) => {
    try{
        //get current user
        const user = await User.findById(req.user.userId);
        
        if(!user){
            return res.status(400).json({msg:"User not found"});
        }
        //get list of following
        const following = user.following;

        const suggestions = await User.find({_id:{$nin:following}})
        .select("-password -secret -email -followers -following -createdAt -updatedAt")
        .limit(10);

        return res.status(200).json({msg:"Find suggestions success",suggestions});
    } catch(err){
        return res.status(400).json({msg:err.message});
    }
}
export {
    register,
    login,
    userFollower,
    addFollower,
    getInformationUser,
    suggestUser,
};