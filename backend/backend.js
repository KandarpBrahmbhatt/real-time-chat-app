import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import upload from "./middelware/multer.middelware.js";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use("/uploads", express.static("uploads"));

app.post("/upload", upload.single("image"), (req, res) => {
  res.json({
    url: `http://localhost:5000/uploads/${req.file.filename}`,
  });
});

const server = createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

const users = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // JOIN
  socket.on("join", ({ name, room }) => {
    socket.join(room);

    users.set(socket.id, {
      name,
      room,
      socketId: socket.id,
    });

    io.to(room).emit("system", `${name} joined ${room}`);
    sendUsers(room);
  });

  // ROOM MESSAGE
  socket.on("send_message", (data) => {
    io.to(data.room).emit("receive_message", {
      ...data,
      type: "room",
    });
  });

  // ROOM IMAGE
  socket.on("send_image", (data) => {
    io.to(data.room).emit("receive_image", {
      ...data,
      type: "room",
    });
  });

  // PRIVATE MESSAGE
  socket.on("private_message", ({ to, message, from, time }) => {
    io.to(to).emit("receive_private_message", {
      message,
      from,
      time,
      type: "private",
    });

    socket.emit("receive_private_message", {
      message,
      from,
      time,
      type: "private",
    });
  });

  // PRIVATE IMAGE
  socket.on("private_image", ({ to, image, from, time }) => {
    io.to(to).emit("receive_private_image", {
      image,
      from,
      time,
      type: "private",
    });

    socket.emit("receive_private_image", {
      image,
      from,
      time,
      type: "private",
    });
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    const user = users.get(socket.id);

    if (user) {
      io.to(user.room).emit("system", `${user.name} left`);
      users.delete(socket.id);
      sendUsers(user.room);
    }
  });

  function sendUsers(room) {
    const roomUsers = [];

    users.forEach((value, key) => {
      if (value.room === room) {
        roomUsers.push({
          name: value.name,
          socketId: key,
        });
      }
    });

    io.to(room).emit("online_users", roomUsers);
  }
});

server.listen(5000, () => {
  console.log("Server running on 5000");
});