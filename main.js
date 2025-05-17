// Wait for the DOM to be ready
window.addEventListener('load', () => {
    // Create game instance
    window.game = new Phaser.Game(config);
    
    // Set initial language
    setLanguage('ar');
    
    // Handle window resize
    window.addEventListener('resize', () => {
        game.scale.refresh();
    });
    
    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            game.scene.scenes.forEach(scene => {
                if (scene.sound && scene.sound.sounds) {
                    scene.sound.sounds.forEach(sound => {
                        if (sound.isPlaying) sound.pause();
                    });
                }
            });
        } else {
            game.scene.scenes.forEach(scene => {
                if (scene.sound && scene.sound.sounds) {
                    scene.sound.sounds.forEach(sound => {
                        if (sound.isPaused) sound.resume();
                    });
                }
            });
        }
    });
    
    // Handle mobile back button
    window.addEventListener('popstate', (e) => {
        e.preventDefault();
        const currentScene = game.scene.scenes.find(scene => scene.scene.isActive);
        if (currentScene && currentScene.scene.key !== 'MenuScene') {
            currentScene.scene.start('MenuScene');
        }
    });
    
    // Prevent context menu on right click
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Handle fullscreen toggle on mobile
    if (document.documentElement.requestFullscreen) {
        document.getElementById('game').addEventListener('click', () => {
            if (!document.fullscreenElement && game.device.os.android) {
                document.documentElement.requestFullscreen();
            }
        }, { once: true });
    }
}); 