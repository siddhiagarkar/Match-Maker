const mongoose = require('mongoose');

const agentAvailabilitySchema = new mongoose.Schema({
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    availability: { type: Boolean, default: false },
});

module.exports = mongoose.model('AgentAvailability', agentAvailabilitySchema);