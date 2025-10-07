const mongoose = require('mongoose');
const appointmentSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    time: Date,
    status: { type: String, default: 'pending' }
});
module.exports = mongoose.model('Appointment', appointmentSchema);
