const express = require('express');
const cors = require('cors');
const path = require("path");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Frontend serve
app.use(express.static(path.join(__dirname, "public")));

app.post('/api/chat', async (req, res) => {
  const { message, image } = req.body;

  if (image) {
    return res.json({ reply: "Image received! Processing it..." });
  }

  const reply = "This is a demo reply: " + message;
  res.json({ reply });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
