import GameSpeed from "./gameSpeed.js";

class Coins {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.coins = [];
        this.coinFrequency = 500; // Interval in ms between coin creation
        this.lastCoinTime = Date.now();
        this.pxPerSecond = 300; // Pixels per second
        this.score = 0;
    }

    update(deltaTime, player, obstacles, magnetActive) {
        const now = Date.now();
        const speedFactor = (this.pxPerSecond * deltaTime) / 1000;
        
        // Generate new coins (only if safe position available)
        if (now - this.lastCoinTime > this.coinFrequency) {
            // Only create coin if there's a safe position
            if (this.findSafePosition(obstacles)) {
                this.createCoin(obstacles);
                this.lastCoinTime = now;
            }
        }
        
        // Update existing coins
        for (let i = this.coins.length - 1; i >= 0; i--) {
            // Move coin to the left
            this.coins[i].x -= speedFactor;
            
            // Remove coins that are off-screen
            if (this.coins[i].x + this.coins[i].width < 0) {
                this.coins.splice(i, 1);
            } 
            // Collect coin if player touches it or magnet is active
            else if (this.isColliding(player, this.coins[i])) {
                // Collect coin on direct collision
                this.score += 1;
                this.coins.splice(i, 1);
            } else if (this.coins[i].gravitating || (magnetActive && this.distance(player, this.coins[i]) < 150)) {
                // Set coin to gravitate mode if magnet active, or continue gravitating
                this.coins[i].gravitating = true;
                
                // Calculate direction vector toward player
                const dx = (player.x + player.width/2) - (this.coins[i].x + this.coins[i].width/2);
                const dy = (player.y + player.height/2) - (this.coins[i].y + this.coins[i].height/2);
                
                // Calculate distance
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                // Adjust speed based on distance (faster when closer)
                const gravitateSpeedFactor = Math.min(10, 150 / distance) * speedFactor;
                
                // Move coin toward player
                this.coins[i].x += (dx / distance) * gravitateSpeedFactor;
                this.coins[i].y += (dy / distance) * gravitateSpeedFactor;
                
                // Check if coin has reached player after moving
                if (this.isColliding(player, this.coins[i])) {
                    this.score += 1;
                    this.coins.splice(i, 1);
                }
            }
        }

        return this.score;
    }

    findSafePosition(obstacles) {
        // Return true if there's at least one safe position to place a coin
        // This is a simplified check - we're just checking if the entire canvas isn't blocked
        const coinSize = 20;
        const safeZoneWidth = 100; // Width of area to check for obstacles
        
        // Check if obstacles are blocking the entire spawn position
        const blockedAreas = [];
        
        // Get all obstacles in the spawn area
        if (obstacles && obstacles.obstacles) {
            obstacles.obstacles.forEach(obstacle => {
                // Only consider obstacles at the spawn position
                if (obstacle.x > this.canvasWidth - safeZoneWidth && 
                    obstacle.x < this.canvasWidth + safeZoneWidth) {
                    blockedAreas.push({
                        y: obstacle.y,
                        height: obstacle.height
                    });
                }
            });
        }
        
        // If no obstacles in spawn area, we're safe
        if (blockedAreas.length === 0) {
            return true;
        }
        
        // Find gaps between obstacles that are large enough for a coin
        let lastEnd = 0;
        blockedAreas.sort((a, b) => a.y - b.y); // Sort by vertical position
        
        for (const area of blockedAreas) {
            if (area.y - lastEnd > coinSize * 2) {
                // Found a gap big enough for a coin
                return true;
            }
            lastEnd = Math.max(lastEnd, area.y + area.height);
        }
        
        // Check if there's space below the last obstacle
        if (this.canvasHeight - lastEnd > coinSize * 2) {
            return true;
        }
        
        return false; // No safe position found
    }

    createCoin(obstacles) {
        const coinSize = 20;
        let attempts = 0;
        let maxAttempts = 10;
        let validPosition = false;
        let coinY;
        
        // Try to find a position that doesn't overlap with obstacles
        while (!validPosition && attempts < maxAttempts) {
            coinY = Math.random() * (this.canvasHeight - coinSize);
            validPosition = true;
            
            // Check against all obstacles
            if (obstacles && obstacles.obstacles) {
                for (const obstacle of obstacles.obstacles) {
                    // Only check obstacles near spawn point
                    if (obstacle.x > this.canvasWidth - 100 && 
                        obstacle.x < this.canvasWidth + 100) {
                        
                        // Check if coin would overlap with this obstacle
                        if (coinY + coinSize > obstacle.y && 
                            coinY < obstacle.y + obstacle.height) {
                            validPosition = false;
                            break;
                        }
                    }
                }
            }
            
            attempts++;
        }
        
        // Add the coin if we found a valid position or just add it randomly if we failed
        this.coins.push({
            x: this.canvasWidth,
            y: coinY,
            width: coinSize,
            height: coinSize,
            color: "yellow"
        });
    }

    draw(ctx) {
        // Draw all coins as circles
        this.coins.forEach(coin => {
            ctx.fillStyle = coin.color;
            ctx.beginPath();
            ctx.arc(
                coin.x + coin.width / 2, 
                coin.y + coin.height / 2, 
                coin.width / 2, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
        });
    }

    isColliding(a, b) {
        return !(a.x > b.x + b.width ||
                a.x + a.width < b.x ||
                a.y > b.y + b.height ||
                a.y + a.height < b.y);
    }

    distance(a, b) {
        const ax = a.x + a.width / 2;
        const ay = a.y + a.height / 2;
        const bx = b.x + b.width / 2;
        const by = b.y + b.height / 2;
        return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
    }

    getScore() {
        return this.score;
    }

    resetScore() {
        this.score = 0;
    }

    // Optional: add coin image
    setImage(coinImg) {
        this.coinImg = coinImg;
    }

    setGameSpeed(speed) {
        this.pxPerSecond = GameSpeed.objectsSpeed(speed);
    }
}

export default Coins;