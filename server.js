import express from "express";
import { assistent } from "./agent.js";
import { get_memory, files, chat_selector, new_chat } from "./memory.js";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app;

app.post("/ask", async (req, res) => {
  const message = req.body.message;
  const answer = await assistent(message);
  res.json({ reply: answer });
});

app.get("/chat", async (req, res) => {
  const answer = get_memory();
  res.json({ reply: answer });
});
app.get("/conversations", (req, res) => {
  const answer = files();
  res.json({ answer });
});

app.post("/chat/select/:name", (req, res) => {
  chat_selector(req.params.name);
  res.sendStatus(204);
});
app.get("/new_chat", (req, res) => {
  new_chat();
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
