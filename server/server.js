const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join-room", (roomId) => {
  socket.join(roomId);

  const clients = io.sockets.adapter.rooms.get(roomId);
  const count = clients ? clients.size : 0;

  io.to(roomId).emit("users", count);
});

  socket.on("draw", (data) => {
    socket.to(data.room).emit("draw", data);
  });

  socket.on("clear", (room) => {
    socket.to(room).emit("clear");
  });

  socket.on("cursor", (data) => {
    socket.to(data.room).emit("cursor", data);
  });

});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});