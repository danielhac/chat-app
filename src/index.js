/* 
 * This is the server-side of the chat application which establishes the Socket.io connection.
 * 
 * 
 * 
*/


const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { generateMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom, getAllRooms } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

app.all('*', function(req, res, next) {
    const origin = req.get('origin'); 
    res.header('Access-Control-Allow-Origin', origin);
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
})

// Establish Socket.io connection, 
// where users can join rooms and communicate with other users within the same room
io.on('connection', (socket) => {
    console.log('Websocket connection');
    
    // Handles user joining a room
    socket.on('join', ({ username, room }, callback) => {
        // Validate username and room
        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) { return callback(error) }

        // Join room 
        socket.join(user.room)
        socket.emit('message', generateMessage('Dans Bot', `Hello ${user.username}!`))
        socket.broadcast.to(user.room).emit('message', generateMessage('Dans Bot', `${user.username} joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        // Return control back to calling function
        callback()
    })
    
    // Handles sending a message to the room
    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback('Delivered')
    })

    // Handles obtaining all room names
    socket.on('getRooms', callback => {
        const rooms = getAllRooms()
        // Return control back to calling function
        callback(rooms)
    })

    // Handles disconnection / logoff
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