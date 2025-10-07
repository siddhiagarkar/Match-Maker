const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

// Admin-only: View all appointments
router.get('/all', auth, async (req: any, res: any) => {
    // Check if requester is admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Admins only.' });
    }
    const appts = await Appointment.find({});
    res.json(appts);
});


// Get appointments for logged-in user (protected)
router.get('/', auth, async (req: any, res: any) => {
    const appts = await Appointment.find({
        $or: [
            { client: req.user._id },
            { agent: req.user._id }
        ]
    });
    res.json(appts);
});

// Create appointment request (protected)
const AgentAvailability = require('../models/AgentAvailability');

router.post('/', auth, async (req: any, res: any) => {
    const { agent, time } = req.body; // time should be ISO string

    // 1: Fetch agent's available slots
    const availability = await AgentAvailability.findOne({ agent });

    if (!availability || !availability.slots || availability.slots.length === 0) {
        return res.status(400).json({ error: 'No available slots for this agent.' });
    }

    // 2: Check for matching slot
    // Assuming each slot: {start, end} and req.body.time is within a slot
    const requestedTime = new Date(time);
    const isAvailable = availability.slots.some((slot: { start: string | number | Date; end: string | number | Date; }) =>
        requestedTime >= new Date(slot.start) && requestedTime < new Date(slot.end)
    );

    if (!isAvailable) {
        return res.status(400).json({ error: 'Agent is not available at the requested time.' });
    }

    // 3: (Optional) Ensure there's no other appointment in that slot
    const conflict = await Appointment.findOne({ agent, time });
    if (conflict) {
        return res.status(400).json({ error: 'This slot is already booked.' });
    }

    // 4: Create the appointment
    const appt = await Appointment.create({
        client: req.user._id,
        agent,
        time,
        status: 'pending'
    });
    res.status(201).json(appt);
});


module.exports = router;
