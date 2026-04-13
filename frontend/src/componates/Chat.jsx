
// import { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";

// export default function Chat() {
//   const [name, setName] = useState("");
//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]);

//   const socketRef = useRef(null);
//   const bottomRef = useRef(null);

//   // Create socket ONCE
//   useEffect(() => {
//     socketRef.current = io("http://localhost:5000");

//     // receive welcome/system messages
//     socketRef.current.on("welcome", (msg) => {
//       setMessages((prev) => [
//         ...prev,
//         { system: true, message: msg },
//       ]);
//     });

//     // receive chat messages
//     socketRef.current.on("receive_message", (data) => {
//       setMessages((prev) => [...prev, data]);
//     });

//     return () => {
//       socketRef.current.disconnect();
//     };
//   }, []);

//   // Join event when name is entered
//   const joinChat = () => {
//     if (name.trim()) {
//       socketRef.current.emit("join", name);
//     }
//   };

//   // Send message
//   const sendMessage = () => {
//     if (!name || !message) return;

//     const data = {
//       user: name,
//       message,
//       time: new Date().toLocaleTimeString(),
//     };

//     socketRef.current.emit("send_message", data);
//     setMessage("");
//   };

//   // Enter key send
//   const handleEnter = (e) => {
//     if (e.key === "Enter") sendMessage();
//   };

