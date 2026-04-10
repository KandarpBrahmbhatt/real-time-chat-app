import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const server = createServer(app);

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Store online users (optional upgrade)
const users = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Welcome message to only this user
  socket.emit("welcome", "Welcome to chat");

  // Broadcast join message
  socket.broadcast.emit("welcome", `User joined chat`);

  // When user joins with name
  socket.on("join", (name) => {
    users.set(socket.id, name);
    io.emit("welcome", `${name} joined chat`);
  });

  // Send message to everyone
  socket.on("send_message", (data) => {
    io.emit("receive_message", data);
  });

  // Disconnect
  socket.on("disconnect", () => {
    const name = users.get(socket.id);

    io.emit(
      "welcome",
      `${name || "A user"} left chat`
    );

    users.delete(socket.id);

    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server started on port 5000");
});