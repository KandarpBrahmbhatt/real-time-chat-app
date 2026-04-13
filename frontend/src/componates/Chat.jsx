import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function Chat() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);

  const socketRef = useRef(null);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  // CONNECT
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socketRef.current.on("receive_image", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socketRef.current.on("receive_private_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socketRef.current.on("receive_private_image", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socketRef.current.on("system", (msg) => {
      setMessages((prev) => [...prev, { system: true, message: msg }]);
    });

    socketRef.current.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    return () => socketRef.current.disconnect();
  }, []);

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const joinChat = () => {
    if (!name.trim() || !room.trim()) return;
    socketRef.current.emit("join", { name, room });
    setJoined(true);
  };

  // SEND MESSAGE
  const sendMessage = () => {
    if (!message.trim()) return;

    const time = new Date().toLocaleTimeString();

    if (selectedUser) {
      socketRef.current.emit("private_message", {
        to: selectedUser.socketId,
        message,
        from: name,
        time,
      });
    } else {
      socketRef.current.emit("send_message", {
        user: name,
        message,
        room,
        time,
        type: "room",
      });
    }

    setMessage("");
  };

  // SEND IMAGE
  const sendImage = async () => {
    const file = fileRef.current.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });

    const dataRes = await res.json();

    const time = new Date().toLocaleTimeString();

    if (selectedUser) {
      socketRef.current.emit("private_image", {
        to: selectedUser.socketId,
        image: dataRes.url,
        from: name,
        time,
      });
    } else {
      socketRef.current.emit("send_image", {
        user: name,
        image: dataRes.url,
        room,
        time,
        type: "room",
      });
    }

    fileRef.current.value = "";
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  if (!joined) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Join Chat</h2>
        <input onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <br /><br />
        <input onChange={(e) => setRoom(e.target.value)} placeholder="Room" />
        <br /><br />
        <button onClick={joinChat}>Join</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>

      {/* SIDEBAR */}
      <div style={{
        width: "250px",
        borderRight: "1px solid #ddd",
        padding: "10px",
        background: "#f7f7f7"
      }}>
        <h3>🟢 Online</h3>

        <div onClick={() => setSelectedUser(null)}>🌐 Room Chat</div>

        {onlineUsers.map((u, i) => (
          <div key={i} onClick={() => setSelectedUser(u)}>
            🟢 {u.name}
          </div>
        ))}
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        <div style={{
          padding: "10px",
          borderBottom: "1px solid #ddd",
          background: "#ededed"
        }}>
          <b>
            {selectedUser ? `Chat with ${selectedUser.name}` : `Room: ${room}`}
          </b>
        </div>

        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px",
          background: "#e5ddd5"
        }}>
          {messages.map((msg, i) => {

            // ✅ FIX: Separate handling for system messages
            if (msg.system) {
              return selectedUser ? null : (
                <div key={i} style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "10px"
                }}>
                  <div style={{
                    background: "#fff3cd",
                    padding: "5px 10px",
                    borderRadius: "10px"
                  }}>
                    {msg.message}
                  </div>
                </div>
              );
            }

            // ✅ FIX: Room messages only in room chat
            if (msg.type === "room" && selectedUser) return null;

            // ✅ FIX: Private messages only when user selected and involved
            if (msg.type === "private") {
              if (!selectedUser) return null;
              if (msg.from !== selectedUser.name && msg.from !== name) return null;
            }

            const isMe = (msg.user || msg.from) === name;

            return (
              <div key={i} style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                marginBottom: "10px"
              }}>
                <div style={{
                  maxWidth: "60%",
                  background: isMe ? "#dcf8c6" : "#fff",
                  padding: "10px",
                  borderRadius: "10px"
                }}>
                  <b>{msg.user || msg.from}</b>

                  {msg.image ? (
                    <img src={msg.image} style={{ width: "100%" }} />
                  ) : (
                    <p>{msg.message}</p>
                  )}

                  <div style={{ fontSize: "10px" }}>
                    {msg.time}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        <div style={{ display: "flex", padding: "10px" }}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleEnter}
            style={{ flex: 1 }}
          />

          <button onClick={sendMessage}>Send</button>

          <input type="file" ref={fileRef} />
          <button onClick={sendImage}>📷</button>
        </div>
      </div>
    </div>
  );
}