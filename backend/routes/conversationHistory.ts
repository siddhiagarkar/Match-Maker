const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const auth = require('../middleware/auth');

// Get all conversations for logged-in user
router.get('/', auth, async (req: any, res: any) => {
    const convos = await Conversation.find({ participants: req.user._id });
    res.json(convos);
});

// Create new conversation (protected)
router.post('/', auth, async (req: any, res: any) => {
    const { participants } = req.body;
    const convo = await Conversation.create({ participants }); // Validation recommended
    res.status(201).json(convo);
});

module.exports = router;
