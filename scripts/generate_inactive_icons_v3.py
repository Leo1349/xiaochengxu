from PIL import Image
import os
import glob

def make_grayscale(input_path, output_path):
    try:
        img = Image.open(input_path).convert('LA')
        # Reduce opacity for inactive state
        # Split into bands
        l, a = img.split()
        # Create a new alpha channel with 50% opacity of original
        a = a.point(lambda i: i * 0.5)
        # Merge back
        img = Image.merge('LA', (l, a))
        img.save(output_path)
        print(f"Generated {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

icon_dir = r"miniprogram\images\icons_v3"
active_icons = ["home_active_v3.png", "service_active_v3.png", "message_active_v3.png", "mine_active_v3.png"]

for icon in active_icons:
    input_path = os.path.join(icon_dir, icon)
    output_path = os.path.join(icon_dir, icon.replace("_active_", "_").replace("_v3", "_v3_gray"))
    # Also create the non-active v3 (which usually is the inactive one, but let's follow standard naming if possible)
    # Actually standard usually is: home.png (inactive), home-active.png (active).
    # My plan said: home_v2.png (Active) ?? No, usually active is highlighted.
    # Plan: Home: home_v2.png (Active), home_v2_gray.png (Inactive) -> This naming in plan was a bit check.
    # Standard wx: iconPath (inactive), selectedIconPath (active).
    # So I will generate: home_v3.png (Inactive/Grayscale), home_active_v3.png (Active/Color)
    
    output_path_standard = os.path.join(icon_dir, icon.replace("_active_v3", "_v3"))
    make_grayscale(input_path, output_path_standard)
