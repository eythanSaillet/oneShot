let express = require('express')
let app = express()
let server = app.listen(process.env.PORT)

app.use(express.static('public'))

console.log('server is running')

let socket = require('socket.io')
let io = socket(server)

io.sockets.on('connection', newConnection)

function newConnection(socket)
{
    console.log('new connection : ' + socket.id)
}