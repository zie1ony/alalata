import GameSpeed from "./gameSpeed.js";

class BackgroundAnimation {
    constructor(imgFileName, ctx, canvasHeight, canvasWidth) {
        this.x = 0;
        this.pxPerSecond = GameSpeed.backgroundSpeed(GameSpeed.NORMAL);
        this.ctx = ctx;
        this.canvasHeight = canvasHeight;
        this.canvasWidth = canvasWidth;
        this.img = new Image();
        this.img.src = "./images/" + imgFileName;

        this.loaded = false;
        this.img.onload = () => {
            this.loaded = true;
            const scale = this.canvasHeight / this.img.naturalHeight;
            this.width = this.img.naturalWidth * scale;
            this.width = this.img.naturalWidth * scale;
        };
    }

    isLoaded() {
        return this.loaded;
    }

    update(deltaTime) {
        this.x -= (this.pxPerSecond * deltaTime) / 1000;
        if (this.x <= -this.width) {
            this.x = 0;
        }
    }

    draw() {
        const scale = this.canvasHeight / this.img.naturalHeight;
        const imgWidth = this.img.naturalWidth * scale;

        // First image
        this.ctx.drawImage(
            this.img,
            0, 0, 
            this.img.naturalWidth, this.img.naturalHeight,
            this.x, 0,
            imgWidth, this.canvasHeight
        );
        
        // Second image
        this.ctx.drawImage(
            this.img,
            0, 0, 
            this.img.naturalWidth, this.img.naturalHeight,
            imgWidth+this.x, 0,
            imgWidth, this.canvasHeight
        );
    }

    setGameSpeed(speed) {
        this.pxPerSecond = GameSpeed.backgroundSpeed(speed);
    }
}

export default BackgroundAnimation;