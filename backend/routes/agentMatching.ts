// const express = require('express');
// const router = express.Router();
// const AgentAvailability = require('../models/AgentAvailability');
// const Conversation = require('../models/Conversation');
// const auth = require('../middleware/auth');
// const Appointment = require('../models/Appointment');


// // GET matched agent for client
// router.get('/match-agent', auth, async (req: { user: { role: string; _id: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: string; message?: string; success?: boolean; agent?: { id: any; name: any; email: any; isPastAgent: any; }; details?: string; }): void; new(): any; }; }; }) => {
//     try {
//         // Only clients can request agent matching
//         if (req.user.role !== 'client') {
//             return res.status(403).json({ error: 'Only clients can request agent matching.' });
//         }

//         const clientId = req.user._id;

//         // Step 1: Get all agents marked available
//         const availableAgents = await AgentAvailability.find({
//             availability: true
//         }).populate('agent', 'name email');

//         if (!availableAgents || availableAgents.length === 0) {
//             return res.status(404).json({
//                 error: 'No agents available at the moment.',
//                 message: 'Please try again later or leave a message.'
//             });
//         }

//         // Step 2: Exclude agents with a conflicting appointment (+/- 20 min buffer around now)
//         const bufferMinutes = 20;
//         const requestedTime = new Date();

//         const lowerBound = new Date(requestedTime.getTime() - bufferMinutes * 60000);
//         const upperBound = new Date(requestedTime.getTime() + bufferMinutes * 60000);

//         // Filter agents who don't have any overlapping appointment
//         const eligibleAgents = [];
//         for (const avail of availableAgents) {
//             const conflict = await Appointment.findOne({
//                 agent: avail.agent._id,
//                 time: { $gte: lowerBound, $lte: upperBound },
//                 status: { $in: ['pending', 'confirmed'] }
//             });
//             if (!conflict) {
//                 eligibleAgents.push(avail);
//             }
//         }

//         if (eligibleAgents.length === 0) {
//             return res.status(404).json({
//                 error: 'No agents are free right now.',
//                 message: 'All agents are busy, please try again later.'
//             });
//         }

//         // Step 3: Check if client has had previous conversations
//         const pastConversations = await Conversation.find({
//             client: clientId
//         }).select('agent createdAt').sort({ createdAt: -1 });

//         let matchedAgent: { agent: { _id: { toString: () => any; }; name: any; email: any; }; } | null = null;

//         // Step 4: Priority to past agents who are also eligible
//         if (pastConversations.length > 0) {
//             const pastAgentIds = pastConversations.map((conv: { agent: { toString: () => any; }; }) => conv.agent.toString());
//             matchedAgent = eligibleAgents.find(avail =>
//                 pastAgentIds.includes(avail.agent._id.toString())
//             );
//         }

//         // Step 5: Fallback to first eligible agent if no match from history
//         if (!matchedAgent) {
//             matchedAgent = eligibleAgents[0];
//         }

//         // Safety check
//         if (!matchedAgent) {
//             return res.status(404).json({ error: 'Agent matching failed unexpectedly.' });
//         }

//         // Step 6: Return matched agent details
//         res.status(200).json({
//             success: true,
//             agent: {
//                 id: matchedAgent.agent._id,
//                 name: matchedAgent.agent.name,
//                 email: matchedAgent.agent.email,
//                 isPastAgent: pastConversations.some(
//                     (                    conv: { agent: { toString: () => any; }; }) => conv.agent.toString() === matchedAgent.agent._id.toString()
//                 )
//             },
//             message: `Matched with ${matchedAgent.agent.name}`
//         });

//     } catch (error) {
//         console.error('Agent matching error:', error);
//         res.status(500).json({
//             error: 'Failed to match agent.',
//             details: error instanceof Error ? error.message : 'Unknown error'
//         });
//     }
// });


// module.exports = router;
