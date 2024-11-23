const mongoose = require('mongoose');

const timerSchema = new mongoose.Schema({
  assessmentStartTime: { type: Date, required: true },
  assessmentEndTime: { type: Date, default: null },
  totalTime: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["in-progress", "completed", "paused"],
    default: "in-progress",
  },
  isPaused: { type: Boolean, default: false },
  pauseStartTime: { type: Date, default: null },
  totalPausedTime: { type: Number, default: 0 },
  lastModified: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Timer', timerSchema);