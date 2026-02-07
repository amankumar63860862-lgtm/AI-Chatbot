import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import multer from "multer";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 🔐 MongoDB connect
mongoose.connect(process.env.MONGODB_URI);

// 🔐 User schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model("User", userSchema);

// 💬 Chat schema
const chatSchema = new mongoose.Schema({
  userId: String,
  role: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
});
const Chat = mongoose.model("Chat", chatSchema);

// 🔐 Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// 🧾 Register
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hash });
  res.json({ message: "User registered" });
});

// 🔑 Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Wrong password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});

// 💬 Chat with AI (Text + Image)
app.post("/api/chat", auth, upload.single("image"), async (req, res) => {
  const { message } = req.body;
  const image = req.file;

  let userContent = message;
  if (image) userContent = "User sent an image.";

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: userContent }],
  });

  const reply = completion.choices[0].message.content;

  await Chat.create({ userId: req.userId, role: "user", content: userContent });
  await Chat.create({ userId: req.userId, role: "assistant", content: reply });

  res.json({ reply });
});

// 📜 Get chat history
app.get("/api/chats", auth, async (req, res) => {
  const chats = await Chat.find({ userId: req.userId }).sort({ createdAt: 1 });
  res.json(chats);
});

// 🗑 Delete all chats
app.delete("/api/chats", auth, async (req, res) => {
  await Chat.deleteMany({ userId: req.userId });
  res.json({ message: "Chats deleted" });
});

// 🎙 Voice to Text
app.post("/api/voice", auth, upload.single("audio"), async (req, res) => {
  res.json({ text: "Voice processing feature coming soon!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
