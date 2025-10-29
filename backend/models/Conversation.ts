const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // client & agent
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', conversationSchema);
