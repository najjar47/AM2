class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        // Add player to the scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Player properties
        this.isHidden = false;
        this.isSliding = false;
        this.lastTapTime = 0;
        this.doubleTapDelay = 300;
        
        // Physics properties
        this.setBounce(0.2);
        this.setCollideWorldBounds(true);
        this.setGravityY(300);
        
        // Default size
        this.normalHeight = 48;
        this.slideHeight = 24;
        this.setSize(32, this.normalHeight);
        
        // Movement speeds
        this.walkSpeed = 160;
        this.runSpeed = 240;
        this.jumpForce = -330;
        
        // Initialize animations
        this.createAnimations();
        
        // Initialize controls
        this.setupControls();
    }
    
    createAnimations() {
        // Create player animations
        this.scene.anims.create({
            key: 'idle',
            frames: [{ key: 'player', frame: 0 }],
            frameRate: 10
        });
        
        this.scene.anims.create({
            key: 'walk',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 1, end: 4 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.scene.anims.create({
            key: 'jump',
            frames: [{ key: 'player', frame: 5 }],
            frameRate: 10
        });
        
        this.scene.anims.create({
            key: 'slide',
            frames: [{ key: 'player', frame: 6 }],
            frameRate: 10
        });
        
        this.scene.anims.create({
            key: 'hide',
            frames: [{ key: 'player', frame: 7 }],
            frameRate: 10
        });
    }
    
    setupControls() {
        // Keyboard controls
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        
        // Touch controls
        if (this.scene.sys.game.device.input.touch) {
            this.setupTouchControls();
        }
    }
    
    setupTouchControls() {
        // Double tap detection for hiding
        this.scene.input.on('pointerdown', (pointer) => {
            const currentTime = new Date().getTime();
            if (currentTime - this.lastTapTime < this.doubleTapDelay) {
                this.toggleHide();
            }
            this.lastTapTime = currentTime;
        });
        
        // Swipe detection for sliding
        let touchStartY = 0;
        this.scene.input.on('pointerdown', (pointer) => {
            touchStartY = pointer.y;
        });
        
        this.scene.input.on('pointerup', (pointer) => {
            const swipeDistance = pointer.y - touchStartY;
            if (swipeDistance > 50) { // Swipe down
                this.slide();
            }
        });
    }
    
    update() {
        if (this.isHidden) {
            this.setAlpha(0.5);
            return;
        }
        
        this.setAlpha(1);
        
        // Handle movement
        if (this.cursors.left.isDown) {
            this.moveLeft();
        } else if (this.cursors.right.isDown) {
            this.moveRight();
        } else {
            this.stand();
        }
        
        // Handle jumping
        if ((this.cursors.up.isDown || this.cursors.space.isDown) && this.body.touching.down) {
            this.jump();
        }
        
        // Handle sliding
        if (this.cursors.down.isDown && this.body.touching.down && !this.isSliding) {
            this.slide();
        }
        
        // Update animations
        if (!this.body.touching.down) {
            this.play('jump', true);
        } else if (this.isSliding) {
            this.play('slide', true);
        } else if (this.body.velocity.x !== 0) {
            this.play('walk', true);
        } else {
            this.play('idle', true);
        }
    }
    
    moveLeft() {
        this.setVelocityX(-this.walkSpeed);
        this.flipX = true;
    }
    
    moveRight() {
        this.setVelocityX(this.walkSpeed);
        this.flipX = false;
    }
    
    stand() {
        this.setVelocityX(0);
    }
    
    jump() {
        this.setVelocityY(this.jumpForce);
        this.scene.sound.play('jump');
    }
    
    slide() {
        if (!this.isSliding && this.body.touching.down) {
            this.isSliding = true;
            this.setSize(32, this.slideHeight);
            
            // Reset slide after delay
            this.scene.time.delayedCall(500, () => {
                this.isSliding = false;
                this.setSize(32, this.normalHeight);
            });
        }
    }
    
    toggleHide() {
        this.isHidden = !this.isHidden;
        if (this.isHidden) {
            this.play('hide', true);
        }
    }
    
    takeDamage() {
        if (!this.isHidden) {
            this.scene.events.emit('playerDamage');
            this.setTint(0xff0000);
            this.scene.time.delayedCall(100, () => {
                this.clearTint();
            });
        }
    }
} 