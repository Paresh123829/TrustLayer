const express = require("express");
const router = express.Router();

router.get("/check/:userId", async (req, res) => {
  const db = req.app.locals.db;
  const { userId } = req.params;

  try {
    const token = await db.collection("token_history").findOne({
      user_id: userId
    });

    if (!token) {
      return res.status(403).json({
        allowed: false,
        reason: "Session expired or invalid user"
      });
    }

    res.json({ allowed: true });
  } catch (err) {
    console.error("Token check error:", err);
    res.status(500).json({ allowed: false, reason: "Server error" });
  }
});

module.exports = router;