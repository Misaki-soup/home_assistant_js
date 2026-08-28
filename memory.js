import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const file_path = fileURLToPath(import.meta.url);
const dir_name = path.dirname(file_path);
const data_dir = path.join(dir_name, "data");
fs.mkdirSync(data_dir, { recursive: true });

function check_recent() {
  const file = path.join(data_dir, "recent.json");
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "[]");
  }
  return file;
}

function get_short_memory() {
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
}

export { get_short_memory, write_to_memory };
