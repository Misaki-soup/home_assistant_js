import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { helper } from "./agent.js";

const file_path = fileURLToPath(import.meta.url);
const dir_name = path.dirname(file_path);
const data_dir = path.join(dir_name, "data");
fs.mkdirSync(data_dir, { recursive: true });
let current_chat = null;

function check_recent() {
  const file = path.join(data_dir, "recent.json");
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "[]");
  }
  return file;
}

function get_short_memory() {
  // returns list of obj
  try {
    const content = fs.readFileSync(check_recent(), "utf8");
    const data = JSON.parse(content);
    return data;
  } catch (err) {
    console.log(
      "Error hapened during extractiong of short  memory. It was empty or something bad happened",
    );
    return [];
  }
}

function write_to_memory(conv) {
  const data = [];
  try {
    const old_content = fs.readFileSync(check_recent(), "utf8");
    const old_data = JSON.parse(old_content);
    for (const msg of old_data) {
      data.push(msg);
    }
  } catch (err) {}

  for (const line of conv) {
    const exists = data.some(
      (chunk) => chunk.role === line.role && chunk.content === line.content,
    );
    if (!exists) {
      data.push(line);
    }
  }
  fs.writeFileSync(check_recent(), JSON.stringify(data));
  save_to_longmemory(data);
}

function clear_chat() {
  fs.writeFileSync(check_recent(), "");
}

async function optimize(option, history) {
  const sum_prompt = `You are a conversation-history compressor. You are NOT chatting with the
user — you are given a chunk of past conversation turns and must output a
compact summary that preserves everything a future turn would need, while
dropping everything it wouldn't.

## What to preserve (in priority order)
1. Decisions made — anything the user chose, committed to, or ruled out
2. Facts stated by the user — names, paths, configs, numbers, constraints,
   preferences, project/system details
3. Unresolved threads — questions still open, tasks still in progress, errors
   not yet fixed
4. Code/command state — what was written, what changed, what broke, what
   worked. Keep exact identifiers (file names, function names, flags,
   package names) verbatim — never paraphrase these.
5. Explicit instructions the user gave about how to be helped (tone, format,
   constraints on assistance)

## What to discard
- Pleasantries, small talk, filler acknowledgments ("sounds good", "thanks")
- The assistant's own reasoning/explanation *process* — keep conclusions,
  not the walkthrough
- Anything superseded later in the same chunk (e.g. a decision that was
  reversed — keep only the final state, don't preserve the abandoned path)
- Redundant restatements of the same fact

## Output format
Plain prose or tight bullets, organized by topic if multiple topics were
covered. No preamble, no "Here's a summary of...". Write as terse notes
the assistant will read back to itself, not as prose for the user.

Target length: as short as possible while losing zero decisions, facts,
or open threads. A summary that's too short but drops a fact is a failure;
a summary that's accurate but verbose is a lesser failure.

## Hard rule
Never invent, infer, or soften anything not explicitly present in the
source turns. If something is ambiguous in the original, mark it as
ambiguous rather than resolving it yourself.`;
  const file_name_prompt = `You are a conversation-title generator. You are given a chunk of chat
history (or a summary of one) and must output a single short title that
identifies what it's about — nothing else.

## Rules
- 1-5 words, plain text, no punctuation at the end, no quotes around it
- Fewer words is better — use the minimum needed to be specific
- Specific over generic: name the actual subject (tool, project, bug,
  decision), not the category. "SCADA sensor timeout" not "Bug fix
  discussion"
- Base it on the first user request and Claude's answer in the chunk —
  that's what most reliably identifies the topic
- If multiple topics were covered, pick the one a future search would
  most likely be looked up by
- No preamble, no "Title:" prefix — output the title text only, nothing else

## Output
One line. The title only.`;
  switch (option) {
    case 1: {
      //summary
      const meta = sum_prompt;
      return await helper(history, meta);
      break;
    }
    case 2: {
      //chat name
      const meta = file_name_prompt;
      const name = await helper(history, meta);
      current_chat = name.at(-1).content;
      return current_chat;
      break; //figure out to give a name to file etc
    }
  }
}

function create_conv_file(f_name) {
  const file = path.join(data_dir, `${f_name}.json`);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "[]");
  }
  return file;
}

function save_to_longmemory(conv) {
  if (!current_chat) return;
  fs.writeFileSync(create_conv_file(current_chat), JSON.stringify(conv));
}

function get_long_memory(file_name) {
  // returns list of obj
  try {
    const content = fs.readFileSync(file_name, "utf8");
    const data = JSON.parse(content);
    return data;
  } catch (err) {
    console.log(
      "Error hapened during extractiong of long  memory. It was empty or something bad happened",
    );
    return [];
  }
}

export {
  get_short_memory,
  write_to_memory,
  clear_chat,
  optimize,
  get_long_memory,
};
