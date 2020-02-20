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
    clientPlayer = new Player(random(width / 10 , width / 1.1), random(height / 10 , height / 1.1), 30, {r: random(255), g: random(255), b: random(255)})
    playerStates =
    {
        x : clientPlayer.pos.x,
        y : clientPlayer.pos.y,
        cannonDir : {x : clientPlayer.cannonDir.x, y : clientPlayer.cannonDir.y},
        radius : clientPlayer.radius,
        color : clientPlayer.color,
        godMod : false,
    }
    socket.emit('start', playerStates)

    // SETTING PLAYER ID
    socket.on('id', id =>
    {
        clientPlayer.id = id
    })

    // RECEIVE ALL PLAYERS DATA FROM THE SERVER
    socket.on('heartbeat', players =>
    {
        playersArray = players
    })

    // SETTING BULLET INFO SOCKET
    socket.on('enemyShoot', bulletData =>
    {
        if (bulletData.id != clientPlayer.id) {
            bulletArray.push(new Bullet(bulletData.posX, bulletData.posY, bulletData.speedX, bulletData.speedY, clientPlayer.bulletSpeed, bulletData.id))
        }
    })
}

function updatePlayerPos(player)
{
    if (clientPlayer.isDead == false)
    {
        // PLAYER CANVAS POS UPDATE
        player.speed.x = lerp(player.speed.x, player.speedGoal.x, player.acc)
        player.speed.y = lerp(player.speed.y, player.speedGoal.y, player.acc)
        player.pos.x += player.speed.x
        player.pos.y += player.speed.y
    
        // PLAYER CANNON DIRECTION UPDATE
        player.cannonDir = createVector(mouseX - clientPlayer.pos.x, mouseY - clientPlayer.pos.y).normalize().mult(player.cannonLength)
    }

    if (clientPlayer.godMod == false)
    {
        // ALIVE PLAYER AND CANNON DISPLAY
        strokeWeight(1)
        fill(player.color.r, player.color.g, player.color.b)
        stroke('pink')
        ellipse(player.pos.x, player.pos.y, player.radius)

        stroke(200)
        strokeWeight(player.cannonWidth)
        line(clientPlayer.pos.x, clientPlayer.pos.y, clientPlayer.pos.x + player.cannonDir.x, clientPlayer.pos.y + player.cannonDir.y)
    }
    else
    {
        // DEAD PLAYER AND CANNON DISPLAY
        stroke('rgba(100%,100%,100%,0.3)')
        strokeWeight(1)
        fill('rgba(100%,100%,100%,0.3)')
        ellipse(player.pos.x, player.pos.y, player.radius)

        stroke(200)
        strokeWeight(player.cannonWidth)
        line(clientPlayer.pos.x, clientPlayer.pos.y, clientPlayer.pos.x + player.cannonDir.x, clientPlayer.pos.y + player.cannonDir.y)
    }
}

function playerConstrain(player)
{
    player.pos.x = constrain(player.pos.x, 0 + player.radius / 2, width - player.radius / 2)
    player.pos.y = constrain(player.pos.y, 0 + player.radius / 2, width - player.radius / 2)
}

// DISPLAYING ALL PLAYERS EXCEPT THE CLIENT PLAYER
function playersDisplay()
{
    // PLAYER SERVER POS/CANNONDIR UPDATE
    playerStates.x = clientPlayer.pos.x
    playerStates.y = clientPlayer.pos.y
    playerStates.cannonDir.x = clientPlayer.cannonDir.x
    playerStates.cannonDir.y = clientPlayer.cannonDir.y
    playerStates.godMod = clientPlayer.godMod
    socket.emit('update', playerStates)

    for (const _element of playersArray)
    {
        if(_element.id != socket.id)
        {
            // console.log(_element)
            if(_element.godMod == false)
            {
                // ALIVE PLAYER DISPLAY
                stroke('white')
                strokeWeight(1)
                fill(_element.color.r, _element.color.g, _element.color.b)
                ellipse(_element.pos.x, _element.pos.y, _element.radius)
    
                // ALIVE CANNON DISPLAY
                stroke(200)
                strokeWeight(clientPlayer.cannonWidth)
                line(_element.pos.x, _element.pos.y, _element.pos.x + _element.cannonDir.x, _element.pos.y + _element.cannonDir.y)
            }
            else
            {
                // DEAD PLAYER DISPLAY
                stroke('rgba(100%,100%,100%,0.3)')
                strokeWeight(1)
                fill('rgba(100%,100%,100%,0.3)')
                ellipse(_element.pos.x, _element.pos.y, _element.radius)

                // DEAD CANNON DISPLAY
                stroke(200)
                strokeWeight(clientPlayer.cannonWidth)
                line(_element.pos.x, _element.pos.y, _element.pos.x + _element.cannonDir.x, _element.pos.y + _element.cannonDir.y)
            }
        }
    }
}

function playerShooting()
{
    if (clientPlayer.isShooting == true)
    {
        if (clientPlayer.justShoot == false)
        {
            // CREATING BULLET OBJECT 
            bulletArray.push(new Bullet(clientPlayer.pos.x, clientPlayer.pos.y, clientPlayer.cannonDir.x, clientPlayer.cannonDir.y, clientPlayer.bulletSpeed, clientPlayer.id))

            // SENDING BULLET INFOS TO SERVER
            let bulletData =
            {
                id : clientPlayer.id,
                posX : clientPlayer.pos.x,
                posY : clientPlayer.pos.y,
                speedX : clientPlayer.cannonDir.x,
                speedY : clientPlayer.cannonDir.y
            }
            socket.emit('shoot', bulletData)

            // SETTING SHOOTING DELAY
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

    // DESTROY BULLETS THAT ARE OUT OF THE SCREEN
    bulletArray = bulletArray.filter(bullet => bullet.pos.x < width && bullet.pos.x > 0 && bullet.pos.y < height && bullet.pos.y > 0)

    // UPDATE BULLETS POSITION AND DRAW THEM
    for (let i = 0; i < bulletArray.length; i++) {
        bulletArray[i].updatePos()
        bulletArray[i].draw()
    }
}

function bulletCollisionTest()
{
    for (const _bullet of bulletArray)
    {
        if (_bullet.playerId != clientPlayer.id && dist(_bullet.pos.x, _bullet.pos.y, clientPlayer.pos.x, clientPlayer.pos.y) < 25 && clientPlayer.godMod == false)
        {
            console.log('touch')
            clientPlayer.die()
        }
    }
}

function draw()
{
    clear()
    background(51)

    if (clientPlayer.isDead == false)
    {
        playerShooting()
        playerConstrain(clientPlayer)
    }
    updatePlayerPos(clientPlayer)
    playersDisplay()

    bulletsUpdate()
    bulletCollisionTest()
}