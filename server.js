require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

// Debug logs
console.log("Current directory:", __dirname);
console.log("Files in directory:", fs.readdirSync(__dirname));

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// Gemini AI Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// Home Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Chat Route
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        reply: "Please enter a message.",
      });
    }

    const result = await model.generateContent(message);
    const reply = result.response.text();

    res.json({ reply });

  } catch (error) {
    console.error("Gemini Error:", error);

    res.status(500).json({
      reply: "Sorry, something went wrong while generating the response.",
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});