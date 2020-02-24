class Player
{
    constructor(id, name, posX, posY, radius, color)
    {
        this.id = id
        this.name = name

        this.radius = radius
        this.color = color,

        this.pos = createVector(posX, posY)
        this.afkPos = 0
        this.speed = createVector(0, 0)
        this.speedGoal = createVector(0, 0)
        this.maxSpeed = 3
        this.acc = 0.1

        this.movingXPos = false
        this.movingXNeg = false
        this.movingYPos = false
        this.movingYNeg = false
        

        this.cannonLength = 20,
        this.cannonWidth = 10,
        this.cannonDir = createVector(0, 0),
        this.isShooting = false,
        this.justShoot = false,
        this.shootingRate = 400,
        this.bulletSpeed = 0.3,

        this.isDead = false
        this.godMod = false


        this.setShootingMouseEvent()
        this.setKeyboardControls()
        afkTest()
    }

    die()
    {
        this.death++
        this.isDead = true
        this.godMod = true
        setTimeout( () =>
        {
            this.isDead = false
        }, 5000)
        setTimeout( () =>
        {
            this.godMod = false
        }, 6500)
    }

    syncClientWithServer()
    {
        for (const _player of playersArray)
        {
            if (_player.id == socket.id)
            {
                this.shootingRate = _player.shootingRate
            }
        }
    }

    updateStates()
    {
        // PLAYER SERVER POS/CANNONDIR UPDATE
        playerStates.x = this.pos.x
        playerStates.y = this.pos.y
        playerStates.cannonDir.x = this.cannonDir.x
        playerStates.cannonDir.y = this.cannonDir.y
        playerStates.godMod = this.godMod
        socket.emit('update', playerStates)
    }

    shootingTest()
    {
        if (this.isShooting == true)
        {
            if (this.justShoot == false)
            {
                // CREATING BULLET OBJECT 
                bulletArray.push(new Bullet(this.pos.x, this.pos.y, this.cannonDir.x, this.cannonDir.y, this.bulletSpeed, this.id))

                // SENDING BULLET INFOS TO SERVER
                let bulletData =
                {
                    id : this.id,
                    posX : this.pos.x,
                    posY : this.pos.y,
                    speedX : this.cannonDir.x,
                    speedY : this.cannonDir.y
                }
                socket.emit('shoot', bulletData)

                // SETTING SHOOTING DELAY
                this.justShoot = true
                setTimeout( () =>
                {
                    this.justShoot = false
                }
                , this.shootingRate)
            }
        }
    }

    updatePos()
    {
        // UPDATE
        if (this.isDead == false)
        {
            // PLAYER CANVAS POS
            this.speed.x = lerp(this.speed.x, this.speedGoal.x, this.acc)
            this.speed.y = lerp(this.speed.y, this.speedGoal.y, this.acc)
            this.pos.x += this.speed.x
            this.pos.y += this.speed.y
        
            // PLAYER CANNON DIRECTION
            this.cannonDir = createVector(mouseX - this.pos.x, mouseY - this.pos.y).normalize().mult(this.cannonLength)
        }

        // DISPLAY
        if (this.godMod == false)
        {
            // ALIVE PLAYER
            // PLAYER
            strokeWeight(1)
            fill(this.color)
            stroke('pink')
            ellipse(this.pos.x, this.pos.y, this.radius)

            // CANNON
            stroke(200)
            strokeWeight(this.cannonWidth)
            line(this.pos.x, this.pos.y, this.pos.x + this.cannonDir.x, this.pos.y + this.cannonDir.y)

        }
        else
        {
            // DEAD PLAYER
            // PLAYER
            stroke('rgba(100%,100%,100%,0.3)')
            strokeWeight(1)
            fill('rgba(100%,100%,100%,0.3)')
            ellipse(this.pos.x, this.pos.y, this.radius)

            // CANNON
            stroke(200)
            strokeWeight(this.cannonWidth)
            line(this.pos.x, this.pos.y, this.pos.x + this.cannonDir.x, this.pos.y + this.cannonDir.y)
        }

        // PLAYER NAME DISPLAY
        textAlign(CENTER)
        textSize(15)
        fill('rgba(255, 255, 255, 0.4)')
        noStroke()
        text(this.name, this.pos.x, this.pos.y + 35)
    }

    mapConstrain()
    {
        this.pos.x = constrain(this.pos.x, 0 + this.radius / 2, width - this.radius / 2)
        this.pos.y = constrain(this.pos.y, 0 + this.radius / 2, width - this.radius / 2)
    }

    setShootingMouseEvent()
    {
        window.addEventListener('mousedown', () =>
        {
            this.isShooting = true
        })
        window.addEventListener('mouseup', () =>
        {
            this.isShooting = false
        })
    }

    setKeyboardControls()
    {
        window.addEventListener('keydown', (_event) =>
        {
            if (this.isDead == false)
            {
                switch (_event.code) {
                    case 'KeyW':
                    case 'ArrowUp':
                        this.speedGoal.y = -this.maxSpeed
                        break;
                    case 'KeyS':
                    case 'ArrowDown':
                        this.speedGoal.y = this.maxSpeed
                        break;
                    case 'KeyA':
                    case 'ArrowLeft':
                        this.movingXNeg = true
                        this.speedGoal.x = -this.maxSpeed
                        break;
                    case 'KeyD':
                    case 'ArrowRight':
                        this.movingXPos = true
                        this.speedGoal.x = this.maxSpeed
                        break;
                    default:
                        break;
                }
            }
        })

        window.addEventListener('keyup', (_event) =>
        {
            switch (_event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    if (this.movingYPos && this.movingYneg) {
                        this.movingYNeg = false
                        this.speedGoal.y = -this.maxSpeed
                    }
                    else
                    {
                        this.movingYNeg = false
                        this.speedGoal.y = 0
                    }
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    if (this.movingYPos && this.movingYneg) {
                        this.movingYPos = false
                        this.speedGoal.y = -this.maxSpeed
                    }
                    else
                    {
                        this.movingYNeg = false
                        this.speedGoal.y = 0
                    }
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    if (this.movingXPos && this.movingXNeg) {
                        this.movingXNeg = false
                        this.speedGoal.x = this.maxSpeed
                    }
                    else
                    {
                        this.movingXNeg = false
                        this.speedGoal.x = 0
                    }
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    if (this.movingXPos && this.movingXNeg) {
                        this.movingXPos = false
                        this.speedGoal.x = -this.maxSpeed
                    }
                    else
                    {
                        this.movingXPos = false
                        this.speedGoal.x = 0
                    }
                    break;
                default:
                    break;
            }
        })
    }
}