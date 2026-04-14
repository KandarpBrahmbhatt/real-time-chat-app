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
      online: true,          // ADD THIS
  lastSeen: null,
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
  // socket.on("private_message", ({ to, message, from, time }) => {
  //   io.to(to).emit("receive_private_message", {
  //     message,
  //     from,
  //     time,
  //     type: "private",
  //   });

  //   socket.emit("receive_private_message", {
  //     message,
  //     from,
  //     time,
  //     type: "private",
  //   });
  // });
  socket.on("private_message", ({ to, message, from, time }) => {
    const data = {
      message,
      from,
      to,
      time,
      type: "private",
    };

    io.to(to).emit("receive_private_message", data);
    socket.emit("receive_private_message", data);
  });

  // PRIVATE IMAGE
  // socket.on("private_image", ({ to, image, from, time }) => {
  //   io.to(to).emit("receive_private_image", {
  //     image,
  //     from,
  //     time,
  //     type: "private",
  //   });

  //   socket.emit("receive_private_image", {
  //     image,
  //     from,
  //     time,
  //     type: "private",
  //   });
  // });
  socket.on("private_image", ({ to, image, from, time }) => {
    const data = {
      image,
      from,
      to,
      time,
      type: "private",
    };

    io.to(to).emit("receive_private_image", data);
    socket.emit("receive_private_image", data);
  });

  socket.on("typing", ({ to, from }) => {
    io.to(to).emit("typing", { from });
  });

  socket.on("delete_message", ({ id, to }) => {
    io.to(to).emit("delete_message", { id });
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    const user = users.get(socket.id);

    if (user) {
      io.to(user.room).emit("system", `${user.name} left`);
      // users.delete(socket.id);
      users.set(socket.id, {
        ...user,
        online: false,
        lastSeen: new Date(),
      });
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
           online: value.online ?? true,   // ✅ FIX
        lastSeen: value.lastSeen || null // ✅ optional
        });
      }
    });

    io.to(room).emit("online_users", roomUsers);
  }
});

server.listen(5000, () => {
  console.log("Server running on 5000");
});