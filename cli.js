import readline from "readline/promises";
import { assistent } from "./agent.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.on("close", () => {
  console.log("Programm has been closed");
});

while (true) {
  let input = await rl.question("User: ");
  if (input === "q" || input === "quit") {
    rl.close();
    break;
  }
  await assistent(input);
}
