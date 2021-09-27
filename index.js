const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
const {addUser,removeUser,getUser,getUsersInRoom} = require('./users');


const PORT = process.env.PORT || 5000;
const app = express();

const router = require('./router');
const server = http.createServer(app);
const io = socketio(server);


io.on('connection', (socket)=> {
    console.log('we have a new connection');
    
    socket.on('join', ({name, room}, callback) => {
        const {error, user} = addUser({id:socket.id,name,room});
        if(error) return callback(error);
        socket.emit('message', {user : 'admin',text: `${user.name},welcome to the room ${user.room}` });
        socket.broadcast.to(user.room).emit('message', {user : 'admin',text: `${user.name} has joined!` });
        socket.join(user.room);
        io.to(user.room).emit('roomData',{room : user.room, users: getUsersInRoom(user.room)})
        callback();
    })
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message', {user : user.name, text: message});
        io.to(user.room).emit('roomData', {room : user.room,users: getUsersInRoom(user.room)});
        callback();
    })
    socket.on('disconnect', () => {
        console.log('out!!!');
        const user = removeUser(socket.id);
        console.log(user);
        if(user) {
            io.to(user.room).emit('message', {user : 'admin',text : `${user.name} have left the chat`})
        }
    })
})
 
app.use(router);
app.use(cors());
server.listen(PORT, () => console.log(`Server has started in the PORT ${PORT}`));













// Test
// const requireJsonContent = () => {
//     return (req, res, next) => {
//         if (req.headers['content-type'] !== 'application/json') {
//             res.status(400).send('Server requires application/json')
//         } else {
//             next()
//         }
//     }
// }
// app.get('/', (req, res, next) => {
//     res.send('Welcome Home');
// });

// app.post('/', requireJsonContent(), (req, res, next) => {
//     res.send('You sent JSON');
// })
// app.listen(3000);