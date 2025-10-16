const mongoose = require('mongoose');

const agentAvailabilitySchema = new mongoose.Schema({
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    slots: [
        {
            start: { type: Date, required: true }, 
            end: { type: Date, required: true },   
            timezone: { type: String, default: 'Asia/Kolkata' } // Default timezone
        }
    ],
});

module.exports = mongoose.model('AgentAvailability', agentAvailabilitySchema);