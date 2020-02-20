class Bullet
{
    constructor(posX, posY, speedX, speedY, bulletSpeed)
    {
        this.pos = createVector(posX + speedX, posY + speedY)
        this.speed = createVector(speedX, speedY).mult(bulletSpeed)
    }

    updatePos()
    {
        this.pos.add(this.speed)
    }

    draw()
    {
        noStroke()
        fill('white')
        ellipse(this.pos.x, this.pos.y, 10, 10)
    }
}