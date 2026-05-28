require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

app.get("/", (req, res) => {
    res.send("AI Voicebot Backend Running");
});

app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        const completion = await groq.chat.completions.create({
            model: "llama3-8b-8192",

            messages: [
                {
                    role: "system",
                    content:
                        "You are Aditya Raj Singh, an AI developer answering interview questions naturally and confidently.",
                },
                {
                    role: "user",
                    content: message,
                },
            ],
        });

        const reply = completion.choices[0].message.content;

        res.json({
            reply,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            error: "Something went wrong",
        });
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
