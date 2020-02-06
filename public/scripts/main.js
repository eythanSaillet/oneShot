let player
let socket

function setup()
{
    createCanvas(700, 700).parent('canvasContainer')
    background(51)
    frameRate(60)

    // socket = io.connect('http://eythansaillet.eu-4.evennode.com/')
    socket = io.connect('localhost:3000')

    socket.emit('')

    player = new Player(random(width / 10 , width / 1.1), random(height / 10 , height / 1.1), 30)
    console.log(player)
}

function draw()
{
    clear()
    background(51)
    fill('red')
    stroke('pink')
    ellipse(player.pos.x, player.pos.y, player.radius)

    player.speed.x = lerp(player.speed.x, player.speedGoal.x, player.acc)
    player.speed.y = lerp(player.speed.y, player.speedGoal.y, player.acc)
    player.pos.x += player.speed.x
    player.pos.y += player.speed.y

}