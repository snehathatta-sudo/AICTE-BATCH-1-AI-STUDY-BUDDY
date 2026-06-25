require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

app.get("/", (req, res) => {
  res.send("✅ AI Study Buddy Server is Running");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        reply: "Please enter a message.",
      });
    }

    const result = await model.generateContent(message);
    const response = await result.response;
    const reply = response.text();

    res.json({ reply });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      reply: "Sorry, something went wrong while generating the response.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});