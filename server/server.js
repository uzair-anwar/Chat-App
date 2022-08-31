const { instrument } = require("@socket.io/admin-ui");

const io = require("socket.io")(4000, {
  cors: {
    origin: ["http://localhost:8080", "https://admin.socket.io/"],
  },
});

const userIo = io.of("/user");
userIo.on("connection", (socket) => {
  console.log("Connection establish with user id : ", socket.username);
});

userIo.use((socket, next) => {
  if (socket.handshake.auth.token) {
    socket.username = getUsernameFromToken(socket.handshake.auth.token);
    next();
  } else {
    next(new Error("Please send token"));
  }
});

function getUsernameFromToken(token) {
  return token;
}

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("message", (message, room) => {
    if (room === "") {
      socket.broadcast.emit("recieved-message", message);
    } else {
      socket.to(room).emit("recieved-message", message);
    }
  });
  socket.on("join-room", (room, callback) => {
    socket.join(room);
    callback(`Joined ${room}`);
  });

  socket.on("ping", (n) => console.log(n));
});

instrument(io, { auth: false });
