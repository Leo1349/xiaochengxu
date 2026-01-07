
import os
from PIL import Image

def resize_image(file_path, max_size_kb=40, target_width=81):
    try:
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            return

        original_size = os.path.getsize(file_path)
        print(f"Processing {file_path} (Size: {original_size/1024:.2f} KB)")

        if original_size <= max_size_kb * 1024:
            print(f" - Already under {max_size_kb}KB. Skipping.")
            return

        img = Image.open(file_path)
        
        # Resize if width is larger than target_width
        w, h = img.size
        if w > target_width or h > target_width:
            ratio = min(target_width/w, target_width/h)
            new_size = (int(w*ratio), int(h*ratio))
            img = img.resize(new_size, Image.Resampling.LANCZOS)
            print(f" - Resized from {w}x{h} to {new_size}")
        
        # Save and check size
        img.save(file_path, optimize=True)
        new_size = os.path.getsize(file_path)
        print(f" - New size: {new_size/1024:.2f} KB")
        
        # If still too big, try reducing colors (quantize)
        if new_size > max_size_kb * 1024:
            print(" - Still too big, trying quantization...")
            img = img.quantize(colors=256)
            img.save(file_path, optimize=True)
            final_size = os.path.getsize(file_path)
            print(f" - Quantized size: {final_size/1024:.2f} KB")

    except Exception as e:
        print(f"Error processing {file_path}: {e}")

icons = [
    "miniprogram/images/icons/home.png",
    "miniprogram/images/icons/home-active.png",
    "miniprogram/images/icons/service.png",
    "miniprogram/images/icons/service-active.png",
    "miniprogram/images/icons/message.png",
    "miniprogram/images/icons/message-active.png",
    "miniprogram/images/icons/mine.png",
    "miniprogram/images/icons/mine-active.png"
]

base_dir = os.getcwd()
print(f"Working directory: {base_dir}")

for icon in icons:
    full_path = os.path.join(base_dir, icon)
    resize_image(full_path)
