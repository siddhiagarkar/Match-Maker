const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const auth = require('../middleware/auth');

const validate = require('../middleware/inputValidate');
const { conversationSchema } = require('../middleware/validationSchema'); //import Joi validation schemas


// Get all conversations for logged-in user
router.get('/', auth, async (req: any, res: any) => {
    const convos = await Conversation.find({ participants: req.user._id }).populate('participants', 'name').populate('ticket');
    res.json(convos);
});

// Create new conversation (protected)
router.post('/', auth, validate(conversationSchema), async (req: any, res: any) => {
    const { participants } = req.body;

    // Check all participant IDs exist in your User collection
    const userCount = await User.countDocuments({ _id: { $in: participants } });
    //userCount returns count of valid users found in DB
    if (userCount !== participants.length) {
        return res.status(400).json({ error: 'One or more participant IDs are invalid.' });
    }

    const convo = await Conversation.create({ participants }); 
    res.status(201).json(convo);
});

module.exports = router;
