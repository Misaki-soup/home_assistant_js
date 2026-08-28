import dotenv from "dotenv";
import fs from "fs";
import * as yaml from "js-yaml";
import Together from "together-ai";
import readline from "readline/promises";
import { get_short_memory, write_to_memory } from "./memory.js";

//init
dotenv.config({ override: true });

const client = new Together({ apiKey: process.env.together_api });

let config;
try {
  config = yaml.load(fs.readFileSync("config.yaml", "utf8"));
} catch (err) {
  config = {
    model: "qwen/qwen3-32b",
    max_tokens: 3000,
    system_prompt: "You are helpfull assistent!",
    reasoning_effort: "none",
    temperature: 0.4,
  };
  let write_to_yaml = yaml.dump(config, { indent: 2 });
  fs.writeFileSync("config.yaml", write_to_yaml, "utf8");
  console.log(`Error on loading config: ${err}`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.on("close", () => {
  console.log("Programm has been closed");
});

//funcs
async function assistent(message) {
  const history = get_short_memory();
  const system_prompt = { role: "system", content: config.system_prompt };
  if (history.length === 0) {
    history.push(system_prompt);
  }
  history.push({ role: "user", content: message });
  const response = await client.chat.completions.create({
    model: config.model,
    messages: history,
    reasoning_effort: config.reasoning_effort,
    temperature: config.temperature,
    max_tokens: config.max_tokens,
  });
  const answer = response.choices[0].message.content;
  console.log(`Agent: ${answer}`);
  history.push({ role: response.choices[0].message.role, content: answer });
  write_to_memory(history);
}

while (true) {
  let input = await rl.question("User: ");
  if (input === "q" || input === "quit") {
    rl.close();
    break;
  }
  await assistent(input);
}
