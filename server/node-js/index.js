const express = require('express');
const http = require('http');
const {Server} = require("socket.io")

const app = express();
const server = http.createServer(app);
const io = new Server({
  cors: {
    origin: "*",
  }
});

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('chat message', (message) => {
    console.log("meassge====>>>> ", message);
    io.emit('chat message', message);
  });
});

io.listen(4000);
