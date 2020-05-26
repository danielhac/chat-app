const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { generateMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

app.all('*', function(req, res, next) {
    var origin = req.get('origin'); 
    res.header('Access-Control-Allow-Origin', origin);
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
})

io.on('connection', (socket) => {
    console.log('Websocket connection');
    
    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) { return callback(error) }


        socket.join(user.room)
        socket.emit('message', generateMessage('Dans Bot', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Dans Bot', `${user.username} joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })
    
    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback('Delivered')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('Dans Bot', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server up on port: ${port}`);
})