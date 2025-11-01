const express = require('express');
const Ticket = require('../models/Ticket');
const auth = require('../middleware/auth');
const router = express.Router();
const Conversation = require('../models/Conversation');

// Client: create ticket
router.post('/', auth, async (req: any, res: any) => {
    if (req.user.role !== 'client') return res.status(403).json({ error: "Only clients can create tickets" });
    const { subject } = req.body;
    const ticket = await Ticket.create({ client: req.user._id, subject, status: 'open'});
    res.status(201).json(ticket);
});

// Anyone (employee): dashboard - get all open tickets
router.get('/dashboard-open', auth, async (req: any, res: any) => {
    console.log(req.user.role);
    if (req.user.role !== 'agent' && req.user.role!== 'admin') return res.status(403).json({ error: "Only employees can view dashboard" });
    const tickets = await Ticket.find({ status: 'open' }).populate('client', 'name');
    res.json(tickets);
});

// Anyone (employee): dashboard - get all open tickets
router.get('/dashboard-accepted', auth, async (req: any, res: any) => {
    if (req.user.role !== 'agent' && req.user.role !== 'admin') return res.status(403).json({ error: "Only employees can view dashboard" });
    const tickets = await Ticket.find({ status: 'accepted' }).populate('client', 'name');
    res.json(tickets);
});

// Anyone (employee): dashboard - get all open tickets
router.get('/dashboard-resolved', auth, async (req: any, res: any) => {
    if (req.user.role !== 'agent' && req.user.role!== 'admin') return res.status(403).json({ error: "Only employees can view dashboard" });
    const tickets = await Ticket.find({ status: 'resolved' }).populate('client', 'name');
    res.json(tickets);
});

// Employee: accept ticket
router.post('/:id/accept', auth, async (req: any, res: any) => {
    if (req.user.role !== 'agent') return res.status(403).json({ error: "Only employees can accept tickets" });
    // Atomic update to avoid race conditions
    const ticket = await Ticket.findOneAndUpdate(
        { _id: req.params.id, status: 'open' },
        { status: 'accepted', acceptedBy: req.user._id },
        { new: true }
    );
    if (!ticket) return res.status(400).json({ error: 'Ticket already accepted or not found' });

    //create conversation for this ticket
    await Conversation.create({
        ticket: ticket._id,
        participants: [ticket.client, req.user._id]
    });

    res.json(ticket);
});

// Employee: mark as resolved
router.post('/:id/resolve', auth, async (req: any, res: any) => {
    if (req.user.role !== 'agent') return res.status(403).json({ error: "Only employees can resolve tickets" });
    const ticket = await Ticket.findOneAndUpdate(
        { _id: req.params.id, status: 'accepted', acceptedBy: req.user._id },
        { status: 'resolved' },
        { new: true }
    );
    if (!ticket) return res.status(400).json({ error: 'Ticket not found or not accepted by you' });
    res.json(ticket);
});

// Client: view their own tickets
router.get('/my', auth, async (req: any, res: any) => {
    if (req.user.role !== 'client') return res.status(403).json({ error: "Only clients can view their own tickets" });
    const tickets = await Ticket.find({ client: req.user._id }).populate('acceptedBy', 'name');
    res.json(tickets);
});

module.exports = router;
