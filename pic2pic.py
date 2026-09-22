import os
from PIL import Image

# 1. 自动获取当前脚本所在的绝对目录 (即 D:\CODE_WORLD\personalPage)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 基于脚本所在目录拼接路径
INPUT_DIR = os.path.join(BASE_DIR, "raw_photos")
OUTPUT_DIR = os.path.join(BASE_DIR, "picture", "photographer")

# 2. 压缩参数
MAX_WIDTH = 1920
QUALITY = 80

def process_photos():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    valid_exts = ('.jpg', '.jpeg', '.png')
    # 增加一层判断：检查输入目录是否存在
    if not os.path.exists(INPUT_DIR):
        print(f"❌ 找不到原图目录: {INPUT_DIR}")
        return

    files = [f for f in os.listdir(INPUT_DIR) if f.lower().endswith(valid_exts)]
    
    print(f"📸 找到 {len(files)} 张图片，开始处理...")

    for index, filename in enumerate(files, start=1):
        input_path = os.path.join(INPUT_DIR, filename)
        output_path = os.path.join(OUTPUT_DIR, f"{index}.jpg")
        
        try:
            with Image.open(input_path) as img:
                img = img.convert('RGB')
                img.thumbnail((MAX_WIDTH, MAX_WIDTH))
                img.save(output_path, "JPEG", quality=QUALITY, optimize=True)
                
                size_kb = os.path.getsize(output_path) / 1024
                print(f"✅ 生成 {index}.jpg | 体积: {size_kb:.1f} KB")
                
        except Exception as e:
            print(f"❌ 处理 {filename} 失败: {e}")

if __name__ == "__main__":
    if not os.path.exists(INPUT_DIR):
        os.makedirs(INPUT_DIR)
        print(f"📁 已自动为你创建 {INPUT_DIR} 文件夹，请把 a7c2 的原图放进去后重新运行！")
    else:
        process_photos()
        print("🎉 全部处理完毕，可以直接去浏览器刷新主页了！")