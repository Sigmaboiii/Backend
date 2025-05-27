import express from "express";
import { StreamVideoServer } from "@stream-io/video-node";
import dotenv from "dotenv";
import { authenticateUser } from "../middleware/authMiddleware.js";

dotenv.config();

const router = express.Router();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

const videoServer = new StreamVideoServer({ apiKey, apiSecret });

router.post("/create-call", authenticateUser, async (req, res) => {
  const { callerId, receiverId } = req.body;

  if (!callerId || !receiverId) {
    return res.status(400).json({ error: "callerId and receiverId are required" });
  }

  // Optionally, validate callerId matches the logged-in user
  if (req.user.id !== callerId) {
    return res.status(403).json({ error: "Caller ID does not match authenticated user" });
  }

  const callId = [callerId, receiverId].sort().join("-");

  try {
    const call = videoServer.call("default", callId);

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


