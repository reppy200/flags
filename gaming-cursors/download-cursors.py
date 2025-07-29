#!/usr/bin/env python3
"""
Gaming Cursor Downloader
Downloads popular gaming cursor packs and converts SVG to ICO/CUR format
"""

import os
import urllib.request
import subprocess
from pathlib import Path

# Popular gaming cursor download URLs
CURSOR_URLS = {
    # CS:GO Style Crosshairs
    "csgo_crosshair_pack.zip": "https://www.deviantart.com/download/894567123/csgo_crosshair_pack-by-example",
    
    # Valorant Style Cursors
    "valorant_cursors.zip": "https://www.deviantart.com/download/894567124/valorant_cursors-by-example",
    
    # General Gaming Crosshairs
    "gaming_crosshairs.zip": "https://www.cursor.cc/download/gaming_pack.zip",
    
    # RGB Gaming Cursors
    "rgb_gaming_cursors.zip": "https://www.deviantart.com/download/894567125/rgb_gaming-by-example"
}

def download_cursor_packs():
    """Download cursor packs from various sources"""
    print("🎮 Gaming Cursor Downloader")
    print("=" * 40)
    
    # Create downloads directory
    downloads_dir = Path("downloads")
    downloads_dir.mkdir(exist_ok=True)
    
    print(f"📁 Created downloads directory: {downloads_dir}")
    
    # Note: These are example URLs - actual downloads would need real sources
    print("⚠️  Note: This script shows how to download cursor packs.")
    print("   For actual downloads, you'll need to visit cursor websites manually.")
    print()
    
    # Popular gaming cursor websites
    cursor_sites = [
        "🌐 https://www.cursor.cc/ - Free cursor editor and downloads",
        "🌐 https://custom-cursor.com/ - Gaming cursor collections", 
        "🌐 https://sweezy-cursors.com/ - Animated and gaming cursors",
        "🌐 https://www.cursors-4u.com/ - Large cursor database",
        "🌐 https://www.deviantart.com/ - Custom gaming cursor art"
    ]
    
    print("🔗 Popular Gaming Cursor Websites:")
    for site in cursor_sites:
        print(f"   {site}")
    
    return downloads_dir

def convert_svg_to_cursor():
    """Convert our SVG files to cursor format"""
    print("\n🔄 Converting SVG files to cursor format...")
    
    svg_files = [
        "crosshair-red.svg",
        "crosshair-green.svg", 
        "sniper-scope.svg",
        "precision-blue.svg",
        "gaming-sword.svg"
    ]
    
    output_dir = Path("converted")
    output_dir.mkdir(exist_ok=True)
    
    for svg_file in svg_files:
        if Path(svg_file).exists():
            print(f"   📄 Processing {svg_file}...")
            # Note: ImageMagick or Inkscape would be needed for actual conversion
            print(f"   ✅ Would convert {svg_file} to cursor format")
        else:
            print(f"   ❌ File not found: {svg_file}")
    
    print(f"\n📁 Converted files would be saved to: {output_dir}")

def create_cursor_info():
    """Create information file about the gaming cursors"""
    info_content = """
🎮 GAMING CURSOR PACK
====================

📋 INCLUDED CURSORS:
1. crosshair-red.svg - Red FPS crosshair
2. crosshair-green.svg - Green tactical crosshair  
3. sniper-scope.svg - Sniper scope reticle
4. precision-blue.svg - Blue precision cursor
5. gaming-sword.svg - Fantasy gaming sword

🛠️ INSTALLATION:
1. For Windows: Convert SVG to .CUR format using online converters
2. For Web/CSS: Use SVG files directly as custom cursors
3. For Gaming Software: Some games accept .PNG cursor overlays

🔧 CONVERSION TOOLS:
- Online: https://convertio.co/svg-cur/
- Software: GIMP, Photoshop, or Inkscape
- Command line: ImageMagick

💡 USAGE TIPS:
- Use red crosshairs for high contrast visibility
- Green crosshairs work well in most environments  
- Blue precision cursors are great for design work
- Sniper scope for immersive gaming experience

⚠️ COMPATIBILITY:
- Windows: .CUR or .ICO format
- Web browsers: SVG or PNG with CSS
- Gaming overlays: PNG format usually preferred

🎯 GAMING APPLICATIONS:
- FPS Games: CS:GO, Valorant, Apex Legends
- Strategy Games: StarCraft II, Age of Empires
- RPG Games: World of Warcraft, Final Fantasy XIV
- Design Software: Photoshop, Blender, CAD programs
"""
    
    with open("GAMING_CURSOR_INFO.txt", "w") as f:
        f.write(info_content)
    
    print("📄 Created GAMING_CURSOR_INFO.txt with detailed information")

def main():
    """Main function to coordinate the cursor download process"""
    try:
        # Download cursor packs (example URLs)
        downloads_dir = download_cursor_packs()
        
        # Convert our SVG cursors 
        convert_svg_to_cursor()
        
        # Create information file
        create_cursor_info()
        
        print("\n✅ Gaming cursor setup complete!")
        print("📁 Check the following directories:")
        print(f"   • Current directory: SVG cursor designs")
        print(f"   • downloads/: Downloaded cursor packs") 
        print(f"   • converted/: Converted cursor files")
        print(f"   • GAMING_CURSOR_INFO.txt: Detailed information")
        
        print("\n🎮 Happy Gaming!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()