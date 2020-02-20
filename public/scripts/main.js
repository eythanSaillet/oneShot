let clientPlayer, playerStates
let playersArray = []
let bulletArray = []
let socket

function setup()
{
    createCanvas(700, 700).parent('canvasContainer')
    angleMode(DEGREES)

    // socket = io.connect('http://eythansaillet.eu-4.evennode.com/')
    socket = io.connect('localhost:3000')

    // CREATE THE PLAYER AND SEND IT TO THE SERVER
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

function updatePlayerPos(player)
{
    // PLAYER CANVAS POS UPDATE
    player.speed.x = lerp(player.speed.x, player.speedGoal.x, player.acc)
    player.speed.y = lerp(player.speed.y, player.speedGoal.y, player.acc)
    player.pos.x += player.speed.x
    player.pos.y += player.speed.y

    stroke('white')
    strokeWeight(1)
    fill(player.color.r, player.color.g, player.color.b)
    stroke('pink')
    ellipse(player.pos.x, player.pos.y, player.radius)

    // PLAYER SERVER POS UPDATE
    playerStates.x = player.pos.x
    playerStates.y = player.pos.y
    socket.emit('update', playerStates)

    // PLAYER CANNON DIRECTION UPDATE
    player.cannonDir = createVector(mouseX - clientPlayer.pos.x, mouseY - clientPlayer.pos.y).normalize().mult(player.cannonLength)
    stroke(200)
    strokeWeight(player.cannonWidth)
    line(clientPlayer.pos.x, clientPlayer.pos.y, clientPlayer.pos.x + player.cannonDir.x, clientPlayer.pos.y + player.cannonDir.y)
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
            stroke('white')
            strokeWeight(1)
            fill(_element.color.r, _element.color.g, _element.color.b)
            ellipse(_element.pos.x, _element.pos.y, _element.radius)
        }
    }
}

function playerShooting()
{
    if (clientPlayer.isShooting == true)
    {
        if (clientPlayer.justShoot == false)
        {
            bulletArray.push(new Bullet(clientPlayer.pos.x, clientPlayer.pos.y, clientPlayer.cannonDir.x, clientPlayer.cannonDir.y, clientPlayer.bulletSpeed))
            clientPlayer.justShoot = true
            setTimeout( () =>
            {
                clientPlayer.justShoot = false
            }
            , clientPlayer.shootingRate)
        }
    }
}

function bulletsUpdate()
{

    bulletArray = bulletArray.filter(bullet => bullet.pos.x < width && bullet.pos.x > 0 && bullet.pos.y < height && bullet.pos.y > 0)

    for (let i = 0; i < bulletArray.length; i++) {
        bulletArray[i].updatePos()
        bulletArray[i].draw()
    }
}

function draw()
{
    clear()
    background(51)

    playerShooting()
    bulletsUpdate()

    updatePlayerPos(clientPlayer)
    playerConstrain(clientPlayer)
    playersDisplay()

    // clientPlayer.updateCannonDir()
}