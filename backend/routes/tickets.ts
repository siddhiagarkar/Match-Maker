const express = require('express');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();
const Conversation = require('../models/Conversation');

// Client: create ticket
// Helper to sanitize client name for code
function cleanName(name:any) {
    return name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}
router.post('/', auth, async (req: any, res: any) => {
    if (req.user.role !== 'client') {
        return res.status(403).json({ error: "Only clients can create tickets" });
    }

    const { priority, masterDomain, subDomain, subject, additional_comment } = req.body;

    // Validation: All required fields
    if (!priority) {
        return res.status(400).json({ error: 'Priority is required.' });
    }
    if (!masterDomain) {
        return res.status(400).json({ error: 'Master domain is required.' });
    }
    

    // Build base code
    const client_name = req.user.name;
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const namePart = cleanName(client_name); // johndoe
    let baseCode = `${datePart}-${namePart}`;
    let code = baseCode;
    let tryNum = 1;

    // Ensure code is unique
    while (await Ticket.findOne({ code })) {
        tryNum += 1;
        code = `${baseCode}-${String(tryNum).padStart(3, '0')}`; // 001, 002...
    }

    // Create ticket
    const ticket = await Ticket.create({
        client: req.user._id,
        code: code,
        priority,
        masterDomain,
        subDomain: subDomain || undefined, // only save if present
        subject,
        additional_comment,
        status: 'open'
        // acceptedBy, createdAt: handled by schema defaults
    });

    res.status(201).json(ticket);
});


// Anyone (employee): dashboard - get all open tickets
router.get('/dashboard-open', auth, async (req: any, res: any) => {
    console.log(req.user.role);
    if (req.user.role !== 'agent' && req.user.role!== 'admin') return res.status(403).json({ error: "Only employees can view dashboard" });
    const tickets = await Ticket.find({ status: 'open' }).populate('client', 'name');
    res.json(tickets);
});

// Anyone (employee): dashboard - get all accepted tickets
router.get('/dashboard-accepted', auth, async (req: any, res: any) => {
    if (req.user.role !== 'agent' && req.user.role !== 'admin') return res.status(403).json({ error: "Only employees can view dashboard" });
    const tickets = await Ticket.find({ status: 'accepted' }).populate('client', 'name');
    res.json(tickets);
});

// Anyone (employee): dashboard - get all resolved tickets
router.get('/dashboard-resolved', auth, async (req: any, res: any) => {
    if (req.user.role !== 'agent' && req.user.role!== 'admin') return res.status(403).json({ error: "Only employees can view dashboard" });
    const tickets = await Ticket.find({ status: 'resolved' }).populate('client', 'name');
    res.json(tickets);
});

// Anyone (employee): dashboard - get ALL tickets
router.get('/dashboard-all', auth, async (req: any, res: any) => {
    console.log(req.user.role);
    if (req.user.role !== 'agent' && req.user.role !== 'admin') return res.status(403).json({ error: "Only employees and admin can view dashboard" });
    const tickets = await Ticket.find().populate('client', 'name');
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

//Generate suggestions for who should accept the ticket based on past interaction
router.get('/suggestions', auth, async (req: any, res: any) => {
    if (req.user.role !== 'agent') {
        return res.status(403).json({ error: "Only agents have access to this" });
    }

    const openTickets = await Ticket.find({ status: 'open' }).lean();
    const ticketSuggestions = new Array;

    for (const ticket of openTickets) {
        const pastTickets = await Ticket.find({
            client: ticket.client,
            _id: { $ne: ticket._id },
            acceptedBy: { $exists: true, $ne: null }
        }).lean();

        const agentFreq = new Array;
        for (const t of pastTickets) {
            const agentId = t.acceptedBy?.toString();
            if (agentId) {
                agentFreq[agentId] = (agentFreq[agentId] || 0) + 1;
            }
        }

        const topAgents = Object.entries(agentFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([agentId]) => agentId);

        const agentsWithNames = topAgents.length
            ? await User.find({ _id: { $in: topAgents } }).select('name').lean()
            : [];

        ticketSuggestions[ticket._id] = agentsWithNames.map((agent: { _id: any; name: any; }) => ({
            _id: agent._id,
            name: agent.name
        }));
    }

    res.json(ticketSuggestions);
});


module.exports = router;
