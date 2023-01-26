import express from 'express';
import { getAllMessages, sendMessage, isRead } from '../controllers/message.js';

const router = express.Router();

router.route("/").get(async (req, res) => {
    res.json({ msg: "Message" });
})

router.route('/get-all-messages').get(getAllMessages);
router.route('/send-message').put(sendMessage);
router.route('/is-read').get(isRead);

export default router;