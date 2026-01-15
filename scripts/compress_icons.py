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
    # icons_v3目录
    icons_v3_dir = r"e:\Users\Administrator\Desktop\xiaochengxu\miniprogram\images\icons_v3"
    icons_v3_list = [
        "home_v3.png", "home_active_v3.png",
        "service_v3.png", "service_active_v3.png",
        "message_v3.png", "message_active_v3.png",
        "mine_v3.png", "mine_active_v3.png",
        "nav_find_tutor.png", "nav_orders.png", "nav_child.png", "nav_cases.png",
        "service_subject.png", "service_psych.png", "service_habit.png", "service_interest.png",
    ]
    
    # mine_v3目录
    mine_v3_dir = r"e:\Users\Administrator\Desktop\xiaochengxu\miniprogram\images\mine_v3"
    mine_v3_list = [
        "menu_case.png", "menu_child.png", "menu_feedback.png", "menu_rebate.png",
        "menu_resume.png", "menu_service.png", "menu_settings.png",
        "order_all.png", "order_pending.png", "order_processing.png", "order_completed.png",
    ]
    
    print("开始压缩图标...")
    print("-" * 40)
    
    # 处理icons_v3
    print("\n[icons_v3目录]")
    for icon_name in icons_v3_list:
        input_path = os.path.join(icons_v3_dir, icon_name)
        if os.path.exists(input_path):
            original_size = os.path.getsize(input_path) / 1024
            if original_size > 40:
                compress_image(input_path, input_path, max_size_kb=40, target_size=81)
            else:
                print(f"  {icon_name}: {original_size:.1f}KB (已满足)")
        else:
            print(f"  {icon_name}: 不存在")
    
    # 处理mine_v3
    print("\n[mine_v3目录]")
    for icon_name in mine_v3_list:
        input_path = os.path.join(mine_v3_dir, icon_name)
        if os.path.exists(input_path):
            original_size = os.path.getsize(input_path) / 1024
            if original_size > 40:
                compress_image(input_path, input_path, max_size_kb=40, target_size=80)
            else:
                print(f"  {icon_name}: {original_size:.1f}KB (已满足)")
        else:
            print(f"  {icon_name}: 不存在")
    
    # 处理message目录
    message_dir = r"e:\Users\Administrator\Desktop\xiaochengxu\miniprogram\images\message"
    message_list = [
        "msg-system.png", "msg-order.png", "msg-activity.png", "msg-service.png", "msg-empty.png",
    ]
    
    print("\n[message目录]")
    for icon_name in message_list:
        input_path = os.path.join(message_dir, icon_name)
        if os.path.exists(input_path):
            original_size = os.path.getsize(input_path) / 1024
            target = 200 if icon_name == "msg-empty.png" else 120
            if original_size > 40:
                compress_image(input_path, input_path, max_size_kb=40, target_size=target)
            else:
                print(f"  {icon_name}: {original_size:.1f}KB (已满足)")
        else:
            print(f"  {icon_name}: 不存在")
    
    print("-" * 40)
    print("压缩完成!")

if __name__ == "__main__":
    main()
