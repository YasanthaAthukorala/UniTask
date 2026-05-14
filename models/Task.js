const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true }, 
    budget: { type: Number, required: true },
    studentName: { type: String, required: true },
    status: { type: String, default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);