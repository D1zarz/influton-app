const Spin = require("../models/spinModel");
const User = require("../models/userModel");

const SPIN_COOLDOWN_MS = 8 * 60 * 60 * 1000; // 8 hours
const MAX_SPINS = 3;

const PRIZES = [
  { value: 10, probability: 0.3, label: "10", color: "#FF6B6B" },
  { value: 25, probability: 0.25, label: "25", color: "#4ECDC4" },
  { value: 50, probability: 0.18, label: "50", color: "#45B7D1" },
  { value: 100, probability: 0.12, label: "100", color: "#96CEB4" },
  { value: 250, probability: 0.08, label: "250", color: "#FFEAA7" },
  { value: 500, probability: 0.04, label: "500", color: "#DDA0DD" },
  { value: 1000, probability: 0.025, label: "1K", color: "#98D8C8" },
  { value: 5000, probability: 0.005, label: "JACKPOT", color: "#FFD700" },
];

class WheelService {
  // Get or create spin record for user
  async getSpinStatus(userId) {
    let spinRecord = await Spin.findOne({ userId });

    if (!spinRecord) {
      spinRecord = await Spin.create({
        userId,
        spinsRemaining: MAX_SPINS,
      });
    }

    // Check if spins should be recovered
    spinRecord = await this.recoverSpins(spinRecord);

    // Get user balance
    const user = await User.findById(userId);
    const balance = user ? user.cointrust || 0 : 0;

    return {
      spinsRemaining: spinRecord.spinsRemaining,
      nextSpinAvailable: spinRecord.nextSpinAvailable,
      totalSpins: spinRecord.totalSpins,
      totalWinnings: spinRecord.totalWinnings,
      balance: balance,
    };
  }

  // Recover spins based on time passed
  async recoverSpins(spinRecord) {
    if (spinRecord.spinsRemaining >= MAX_SPINS) {
      return spinRecord;
    }

    const now = new Date();

    if (!spinRecord.lastSpinTime) {
      return spinRecord;
    }

    if (spinRecord.nextSpinAvailable && now >= spinRecord.nextSpinAvailable) {
      // Calculate how many spins to recover
      const timePassed = now - spinRecord.lastSpinTime;
      const spinsToRecover = Math.floor(timePassed / SPIN_COOLDOWN_MS);

      if (spinsToRecover > 0) {
        spinRecord.spinsRemaining = Math.min(
          MAX_SPINS,
          spinRecord.spinsRemaining + spinsToRecover
        );

        // Update next available time if still not at max
        if (spinRecord.spinsRemaining < MAX_SPINS) {
          spinRecord.nextSpinAvailable = new Date(
            spinRecord.lastSpinTime.getTime() +
              (spinsToRecover + 1) * SPIN_COOLDOWN_MS
          );
        } else {
          spinRecord.nextSpinAvailable = null;
        }

        await spinRecord.save();
      }
    }

    return spinRecord;
  }

  // Perform a spin
  async performSpin(userId) {
    let spinRecord = await Spin.findOne({ userId });

    if (!spinRecord) {
      spinRecord = await Spin.create({ userId, spinsRemaining: MAX_SPINS });
    }

    // Recover any available spins first
    spinRecord = await this.recoverSpins(spinRecord);

    if (spinRecord.spinsRemaining <= 0) {
      return {
        success: false,
        error: "No spins remaining",
        nextSpinAvailable: spinRecord.nextSpinAvailable,
      };
    }

    // Determine prize using weighted random
    const prize = this.calculatePrize();
    const prizeIndex = PRIZES.findIndex((p) => p.value === prize.value);

    // Update spin record
    const now = new Date();
    spinRecord.spinsRemaining -= 1;
    spinRecord.lastSpinTime = now;
    spinRecord.totalSpins += 1;
    spinRecord.totalWinnings += prize.value;

    if (prize.value === 5000) {
      spinRecord.jackpotsWon += 1;
    }

    // Set next spin available time
    if (spinRecord.spinsRemaining < MAX_SPINS) {
      spinRecord.nextSpinAvailable = new Date(now.getTime() + SPIN_COOLDOWN_MS);
    }

    await spinRecord.save();

    // Update user balance
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { cointrust: prize.value } },
      { new: true }
    );

    const newBalance = user ? user.cointrust : prize.value;

    return {
      success: true,
      prize: prize,
      prizeIndex: prizeIndex,
      spinsRemaining: spinRecord.spinsRemaining,
      nextSpinAvailable: spinRecord.nextSpinAvailable,
      newBalance: newBalance,
    };
  }

  // Weighted random prize selection
  calculatePrize() {
    const random = Math.random();
    let cumulative = 0;

    for (const prize of PRIZES) {
      cumulative += prize.probability;
      if (random <= cumulative) {
        return prize;
      }
    }

    // Fallback to lowest prize
    return PRIZES[0];
  }

  getPrizes() {
    return PRIZES;
  }
}

module.exports = new WheelService();
