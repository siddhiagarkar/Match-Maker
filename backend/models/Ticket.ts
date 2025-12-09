const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: true, unique: true },
    priority: { type: String, enum: ['urgent', 'high', 'medium', 'low'], default: 'low' },
    masterDomain: { type: String, required: true },
    subDomain: { type: String, required: false },
    subject: { type: String, required: false },
    additional_comment: {type: String},
    status: { type: String, enum: ['open', 'accepted', 'resolved'], default: 'open' },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdAt: { type: Date, default: Date.now },

    // new supervision fields
    acceptedAt: { type: Date },            // when agent accepted
    resolvedAt: { type: Date },            // when marked resolved

    // ETA provided by agent when accepting
    estimatedResolutionAt: { type: Date },
});

module.exports = mongoose.model('Ticket', ticketSchema);
