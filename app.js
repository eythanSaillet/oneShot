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
let leaderBoard = []

class Player
{
    constructor(id, name, x, y, cannonDirX, cannonDirY, radius, color)
    {
        this.id = id
        this.name = name
        this.pos = {x: x, y: y}
        this.cannonDir = {x : cannonDirX, y : cannonDirY}
        this.radius = radius
        this.color = color
        this.shootingRate = null

        this.afkPos = 0

        this.kill = 0
        this.death = 0.01
    }
}

// NEW CONNECTION EVENT
function newConnection(socket)
{
    console.log('New connection : ' + socket.id)
    socket.emit('id', socket.id)

    // GET PLAYER INFOS FROM CLIENT
    socket.on('start', player =>
    {
        // ADD THE PLAYER TO THE PLAYERS LIST
        players.push(new Player(socket.id, player.name, player.x, player.y, player.cannonDir.x, player.cannonDir.y, player.radius, player.color))

        // SET UPDATE CLIENT INFOS
        socket.on('update', playerStates =>
        {
            for (const _key in players)
            {
                if (socket.id == players[_key].id)
                {
                    // players[_key].name = playerStates.name
                    players[_key].pos.x = playerStates.x
                    players[_key].pos.y = playerStates.y
                    players[_key].cannonDir.x = playerStates.cannonDir.x
                    players[_key].cannonDir.y = playerStates.cannonDir.y
                    players[_key].godMod = playerStates.godMod

                    players[_key].shootingRate = 200 * Math.pow(1.4, players.length)
                }
            }
        })

        // SET UPDATE BULLET CLIENT INFOS
        socket.on('shoot', bulletData =>
        {
            io.sockets.emit('enemyShoot', bulletData)
        })

        // PUT THE PLAYER IN THE LEADERBOARD
        let isInTheLeaderBoard = false
        for (const _leaderBoardPlayer of leaderBoard)
        {
            if (player.name == _leaderBoardPlayer.name)
            {
                isInTheLeaderBoard = true
            }
        }
        if (isInTheLeaderBoard == false)
        {
            leaderBoard.push({
                name: player.name,
                kill: player.kill,
                death: player.death
            })
        }
    })

    // DELETE PLAYER WHEN DISCONNECT
    socket.on('disconnect', () =>
    {
        for (const _key in players)
        {
            if (players[_key].id == socket.id)
            {
                players.splice(_key, 1)
            }
        }
    })

    // KILL DATA TO UPDATE THE LEADERBOARD
    socket.on('death', (_killData) =>
    {
        for (const _player of players)
        {
            if(_killData.killerId == _player.id)
            {
                _player.kill++
            }
            if(_killData.killedId == _player.id)
            {
                _player.death++
            }
        }
    })
}

// SORT THE PLAYERS ARRAY BEFORE DISPLAY IT ON THE LEADERBOARD

function updateLeaderBoardArray()
{
    for (const _player of players)
    {
        for (const _leaderBoardPlayer of leaderBoard)
        {
            if (_player.name == _leaderBoardPlayer.name)
            {
                _leaderBoardPlayer.kill = _player.kill
                _leaderBoardPlayer.death = _player.death
                _leaderBoardPlayer.ratio = _player.kill / _player.death
            }
        }
    }
}

function sortPlayersByRatio(tab)
{
    // let tab =  JSON.parse(JSON.stringify(leaderBoard))
    let temp, i, j
    
    for(i = 1; i < tab.length; i++)
    {
        temp = tab[i]
        j = i - 1
        while (j >= 0 && tab[j].kill / tab[j].death > temp.kill / temp.death)
        {
            tab[j+1] = tab[j]
            j--
        }
        tab[j+1] = temp
    }
    return tab
}



// SET THE INTERVAL WHICH SEND UPDATE TO ALL CLIENTS
setInterval(heartBeat, 33)

function heartBeat()
{
    io.sockets.emit('heartbeat', players)
}


// AFK TEST
setInterval(afkTest, 700000)

function afkTest()
{
    for (const _key in players)
    {
        if(players[_key].afkPos == players[_key].pos.x)
        {
            io.sockets.emit('afk', players[_key].id)
            players.splice(_key, 1)
        }
        else
        {
            players[_key].afkPos = players[_key].pos.x
        }
    }
}

setInterval(() => {
    updateLeaderBoardArray()
    sortPlayersByRatio(leaderBoard)
    io.sockets.emit('updateLeaderBoard', leaderBoard)
}, 1000)