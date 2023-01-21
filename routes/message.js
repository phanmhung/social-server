import express from 'express';
import { getAllMessages, sendMessage } from '../controllers/message';

const router =express.Router();

router.route("/").get(async (req, res) => {
    res.json({ msg: "Message" });
})

router.route('/get-all-messages').get(getAllMessages);
router.route('/send-message').post(sendMessage);
router.route('/is-read').put(isRead);
