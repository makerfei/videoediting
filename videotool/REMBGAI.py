# -------图片抠图
# pip install onnxruntime
# pip install rembg

from rembg import remove
from PIL import Image
import io
import sys
import json
from tool import *
def remove_background(data):
    """
    读取图片 -> 抠图 -> 返回 PIL Image 对象 (RGBA)
    """
    # 2. 将 Image 转为 bytes，因为 rembg 主要处理 bytes
    input_data =  base64_2_BytesIO(data.get('image'))
    # 3. 执行抠图 (输入 bytes，输出 bytes)
    output_data = remove(input_data, 
                         alpha_matting=True,
                            alpha_matting_foreground_threshold=240,
                            alpha_matting_background_threshold=10,
                             alpha_matting_erode_size = 10,
                        )
    # 4. 【关键修复】将输出的 bytes 转回 PIL Image 对象
    result_img = Image.open(io.BytesIO(output_data)).convert("RGBA")
    base64data = pil_to_base64(result_img)   
    print("--完成--")
    res = {"base64": base64data ,"width":result_img.width,"height":result_img.height}
    print(json.dumps(res))

input_data = sys.stdin.read()
data = json.loads(input_data)
remove_background(data)
