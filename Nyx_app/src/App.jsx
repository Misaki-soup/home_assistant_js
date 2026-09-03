import { useState } from "react";
//import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState("");

  const getHistory = async () => {
    const req = await fetch("http://localhost:3000/chat/history", {
      method: "GET",
      headers: { "Content-Type": "application/JSON" },
    });
    const data = await req.json();
    setHistory(data);
  };

  const handleInput = async () => {
    if (input.trim() !== "") {
      const req = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/JSON" },
        body: JSON.stringify({ message: input }),
      });
      const data = await req.json();
      console.log(data.reply);
      //do the whole thing with messages. show the history e.t.c. first function to store it. then the showcase on page fix extraction from the memory of the chat

      setInput("");
    }
  };

  return (
    <>
      <div>
        {history.reply &&
          history.reply.map((msg, index) => <p key={index}>{msg.content}</p>)}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleInput();
              getHistory();
            }
          }}
        />
        <button onClick={handleInput}>AAAAAAAAAAA</button>
      </div>
    </>
  );
}

export default App;
