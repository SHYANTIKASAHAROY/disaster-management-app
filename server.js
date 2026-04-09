import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 (keep your key for now, we'll secure later)
const API_KEY = "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";

app.get("/", (req, res) => {
  res.send("🚀 Disaster Management Backend is Running!");
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer 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`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "arcee-ai/trinity-large-preview:free",
        messages: [
          {
            role: "system",
            content: "You are an emergency safety assistant. Give short, clear safety advice.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content || "No AI response";

    res.json({ reply });

  } catch (err) {
    console.log(err);
    res.json({ reply: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});