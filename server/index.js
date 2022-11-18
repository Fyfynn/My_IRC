const express = require('express');
const socket = require('socket.io');
const app = express();
const cors = require("cors");
var mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

mongoose.connect('mongodb://localhost/ChatSocket', { useNewUrlParser: true, useUnifiedTopology: true }, 
function(error) {
    if(error) {
        console.log(error);
    } else {
        console.log('Connected to mongodb');
    }
});

require('./models/user.model');
require('./models/room.model');
require('./models/chat.model');

var User = mongoose.model('user');
var Room = mongoose.model('room');
var Chat = mongoose.model('chat');

app.use(cors()); 
app.use(express.json());


const server = app.listen('3002', () => {
    console.log("Server Running on Port 3002...");  
});

io = socket(server);
var connectedUsers = [];

io.on('connect', (socket) => {
    // console.log(socket.id);

    // send "user connected" + newUser send "a rejoint le chat"
    socket.on('pseudo', (pseudo) => {
        // MongoDB
        User.findOne({ pseudo: pseudo }, (err, user) => {

            if(user) {
                socket.pseudo = pseudo;
                socket.broadcast.emit('newUser', pseudo);
                console.log('User connected : ' + pseudo)
            } else {
                var user = new User();
                user.pseudo = pseudo;
                user.save();

                socket.pseudo = pseudo;
                socket.broadcast.emit('newUser', pseudo);
                console.log('User connected & : ' + pseudo)
            }

            connectedUsers.push(socket);

            Chat.find((error, messages) => {
                console.log(messages);
                socket.emit('oldMessages', messages);
            });

            User.find((err, users) => {
                socket.emit('userList', users )
            })
        });
    })

    socket.on('join_room', (room) => {
        socket.join(room);
        socket.room = room
        console.log('User connected and joined room : ' + room)
    })

    socket.on('sendMessage', (data, receiver) => {

        if(receiver === "all") {
            // MongoDB

            var chat = new Chat();
            chat.content = data.message;
            chat.sender = socket.pseudo;
            chat.receiver = "all";
            chat.save();
           
            socket.broadcast.emit('receiveMessage', data);
        } else {

            User.findOne({ pseudo: receiver }, (err, user) => {

                if(!user) {
                    console.log('marche pas');
                    return false;
                } else {

                    socketReceiver = connectedUsers.find(socket => socket.pseudo === user.pseudo)
                    if(socketReceiver) {
                        console.log("le nom du sender est : " + socket.pseudo);
                        socketReceiver.emit('whisper', { sender: socket.pseudo, message: data.message, receiver: receiver });
                    }
        
                    var chat = new Chat();
                    chat.content = data.message;
                    chat.sender = socket.pseudo;
                    chat.receiver = receiver;
                    chat.save();
                }
            });
        };

        // console.log(data.message);
        // console.log(socket.pseudo);

    })

    socket.on('writting', (pseudo) => {
        socket.broadcast.emit('writting', pseudo)
    })

    socket.on('notWritting', () => {
        socket.broadcast.emit('notWritting')
    })

    socket.on('disconnect', () => {
        // console.log(socket.room);
        var index = connectedUsers.indexOf(socket);
        // Si la socket existe 
        if(index > -1) {
            connectedUsers.splice(index, 1);
        }
        socket.broadcast.emit('quitUser', socket.pseudo);
        console.log('User disconnected')
    })
})
