const mongoose = require('mongoose');

const agentAvailabilitySchema = new mongoose.Schema({
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    slots: [
        {
            start: { type: Date, required: true }, // This will store both date and time
            end: { type: Date, required: true }    // Optional, in case you want to support ranges
        }
    ]
});

module.exports = mongoose.model('AgentAvailability', agentAvailabilitySchema);
