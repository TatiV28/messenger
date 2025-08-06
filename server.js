const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let users = [];

io.on('connection', (socket) => {
  socket.on('login', (username) => {
    users.push({ id: socket.id, username });
    socket.emit('users', users);
    socket.broadcast.emit('users', users);
  });

  socket.on('message', (msg) => {
    const recipient = users.find(u => u.username === msg.to);
    if (recipient) {
      io.to(recipient.id).emit('message', msg);
    }
  });

  socket.on('disconnect', () => {
    users = users.filter(u => u.id !== socket.id);
    io.emit('users', users);
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
