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
  const [search, setSearch] = useState("");

  const [allUsers, setAllUsers] = useState([]); // all the user maintain and store karamate use karel 6e.

  const socketRef = useRef(null);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  // WRITE FILTER HERE (after states, before return)
  // const filteredUsers = onlineUsers.filter((u) =>
  //   u.name.toLowerCase().includes(search.toLowerCase())
  // );

  const filteredUsers = allUsers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

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

    // socketRef.current.on("online_users", (users) => {
    //   setOnlineUsers(users);
    // });
    socketRef.current.on("online_users", (users) => {
      setOnlineUsers(users);

      //  merge with previous users (keep offline users)
      setAllUsers((prev) => {
        const map = new Map();

        // old users
        prev.forEach((u) => {
          map.set(u.socketId, { ...u, online: false });
        });

        // update online users
        // users.forEach((u) => {
        //   map.set(u.socketId, { ...u, online: true });
        // });
        users.forEach((u) => {
          map.set(u.socketId, {
            ...u,
            online: u.online,        // USE BACKEND VALUE
            lastSeen: u.lastSeen     //  keep lastSeen
          });
        });
        return Array.from(map.values());
      });
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
      {/* <div style={{
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
      </div> */}

      {/* SIDEBAR */}
      <div style={{
        width: "30%",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #ddd"
      }}>

        {/* HEADER */}
        <div style={{
          padding: "12px",
          background: "#ededed",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ fontWeight: "bold" }}>Chats</div>
          <div>⋮</div>
        </div>

        {/* SEARCH */}
        <div style={{ padding: "10px" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search or start new chat"
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "none",
              background: "#f0f2f5",
              color: "black",
              outline: "none"
            }}
          />
        </div>

        {/* CHAT LIST */}
        <div style={{ flex: 1, overflowY: "auto" }}>

          {/* ROOM CHAT */}
          <div
            onClick={() => setSelectedUser(null)}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px",
              cursor: "pointer",
              background: !selectedUser ? "#f0f2f5" : "#fff",
              borderBottom: "1px solid #eee"
            }}
          >
            {/* Avatar */}
            <div style={{
              width: "45px",
              height: "45px",
              borderRadius: "50%",
              background: "#ccc",
              marginRight: "10px"
            }} />

            {/* Name + Message */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "500" }}>Room Chat</div>
              <div style={{ fontSize: "12px", color: "#667781" }}>
                Group conversation
              </div>
            </div>
          </div>

          {/* USERS */}
          {filteredUsers.map((u, i) => {
            const isSelected = selectedUser?.socketId === u.socketId;

            return (
              <div
                key={i}
                onClick={() => setSelectedUser(u)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px",
                  cursor: "pointer",
                  background: isSelected ? "#f0f2f5" : "#fff",
                  borderBottom: "1px solid #eee",
                  transition: "0.2s"
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "50%",
                  background: "#bbb",
                  marginRight: "10px",
                  position: "relative"
                }}>
                  {/* Online Dot */}
                  {/* <div style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#25D366",
                    position: "absolute",
                    bottom: "2px",
                    right: "2px",
                    border: "2px solid white"
                  }} /> */}

                  {u.online && (
                    <div style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: "#25D366",
                      position: "absolute",
                      bottom: "2px",
                      right: "2px",
                      border: "2px solid white"
                    }} />
                  )}
                </div>

                {/* User Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "500" }}>{u.name}</div>
                  <div style={{ fontSize: "12px", color: "#667781" }}>
                    {u.online ? "online" : "offline"}
                  </div>
                </div>

                {/* Time (optional UI) */}
                <div style={{ fontSize: "11px", color: "#999" }}>
                  now
                </div>
              </div>
            );
          })}
        </div>
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

            //  FIX: Room messages only in room chat
            if (msg.type === "room" && selectedUser) return null;

            //  FIX: Private messages only when user selected and involved
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

        {/* <div style={{ display: "flex", padding: "10px" }}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleEnter}
            style={{ flex: 1 }}
          /> */}

        {/* <button onClick={sendMessage}>Send</button>

          <input type="file" ref={fileRef} />
          <button onClick={sendImage}>📷</button> */}

        <div style={{
          display: "flex",
          alignItems: "center",
          padding: "10px",
          background: "#f0f2f5",
          borderTop: "1px solid #ddd",
          gap: "10px"
        }}>

          {/* Message Input */}
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleEnter}
            placeholder="Type a message"
            style={{
              flex: 1,
              padding: "10px 15px",
              borderRadius: "25px",
              border: "none",
              outline: "none",
              fontSize: "14px",
              background: "white",
              color: "black"
            }}
          />

          {/* File Upload Hidden */}
          <input
            type="file"
            ref={fileRef}
            style={{ display: "none" }}
            onChange={sendImage}
          />

          {/* Attach Button */}
          <button
            onClick={() => fileRef.current.click()}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer"
            }}
          >
            📎
          </button>

          {/* Send Button */}
          <button
            onClick={sendMessage}
            style={{
              background: "#25D366",
              border: "none",
              color: "white",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              fontSize: "18px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ➤
          </button>
        </div>

      </div>
    </div>
    // </div>
  );
}