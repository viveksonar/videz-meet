const { Socket } = require("dgram");
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidv4 } = require("uuid");
const {ExpressPeerServer} = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
})

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use('/peerjs', peerServer);

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on('connection',socket =>{
  socket.on('join-room' , (roomId, userId) =>{
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
    socket.on('message', message =>{
      // To send the message to only its room id and not to every other room id
      io.to(roomId).emit('createMessage', message)
    })

  })
})

server.listen(process.env.PORT||3030);
