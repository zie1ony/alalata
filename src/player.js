import GameSpeed from "./gameSpeed.js";

class Player {
    constructor(canvasHeight) {
        this.img = new Image();
        this.img.src = "./images/ala_mala.png";
        this.canvasHeight = canvasHeight;
        this.width = 50;
        this.height = 100;

        this.x = 50;
        this.y = canvasHeight / 2 - this.height;

        this.fps = 8;
        this.frames = 3;
        this.currentFrame = 0;
        this.frameCounter = 0;
        this.frameWidth = 150;
        this.frameHeight = 260;
        
        this.loaded = false;
        this.img.onload = () => {
            this.loaded = true;
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
        return this.loaded;
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

        // Handle key events for player movement
        if (this.keys[38]) { this.y -= 5; }
        if (this.keys[40]) { this.y += 5; }
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > this.canvasHeight) this.y = this.canvasHeight - this.height;

    }

    draw(ctx) {
        // Draw the current frame
        ctx.drawImage(
            this.img,
            this.currentFrame * this.frameWidth,
            20, // Frame position on sprite sheet
            this.frameWidth,
            this.frameHeight,
            this.x,
            this.y,
            this.width,
            this.height
        );

        // Draw a rectangle around the player for debugging
        if (this.hasShield) {
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 5;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }

    setGameSpeed(speed) {
        this.fps = GameSpeed.playerFPS(speed);
    }
}

export default Player;
