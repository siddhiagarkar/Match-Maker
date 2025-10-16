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

    if (req.user.role !== 'client') {
        return res.status(403).json({error : 'Only clients can create appointments.'})
    }

    // 1: Fetch agent's available slots
    const availability = await AgentAvailability.findOne({ agent });

    if (!availability || !availability.slots || availability.slots.length === 0) {
        return res.status(400).json({ error: 'No available slots for this agent.' });
    }

    // 2: Check for matching slot
    const requestedTime = new Date(time);
    const isAvailable = availability.slots.some((slot: any) =>
        requestedTime >= new Date(slot.start) && requestedTime < new Date(slot.end)
    );

    if (!isAvailable) {
        return res.status(400).json({ error: 'Agent is not available at the requested time.' });
    }

    // 3: Ensure there's no other appointment in a +/-20 minute buffer

    const bufferMinutes = 20; //assuming each appointment takes 20 mins

    const lowerBound = new Date(requestedTime.getTime() - bufferMinutes * 60000);
    const upperBound = new Date(requestedTime.getTime() + bufferMinutes * 60000);

    const conflict = await Appointment.findOne({
        agent,
        time: { $gte: lowerBound, $lte: upperBound }
    });
    if (conflict) {
        return res.status(400).json({ error: `This slot overlaps with another booking (within ${bufferMinutes} minutes).` });
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
