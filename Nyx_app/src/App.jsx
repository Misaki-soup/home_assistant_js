import { useState } from "react";
//import "./App.css";

function App() {
  const [input, setText] = useState("");
  const [messages, setMessage] = useState("");

  const handleInput = async () => {
    if (input.trim() !== "") {
      const req = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/JSON" },
        body: JSON.stringify({ message: input }),
      });
      const data = await req.json();
      console.log(data.reply);
      setText("");
    }
  };

  return (
    <>
      <div>
        <input
          value={input}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleInput();
            }
          }}
        />
        <button onClick={handleInput}>AAAAAAAAAAA</button>
      </div>
    </>
  );
}

export default App;
