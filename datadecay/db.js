const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("❌ MONGO_URI not found in datadecay/.env");
  process.exit(1);
}

const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log("✅ MongoDB connected (Data Decay Engine)");
    return client.db();
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}

module.exports = { connectDB };