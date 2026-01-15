"""
图标压缩脚本
将icons_v3目录下的大图标压缩到40KB以下
"""
from PIL import Image
import os

def compress_image(input_path, output_path, max_size_kb=40, target_size=81):
    """
    压缩图片到指定大小以下
    
    Args:
        input_path: 输入图片路径
        output_path: 输出图片路径
        max_size_kb: 最大文件大小(KB)
        target_size: 目标尺寸(像素)
    """
    img = Image.open(input_path)
    
    # 转换为RGBA模式
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # 调整尺寸到目标大小
    img = img.resize((target_size, target_size), Image.Resampling.LANCZOS)
    
    # 保存为PNG，尝试不同的压缩级别
    img.save(output_path, 'PNG', optimize=True)
    
    # 检查文件大小
    file_size = os.path.getsize(output_path) / 1024
    print(f"  {os.path.basename(input_path)}: {file_size:.1f}KB")
    
    return file_size

def main():
    icons_dir = r"e:\Users\Administrator\Desktop\xiaochengxu\miniprogram\images\icons_v3"
    
    # 需要压缩的图标列表
    icons_to_compress = [
        "home_v3.png",
        "home_active_v3.png",
        "service_v3.png",
        "service_active_v3.png",
        "message_v3.png",
        "message_active_v3.png",
        "mine_v3.png",
        "mine_active_v3.png",
        "nav_find_tutor.png",
        "nav_orders.png",
        "nav_child.png",
        "nav_cases.png",
        "service_subject.png",
        "service_psych.png",
        "service_habit.png",
    ]
    
    print("开始压缩图标...")
    print("-" * 40)
    
    for icon_name in icons_to_compress:
        input_path = os.path.join(icons_dir, icon_name)
        
        if os.path.exists(input_path):
            # 检查原始大小
            original_size = os.path.getsize(input_path) / 1024
            
            if original_size > 40:
                # 需要压缩
                compress_image(input_path, input_path, max_size_kb=40, target_size=81)
            else:
                print(f"  {icon_name}: {original_size:.1f}KB (已满足要求)")
        else:
            print(f"  {icon_name}: 文件不存在")
    
    print("-" * 40)
    print("压缩完成!")

if __name__ == "__main__":
    main()
