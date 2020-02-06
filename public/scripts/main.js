let socket

function setup()
{
    createCanvas(700, 700).parent('canvasContainer')
    background(51)
    frameRate(60)

    socket = io.connect('http://eythansaillet.eu-4.evennode.com/')
}

function draw()
{

}