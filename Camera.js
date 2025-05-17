class SurveillanceCamera extends Phaser.GameObjects.Container {
    constructor(scene, x, y, options = {}) {
        super(scene, x, y);
        
        // Add to scene
        scene.add.existing(this);
        
        // Camera properties
        this.rotationSpeed = options.rotationSpeed || 0.02;
        this.detectionRange = options.detectionRange || 250;
        this.fieldOfView = options.fieldOfView || Math.PI / 4; // 45 degrees
        this.rotationLimits = options.rotationLimits || { min: -Math.PI / 2, max: Math.PI / 2 };
        this.currentRotation = 0;
        this.rotationDirection = 1;
        this.isDisabled = false;
        
        // Create camera body
        this.body = scene.add.rectangle(0, 0, 20, 20, 0x666666);
        this.add(this.body);
        
        // Create camera lens
        this.lens = scene.add.rectangle(10, 0, 10, 8, 0x333333);
        this.add(this.lens);
        
        // Create vision cone
        this.visionCone = scene.add.graphics();
        this.updateVisionCone();
        
        // Create alert indicator
        this.alertIndicator = scene.add.circle(0, -15, 5, 0x00ff00);
        this.add(this.alertIndicator);
        
        // Start scanning
        this.startScanning();
    }
    
    updateVisionCone() {
        this.visionCone.clear();
        
        if (this.isDisabled) {
            this.visionCone.lineStyle(2, 0x666666, 0.5);
            this.visionCone.fillStyle(0x666666, 0.2);
        } else {
            this.visionCone.lineStyle(2, 0x00ff00, 0.5);
            this.visionCone.fillStyle(0x00ff00, 0.2);
        }
        
        // Calculate vision cone angles
        const startAngle = this.rotation - this.fieldOfView / 2;
        const endAngle = this.rotation + this.fieldOfView / 2;
        
        // Draw vision cone
        this.visionCone.beginPath();
        this.visionCone.moveTo(this.x, this.y);
        this.visionCone.arc(this.x, this.y, this.detectionRange, startAngle, endAngle);
        this.visionCone.lineTo(this.x, this.y);
        this.visionCone.closePath();
        this.visionCone.fill();
        this.visionCone.stroke();
    }
    
    startScanning() {
        if (!this.isDisabled) {
            this.scanTween = this.scene.tweens.add({
                targets: this,
                rotation: this.rotationLimits.max,
                duration: 2000,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    this.updateVisionCone();
                }
            });
        }
    }
    
    disable() {
        this.isDisabled = true;
        if (this.scanTween) {
            this.scanTween.stop();
        }
        this.alertIndicator.setFillStyle(0xff0000);
        this.updateVisionCone();
    }
    
    enable() {
        this.isDisabled = false;
        this.alertIndicator.setFillStyle(0x00ff00);
        this.startScanning();
    }
    
    canSeePlayer(player) {
        if (this.isDisabled || player.isHidden) return false;
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance > this.detectionRange) return false;
        
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        const normalizedAngle = Phaser.Math.Angle.Normalize(angle);
        const cameraAngle = Phaser.Math.Angle.Normalize(this.rotation);
        const angleDiff = Math.abs(Phaser.Math.Angle.Normalize(normalizedAngle - cameraAngle));
        
        return angleDiff <= this.fieldOfView / 2;
    }
    
    update(player) {
        if (!this.isDisabled && this.canSeePlayer(player)) {
            this.alertIndicator.setFillStyle(0xff0000);
            this.scene.events.emit('playerDetected', { x: this.x, y: this.y });
        } else if (!this.isDisabled) {
            this.alertIndicator.setFillStyle(0x00ff00);
        }
    }
    
    destroy() {
        if (this.scanTween) {
            this.scanTween.stop();
        }
        if (this.visionCone) {
            this.visionCone.destroy();
        }
        super.destroy();
    }
} 