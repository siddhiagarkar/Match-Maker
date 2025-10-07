const express = require('express');
const router = express.Router();
const AgentAvailability = require('../models/AgentAvailability');
const auth = require('../middleware/auth');

// Get agent's availabilities (protected)
router.get('/:agentId', auth, async (req: any, res: any) => {
    const avail = await AgentAvailability.findOne({ agent: req.params.agentId });
    res.json(avail);
});

// Set agent slot(s) (protected, agents only)
router.post('/', auth, async (req: any, res: any) => {
    // Optionally: check req.user.role === 'agent'
    const { slots } = req.body;
    const avail = await AgentAvailability.findOneAndUpdate(
        { agent: req.user._id },
        { $set: { slots } },
        { upsert: true, new: true }
    );
    res.json(avail);
});

module.exports = router;
