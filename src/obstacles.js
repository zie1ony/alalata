import GameSpeed from "./gameSpeed.js";

class Obstacles {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.obstacles = [];
        this.obstacleFrequency = 1800; // Interval in ms between obstacle creation
        this.lastObstacleTime = Date.now();
        this.pxPerSecond = 300; // Pixels per second
        this.rockPeriod = 1000;
    }

    update(deltaTime) {
        const now = Date.now();
        const speedFactor = (this.pxPerSecond * deltaTime) / 1000;
        
        // Generate new obstacles
        if (now - this.lastObstacleTime > this.obstacleFrequency) {
            this.createObstacle();
            this.lastObstacleTime = now;
        }
        
        // Update existing obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            // Special animation for rock obstacles
            if (this.obstacles[i].type === "rock") {
                const amplitude = 100;
                const t = now - this.obstacles[i].spawnTime;
                this.obstacles[i].y = this.obstacles[i].initialY + 
                    amplitude * Math.sin(2 * Math.PI * t / this.rockPeriod);
            }
            
            // Move obstacle to the left
            this.obstacles[i].x -= speedFactor;
            
            // Remove obstacles that are off-screen
            if (this.obstacles[i].x + this.obstacles[i].width < 0) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    createObstacle() {
        // 30% chance for flying rock, 70% for pipe
        if (Math.random() < 0.3) {
            console.log("Creating flying rock");
            this.createFlyingRock();
        } else {
            console.log("Creating pipe obstacle");
            this.createPipeObstacle();
        }
    }

    createPipeObstacle() {
        const gapHeight = 200;
        const minGapY = 40;
        const maxGapY = this.canvasHeight - gapHeight - 40;
        const gapPosition = Math.random() * (maxGapY - minGapY) + minGapY;
        const obstacleWidth = 50;
        
        // Top pipe
        this.obstacles.push({
            type: 'pipe',
            x: this.canvasWidth,
            y: 0,
            width: obstacleWidth,
            height: gapPosition,
            color: "green"
        });
        
        // Bottom pipe
        this.obstacles.push({
            type: 'pipe',
            x: this.canvasWidth,
            y: gapPosition + gapHeight,
            width: obstacleWidth,
            height: this.canvasHeight - gapPosition - gapHeight,
            color: "green"
        });
    }

    createFlyingRock() {
        const size = 100;
        const y = Math.random() * (this.canvasHeight - size);
        
        this.obstacles.push({
            type: 'rock',
            x: this.canvasWidth,
            y: y,
            width: size,
            height: size,
            color: "gray",
            spawnTime: Date.now(),
            initialY: y  // Store initial Y position for oscillation
        });
    }

    draw(ctx) {
        // Draw all obstacles
        this.obstacles.forEach(obstacle => {
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
    }

    checkCollision(player) {
        // Check if player collides with any obstacle
        for (let obstacle of this.obstacles) {
            if (this.isColliding(player, obstacle)) {
                return true;
            }
        }
        return false;
    }

    isColliding(a, b) {
        return !(a.x > b.x + b.width ||
                 a.x + a.width < b.x ||
                 a.y > b.y + b.height ||
                 a.y + a.height < b.y);
    }

    // Optionally add rock/pipe images
    setImages(rockImg, pipeImg) {
        this.rockImg = rockImg;
        this.pipeImg = pipeImg;
    }

    setGameSpeed(speed) {
        this.pxPerSecond = GameSpeed.objectsSpeed(speed);
        // this.rockPeriod = GameSpeed.rockPeriod(speed);
    }
}

export default Obstacles;