let player, playerStates
let playersArray = []
let socket

function setup()
{
    createCanvas(700, 700).parent('canvasContainer')
    background(51)

    // socket = io.connect('http://eythansaillet.eu-4.evennode.com/')
    socket = io.connect('localhost:3000')

    // CREATE THE PLAYER AND SEND IT TO THE SERVER
    console.log(`rgb(${random(255)}, ${random(255)}, ${random(255)})`)
    clientPlayer = new Player(random(width / 10 , width / 1.1), random(height / 10 , height / 1.1), 30, {r: random(255), g: random(255), b: random(255),})
    playerStates =
    {
        x : clientPlayer.pos.x,
        y : clientPlayer.pos.y,
        radius : clientPlayer.radius,
        color : clientPlayer.color,
    }
    socket.emit('start', playerStates)

    // RECEIVE ALL PLAYERS DATA FROM THE SERVER
    socket.on('heartbeat', players =>
    {
        playersArray = players
    })
}

function playerPosUpdate(player)
{
    // PLAYER CANVAS POS UPDATE
    player.speed.x = lerp(player.speed.x, player.speedGoal.x, player.acc)
    player.speed.y = lerp(player.speed.y, player.speedGoal.y, player.acc)
    player.pos.x += player.speed.x
    player.pos.y += player.speed.y

    fill(player.color.r, player.color.g, player.color.b)
    stroke('pink')
    ellipse(player.pos.x, player.pos.y, player.radius)

    // PLAYER SERVER POS UPDATE
    playerStates.x = player.pos.x
    playerStates.y = player.pos.y
    socket.emit('update', playerStates)
}

function playerConstrain(player)
{
    player.pos.x = constrain(player.pos.x, 0 + player.radius / 2, width - player.radius / 2)
    player.pos.y = constrain(player.pos.y, 0 + player.radius / 2, width - player.radius / 2)
}

// DISPLAYING ALL PLAYERS EXCEPT THE CLIENT PLAYER
function playersDisplay()
{
    for (const _element of playersArray)
    {
        if(_element.id != socket.id)
        {
            fill(_element.color.r, _element.color.g, _element.color.b)
            ellipse(_element.pos.x, _element.pos.y, _element.radius)
        }
    }
}

function draw()
{
    clear()
    background(51)

    playerPosUpdate(clientPlayer)
    playerConstrain(clientPlayer)
    playersDisplay()
}