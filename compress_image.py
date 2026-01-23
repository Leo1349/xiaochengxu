# 图片压缩脚本
from PIL import Image
import os

# 原始文件路径
file_path = r'e:\xiaochengxu\miniprogram\images\mine_v3\menu_favorite.png'

# 获取原始大小
original_size = os.path.getsize(file_path) / 1024
print(f"原始大小: {original_size:.2f} KB")

# 打开并压缩图片
img = Image.open(file_path)
print(f"原始尺寸: {img.size}")

# 缩小到 64x64 像素（菜单图标不需要太大）
img = img.resize((64, 64), Image.LANCZOS)

# 转换为 RGB 如果有 alpha 通道，保存为更小的格式
if img.mode == 'RGBA':
    # 保持 PNG 格式但优化
    img.save(file_path, 'PNG', optimize=True)
else:
    img.save(file_path, 'PNG', optimize=True)

# 获取压缩后大小
new_size = os.path.getsize(file_path) / 1024
print(f"压缩后大小: {new_size:.2f} KB")
print(f"节省: {original_size - new_size:.2f} KB")
