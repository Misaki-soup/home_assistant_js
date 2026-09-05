import { useState } from "react";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState("");

  const getHistory = async () => {
    const req = await fetch("http://localhost:3000/chat/history", {
      method: "GET",
      headers: { "Content-Type": "application/JSON" },
    });
    const data = await req.json();
    setHistory(data.reply);
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
      <div className="nav"></div>
      <div className="showcase">
        <div className="chat_window">
          <div className="chat">
            {history &&
              history
                .filter((msg) => msg.role !== "system")
                .map((msg, index) => (
                  <p className={msg.role} key={index}>
                    {msg.content}
                  </p>
                ))}
          </div>
        </div>
        <div className="input">
          <textarea
            className="textik"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                await handleInput();
                await getHistory();
              }
            }}
          />
          <button className="inputButton" onClick={handleInput}>
            Huh?
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
