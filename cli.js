import readline from "readline/promises";
import { assistent } from "./agent.js";
import { files, chat_selector, new_chat } from "./memory.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.on("close", () => {
  console.log("Programm has been closed");
});
new_chat();
while (true) {
  let input = await rl.question("User: ");
  if (input === "q" || input === "quit") {
    rl.close();
    break;
  }
  if (input === "/select") {
    console.log(files());
    input = await rl.question("Chat: ");
    chat_selector(input);
    continue;
  }
  if (input === "/new") {
    new_chat();
    continue;
  }
  await assistent(input);
}
