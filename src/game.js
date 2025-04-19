import BackgroundAnimation from "./background.js";
import Player from "./player.js";
import Obstacles from "./obstacles.js";
import Coins from "./coins.js";
import Powerups from "./powerups.js";
import GameSpeed from "./gameSpeed.js";

class Game {
    constructor(ctx, canvasHeight, canvasWidth, gameOverCallback, scoreUpdateCallback) {
        this.ctx = ctx;
        this.background = new BackgroundAnimation("background_light.png", ctx, canvasHeight, canvasWidth);
        this.player = new Player(canvasHeight);
        this.obstacles = new Obstacles(canvasWidth, canvasHeight);
        this.coins = new Coins(canvasWidth, canvasHeight, scoreUpdateCallback);
        this.powerups = new Powerups(canvasWidth, canvasHeight);
        this.gameOverCallback = gameOverCallback;
    }

    isLoaded() {
        return this.background.isLoaded() 
            && this.player.isLoaded()
            && this.obstacles.isLoaded()
            && this.coins.isLoaded();
    }

    start() {
        if (this.isLoaded()) {
            this.lastTime = Date.now();
            this.player.setupKeyListeners();
            this.gameLoop();
        } else {
            console.log("Assets not loaded yet");
            setTimeout(() => this.start(), 100); // Retry after 100ms
        }
    }

    gameLoop() {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();

        if (!this.powerups.shield.isActive()) {
            if (this.obstacles.checkCollision(this.player)) {
                this.gameOverCallback(this.coins.getScore());
                return;
            }
        }

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(deltaTime) {
        let speed = this.gameSpeed();

        // Update game speed.
        this.background.setGameSpeed(speed);
        this.player.setGameSpeed(speed);
        this.obstacles.setGameSpeed(speed);
        this.coins.setGameSpeed(speed);
        this.powerups.setGameSpeed(speed);

        this.background.update(deltaTime);
        this.player.update(deltaTime, this.powerups.shield.isActive());
        this.obstacles.update(deltaTime, );
        this.coins.update(deltaTime, this.player, this.obstacles, this.powerups.magnet.isActive(), this.powerups.speedUp.isActive());
        this.powerups.update(deltaTime, this.player, this.obstacles);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.background.draw();
        this.player.draw(this.ctx);
        this.obstacles.draw(this.ctx);
        this.coins.draw(this.ctx);
        this.powerups.draw(this.ctx);
    }

    gameSpeed() {
        if(this.powerups.speedUp.isActive()) {
            return GameSpeed.FAST;
        }
        if(this.powerups.slowDown.isActive()) {
            return GameSpeed.SLOW;
        }
        return GameSpeed.NORMAL;
    }
}

export default Game;