//   // Auto scroll
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   return (
//     <div style={styles.container}>
//       <div style={styles.header}>Real Time Chat</div>

//       {/* Name input */}
//       <input
//         placeholder="Enter your name..."
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         onBlur={joinChat}
//         style={styles.nameInput}
//       />

//       {/* Chat box */}
//       <div style={styles.chatBox}>
//         {messages.map((msg, i) => (
//           <div
//             key={i}
//             style={
//               msg.system
//                 ? styles.system
//                 : msg.user === name
//                 ? styles.me
//                 : styles.other
//             }
//           >
//             {!msg.system && (
//               <div style={styles.user}>
//                 {msg.user}
//                 <span style={styles.time}>{msg.time}</span>
//               </div>
//             )}

//             <div>{msg.message}</div>
//           </div>
//         ))}

//         <div ref={bottomRef} />
//       </div>

//       {/* Input */}
//       <div style={styles.inputBox}>
//         <input
//           placeholder="Type message..."
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           onKeyDown={handleEnter}
//           style={styles.input}
//         />

//         <button onClick={sendMessage} style={styles.btn}>
//           Send
//         </button>
//       </div>
//     </div>
//   );
// }

// // Styles
// const styles = {
//   container: {
//     width: 400,
//     margin: "20px auto",
//     fontFamily: "Arial",
//     border: "1px solid #ddd",
//     borderRadius: 10,
//     overflow: "hidden",
//   },
//   header: {
//     background: "#4A90E2",
//     color: "white",
//     padding: 15,
//     fontWeight: "bold",
//   },
//   nameInput: {
//     width: "100%",
//     padding: 10,
//     border: "none",
//     borderBottom: "1px solid #eee",
//   },
//   chatBox: {
//     height: 400,
//     overflowY: "auto",
//     padding: 10,
//     background: "#f5f5f5",
//   },
//   me: {
//     background: "#DCF8C6",
//     padding: "6px 10px",
//     borderRadius: 8,
//     margin: "4px 0",
//     marginLeft: "auto",
//     maxWidth: "70%",
//     width: "fit-content",
//     fontSize: 13,
//   },
//   other: {
//     background: "white",
//     padding: "6px 10px",
//     borderRadius: 8,
//     margin: "4px 0",
//     marginRight: "auto",
//     maxWidth: "70%",
//     width: "fit-content",
//     fontSize: 13,
//   },
//   system: {
//     textAlign: "center",
//     fontSize: 12,
//     color: "gray",
//     margin: 10,
//   },
//   user: {
//     fontWeight: "bold",
//     fontSize: 11,
//     marginBottom: 2,
//   },
//   time: {
//     marginLeft: 6,
//     fontSize: 9,
//     color: "gray",
//   },
//   inputBox: {
//     display: "flex",
//     borderTop: "1px solid #eee",
//   },
//   input: {
//     flex: 1,
//     padding: 12,
//     border: "none",
//   },
//   btn: {
//     padding: "0 20px",
//     background: "#4A90E2",
//     color: "white",
//     border: "none",
//   },
// };

// import { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";

// export default function Chat() {
//   const [name, setName] = useState("");
//   const [room, setRoom] = useState("");
//   const [joined, setJoined] = useState(false);

//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [onlineUsers, setOnlineUsers] = useState([]);

//   const socketRef = useRef(null);
//   const fileRef = useRef();

//   useEffect(() => {
//     socketRef.current = io("http://localhost:5000");

//     socketRef.current.on("receive_message", (data) => {
//       setMessages((prev) => [...prev, data]);
//     });

//     socketRef.current.on("receive_image", (data) => {
//       setMessages((prev) => [...prev, data]);
//     });

//     socketRef.current.on("system", (msg) => {
//       setMessages((prev) => [...prev, { system: true, message: msg }]);
//     });

//     socketRef.current.on("online_users", (users) => {
//       setOnlineUsers(users);
//     });

//     return () => socketRef.current.disconnect();
//   }, []);

//   // JOIN CHAT
//   const joinChat = () => {
//     if (name && room) {
//       socketRef.current.emit("join", { name, room });
//       setJoined(true);
//     }
//   };

//   // SEND MESSAGE
//   const sendMessage = () => {
//     const data = {
//       user: name,
//       message,
//       room,
//       time: new Date().toLocaleTimeString(),
//     };

//     socketRef.current.emit("send_message", data);
//     setMessage("");
//   };

//   // SEND IMAGE
//   const sendImage = () => {
//     const file = fileRef.current.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = () => {
//       const data = {
//         user: name,
//         image: reader.result,
//         room,
//       };

//       socketRef.current.emit("send_image", data);
//     };
//     reader.readAsDataURL(file);
//   };

//   if (!joined) {
//     return (
//       <div>
//         <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
//         <input placeholder="Room" onChange={(e) => setRoom(e.target.value)} />
//         <button onClick={joinChat}>Join Chat</button>
//       </div>
//     );
//   }

//   return (
//     <div style={{ display: "flex" }}>
      
//       {/* ONLINE USERS */}
//       <div style={{ width: 200, borderRight: "1px solid gray" }}>
//         <h3>Online</h3>
//         {onlineUsers.map((u, i) => (
//           <div key={i}>🟢 {u.name}</div>
//         ))}
//       </div>

//       {/* CHAT */}
//       <div style={{ flex: 1 }}>
//         <div style={{ height: 400, overflow: "auto" }}>
//           {messages.map((msg, i) => (
//             <div key={i}>
//               {msg.system ? (
//                 <p>{msg.message}</p>
//               ) : msg.image ? (
//                 <div>
//                   <b>{msg.user}</b>
//                   <img src={msg.image} width={150} />
//                 </div>
//               ) : (
//                 <p>
//                   <b>{msg.user}</b>: {msg.message}
//                 </p>
//               )}
//             </div>
//           ))}
//         </div>

//         <input
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//         />
//         <button onClick={sendMessage}>Send</button>

//         <input type="file" ref={fileRef} />
//         <button onClick={sendImage}>Send Image</button>
//       </div>
//     </div>
//   );
// }




// import { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";

// export default function Chat() {
//   const [name, setName] = useState("");
//   const [room, setRoom] = useState("");
//   const [joined, setJoined] = useState(false);

//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [onlineUsers, setOnlineUsers] = useState([]);

//   const socketRef = useRef(null);
//   const fileRef = useRef();

//   useEffect(() => {
//     socketRef.current = io("http://localhost:5000");

//     socketRef.current.on("receive_message", (data) => {
//       setMessages((prev) => [...prev, data]);
//     });

//     socketRef.current.on("receive_image", (data) => {
//       setMessages((prev) => [...prev, data]);
//     });

//     socketRef.current.on("system", (msg) => {
//       setMessages((prev) => [...prev, { system: true, message: msg }]);
//     });

//     socketRef.current.on("online_users", (users) => {
//       setOnlineUsers(users);
//     });

//     return () => socketRef.current.disconnect();
//   }, []);

//   const joinChat = () => {
//     if (name && room) {
//       socketRef.current.emit("join", { name, room });
//       setJoined(true);
//     }
//   };

//   const sendMessage = () => {
//     if (!message.trim()) return;

//     const data = {
//       user: name,
//       message,
//       room,
//       time: new Date().toLocaleTimeString(),
//     };

//     socketRef.current.emit("send_message", data);
//     setMessage("");
//   };

//   const sendImage = () => {
//     const file = fileRef.current.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = () => {
//       const data = {
//         user: name,
//         image: reader.result,
//         room,
//         time: new Date().toLocaleTimeString(),
//       };

//       socketRef.current.emit("send_image", data);
//     };
//     reader.readAsDataURL(file);
//   };

//   if (!joined) {
//     return (
//       <div style={{ textAlign: "center", marginTop: "100px" }}>
//         <h2>Join Chat</h2>
//         <input placeholder="Name" onChange={(e) => setName(e.target.value)} /><br /><br />
//         <input placeholder="Room" onChange={(e) => setRoom(e.target.value)} /><br /><br />
//         <button onClick={joinChat}>Join</button>
//       </div>
//     );
//   }

//   return (
//     <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>
      
//       {/* Sidebar */}
//       <div style={{
//         width: "250px",
//         borderRight: "1px solid #ddd",
//         padding: "10px",
//         background: "#f7f7f7"
//       }}>
//         <h3>🟢 Online</h3>
//         {onlineUsers.map((u, i) => (
//           <div key={i}>🟢 {u.name}</div>
//         ))}
//       </div>

//       {/* Chat */}
//       <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
//         {/* Header */}
//         <div style={{
//           padding: "10px",
//           borderBottom: "1px solid #ddd",
//           background: "#ededed"
//         }}>
//           <b>Room: {room}</b>
//         </div>

//         {/* Messages */}
//         <div style={{
//           flex: 1,
//           overflowY: "auto",
//           padding: "10px",
//           background: "#e5ddd5"
//         }}>
//           {messages.map((msg, i) => {
//             const isMe = msg.user === name;

//             return (
//               <div
//                 key={i}
//                 style={{
//                   display: "flex",
//                   justifyContent: isMe ? "flex-end" : "flex-start",
//                   marginBottom: "10px"
//                 }}
//               >
//                 {msg.system ? (
//                   <div style={{
//                     background: "#fff3cd",
//                     padding: "5px 10px",
//                     borderRadius: "10px"
//                   }}>
//                     {msg.message}
//                   </div>
//                 ) : (
//                   <div style={{
//                     maxWidth: "60%",
//                     background: isMe ? "#dcf8c6" : "#fff",
//                     padding: "10px",
//                     borderRadius: "10px"
//                   }}>
//                     <b>{msg.user}</b>

//                     {msg.image ? (
//                       <img src={msg.image} style={{ width: "100%", marginTop: "5px" }} />
//                     ) : (
//                       <p>{msg.message}</p>
//                     )}

//                     <div style={{ fontSize: "10px", textAlign: "right" }}>
//                       {msg.time}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         {/* Input */}
//         <div style={{
//           display: "flex",
//           padding: "10px",
//           borderTop: "1px solid #ddd"
//         }}>
//           <input
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             style={{ flex: 1 }}
//           />
//           <button onClick={sendMessage}>Send</button>

//           <input type="file" ref={fileRef} />
//           <button onClick={sendImage}>📷</button>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function Chat() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const socketRef = useRef(null);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  // CONNECT SOCKET
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socketRef.current.on("receive_image", (data) => {
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

  // JOIN CHAT
  const joinChat = () => {
    if (!name.trim() || !room.trim()) return;
    socketRef.current.emit("join", { name, room });
    setJoined(true);
  };

  // SEND TEXT MESSAGE
  const sendMessage = () => {
    if (!message.trim()) return;

    const data = {
      user: name,
      message,
      room,
      time: new Date().toLocaleTimeString(),
    };

    socketRef.current.emit("send_message", data);
    setMessage("");
  };

  // SEND IMAGE (UPLOAD → SEND URL)
  const sendImage = async () => {
    const file = fileRef.current.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      // Upload image
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const dataRes = await res.json();

      // Send URL via socket
      const data = {
        user: name,
        image: dataRes.url,
        room,
        time: new Date().toLocaleTimeString(),
      };

      socketRef.current.emit("send_image", data);

      fileRef.current.value = ""; // reset input
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  // ENTER KEY SEND
  const handleEnter = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // JOIN SCREEN
  if (!joined) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Join Chat</h2>
        <input
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />
        <br /><br />
        <input
          placeholder="Room"
          onChange={(e) => setRoom(e.target.value)}
        />
        <br /><br />
        <button onClick={joinChat}>Join</button>
      </div>
    );
  }

  // CHAT UI
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
        {onlineUsers.map((u, i) => (
          <div key={i}>🟢 {u.name}</div>
        ))}
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* HEADER */}
        <div style={{
          padding: "10px",
          borderBottom: "1px solid #ddd",
          background: "#ededed"
        }}>
          <b>Room: {room}</b>
        </div>

        {/* MESSAGES */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px",
          background: "#e5ddd5"
        }}>
          {messages.map((msg, i) => {
            const isMe = msg.user === name;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                  marginBottom: "10px"
                }}
              >
                {msg.system ? (
                  <div style={{
                    background: "#fff3cd",
                    padding: "5px 10px",
                    borderRadius: "10px"
                  }}>
                    {msg.message}
                  </div>
                ) : (
                  <div style={{
                    maxWidth: "60%",
                    background: isMe ? "#dcf8c6" : "#fff",
                    padding: "10px",
                    borderRadius: "10px"
                  }}>
                    <b>{msg.user}</b>

                    {/* {msg.image ? (
                      <img
                        src={msg.image}
                        alt="chat"
                        style={{
                          width: "100%",
                          marginTop: "5px",
                          borderRadius: "8px"
                        }}
                      />
                    ) : (
                      <p>{msg.message}</p>
                    )} */}

{msg.image ? (
  <img
    src={msg.image}
    alt="chat"
    style={{
      width: "100%",
      marginTop: "5px",
      borderRadius: "8px"
    }}
  />
) : (
  <p>{msg.message}</p>
)}

                    <div style={{
                      fontSize: "10px",
                      textAlign: "right",
                      marginTop: "5px"
                    }}>
                      {msg.time}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div style={{
          display: "flex",
          padding: "10px",
          borderTop: "1px solid #ddd",
          gap: "5px"
        }}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleEnter}
            placeholder="Type message..."
            style={{ flex: 1, padding: "8px" }}
          />

          <button onClick={sendMessage}>Send</button>

          <input type="file" ref={fileRef} />
          <button onClick={sendImage}>📷</button>
        </div>
      </div>
    </div>
  );
}