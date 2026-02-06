import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    // OpenAI API call karke reply le rahe hain
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: userMessage }
      ],
    });

    const aiReply = completion.choices[0].message.content;

    res.json({ reply: aiReply });
  } catch (error) {
    console.error('Error from OpenAI:', error);
    res.status(500).json({ reply: 'Kuch galat ho gaya, try karo later.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
