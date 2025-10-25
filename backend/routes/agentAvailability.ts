import mongoose = require("mongoose");

const express = require('express');
const router = express.Router();
const AgentAvailability = require('../models/AgentAvailability');
const auth = require('../middleware/auth');


// Admin-only: View all availabilities
router.get('/all', auth, async (req: any, res: any) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Admins only.' });
    }
    const availability_logs = await AgentAvailability.find({}).populate('agent');
    res.json(availability_logs);
});


module.exports = router;