import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      sender: "You",
      text: input
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/chat", {
        input_text: input
      });

      const data = res.data.data;

      const botMessage = {
        sender: "AI",
        text: `Doctor: ${data.hcp_name}
Summary: ${data.summary}
Sentiment: ${data.sentiment}
Follow-up: ${data.follow_up}`
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "AI", text: "Server error ❌" }
      ]);
    }

    setLoading(false);
  };

  // Fetch history
  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/interactions");
      setHistory(res.data);
    } catch (err) {
      console.log("Error fetching history");
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "20px auto",
        fontFamily: "Arial",
        background: "#1e1e1e",
        color: "white",
        padding: "15px",
        borderRadius: "10px"
      }}
    >
      <h2 style={{ textAlign: "center" }}>AI CRM Chat</h2>

      {/* Chat Box */}
      <div
        style={{
          border: "1px solid #444",
          borderRadius: "10px",
          padding: "15px",
          height: "350px",
          overflowY: "auto",
          background: "#2c2c2c"
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent:
                msg.sender === "You" ? "flex-end" : "flex-start",
              marginBottom: "10px"
            }}
          >
            <div
              style={{
                background:
                  msg.sender === "You" ? "#4caf50" : "#444",
                padding: "10px",
                borderRadius: "10px",
                maxWidth: "75%",
                whiteSpace: "pre-line"
              }}
            >
              <b>{msg.sender}</b>
              <div>{msg.text}</div>
            </div>
          </div>
        ))}

        {loading && <p>AI is thinking...</p>}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input Section */}
      <div style={{ display: "flex", marginTop: "10px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter interaction..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "5px",
            border: "none",
            outline: "none"
          }}
        />

        <button
          onClick={sendMessage}
          style={{
            marginLeft: "10px",
            padding: "10px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Send
        </button>

        <button
          onClick={clearChat}
          style={{
            marginLeft: "10px",
            padding: "10px",
            background: "red",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Clear
        </button>

        <button
          onClick={fetchHistory}
          style={{
            marginLeft: "10px",
            padding: "10px",
            background: "orange",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          History
        </button>
      </div>

      {/* History Table */}
      {history.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Interaction History</h3>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "white",
              color: "black"
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Doctor
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Summary
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Sentiment
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Follow-up
                </th>
              </tr>
            </thead>

            <tbody>
              {history.map((item, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {item.hcp_name}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {item.summary}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {item.sentiment}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {item.follow_up}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;