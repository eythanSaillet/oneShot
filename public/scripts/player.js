class Player
{
    constructor(posX, posY, radius)
    {
        this.id = null

        this.pos = createVector(posX, posY)
        this.speed = createVector(0, 0)
        this.radius = radius

        this.speedGoal = createVector(0, 0)
        this.maxSpeed = 3
        this.acc = 0.1

        this.movingXPos = false
        this.movingXNeg = false
        this.movingYPos = false
        this.movingYNeg = false

        this.life = 100

        this.setKeyboardControls()
    }


    setKeyboardControls()
    {
        window.addEventListener('keydown', (_event) =>
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

    // wallCollisionTestXPos(){
    //     if(this.pos.x > width - (this.radius / 2)){
    //         return true
    //     }
    //     else{
    //         return false
    //     }
    // }
    // wallCollisionTestXNeg(){
    //     if(this.pos.x < - (this.width / 2) + this.wallHeight + (this.width / 2)){
    //         return true
    //     }
    //     else{
    //         return false
    //     }
    // }
    // wallCollisionTestYPos(){
    //     if(this.pos.y > (this.height / 2) - this.wallHeight - (this.height / 2)){
    //         return true
    //     }
    //     else{
    //         return false
    //     }
    // }
    // wallCollisionTestYNeg(){
    //     if(this.pos.y < - (this.height / 2) + this.wallHeight + (this.height / 2)){
    //         return true
    //     }
    //     else{
    //         return false
    //     }
    // }

    // playerMovement()
    // {
    //     if (player.pos.x <) {
            
    //     }
    // }
}