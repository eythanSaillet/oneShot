let express = require('express')
let app = express()
// let server = app.listen(process.env.PORT)
let server = app.listen(3000)

app.use(express.static('public'))

console.log('Server is running')

let socket = require('socket.io')
let io = socket(server)

io.sockets.on('connection', newConnection)

let players = []

class Player
{
    constructor(id, x, y, radius, color)
    {
        this.id = id
        this.pos = {x: x, y: y}
        this.radius = radius
        this.color = color
    }
}

// NEW CONNECTION EVENT
function newConnection(socket)
{
    console.log('New connection : ' + socket.id)

    // GET PLAYER INFOS FROM CLIENT
    socket.on('start', player =>
    {
        // ADD THE PLAYER TO THE PLAYERS LIST
        players.push(new Player(socket.id, player.x, player.y, player.radius, player.color))

        // SET THE INTERVAL WHICH SEND UPDATE TO ALL CLIENTS

        // SET UPDATE CLIENT INFOS
        socket.on('update', playerStates =>
        {
            for (const _key in players)
            {
                if (socket.id == players[_key].id)
                {
                    players[_key].pos.x = playerStates.x
                    players[_key].pos.y = playerStates.y
                }
            }
        })
    })
}

setInterval(heartBeat, 33)

// INTERVAL WHICH SEND UPDATE TO ALL CLIENTS
function heartBeat()
{
    io.sockets.emit('heartbeat', players)
}