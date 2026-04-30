import React, { useState } from "react";
import axios from "axios";

function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    const userMessage = { type: "user", text: input };

    const res = await axios.post("http://127.0.0.1:8000/chat", {
      input_text: input,
    });

    const botMessage = {
      type: "bot",
      text: res.data.data.summary,
      sentiment: res.data.data.sentiment,
      follow_up: res.data.data.follow_up,
    };

    setMessages([...messages, userMessage, botMessage]);
    setInput("");
  };

  return (
    <div>
      <div style={{ border: "1px solid gray", padding: "10px", height: "300px", overflowY: "scroll" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ margin: "10px 0" }}>
            {msg.type === "user" ? (
              <b>You:</b>
            ) : (
              <b>AI:</b>
            )}
            <p>{msg.text}</p>

            {msg.type === "bot" && (
              <>
                <small>Sentiment: {msg.sentiment}</small><br />
                <small>Follow-up: {msg.follow_up}</small>
              </>
            )}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter interaction..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chat;