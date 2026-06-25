require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

// Validate API Key
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing");
    process.exit(1);
}

// Middleware
app.use(cors());

app.use(express.json({
    limit: "1mb"
}));

app.use(express.urlencoded({
    extended: true
}));

// Security Headers
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    next();
});

// Static Files
app.use(express.static(path.join(__dirname)));

// Gemini Setup
const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});

// ======================
// Routes
// ======================

// Home Route
app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "index.html")
    );
});

// Health Check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        uptime: process.uptime()
    });
});

// Chat Route
app.post("/chat", async (req, res) => {

    try {

        const { message, feature } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                reply: "Please enter a valid message."
            });
        }

        let prompt = "";

        switch (feature) {

            case "Summarize":

                prompt = `
You are AI Study Buddy.

Summarize the following content in 5-7 short bullet points.

Rules:
- Keep it concise.
- Focus only on the main ideas.
- Do NOT explain line by line.
- Use simple student-friendly language.

Content:
${message}
`;
                break;

            case "Quiz":

                prompt = `
You are AI Study Buddy.

Create 5 multiple-choice questions.

Format:

1. Question
A)
B)
C)
D)

Answer: X

Content:
${message}
`;
                break;

            case "Flashcards":

                prompt = `
You are AI Study Buddy.

Create at least 5 flashcards.

Format:

Q: Question
A: Answer

Content:
${message}
`;
                break;

            case "Explain":

            default:

                prompt = `
You are AI Study Buddy.

Explain the topic in a simple student-friendly way.

Rules:
- Use easy language.
- Give examples.
- Make learning easy.

Topic:
${message}
`;
        }

        const result = await model.generateContent(prompt);

        const reply =
            result?.response?.text() ||
            "No response generated.";

        return res.status(200).json({
            reply
        });

    } catch (error) {

        console.error("Gemini Error:", error);

        return res.status(500).json({
            reply:
                "⚠️ Sorry, I couldn't process your request right now."
        });
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found"
    });
});

// Start Server
app.listen(PORT, () => {

    console.log("================================");
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📂 Directory: ${__dirname}`);

    try {
        console.log(
            "📄 Files:",
            fs.readdirSync(__dirname)
        );
    } catch (err) {
        console.log("Could not read directory");
    }

    console.log("================================");
});