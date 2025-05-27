import express from "express";
import { StreamVideoServer } from "@stream-io/video-node";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

const videoServer = new StreamVideoServer({ apiKey, apiSecret });

router.post("/create-call", async (req, res) => {
  const { callerId, receiverId } = req.body;

  if (!callerId || !receiverId) {
    return res.status(400).json({ error: "callerId and receiverId are required" });
  }

  // Create unique callId based on caller and receiver
  const callId = [callerId, receiverId].sort().join("-");

  try {
    const call = videoServer.call("default", callId);

    // Create or get call with members
    await call.getOrCreate({
      members: [
        { user_id: callerId },
        { user_id: receiverId },
      ],
    });

    return res.status(200).json({ callId });
  } catch (error) {
    console.error("Failed to create call:", error);
    return res.status(500).json({ error: "Failed to create call" });
  }
});

export default router;
