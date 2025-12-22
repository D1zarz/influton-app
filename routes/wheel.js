const express = require("express");
const wheelService = require("../services/wheelService");

const router = express.Router();

// Render wheel page
router.get("/wheel", async (req, res) => {
  const { username, userId } = req.query;

  if (!username || !userId) {
    return res.redirect("/error");
  }

  try {
    const spinStatus = await wheelService.getSpinStatus(userId);
    const prizes = wheelService.getPrizes();

    return res.render("wheel", {
      username,
      userId,
      spinStatus,
      prizes: JSON.stringify(prizes),
    });
  } catch (error) {
    console.error("Wheel page error:", error);
    return res.redirect("/error");
  }
});

// API: Get spin status
router.get("/api/wheel/status/:userId", async (req, res) => {
  try {
    const status = await wheelService.getSpinStatus(req.params.userId);
    res.json({ success: true, ...status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Perform spin
router.post("/api/wheel/spin", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, error: "userId required" });
  }

  try {
    const result = await wheelService.performSpin(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
