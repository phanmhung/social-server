import Message from "../models/message";
import cloudinary from "cloudinary";

//config cloudinary
cloudinary.config({
    cloud_name: 'dn2iwzms1',
    api_key: '346878672592918',
    api_secret: 'fUf6Kes8VuUFn6YlZVVHTdPPTVI',
});

const getAllMessages = async (req, res) => {
    try {
        const userId = req.user.userId;
        const messages = await Message.find({members:{$in:userId}})
        .populate(
            "members", 
            "-password -secret -email -followers -following -createdAt -updatedAt -about -username")
        .populate(
            "content.sentBy",
            "-password -secret -email -followers -following -createdAt -updatedAt -about -username")
        .sort({updatedAt:-1});
    } catch (err) {
        return res.status(400).json({ msg: err.message });
    }
}

const sendMessage = async (req, res) => {
    try{
        const userId = req.user.userId;
        let data = { sentBy: userID};
        const {receivedId, text, image} = req.body;
        const limit = req.body.limit || 10;
        if(!receivedId.length || receivedId.includes(null)){
            return res.status(400).json({msg:"Please select a user to send message"});
        }
        if(image){
            data.image=image;
        }

        if(text){
            data.text=text;
        }

        if(!image && !text){
            return res.status(400).json({msg:"Please enter a message"});
        }

        //seen data
        let message = await Message.findOneAndUpdate(
            {
                members:[...receivedId, userId].sort(),
            },
            {
                $addToSet:{ content: data},
            },
            {new:true}
            ).populate(
                "content.sentBy",
                "-password -secret -email -followers -following -createdAt -updatedAt -about -username"
            );

            if(!message){
                message = await Message.create({
                    members:[...receivedId, userId].sort(),
                    content: data,
                });
                message = await Message.findById(message._id).populate(
                    "members",
                    "-password -secret -email -followers -following -role -createdAt -updatedAt -about -username"
                )
                .populate(
                    "content.sentBy",
                    "-password -secret -email -followers -following -role -createdAt -updatedAt -about -username"
                );
            }

            return res.status(200).json({msg:"Message sent", message});
    } catch (err) {
        return res.status(400).json({ msg: err.message });
    }
};

const isRead = async (req, res) => {};

export {
    getAllMessages,
    sendMessage,
    isRead
};