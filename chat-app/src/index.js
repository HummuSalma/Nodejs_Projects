const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words') 
const {generateMessage, generateLocation} = require('./utils/messages')


const app = express()
const server = http.createServer(app) //express creates the server implicitly .Hence this line not required
const io = socketio(server) //Here, the server value has to be passed to the socketio. Hence we've created the server explicitly

const port = process.env.PORT || 3002
const publicDirectory = path.join(__dirname, '../public')
app.use(express.static(publicDirectory))

//The socket.io sends and receives events
//socket.emit ->sends an event
//socket.on -> receives an event

io.on('connection', (socket) => {
    console.log('New WebSocket Connection established!!')

    //join is an event
    socket.on('join',({username, room})=>{
        socket.join(room)
        socket.emit('message', generateMessage('Welcome!!'))
        //socket.broadcast is used to emit the event to everyone except the socket(Client) itself.
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!!`))    
    })

    //Message event
    socket.on('message', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
        io.emit('message',generateMessage (message))
        callback()
    })

    socket.on('disconnect', () => {
        //io.emit is used to emit the events to everyone who is connected to the server
        io.emit('message', generateMessage('A User has left!'))
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', generateLocation(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

