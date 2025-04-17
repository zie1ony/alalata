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
        this.pipePeriod = 2000; // Period for moving pipe oscillation

        this.loadedImages = 0;

        this.pipeUp = new Image();
        this.pipeUp.src = "./images/pipe_up.png";
        this.pipeUp.onload = () => { this.loadedImages++; };

        this.pipeDown = new Image();
        this.pipeDown.src = "./images/pipe_down.png";
        this.pipeDown.onload = () => { this.loadedImages++; };
        this.pipeImgHeight = 600;
        this.pipeImgWidth = 121;

        this.rockImg = new Image();
        this.rockImg.src = "./images/rock_small.png";
        this.rockImg.onload = () => { this.loadedImages++; };
        this.rockImgWidth = 300;
        this.rockImgHeight = 265;
    }

    isLoaded() {
        return this.loadedImages === 3;
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
            const obstacle = this.obstacles[i];
            
            // Special animation for rock obstacles
            if (obstacle.type === "rock") {
                const amplitude = 100;
                const t = now - obstacle.spawnTime;
                obstacle.y = obstacle.initialY + 
                    amplitude * Math.sin(2 * Math.PI * t / this.rockPeriod);
            }
            
            // Handle moving pipe gaps
            if (obstacle.type === 'pipe' && obstacle.isMoving) {
                // Only update the first part of the pair (the reference part)
                if (obstacle.isPairReference) {
                    const amplitude = 80; // Max distance the gap will move
                    const t = now - obstacle.spawnTime;
                    const newGapPosition = obstacle.initialGapPosition + 
                        amplitude * Math.sin(2 * Math.PI * t / this.pipePeriod);
                    
                    // Update the top pipe's height
                    obstacle.height = newGapPosition;
                    
                    // Find and update the bottom pipe (which is the next obstacle in the array)
                    if (i + 1 < this.obstacles.length && this.obstacles[i + 1].pairId === obstacle.pairId) {
                        const bottomPipe = this.obstacles[i + 1];
                        bottomPipe.y = newGapPosition + obstacle.gapHeight;
                        bottomPipe.height = this.canvasHeight - bottomPipe.y;
                    }
                }
            }
            
            // Move obstacle to the left
            obstacle.x -= speedFactor;
            
            // Remove obstacles that are off-screen
            if (obstacle.x + obstacle.width < -50) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    createObstacle() {
        // 30% chance for flying rock, 20% for moving pipes, 50% for regular pipes
        const random = Math.random();
        if (random < 0.3) {
            console.log("Creating flying rock");
            this.createFlyingRock();
        } else if (random < 0.5) {
            console.log("Creating moving pipe obstacle");
            this.createMovingPipeObstacle();
        } else {
            console.log("Creating pipe obstacle");
            this.createPipeObstacle();
        }
    }

    createPipeObstacle(isMoving = false, gapHeight = 200) {
        const minGapY = 40;
        const maxGapY = this.canvasHeight - gapHeight - 40;
        const gapPosition = Math.random() * (maxGapY - minGapY) + minGapY;
        const obstacleWidth = 70;
        const pairId = Date.now(); // Unique ID to match pipe pairs
        
        // Top pipe
        this.obstacles.push({
            type: 'pipe',
            x: this.canvasWidth,
            y: 0,
            width: obstacleWidth,
            height: gapPosition,
            color: isMoving ? "lightgreen" : "green", // Different color for moving pipes
            isMoving: isMoving,
            isPairReference: true, // This is the pipe we'll use as reference for moving the pair
            pairId: pairId,
            gapHeight: gapHeight,
            initialGapPosition: gapPosition,
            spawnTime: Date.now()
        });
        
        // Bottom pipe
        this.obstacles.push({
            type: 'pipe',
            x: this.canvasWidth,
            y: gapPosition + gapHeight,
            width: obstacleWidth,
            height: this.canvasHeight - gapPosition - gapHeight,
            color: isMoving ? "lightgreen" : "green",
            isMoving: isMoving,
            isPairReference: false, // This pipe follows the reference pipe
            pairId: pairId
        });
    }

    createMovingPipeObstacle() {
        // Uses the same pipe creation but with moving flag set to true
        this.createPipeObstacle(true, 300);
    }

    createFlyingRock() {
        const height = 50;
        const y = Math.random() * (this.canvasHeight - height);
        const scale = this.rockImgHeight / height;
        const width = this.rockImgWidth / scale;

        this.obstacles.push({
            type: 'rock',
            x: this.canvasWidth,
            y: y,
            width: height,
            height: width,
            color: "gray",
            spawnTime: Date.now(),
            initialY: y  // Store initial Y position for oscillation
        });
    }

    draw(ctx) {
        this.obstacles.forEach(obstacle => {
            if (obstacle.type === 'pipe') {
                if (obstacle.isPairReference) {
                    // Top pipe: use pipeUp image; crop from the bottom of the image
                    const topPipeHeight = obstacle.height;
                    ctx.drawImage(
                        this.pipeUp,
                        0, this.pipeImgHeight - topPipeHeight, // source x, source y (crop from bottom)
                        this.pipeImgWidth, topPipeHeight,       // source width, source height
                        obstacle.x, obstacle.y,                 // destination x, y
                        this.pipeImgWidth, topPipeHeight        // destination width, height
                    );
                } else {
                    // Bottom pipe: use pipeDown image; crop from the top of the image
                    const bottomPipeHeight = obstacle.height;
                    ctx.drawImage(
                        this.pipeDown,
                        0, 0,                                 // source x, source y
                        this.pipeImgWidth, bottomPipeHeight,    // source width, source height
                        obstacle.x, obstacle.y,                 // destination x, y
                        this.pipeImgWidth, bottomPipeHeight     // destination width, height
                    );
                }
            } else {
                // For rock obstacles, draw the rock image
                ctx.drawImage(
                    this.rockImg,
                    obstacle.x, obstacle.y,
                    obstacle.width, obstacle.height
                );
            }
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

    setGameSpeed(speed) {
        this.pxPerSecond = GameSpeed.objectsSpeed(speed);
        // Optionally adjust animation periods based on game speed
        // this.rockPeriod = GameSpeed.rockPeriod(speed) || 1000;
        // this.pipePeriod = GameSpeed.pipePeriod(speed) || 2000;
    }
}

export default Obstacles;