const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend from public folder
app.use(express.static(path.join(__dirname, "public")));

// Force root route to serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Test route
app.get("/test", (req, res) => {
  res.send("Server is working!");
});

app.post("/api/chat", async (req, res) => {
  const { message, image } = req.body;
  if (image) {
    return res.json({ reply: "Image received! Processing it..." });
  }
  res.json({ reply: "This is a demo reply: " + message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
