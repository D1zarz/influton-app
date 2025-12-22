const mongoose = require("mongoose");

const SpinSchema = mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
    required: true,
    index: true,
  },
  spinsRemaining: {
    type: Number,
    default: 3,
    min: 0,
    max: 3,
  },
  lastSpinTime: {
    type: Date,
  },
  nextSpinAvailable: {
    type: Date,
  },
  totalSpins: {
    type: Number,
    default: 0,
  },
  totalWinnings: {
    type: Number,
    default: 0,
  },
  jackpotsWon: {
    type: Number,
    default: 0,
  },
});

// Index for efficient queries
SpinSchema.index({ nextSpinAvailable: 1 });

module.exports = mongoose.model("Spin", SpinSchema);
