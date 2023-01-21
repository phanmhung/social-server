import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],
        content: [
            {
                text:String,
                image:{
                    url:String,
                    public_id:String,
                    default:{
                        url:"",
                        public_id:"",
                    }
                },
                createdAt:{
                    type:Date,
                    default:Date.now,
                },
                like:{
                    type:boolean,
                    default:false,
                },
                sentBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                reply:{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Message",
                },
                seen:[
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                    }
                ]
            }
        ]
    },
    {timestamps: true}
);

export default mongoose.model("Message", messageSchema);
