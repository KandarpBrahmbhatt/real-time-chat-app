// import express from 'express'

// import createServer from "http"
// import { Server } from 'socket.io'
// const sk = express()

// const server = createServer(sk)

// const io = new Server(server,({
//   cors: {origin: "http://localhost:5173"}
// }))

// const users = new Map()

// io.on("connection",(socket)=>{
//   console.log("User is connected",socket.id)

//   //જ્યારે user chat app માં “Join” button દબાવે છે
// //  ત્યારે frontend થી આ event આવે છે:
//   socket.on("join",({name,room})=>{
//     socket.join(room); //user ને એક room માં add કરે છે

//     users.set(socket.id,{
//       name,
//       room,
//       socketId:socket.id
//     })

//     io.to(room).emit("system",`${name} joined ${room}`)
//     sendUsers(room)
//   })

//   // room message 

//   socket.on("send_message",(data)=>{
//     io.to(data.room).emit("receive_message",{
//       ...data,
//       type:"room",
//     })
//   })

//   // room message
//   socket.on("send_image",(data)=>{
//     io.to(data.room).emit("receive_image",{
//       ...data,  
//       type:"room"
//     })
//   })

//   // private message

//   socket.on("private_message",(data)=>{
//     io.to(data.room).emit("receive_private_message",{
//       message,
//       from,
//       time,
//       type:"private"
//     })
//   socket.emit("receive_private_message", {
//       message,
//       from,
//       time,
//       type: "private",
//     });

//     // private image
//   socket.on("private_image",(data)=>{
//     io.to(data.room).emit("receive_private_message",{
//       message,
//       from,
//       time,
//       type:"private"
//     })

//       socket.emit("receive_private_image", {
//       image,
//       from,
//       time,
//       type: "private",
//     });
//   })
//   })

// })