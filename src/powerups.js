import GameSpeed from "./gameSpeed.js";

class PowerUp {
    constructor(time, duration) {
        this.activeUntil = time;
        this.duration = duration;
    }

    remainingTimeInSeconds() {
        return Math.floor((this.activeUntil - Date.now()) / 1000);
    }

    isActive() {
        return this.remainingTimeInSeconds() > 0
    }

    activate() {
        this.activeUntil = Date.now() + this.duration;
    }

    deactivate() {
        this.activeUntil = Date.now();
    }
}

class Powerups {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.powerups = [];
        this.powerupFrequency = 2000; // Interval in ms between powerup creation
        this.lastPowerupTime = Date.now();
        this.pxPerSecond = 300; // Pixels per second
        
        // Active powerup effects
        this.speedUp = new PowerUp(0, 5000); // Speed up for 5 seconds
        this.slowDown = new PowerUp(0, 5000); // Slow down for 5 seconds
        this.magnet = new PowerUp(0, 10000); // Magnet for 5 seconds
        this.shield = new PowerUp(0, 5000); // Shield for 5 seconds

        this.loaded = 0;
        this.magnetImg = new Image();
        this.magnetImg.src = "images/powerup_magnet.png";
        this.magnetImg.onload = () => {
            this.loaded += 1;
        };

        this.shieldImg = new Image();
        this.shieldImg.src = "images/powerup_shield.png";
        this.shieldImg.onload = () => {
            this.loaded += 1;
        };

        this.speedUpImg = new Image();
        this.speedUpImg.src = "images/powerup_speed.png";
        this.speedUpImg.onload = () => {
            this.loaded += 1;
        };

        this.slowDownImg = new Image();
        this.slowDownImg.src = "images/powerup_slow.png";
        this.slowDownImg.onload = () => {
            this.loaded += 1;
        };
    }

    isLoaded() {
        return this.loaded === 4;
    }


    update(deltaTime, player, obstacles) {
        const now = Date.now();
        const speedFactor = (this.pxPerSecond * deltaTime) / 1000;
        
        // Generate new powerups (avoiding obstacles)
        if (now - this.lastPowerupTime > this.powerupFrequency) {
            this.createPowerup(obstacles);
            this.lastPowerupTime = now;
        }
        
        // Update existing powerups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            // Move powerup to the left
            this.powerups[i].x -= speedFactor;
            
            // Remove powerups that are off-screen
            if (this.powerups[i].x + this.powerups[i].width < 0) {
                this.powerups.splice(i, 1);
            } 
            // Activate powerup if player touches it
            else if (this.isColliding(player, this.powerups[i])) {
                this.activatePowerup(this.powerups[i]);
                this.powerups.splice(i, 1);
            }
        }
    }

    createPowerup(obstacles) {
        const types = ["shield", "magnet", "speed_up", "slow_down"];
        const type = types[Math.floor(Math.random() * types.length)];
        const size = 60;
        
        // Determine color based on powerup type
        let color;
        switch(type) {
            case "shield": color = "blue"; break;
            case "magnet": color = "purple"; break;
            case "speed_up": color = "red"; break;
            case "slow_down": color = "cyan"; break;
        }
        
        // Find a position that doesn't overlap with obstacles
        let validPosition = false;
        let attempts = 0;
        let maxAttempts = 10;
        let y;
        
        while (!validPosition && attempts < maxAttempts) {
            y = Math.random() * (this.canvasHeight - size);
            validPosition = true;
            
            // Check if position overlaps with obstacles
            if (obstacles && obstacles.obstacles) {
                for (const obstacle of obstacles.obstacles) {
                    if (obstacle.x > this.canvasWidth - 100 && 
                        obstacle.x < this.canvasWidth + 100) {
                        if (y + size > obstacle.y && 
                            y < obstacle.y + obstacle.height) {
                            validPosition = false;
                            break;
                        }
                    }
                }
            }
            
            attempts++;
        }
        
        // Add powerup
        this.powerups.push({
            x: this.canvasWidth,
            y: y || Math.random() * (this.canvasHeight - size), // Fallback if no valid position
            width: size,
            height: size,
            type: type,
            color: color
        });
    }

    activatePowerup(powerup) {
        switch(powerup.type) {
            case "shield":
                this.shield.activate();
                break;
                
            case "magnet":
                this.magnet.activate();
                break;
                
            case "speed_up":
                this.slowDown.deactivate();
                this.speedUp.activate();
                break;
                
            case "slow_down":
                this.speedUp.deactivate();
                this.slowDown.activate();
                break;
        }
    }

    draw(ctx) {
        // Draw all powerups
        this.powerups.forEach(pw => {
            let img = null;
            if (pw.type === "magnet") {
                img = this.magnetImg;
            }

            if (pw.type === "shield") {
                img = this.shieldImg;
            }

            if (pw.type === "speed_up") {
                img = this.speedUpImg;
            }

            if (pw.type === "slow_down") {
                img = this.slowDownImg;
            }

            // Draw powerup image
            if (img) {
                ctx.drawImage(
                    img,
                    pw.x,
                    pw.y,
                    pw.width,
                    pw.height
                );
            }
        });

        // Draw active powerup effects
        // if (this.speedUp.isActive()) {
        //     ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        //     // Write "Speed Up" text
        //     let text = "SpeedUp for " + this.speedUp.remainingTimeInSeconds() + "s";
        //     ctx.fillText(text, 50, 50);
        // }

        // if (this.slowDown.isActive()) {
        //     ctx.fillStyle = "rgba(0, 255, 255, 0.5)";
        //     // Write "Slow Down" text
        //     let text = "SlowDown for " + this.slowDown.remainingTimeInSeconds() + "s";
        //     ctx.fillText(text, 50, 70);
        // }
        // if (this.magnet.isActive()) {
        //     ctx.fillStyle = "rgba(128, 0, 128, 0.5)";
        //     // Write "Magnet" text
        //     let text = "Magnet for " + this.magnet.remainingTimeInSeconds() + "s";
        //     ctx.fillText(text, 50, 90);
        // }
        // if (this.shield.isActive()) {
        //     ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
        //     // Write "Shield" text
        //     let text = "Shield for " + this.shield.remainingTimeInSeconds() + "s";
        //     ctx.fillText(text, 50, 110);
        // }
    }

    isColliding(a, b) {
        return !(a.x > b.x + b.width ||
                a.x + a.width < b.x ||
                a.y > b.y + b.height ||
                a.y + a.height < b.y);
    }

    setGameSpeed(speed) {
        this.pxPerSecond = GameSpeed.objectsSpeed(speed);
    }
}

export default Powerups;