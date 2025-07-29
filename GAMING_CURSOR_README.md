# 🎮 Gaming Cursor

An advanced, animated gaming cursor with particle effects, trails, and multiple modes. Perfect for gaming websites, portfolios, or any site that wants an immersive cursor experience.

## ✨ Features

- **Animated Glow Effects**: Pulsing rings and glowing trails
- **Particle System**: Click explosions and trail particles
- **Multiple Modes**: Default, Sniper, Magic, and Dark themes
- **Crosshair Mode**: FPS-style crosshair for gaming sites
- **Interactive Hover**: Special effects on buttons and links
- **Keyboard Shortcuts**: Quick mode switching and effects
- **Mobile Support**: Touch-friendly for mobile devices
- **Performance Optimized**: Hardware-accelerated animations

## 🚀 Quick Start

### Option 1: Complete HTML Demo
Open `gaming-cursor.html` in your browser to see the full demo with all features.

### Option 2: Add to Your Website

1. **Include the CSS file:**
```html
<link rel="stylesheet" href="gaming-cursor.css">
```

2. **Include the JavaScript file:**
```html
<script src="gaming-cursor.js"></script>
```

3. **Initialize (optional - auto-initializes by default):**
```javascript
// Auto-initializes with default settings
// Or customize:
const cursor = new GamingCursor({
    particleCount: 12,
    enableTrail: true,
    colors: {
        default: '#00ff88',
        hover: '#ffaa00',
        click: '#ff0080'
    }
});
```

## 🎯 Interactive Controls

### Keyboard Shortcuts
- **C**: Toggle crosshair mode
- **Spacebar**: Create explosion effect
- **1**: Default mode (green)
- **2**: Sniper mode (red)
- **3**: Magic mode (purple)
- **4**: Dark mode (white)

### Mouse Effects
- **Move**: Animated trail follows cursor
- **Click**: Particle explosion at click point
- **Hover**: Special glow on interactive elements

## ⚙️ Configuration Options

```javascript
const options = {
    trailLength: 10,           // Number of trail particles
    particleCount: 8,          // Particles per click explosion
    enableTrail: true,         // Enable/disable trail effect
    enableParticles: true,     // Enable/disable click particles
    enableCrosshair: false,    // Start with crosshair mode
    cursorSize: 20,           // Main cursor size in pixels
    colors: {
        default: '#00ff88',    // Default green glow
        hover: '#ffaa00',      // Hover orange glow
        click: '#ff0080',      // Click pink glow
        sniper: '#ff4444',     // Sniper red glow
        magic: '#aa44ff'       // Magic purple glow
    }
};

const cursor = new GamingCursor(options);
```

## 🎨 Cursor Modes

### Default Mode (Green)
- Classic gaming aesthetic with green glow
- Perfect for tech and gaming sites

### Sniper Mode (Red)
- Red crosshair-style cursor
- Ideal for FPS games or action sites

### Magic Mode (Purple)
- Mystical purple glow
- Great for fantasy or RPG themes

### Dark Mode (White)
- Clean white glow for dark themes
- Professional look with gaming flair

## 📱 Mobile Support

The cursor automatically adapts to touch devices:
- Touch events trigger cursor movement
- Responsive sizing for smaller screens
- Optimized performance on mobile

## 🔧 API Methods

```javascript
// Access the global cursor instance
const cursor = window.gamingCursor;

// Control cursor
cursor.enable();           // Show cursor
cursor.disable();          // Hide cursor
cursor.destroy();          // Remove completely

// Change modes
cursor.setMode('sniper');  // Set specific mode
cursor.toggleCrosshair();  // Toggle crosshair

// Create effects
cursor.createExplosion(30); // Custom explosion intensity
cursor.createParticles(x, y, 12); // Custom particle burst

// Update settings
cursor.updateOptions({
    particleCount: 15,
    enableTrail: false
});
```

## 🎯 CSS Customization

### Custom Colors
```css
.gaming-cursor {
    background: radial-gradient(circle, #your-color, #your-darker-color);
    box-shadow: 0 0 10px #your-color;
}
```

### Custom Animations
```css
@keyframes your-custom-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
}

.gaming-cursor::before {
    animation: your-custom-pulse 2s infinite;
}
```

### Responsive Breakpoints
```css
@media (max-width: 480px) {
    .gaming-cursor {
        width: 16px;
        height: 16px;
    }
}
```

## 🚫 Disable Auto-Initialization

If you want to manually control initialization:

```javascript
// Prevent auto-initialization
window.gamingCursorDisabled = true;

// Then manually initialize when ready
const cursor = new GamingCursor(yourOptions);
```

## 📊 Performance Notes

- Uses CSS transforms and opacity for smooth 60fps animations
- Hardware acceleration enabled with `will-change` properties
- Automatic cleanup of particle elements
- Optimized for both desktop and mobile devices

## 🌟 Integration Examples

### React Component
```jsx
import { useEffect } from 'react';

function App() {
    useEffect(() => {
        const cursor = new GamingCursor({
            particleCount: 10,
            colors: { default: '#00ff88' }
        });
        
        return () => cursor.destroy();
    }, []);
    
    return <div>Your app content</div>;
}
```

### Vue Component
```vue
<template>
    <div>Your app content</div>
</template>

<script>
export default {
    mounted() {
        this.cursor = new GamingCursor();
    },
    beforeDestroy() {
        if (this.cursor) {
            this.cursor.destroy();
        }
    }
}
</script>
```

## 🎮 Perfect For

- Gaming websites and portfolios
- Tech company landing pages
- Interactive demos and presentations
- Developer portfolios
- Streaming and content creator sites
- E-sports team websites

## 🔍 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

MIT License - Feel free to use in personal and commercial projects!

---

**Enjoy your new gaming cursor! 🎮✨**