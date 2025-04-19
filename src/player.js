import GameSpeed from "./gameSpeed.js";

class Player {
    constructor(canvasHeight) {
        this.img = new Image();
        this.img.src = "./images/ala2_mala.png";

        this.shieldImg = new Image();
        this.shieldImg.src = "./images/shield.png";

        this.canvasHeight = canvasHeight;
        this.width = 50;
        this.height = 100;

        this.x = 50;
        this.y = canvasHeight / 2 - this.height;

        this.fps = 4;
        this.frames = 3;
        this.currentFrame = 0;
        this.frameCounter = 0;
        this.frameWidth = 150;
        this.frameHeight = 300;

        
        this.loaded = 0;
        this.img.onload = () => {
            this.loaded += 1;
        };
        this.shieldImg.onload = () => {
            this.loaded += 1;
        };

        this.hasShield = false;
    }

    setupKeyListeners() {
        this.keys = {};

        window.addEventListener("keydown", (e) => {
          this.keys[e.keyCode] = true;
        });
        window.addEventListener("keyup", (e) => {
          this.keys[e.keyCode] = false;
        });
    }

    isLoaded() {
        return this.loaded === 2;
    }

    update(deltaTime, hasShield) {
        // Animation logic based on deltaTime and fps
        this.frameCounter += deltaTime;
        this.hasShield = hasShield;
        // Calculate time per frame based on fps
        const frameTime = 1000 / this.fps;
        
        if (this.frameCounter >= frameTime) {
            // Move to next frame
            this.currentFrame = (this.currentFrame + 1) % this.frames;
            // Reset counter, keeping remainder for smoother animation
            this.frameCounter -= frameTime;
        }

        // time‑based movement instead of fixed 5px/frame
        const speed = 500;                     // px per second
        const dy = speed * deltaTime / 1000;   // px this frame
        if (this.keys[38]) {
            this.y -= dy;
            // console.log("up", this.y, dy, deltaTime);
        }   // Up arrow
        if (this.keys[40]) {
            this.y += dy;
            // console.log("down", this.y, dy, deltaTime);
        }   // Down arrow

        // Bounds clamp
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > this.canvasHeight) 
            this.y = this.canvasHeight - this.height;
    }

    draw(ctx) {
        // Draw a rectangle around the player for debugging
        if (this.hasShield) {
            ctx.drawImage(
                this.shieldImg,
                this.x - 30,
                this.y - 30,
                this.width + 60,
                this.height + 60
            );
        }
        // Draw the current frame
        ctx.drawImage(
            this.img,
            this.currentFrame * this.frameWidth,
            0, // Frame position on sprite sheet
            this.frameWidth,
            this.frameHeight,
            this.x,
            this.y,
            this.width,
            this.height
        );


    }

    setGameSpeed(speed) {
        this.fps = GameSpeed.playerFPS(speed);
    }
}

export default Player;
