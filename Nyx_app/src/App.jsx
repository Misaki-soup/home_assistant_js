import { useState, useEffect, useRef } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";

function App() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [c_names, setNames] = useState([]);
  const bottomRef = useRef(null);

  const getHistory = async () => {
    console.log("called for history");

    const req = await fetch("http://localhost:3000/chat", {
      method: "GET",
      headers: { "Content-Type": "application/JSON" },
    });
    const data = await req.json();
    setHistory(data.reply);
  };
  const getChatNames = async () => {
    console.log("called for chats");
    const req = await fetch("http://localhost:3000/conversations", {
      method: "GET",
      headers: { "Content-Type": "application/JSON" },
    });
    const names = await req.json();
    setNames(names.answer);
  };
  const selectedChat = async (name) => {
    console.log("selected chat ", name);
    await fetch(`http://localhost:3000/chat/select/${name}`, {
      method: "POST",
    });
  };
  const new_chat = async () => {
    console.log("new chat created");
    await fetch("http://localhost:3000/new_chat", { method: "GET" });
  };
  //Get buttons with conversation names. and add button for new chats
  useEffect(() => {
    //onload load of page
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getHistory();
    getChatNames();
  }, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleInput = async () => {
    const question = input;
    setInput("");
    if (question.trim() !== "") {
      setHistory((previous) => [
        ...previous,
        { role: "user", content: question },
      ]);
      const req = await fetch("http://localhost:3000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/JSON" },
        body: JSON.stringify({ message: question }),
      });

      let status = req.status === 200 ? "successful call" : "call failed";
      console.log(status);
      const data = await req.json();
      console.log(data.reply);
      setHistory((previous) => [
        ...previous,
        { role: "assistant", content: data.reply },
      ]);
      //do the whole thing with messages. show the history e.t.c. first function to store it. then the showcase on page fix extraction from the memory of the chat
    }
  };

  return (
    <>
      <div className="nav">
        <div className="buttons_nav">
          <button
            className="new_chat"
            onClick={() => {
              new_chat();
              getHistory();
              getChatNames();
            }}
          >
            New Chat
          </button>
        </div>
        <div className="sep_h"></div>
        <div className="history">
          <div className="category_name">
            <span className="s_names">Chats</span>
          </div>
          <div className="chats">
            {c_names &&
              c_names.map((chat, index) => (
                <button
                  className="chat_name navigation"
                  key={index}
                  onClick={async () => {
                    await selectedChat(chat);
                    await getHistory(chat);
                  }}
                >
                  {chat}
                </button>
              ))}
          </div>
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
            <div ref={bottomRef} />
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
              }
            }}
          />
          <button
            className="inputButton"
            onClick={async () => {
              await handleInput();
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
