import express from "express";
import { assistent } from "./agent.js";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app;
app.post("/chat", async (req, res) => {
  const message = req.body.message;
  const answer = await assistent(message);
  res.json({ reply: answer });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
