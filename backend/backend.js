// import express from "express";
// import { Server } from "socket.io";
// import { createServer } from "http";

// const app = express();
// const server = createServer(app);

// // Create Socket.io server
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"],
//   },
// });

// // Store online users (optional upgrade)
// const users = new Map();
// //  Connection =>  Runs when user connects
// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);
 
//   // Welcome message to only this user Send data (client → server OR server → client)
//   socket.emit("welcome", "Welcome to chat");

//   // Broadcast join message
//   socket.broadcast.emit("welcome", `User joined chat`);

//   // When user joins with name
//   socket.on("join", (name) => {
//     users.set(socket.id, name);
//     io.emit("welcome", `${name} joined chat`);
//   });

//   // Send message to everyone
//   socket.on("send_message", (data) => {
//     io.emit("receive_message", data);
//   });

//   socket.emit("send_image",data)
//   // Disconnect
//   socket.on("disconnect", () => {
//     const name = users.get(socket.id);

//     io.emit(
//       "welcome",
//       `${name || "A user"} left chat`
//     );

//     users.delete(socket.id);

//     console.log("User disconnected:", socket.id);
//   });
// });

// server.listen(5000, () => {
//   console.log("Server started on port 5000");
// });

// import required libraries  
import express from "express"; // express for basic server 
import cors from "cors";
import { Server } from "socket.io"; // Socket.IO for real-time communication
import { createServer } from "http"; // Create HTTP server (needed for socket.io)
import upload from "./middelware/multer.middelware.js";

// create express app  
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use("/uploads", express.static("uploads")); // serve images

app.post("/upload", upload.single("image"), (req, res) => {
  res.json({
    url: `http://localhost:5000/uploads/${req.file.filename}`,
  });
});

// Create HTTP server using express app
const server = createServer(app);
// Initialize socket.io server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

// Store users in memory
// Key: socket.id
// Value: { name, room, lastSeen }
const users = new Map(); // socket.id -> {name, room, lastSeen}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

 //  JOIN ROOM EVENT
  socket.on("join", ({ name, room }) => {
    socket.join(room); // Add user to a room

    // Save user info in Map
    users.set(socket.id, {
      name,
      room,
      lastSeen: null,
    });

   // Notify everyone in room
    io.to(room).emit("system", `${name} joined ${room}`);

    // Send updated user list
    sendUsers(room);
  });

  // SEND MESSAGE
  // data = { name, message, room }
  socket.on("send_message", (data) => {
    io.to(data.room).emit("receive_message", data); // Send message to everyone in same room
  });

  // SEND IMAGE
  socket.on("send_image", (data) => {
    io.to(data.room).emit("receive_image", data);  // Broadcast image to room
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    const user = users.get(socket.id);

    if (user) {
      user.lastSeen = new Date().toLocaleTimeString(); // Save last seen time

      //  Notify room that user left
      io.to(user.room).emit(
        "system",
        `${user.name} left (last seen ${user.lastSeen})`
      );
 // Remove user from map
      users.delete(socket.id);
      sendUsers(user.room);
    }

    console.log("User disconnected:", socket.id);
  });

  // SEND ONLINE USERS
  function sendUsers(room) {
    const roomUsers = [];

    users.forEach((value, key) => {
      // Filter users of same room
      if (value.room === room) {
        roomUsers.push({
          name: value.name,
        });
      }
    });

//  Send updated list to room
    io.to(room).emit("online_users", roomUsers);
  }
});

server.listen(5000, () => {
  console.log("Server running on 5000");
});