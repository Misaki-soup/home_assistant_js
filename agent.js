import dotenv from "dotenv";
import fs from "fs";
import * as yaml from "js-yaml";
import Together from "together-ai";
import {
  get_short_memory,
  write_to_memory,
  clear_history,
  save_to_longmemory,
  optimize,
} from "./memory.js";

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

//funcs
async function assistent(message) {
  if (message === "/clear") {
    clear_history();
    console.log("cleared");
    return "History cleared";
  }
  const history = get_short_memory();
  const system_prompt = { role: "system", content: config.system_prompt };
  if (history.length === 0) {
    history.push(system_prompt);
    const start = true;
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
  if (start) {
    optimize(2);
  }
  let tokens = 0;
  try {
    tokens = response.usage.total_tokens;
    console.log(tokens);
  } catch (err) {
    console.log("Failed to count tokens");
  }
  if (tokens >= 80000) {
    save_to_longmemory();
    write_to_memory(optimize(1));
  }
  return answer;
}

async function helper(history, options) {
  const message = [];
  message.push({ role: "user", content: history });
  const response = await client.chat.completions.create({
    system_prompt: optimize(option),
    model: "Prism-ML/Ternary-Bonsai-27B",
    messages: message,
    temperature: config.temperature,
  });
  const shortened_context = response.choices[0].message.content;
  console.log("memory shortened");
  const context = [{ role: "system", content: config.system_prompt }];
  context.push({
    role: response.choices[0].message.role,
    content: shortened_context,
  });
  return context;
}

export { assistent, helper };
