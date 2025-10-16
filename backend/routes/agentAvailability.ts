import mongoose = require("mongoose");

const express = require('express');
const router = express.Router();
const AgentAvailability = require('../models/AgentAvailability');
const auth = require('../middleware/auth');

const validate = require('../middleware/inputValidate');
const { slotSchema, slotsArraySchema } = require('../middleware/validationSchema'); //import Joi validation schemas


// Admin-only: View all availabilities
router.get('/all', auth, async (req: any, res: any) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Admins only.' });
    }
    const availability_logs = await AgentAvailability.find({}).populate('agent');
    res.json(availability_logs);
});

// Bulk set all slots (agents only)
router.post('/', auth, validate(slotsArraySchema), async (req: any, res: any) => {

    if (req.user.role !== 'agent') {
        return res.status(403).json({ error: 'Only Employees.' });
    }

    const avail = await AgentAvailability.findOneAndUpdate(
        { agent: req.user._id },
        { $set: { slots: req.body.slots } },
        { upsert: true, new: true }
    );
    res.json(avail);
});

// Add a single slot
router.post('/add', auth, validate(slotSchema), async (req: any, res: any) => {

    if (req.user.role !== 'agent') {
        return res.status(403).json({ error: 'Only Employees.' });
    }
    
    const avail = await AgentAvailability.findOneAndUpdate(
        { agent: req.user._id },
        { $push: { slots: req.body } },
        { upsert: true, new: true }
    );
    res.json(avail);
});

// Add multiple slots
router.post('/add-many', auth, validate(slotsArraySchema), async (req: any, res: any) => {

    if (req.user.role !== 'agent') {
        return res.status(403).json({ error: 'Only Employees.' });
    }

    const avail = await AgentAvailability.findOneAndUpdate(
        { agent: req.user._id },
        { $push: { slots: { $each: req.body.slots } } },
        { upsert: true, new: true }
    );
    res.json(avail);
});

// Edit a single slot by slotId
router.patch('/:slotId', auth, validate(slotSchema), async (req: any, res: any) => {
    if (req.user.role !== 'agent') {
        return res.status(403).json({ error: 'Only Employees.' });
    }

    const avail = await AgentAvailability.findOneAndUpdate(
        { agent: req.user._id, 'slots._id': req.params.slotId },
        { $set: { 'slots.$': req.body } },
        { new: true }
    );
    if (!avail) return res.status(404).json({ error: 'Slot not found.' });
    res.json(avail);
});

// Get agent's availabilities (protected)
router.get('/:agentId', auth, async (req: any, res: any) => {
    if (
        req.user.role !== 'admin' &&
        req.user._id.toString() !== req.params.agentId
    ) {
        return res.status(403).json({ error: 'Access denied.' });
    }
    const avail = await AgentAvailability.findOne({ agent: req.params.agentId });
    res.json(avail);
});

// Remove a single slot by slotId
router.delete('/:slotId', auth, async (req: any, res: any) => {
    if (req.user.role !== 'agent') {
        return res.status(403).json({ error: 'Agents only.' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.slotId)) {
        return res.status(400).json({ error: 'Invalid slot ID.' });
    }

    const avail = await AgentAvailability.findOneAndUpdate(
        { agent: req.user._id },
        { $pull: { slots: { _id: req.params.slotId } } },
        { new: true }
    );
    res.json(avail);
});

module.exports = router;