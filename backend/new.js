import express from "express"
import createServer from "http"
import { Server } from "socket.io"
const app  = express()

const server = createServer(app)

const io = new Server(server,{
    cors:{
        origin:"http://localhost:5173"
    }
})

const users = new Map();

io.on("connection",(socket)=>{
    socket.on("user conencted",socket.id)

 socket.on("join",({name,room})=>{
    socket.join(room)
 })

 users.set(socket.id,{
    name,
    room,
    lastSeen:null
 })

 io.to("room").emit("system",`${name} joined ${room}`)

 sendUsers(room)

 socket.on("send_messgae",(data)=>{
    io.to(data.room).emit('recive_message',data)
 })

 socket.on("send_image",(data)=>{
    io.to(data.room).emit("recive_image",data)
 })

 socket.on("disconnet",()=>{
    const user = users.get(socket.id)

    if (user) {
        user.lastSeen = new Date().toLocaleDateString()
        io.to(user.room).emit("system",`${user.name} left (last seen) ${user.lastseen}`)
          users.delete(socket.id);
      sendUsers(user.room);
    }
     console.log("User disconnected:", socket.id);
 })

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
})

