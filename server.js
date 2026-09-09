import express from "express";
import fs from "fs";
import path from "path";
import { assistent } from "./agent.js";
import { get_short_memory, get_long_memory } from "./memory.js";
import cors from "cors";

const app = express();
const data_dir = path.join(process.cwd(), "data");

app.use(cors());
app.use(express.json());
app;

app.post("/chat", async (req, res) => {
  const message = req.body.message;
  const answer = await assistent(message);
  res.json({ reply: answer });
});

app.get("/chat/recent", async (req, res) => {
  const answer = get_short_memory();
  res.json({ reply: answer });
});

app.get("/conversations", (req, res) => {
  //returns just list of strings with names of files
  const files = fs
    .readdirSync(data_dir)
    .filter((f) => f.endsWith(".json") && f !== "recent.json")
    .map((f) => f.replace(".json", ""));

  res.json(files);
});

app.get("/chat/history", async (req, res) => {
  const answer = get_long_memory();
  res.json({ reply: answer });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
