const cron = require("node-cron");

function startDecayJob(db) {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const result = await db.collection("token_history").deleteMany({
        expiresAt: { $lte: now }
      });

      if (result.deletedCount > 0) {
        console.log(`🧹 Cleaned up ${result.deletedCount} expired token(s)`);
      }
    } catch (err) {
      console.error("Decay job error:", err);
    }
  });

  console.log("🕐 Data decay job scheduled (every minute)");
}

module.exports = startDecayJob;