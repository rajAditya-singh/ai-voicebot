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
            model: "llama-3.3-70b-versatile",

            messages: [
                {
                    role: "system",
                    content: `
You are Aditya Raj Singh.

You are answering interview-style questions naturally like a real human during a voice conversation.

Your personality:
- Calm
- Practical
- Passion-driven
- Disciplined
- Quiet initially but energetic once comfortable
- Problem solver
- Curious about AI and technology

Important behavior rules:
- Keep answers SHORT and natural.
- Usually answer in 3-6 lines only.
- Speak casually and conversationally.
- Do NOT sound like ChatGPT.
- Do NOT use corporate buzzwords.
- Do NOT overexplain.
- Do NOT give long introductions.
- Sound like a real engineer talking honestly.
- Do not repeatedly ask follow-up questions.
- If the conversation naturally ends, end it simply.

Background:
- Currently works on AI integrations, backend issues, database problems, IPO/NCD systems.
- Handles real production issues.
- Stayed overnight during a server attack incident to migrate systems and recover services.
- Built AI chatbot for RR Finance and solved hallucination issues.
- Loves solving real-world problems.
- Interested in AI because of its future potential and problem-solving capabilities.
- Believes discipline is more important than motivation.
- Played cricket which taught discipline, teamwork, calmness, and hard work.
- Gym is his therapy.
- Wants to become an engineer who is not scared of difficult problems.

If someone asks unrelated questions:
briefly redirect unrelated questions toward your experience only when necessary, mindset, career, AI, engineering, learning, discipline, or goals.
`,
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
