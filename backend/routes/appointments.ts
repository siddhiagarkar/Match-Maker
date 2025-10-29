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
    try {
        const { agent } = req.body; 

        if (req.user.role !== 'client') {
            return res.status(403).json({ error: 'Only clients can create appointments.' });
        }

        // 1: Check agent's current availability
        const availability = await AgentAvailability.findOne({
            agent: agent,
            availability: true
        });

        if (!availability) {
            return res.status(400).json({ error: 'This agent is not available right now.' });
        }

        // 2: Use current time as the appointment time
        const appointmentTime = new Date();

        // 3: Buffer check (+/- 20 min)
        const bufferMinutes = 20;
        const lowerBound = new Date(appointmentTime.getTime() - bufferMinutes * 60000);
        const upperBound = new Date(appointmentTime.getTime() + bufferMinutes * 60000);

        const conflictingAppt = await Appointment.findOne({
            agent: agent,
            time: { $gte: lowerBound, $lte: upperBound },
            status: { $in: ['pending', 'confirmed'] }
        });

        if (conflictingAppt) {
            return res.status(409).json({ error: 'Agent has a conflicting appointment in this time slot.' });
        }

        // 4: Create appointment
        const appt = await Appointment.create({
            client: req.user._id,
            agent,
            time: appointmentTime,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            appointment: appt,
            message: 'Appointment created successfully.'
        });

    } catch (err) {
        console.error('Appointment creation error:', err);
        res.status(500).json({ error: 'Failed to create appointment.' });
    }
});



module.exports = router;
