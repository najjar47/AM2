class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, patrolPoints) {
        super(scene, x, y, 'enemy');
        
        // Add enemy to the scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Enemy properties
        this.patrolPoints = patrolPoints;
        this.currentPoint = 0;
        this.speed = 100;
        this.detectionRange = 200;
        this.fieldOfView = Math.PI / 3; // 60 degrees
        this.isChasing = false;
        this.visionCone = null;
        
        // Physics properties
        this.setBounce(0.2);
        this.setCollideWorldBounds(true);
        
        // Create vision cone
        this.createVisionCone();
        
        // Start patrol
        this.startPatrol();
    }
    
    createVisionCone() {
        this.visionCone = this.scene.add.graphics();
        this.updateVisionCone();
    }
    
    updateVisionCone() {
        this.visionCone.clear();
        this.visionCone.lineStyle(2, 0xff0000, 0.5);
        this.visionCone.fillStyle(0xff0000, 0.2);
        
        // Draw vision cone
        const direction = this.flipX ? Math.PI : 0;
        const startAngle = direction - this.fieldOfView / 2;
        const endAngle = direction + this.fieldOfView / 2;
        
        this.visionCone.beginPath();
        this.visionCone.moveTo(this.x, this.y);
        this.visionCone.arc(this.x, this.y, this.detectionRange, startAngle, endAngle);
        this.visionCone.lineTo(this.x, this.y);
        this.visionCone.closePath();
        this.visionCone.fill();
        this.visionCone.stroke();
    }
    
    startPatrol() {
        if (this.patrolPoints && this.patrolPoints.length > 1) {
            this.moveToPoint(this.patrolPoints[this.currentPoint]);
        }
    }
    
    moveToPoint(point) {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, point.x, point.y);
        const duration = distance / this.speed * 1000;
        
        this.flipX = point.x < this.x;
        
        this.scene.tweens.add({
            targets: this,
            x: point.x,
            y: point.y,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                this.currentPoint = (this.currentPoint + 1) % this.patrolPoints.length;
                this.moveToPoint(this.patrolPoints[this.currentPoint]);
            }
        });
    }
    
    update(player) {
        this.updateVisionCone();
        
        if (this.canSeePlayer(player)) {
            if (!this.isChasing) {
                this.startChasing(player);
            }
            this.chasePlayer(player);
        } else if (this.isChasing) {
            this.stopChasing();
        }
    }
    
    canSeePlayer(player) {
        if (player.isHidden) return false;
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance > this.detectionRange) return false;
        
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        const normalizedAngle = Phaser.Math.Angle.Normalize(angle);
        const direction = this.flipX ? Math.PI : 0;
        const angleDiff = Math.abs(Phaser.Math.Angle.Normalize(normalizedAngle - direction));
        
        return angleDiff <= this.fieldOfView / 2;
    }
    
    startChasing(player) {
        this.isChasing = true;
        this.scene.tweens.killTweensOf(this);
        this.visionCone.setTint(0xff0000);
    }
    
    stopChasing() {
        this.isChasing = false;
        this.visionCone.clearTint();
        this.startPatrol();
    }
    
    chasePlayer(player) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        const velocity = new Phaser.Math.Vector2();
        velocity.setToPolar(angle, this.speed * 1.5);
        
        this.setVelocity(velocity.x, velocity.y);
        this.flipX = velocity.x < 0;
    }
    
    destroy() {
        if (this.visionCone) {
            this.visionCone.destroy();
        }
        super.destroy();
    }
} 