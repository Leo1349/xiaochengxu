from PIL import Image
import os
import glob

def resize_icon(path, size=(81, 81)):
    try:
        img = Image.open(path)
        img = img.resize(size, Image.Resampling.LANCZOS)
        img.save(path, optimize=True)
        file_size = os.path.getsize(path)
        print(f"Resized {path} to {size}. New size: {file_size/1024:.2f} KB")
        if file_size > 40 * 1024:
             print(f"WARNING: {path} is still larger than 40KB!")
    except Exception as e:
        print(f"Error resizing {path}: {e}")

# Resize all icons in icons_v3 and mine_v3
dirs = [r"miniprogram\images\icons_v3", r"miniprogram\images\mine_v3"]

for d in dirs:
    if os.path.exists(d):
        for icon_path in glob.glob(os.path.join(d, "*.png")):
            resize_icon(icon_path)
