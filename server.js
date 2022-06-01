const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const Admin = "Admin";

/// Run when client sonnects
io.on("connection", (socket) => {
  // console.log("New WS Connection..."); // whenever client connects, this pops up

  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    // Welcome current user
    socket.emit("message", formatMessage(Admin, "Welcome to Chat Room!")); // only shown to the single client that is curently connecting
    // io.emit() // to the all client in general

    // Broadcast when a user connects
    // broadcast.emit is different from socket.emit=> emit to everybody except the user
    // no need to notify the user that they are connecting while connecting
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(Admin, `${user.username} has joined the chat`)
      ); // to all the client exepct the user

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // we sent the message to the server, so we should now catch the message
  // Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    // console.log(msg); // now emit this back to the client
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    console.log("🌸", user); // result => { id: 'mJpCOYQyQ9UAtQOrAAAF', username: 'John', room: 'JavaScript' }

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(Admin, `${user.username} has left the chat`)
      );

      // After leaving the chat, update the user list in main.js
      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`🚀 SERVER RUNNING ON ${PORT}`));
