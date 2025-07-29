/**
 * Gaming Cursor - Advanced animated cursor for gaming websites
 * Add this script to any website for an immersive gaming cursor experience
 */

class GamingCursor {
    constructor(options = {}) {
        this.options = {
            trailLength: 10,
            particleCount: 8,
            enableTrail: true,
            enableParticles: true,
            enableCrosshair: false,
            cursorSize: 20,
            colors: {
                default: '#00ff88',
                hover: '#ffaa00',
                click: '#ff0080',
                sniper: '#ff4444',
                magic: '#aa44ff'
            },
            ...options
        };

        this.mouseX = 0;
        this.mouseY = 0;
        this.trailCount = 0;
        this.crosshairMode = false;
        this.currentMode = 'default';

        this.init();
    }

    init() {
        this.createCursorElements();
        this.bindEvents();
        this.startAnimation();
    }

    createCursorElements() {
        // Create main cursor
        this.cursor = document.createElement('div');
        this.cursor.className = 'gaming-cursor';
        this.cursor.id = 'gaming-cursor';
        document.body.appendChild(this.cursor);

        // Create crosshair
        this.crosshair = document.createElement('div');
        this.crosshair.className = 'gaming-crosshair';
        this.crosshair.id = 'gaming-crosshair';
        document.body.appendChild(this.crosshair);

        // Set initial position
        this.updateCursorPosition(window.innerWidth / 2, window.innerHeight / 2);
    }

    bindEvents() {
        // Mouse movement
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.updateCursorPosition(this.mouseX, this.mouseY);
            
            if (this.options.enableTrail && this.trailCount % 3 === 0) {
                this.createTrail(this.mouseX, this.mouseY);
            }
            this.trailCount++;
        });

        // Mouse clicks
        document.addEventListener('mousedown', (e) => {
            this.cursor.classList.add('clicking');
            if (this.options.enableParticles) {
                this.createParticles(e.clientX, e.clientY);
            }
        });

        document.addEventListener('mouseup', () => {
            this.cursor.classList.remove('clicking');
        });

        // Hover effects
        document.addEventListener('mouseover', (e) => {
            if (this.isInteractiveElement(e.target)) {
                this.cursor.classList.add('hover');
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (this.isInteractiveElement(e.target)) {
                this.cursor.classList.remove('hover');
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        // Touch events for mobile
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                this.updateCursorPosition(e.touches[0].clientX, e.touches[0].clientY);
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.updateCursorPosition(e.touches[0].clientX, e.touches[0].clientY);
            }
        });
    }

    updateCursorPosition(x, y) {
        const size = this.options.cursorSize;
        this.cursor.style.left = (x - size / 2) + 'px';
        this.cursor.style.top = (y - size / 2) + 'px';
        
        this.crosshair.style.left = (x - 15) + 'px';
        this.crosshair.style.top = (y - 15) + 'px';
    }

    createTrail(x, y) {
        const trail = document.createElement('div');
        trail.className = 'gaming-cursor-trail';
        trail.style.left = (x - 3) + 'px';
        trail.style.top = (y - 3) + 'px';
        document.body.appendChild(trail);
        
        setTimeout(() => {
            if (trail.parentNode) {
                trail.parentNode.removeChild(trail);
            }
        }, 800);
    }

    createParticles(x, y, count = null) {
        const particleCount = count || this.options.particleCount;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'gaming-cursor-particle';
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = 50 + Math.random() * 30;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            
            particle.style.setProperty('--dx', dx + 'px');
            particle.style.setProperty('--dy', dy + 'px');
            particle.style.left = (x - 2) + 'px';
            particle.style.top = (y - 2) + 'px';
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
    }

    createExplosion(intensity = 20) {
        for (let i = 0; i < intensity; i++) {
            setTimeout(() => {
                const x = this.mouseX + (Math.random() - 0.5) * 100;
                const y = this.mouseY + (Math.random() - 0.5) * 100;
                this.createParticles(x, y, 6);
            }, i * 50);
        }
    }

    toggleCrosshair() {
        this.crosshairMode = !this.crosshairMode;
        if (this.crosshairMode) {
            this.crosshair.classList.add('active');
            this.cursor.style.opacity = '0.3';
        } else {
            this.crosshair.classList.remove('active');
            this.cursor.style.opacity = '1';
        }
    }

    setMode(mode) {
        // Remove all mode classes
        this.cursor.classList.remove('default', 'sniper', 'magic', 'dark');
        
        // Add new mode class
        if (mode && mode !== 'default') {
            this.cursor.classList.add(mode);
        }
        
        this.currentMode = mode;
    }

    isInteractiveElement(element) {
        const interactiveTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
        const interactiveClasses = ['clickable', 'interactive', 'btn', 'button'];
        
        if (interactiveTags.includes(element.tagName)) {
            return true;
        }
        
        for (let className of interactiveClasses) {
            if (element.classList.contains(className)) {
                return true;
            }
        }
        
        return false;
    }

    handleKeyPress(e) {
        switch (e.key.toLowerCase()) {
            case 'c':
                this.toggleCrosshair();
                break;
            case ' ':
                e.preventDefault();
                this.createExplosion();
                break;
            case '1':
                this.setMode('default');
                break;
            case '2':
                this.setMode('sniper');
                break;
            case '3':
                this.setMode('magic');
                break;
            case '4':
                this.setMode('dark');
                break;
        }
    }

    startAnimation() {
        // Optional: Add any continuous animations here
        // For now, all animations are CSS-based for performance
    }

    destroy() {
        // Remove cursor elements
        if (this.cursor && this.cursor.parentNode) {
            this.cursor.parentNode.removeChild(this.cursor);
        }
        if (this.crosshair && this.crosshair.parentNode) {
            this.crosshair.parentNode.removeChild(this.crosshair);
        }

        // Remove trail and particle elements
        document.querySelectorAll('.gaming-cursor-trail, .gaming-cursor-particle').forEach(el => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });

        // Restore default cursor
        document.body.style.cursor = 'auto';
    }

    // Public API methods
    enable() {
        this.cursor.style.display = 'block';
        this.crosshair.style.display = 'block';
    }

    disable() {
        this.cursor.style.display = 'none';
        this.crosshair.style.display = 'none';
    }

    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }
}

// Auto-initialize if DOM is ready
function initGamingCursor(options = {}) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.gamingCursor = new GamingCursor(options);
        });
    } else {
        window.gamingCursor = new GamingCursor(options);
    }
}

// Expose to global scope
window.GamingCursor = GamingCursor;
window.initGamingCursor = initGamingCursor;

// Auto-initialize with default options if no custom initialization is detected
setTimeout(() => {
    if (!window.gamingCursor && !window.gamingCursorDisabled) {
        initGamingCursor();
    }
}, 100);