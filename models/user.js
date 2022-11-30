import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name!"],
        minlength: [3, "Name must be at least 3 characters long"],
        trim:true,
    },
    email: {
        type: String,
        trim:true,
        required: [true, "Please provide your email"],
        unique: true,
        validate:{
            validator: validator.isEmail,
            message: "Please provide a valid email"
        }
    },
    password: {
        type: String,
        trim: true,
        required: [true, "Please provide a password"],
        minlength: [8, "Password must be at least 8 characters long"],
        select:true,
    },
    secret: {
        type: String,
        required: [true, "Please provide a secret"],
    },
    username: {
        type: String,
        unique: true,
        required: [true, "Please provide a username"],
    },
    about:{
        type: String,
    },
    image: {
        url:{
            type: String,
        },
        public_id:{
            type: String,
        }
    },
    following:[
        {
        type: [mongoose.Schema.ObjectId],
        ref: "User",
        },
    ],
    follower:[
        {
        type: [mongoose.Schema.ObjectId],
        ref: "User",
        },
    ],
    role:{
        type: String,
        default: "Subscriber",
    },
},
{
    timestamps: true,
});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return;
    const salt= await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
});

userSchema.methods.matchPassword = async function(enteredPassword){
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    return isMatch;
};
;
export default mongoose.model("User", userSchema);