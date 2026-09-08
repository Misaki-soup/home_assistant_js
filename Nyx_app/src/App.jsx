import { useState, useEffect } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";

function App() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState("");

  const getHistory = async () => {
    console.log("called for history");
    const req = await fetch("http://localhost:3000/chat/history", {
      method: "GET",
      headers: { "Content-Type": "application/JSON" },
    });
    const data = await req.json();
    setHistory(data.reply);
  };

  useEffect(() => {
    //onload load of page
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getHistory();
  }, []);

  const handleInput = async () => {
    const question = input;
    setInput("");
    if (question.trim() !== "") {
      const req = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/JSON" },
        body: JSON.stringify({ message: question }),
      });

      let status = req.status === 200 ? "successful call" : "call failed";
      console.log(status);
      const data = await req.json();
      console.log(data.reply);
      //do the whole thing with messages. show the history e.t.c. first function to store it. then the showcase on page fix extraction from the memory of the chat
    }
  };

  return (
    <>
      <div className="nav">
        <div className="buttons_nav">
          <div className="new_chat"></div>
        </div>
        <div className="sep_h"></div>
        <div className="history">
          <div className="category_name">
            <span className="s_names">Chats</span>
          </div>
          <div className="chats"></div>
        </div>
        <div className="sep_h"></div>
        <div className="user_settings"></div>
      </div>
      <div className="sep_w"></div>
      <div className="showcase">
        <div className="chat_window">
          <div className="chat">
            {history &&
              history
                .filter((msg) => msg.role !== "system")
                .map((msg, index) => (
                  <div className={`message ${msg.role}`} key={index}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ))}
          </div>
        </div>
        <div className="input">
          <textarea
            className="text_input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                await handleInput();
                await getHistory();
              }
            }}
          />
          <button
            className="inputButton"
            onClick={async () => {
              (await handleInput(), await getHistory());
            }}
          >
            Huh?
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
