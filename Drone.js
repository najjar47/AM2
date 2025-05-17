class Drone extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, options = {}) {
        super(scene, x, y, 'drone');
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Drone properties
        this.speed = options.speed || 150;
        this.detectionRange = options.detectionRange || 200;
        this.searchArea = options.searchArea || {
            x: 0,
            y: 0,
            width: scene.game.config.width,
            height: scene.game.config.height
        };
        this.isSearching = true;
        this.nextPointDelay = 2000;
        this.spotlightRadius = 100;
        
        // Physics properties
        this.setCollideWorldBounds(true);
        
        // Create spotlight
        this.spotlight = scene.add.graphics();
        this.updateSpotlight();
        
        // Create propellers
        this.createPropellers();
        
        // Start random movement
        this.moveToRandomPoint();
    }
    
    createPropellers() {
        const propellerSize = 8;
        
        // Left propeller
        this.leftPropeller = this.scene.add.rectangle(-15, 0, propellerSize, propellerSize, 0x333333);
        
        // Right propeller
        this.rightPropeller = this.scene.add.rectangle(15, 0, propellerSize, propellerSize, 0x333333);
        
        // Animate propellers
        this.scene.tweens.add({
            targets: [this.leftPropeller, this.rightPropeller],
            angle: 360,
            duration: 1000,
            repeat: -1
        });
    }
    
    updateSpotlight() {
        this.spotlight.clear();
        
        // Draw outer circle
        this.spotlight.lineStyle(2, 0xffff00, 0.5);
        this.spotlight.strokeCircle(this.x, this.y, this.spotlightRadius);
        
        // Draw gradient
        const gradient = this.spotlight.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.spotlightRadius,
            [
                { stop: 0, color: 0xffff00, alpha: 0.3 },
                { stop: 1, color: 0xffff00, alpha: 0 }
            ]
        );
        
        this.spotlight.fillStyle(gradient);
        this.spotlight.fillCircle(this.x, this.y, this.spotlightRadius);
    }
    
    moveToRandomPoint() {
        if (!this.isSearching) return;
        
        const targetX = Phaser.Math.Between(
            this.searchArea.x + this.spotlightRadius,
            this.searchArea.x + this.searchArea.width - this.spotlightRadius
        );
        
        const targetY = Phaser.Math.Between(
            this.searchArea.y + this.spotlightRadius,
            this.searchArea.y + this.searchArea.height - this.spotlightRadius
        );
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
        const duration = (distance / this.speed) * 1000;
        
        this.scene.tweens.add({
            targets: this,
            x: targetX,
            y: targetY,
            duration: duration,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.scene.time.delayedCall(this.nextPointDelay, () => {
                    this.moveToRandomPoint();
                });
            }
        });
    }
    
    startChasing(player) {
        this.isSearching = false;
        this.scene.tweens.killTweensOf(this);
        
        // Change spotlight color to red
        this.spotlight.clear();
        this.spotlight.lineStyle(2, 0xff0000, 0.5);
        this.spotlight.fillStyle(0xff0000, 0.3);
        this.spotlight.fillCircle(this.x, this.y, this.spotlightRadius);
        this.spotlight.strokeCircle(this.x, this.y, this.spotlightRadius);
        
        // Move towards player
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        const velocity = new Phaser.Math.Vector2();
        velocity.setToPolar(angle, this.speed * 1.5);
        
        this.setVelocity(velocity.x, velocity.y);
    }
    
    stopChasing() {
        this.isSearching = true;
        this.setVelocity(0, 0);
        this.moveToRandomPoint();
    }
    
    canSeePlayer(player) {
        if (player.isHidden) return false;
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        return distance <= this.spotlightRadius;
    }
    
    update(player) {
        // Update spotlight position
        this.updateSpotlight();
        
        // Update propeller positions
        if (this.leftPropeller && this.rightPropeller) {
            this.leftPropeller.setPosition(this.x - 15, this.y);
            this.rightPropeller.setPosition(this.x + 15, this.y);
        }
        
        // Check for player detection
        if (this.canSeePlayer(player)) {
            if (this.isSearching) {
                this.startChasing(player);
            }
            this.scene.events.emit('playerDetected', { x: this.x, y: this.y });
        } else if (!this.isSearching) {
            this.stopChasing();
        }
    }
    
    destroy() {
        if (this.spotlight) {
            this.spotlight.destroy();
        }
        if (this.leftPropeller) {
            this.leftPropeller.destroy();
        }
        if (this.rightPropeller) {
            this.rightPropeller.destroy();
        }
        super.destroy();
    }
} 