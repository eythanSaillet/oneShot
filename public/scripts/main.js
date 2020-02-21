let clientPlayer, clientId, playerStates
let isConnected = false
let playersArray = []
let bulletArray = []
let socket

function setup()
{
    createCanvas(700, 700).parent('canvasContainer')
    document.querySelector('#canvasContainer canvas').style.height = '90vh'
    document.querySelector('#canvasContainer canvas').style.width = 'auto'
    // document.querySelector('#canvasContainer canvas').style.maxWidth = '60vh'
    angleMode(DEGREES)

    // socket = io.connect('http://eythansaillet.eu-4.evennode.com/')
    socket = io.connect('localhost:3000')

    // SETTING PLAYER ID
    socket.on('id', id =>
    {
        clientId = id
    })

    // RECEIVE ALL PLAYERS DATA FROM THE SERVER
    socket.on('heartbeat', players =>
    {
        playersArray = players
    })

    // SETTING BULLET INFO SOCKET
    socket.on('enemyShoot', bulletData =>
    {
        if (bulletData.id != clientId) {
            bulletArray.push(new Bullet(bulletData.posX, bulletData.posY, bulletData.speedX, bulletData.speedY, 0.3, bulletData.id))
        }
    })

    setJoinButtonEvent()
}

function setJoinButtonEvent()
{
    document.querySelector('.connectionContainer .joinButton').addEventListener('click', () =>
    {
        if (isConnected == false)
        {
            isConnected = true
            let inputName = document.querySelector('.connectionContainer .nameInput').value
            let inputColor = document.querySelector('.connectionContainer .colorInput').value
            joinParty(inputName, inputColor)
        }
    })
}

function joinParty(name, color)
{
    // CREATE THE PLAYER AND SEND IT TO THE SERVER
    // randome color : {r: random(255), g: random(255), b: random(255)}
    clientPlayer = new Player(clientId, name, random(width / 10 , width / 1.1), random(height / 10 , height / 1.1), 30, color)
    playerStates =
    {
        id : clientPlayer.id,
        name : clientPlayer.name,
        x : clientPlayer.pos.x,
        y : clientPlayer.pos.y,
        cannonDir : {x : clientPlayer.cannonDir.x, y : clientPlayer.cannonDir.y},
        radius : clientPlayer.radius,
        color : clientPlayer.color,
        godMod : false,
    }
    socket.emit('start', playerStates)
}

function clientServerUpdate()
{
    // PLAYER SERVER POS/CANNONDIR UPDATE
    playerStates.x = clientPlayer.pos.x
    playerStates.y = clientPlayer.pos.y
    playerStates.cannonDir.x = clientPlayer.cannonDir.x
    playerStates.cannonDir.y = clientPlayer.cannonDir.y
    playerStates.godMod = clientPlayer.godMod
    socket.emit('update', playerStates)
}

// DISPLAYING ALL PLAYERS EXCEPT THE CLIENT PLAYER
function playersDisplay()
{

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
                fill(_element.color)
                ellipse(_element.pos.x, _element.pos.y, _element.radius)
    
                // ALIVE CANNON DISPLAY
                stroke(200)
                strokeWeight(10)
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
                strokeWeight(10)
                line(_element.pos.x, _element.pos.y, _element.pos.x + _element.cannonDir.x, _element.pos.y + _element.cannonDir.y)
            }

            // PLAYER NAME DISPLAY
            textAlign(CENTER)
            textSize(15)
            fill('rgba(255, 255, 255, 0.4)')
            noStroke()
            text(_element.name, _element.pos.x, _element.pos.y + 35)
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
    if (clientPlayer != undefined)
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
}

function draw()
{
    clear()
    background(51)

    if (isConnected == true)
    {
        if (clientPlayer.isDead == false)
        {
            playerShooting()
            clientPlayer.playerConstrain()
        }
        clientPlayer.updatePlayerPos()
        clientServerUpdate()
    }
    playersDisplay()

    bulletsUpdate()
    bulletCollisionTest()
}