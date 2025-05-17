// Game configuration
const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [LoadingScene, MenuScene, GameScene],
    pixelArt: true,
    input: {
        activePointers: 3
    }
};

// Language configuration
const LANGUAGES = {
    ar: {
        title: 'أسد المقاومة',
        play: 'ابدأ اللعب',
        instructions: 'التعليمات',
        settings: 'الإعدادات',
        loading: 'جاري التحميل...',
        score: 'النقاط: ',
        gameOver: 'انتهت اللعبة',
        retry: 'حاول مجدداً',
        controls: {
            move: 'استخدم الأسهم للحركة',
            jump: 'اضغط مسافة للقفز',
            slide: 'اسحب لأسفل للانزلاق',
            hide: 'انقر مرتين للتخفي'
        }
    },
    en: {
        title: 'Lion of Resistance',
        play: 'Play',
        instructions: 'Instructions',
        settings: 'Settings',
        loading: 'Loading...',
        score: 'Score: ',
        gameOver: 'Game Over',
        retry: 'Try Again',
        controls: {
            move: 'Use arrows to move',
            jump: 'Press space to jump',
            slide: 'Swipe down to slide',
            hide: 'Double tap to hide'
        }
    },
    he: {
        title: 'אריה ההתנגדות',
        play: 'שחק',
        instructions: 'הוראות',
        settings: 'הגדרות',
        loading: 'טוען...',
        score: 'ניקוד: ',
        gameOver: 'המשחק נגמר',
        retry: 'נסה שוב',
        controls: {
            move: 'השתמש בחצים לתנועה',
            jump: 'לחץ על רווח לקפיצה',
            slide: 'החלק למטה להחלקה',
            hide: 'הקש פעמיים להסתתר'
        }
    }
};

// Current language (default: Arabic)
let currentLanguage = 'ar';

// Function to change language
function setLanguage(lang) {
    if (LANGUAGES[lang]) {
        currentLanguage = lang;
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
        
        // Update active button state
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.onclick.toString().includes(lang)) {
                btn.classList.add('active');
            }
        });

        // Emit event for game scenes to update
        if (window.game) {
            window.game.events.emit('languageChange', lang);
        }
    }
}

// Helper function to get text in current language
function getText(key) {
    const keys = key.split('.');
    let text = LANGUAGES[currentLanguage];
    
    for (const k of keys) {
        if (text[k] === undefined) {
            console.warn(`Missing translation for key: ${key} in language: ${currentLanguage}`);
            return key;
        }
        text = text[k];
    }
    
    return text;
} 