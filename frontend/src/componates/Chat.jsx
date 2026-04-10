
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function Chat() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  // Create socket ONCE
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    // receive welcome/system messages
    socketRef.current.on("welcome", (msg) => {
      setMessages((prev) => [
        ...prev,
        { system: true, message: msg },
      ]);
    });

    // receive chat messages
    socketRef.current.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Join event when name is entered
  const joinChat = () => {
    if (name.trim()) {
      socketRef.current.emit("join", name);
    }
  };

  // Send message
  const sendMessage = () => {
    if (!name || !message) return;

    const data = {
      user: name,
      message,
      time: new Date().toLocaleTimeString(),
    };

    socketRef.current.emit("send_message", data);
    setMessage("");
  };

  // Enter key send
  const handleEnter = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>Real Time Chat</div>

      {/* Name input */}
      <input
        placeholder="Enter your name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={joinChat}
        style={styles.nameInput}
      />

      {/* Chat box */}
      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={
              msg.system
                ? styles.system
                : msg.user === name
                ? styles.me
                : styles.other
            }
          >
            {!msg.system && (
              <div style={styles.user}>
                {msg.user}
                <span style={styles.time}>{msg.time}</span>
              </div>
            )}

            <div>{msg.message}</div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={styles.inputBox}>
        <input
          placeholder="Type message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleEnter}
          style={styles.input}
        />

        <button onClick={sendMessage} style={styles.btn}>
          Send
        </button>
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    width: 400,
    margin: "20px auto",
    fontFamily: "Arial",
    border: "1px solid #ddd",
    borderRadius: 10,
    overflow: "hidden",
  },
  header: {
    background: "#4A90E2",
    color: "white",
    padding: 15,
    fontWeight: "bold",
  },
  nameInput: {
    width: "100%",
    padding: 10,
    border: "none",
    borderBottom: "1px solid #eee",
  },
  chatBox: {
    height: 400,
    overflowY: "auto",
    padding: 10,
    background: "#f5f5f5",
  },
  me: {
    background: "#DCF8C6",
    padding: "6px 10px",
    borderRadius: 8,
    margin: "4px 0",
    marginLeft: "auto",
    maxWidth: "70%",
    width: "fit-content",
    fontSize: 13,
  },
  other: {
    background: "white",
    padding: "6px 10px",
    borderRadius: 8,
    margin: "4px 0",
    marginRight: "auto",
    maxWidth: "70%",
    width: "fit-content",
    fontSize: 13,
  },
  system: {
    textAlign: "center",
    fontSize: 12,
    color: "gray",
    margin: 10,
  },
  user: {
    fontWeight: "bold",
    fontSize: 11,
    marginBottom: 2,
  },
  time: {
    marginLeft: 6,
    fontSize: 9,
    color: "gray",
  },
  inputBox: {
    display: "flex",
    borderTop: "1px solid #eee",
  },
  input: {
    flex: 1,
    padding: 12,
    border: "none",
  },
  btn: {
    padding: "0 20px",
    background: "#4A90E2",
    color: "white",
    border: "none",
  },
};