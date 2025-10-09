const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const { messageSchema } = require('../middleware/validationSchema');
const validate = require('../middleware/inputValidate');

// Get all messages for a conversation (protected)
router.get('/:conversationId', auth, async (req: any, res: any) => {
    const messages = await Message.find({ conversation: req.params.conversationId });
    res.json(messages);
});

// Send message in conversation (protected)
router.post('/', auth, validate(messageSchema), async (req: any, res: any) => {
    const { conversation, content } = req.body;
    const msg = await Message.create({
        conversation,
        content,
        sender: req.user._id
    });
    res.status(201).json(msg);
});

module.exports = router;
