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

export {
    register
};