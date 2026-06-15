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

let conversationHistory = [];

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

- Answer like a real human being, not an AI assistant.
- Speak naturally as if someone is talking to you over a call.
- Use personal experiences whenever possible.
- If asked follow-up questions, remember previous context.
- Keep most answers between 30 and 100 words.
- Do not sound scripted.
- Do not use corporate buzzwords.
- Do not say "As an AI".
- Do not give generic motivational quotes.
- Show personality, opinions and reasoning.
- Sometimes start with phrases like:
  "Honestly..."
  "From my experience..."
  "I learned this the hard way..."
  "One thing I've noticed is..."
- Be authentic and conversational.

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
                ...conversationHistory,
                {
                    role: "user",
                    content: message,
                },
            ],
        });

        const reply = completion.choices[0].message.content;
        conversationHistory.push({
            role: "user",
            content: message,
        });

        conversationHistory.push({
            role: "assistant",
            content: reply,
        });

        /* LIMIT MEMORY */
        if (conversationHistory.length > 30) {
            conversationHistory =
                conversationHistory.slice(-30);
        }

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
