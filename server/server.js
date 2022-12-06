const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

const publicPath = path.join(__dirname, "/../public");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const { User } = require("./utils/users");
const { generateMessage, generateLocationMessage } = require("./utils/message");
const { isRealString } = require("./utils/isRealString");
const users = new User();

app.use(express.static(publicPath));

io.on("connection", (socket) => {
  console.log("New user is connected");

  socket.on("join", function (params, callback) {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      callback("name and room are required");
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit("updateUsersList", users.getUserList(params.room));
    socket.emit("newMessage", generateMessage("Admin", "Welcome to room chat!"));
    socket.broadcast.to(params.room).emit("newMessage", generateMessage("Admin", `${params.name} join room!`));
    callback();
  });

  socket.on("createMessage", (message) => {
    const user = users.getUser(socket.id);

    if (user && isRealString(message.message)) {
      io.emit("newMessage", generateMessage(user.name, message.message));
    }
  });

  socket.on("create-locationMessage", function (data) {
    const user = users.getUser(socket.id);
    io.emit("newLocationMessage", generateLocationMessage(user.name, data.lat, data.lng));
  });

  socket.on("disconnect", () => {
    const user = users.removeUser(socket.id);
    if (user) {
      console.log(user);
      io.to(user.room).emit("updateUsersList", users.getUserList(user.room));
      io.to(user.room).emit("newMessage", generateMessage("Admin", `${user.name} has left the room`));
    }
  });
});

server.listen(3000, () => {
  console.log(`Server is up on port 3000`);
});
