const express = require('express');
const router = express.Router();
const AgentAvailability = require('../models/AgentAvailability');
const auth = require('../middleware/auth');

// Admin-only: View all availabilities
router.get('/all', auth, async (req: any, res: any) => {
    // Check if requester is admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Admins only.' });
    }
    const availability_logs = await AgentAvailability.find({});
    res.json(availability_logs);
});

// Get agent's availabilities (protected)
router.get('/:agentId', auth, async (req: any, res: any) => {
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.agentId) {
        return res.status(403).json({ error: 'Access denied.' });
    }
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
