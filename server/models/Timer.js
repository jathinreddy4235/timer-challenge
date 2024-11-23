const mongoose = require('mongoose');

const timerSchema = new mongoose.Schema({
  assessmentStartTime: {type: Date,required: true},
  assessmentEndTime: {type: Date,default: null},
  totalTime: {type: Number,default: 0},
  status: {type: String,enum: ['in-progress', 'completed'],default: 'in-progress'}
});

module.exports = mongoose.model('Timer', timerSchema);