import base64
import numpy as np
import cv2
import base64
from io import BytesIO
from PIL import Image

# cv2加载
def base64_to_cv2(base64_str):
    """
    将 base64 字符串转换为 cv2 图像对象 (numpy array)
    """
    # 1. Base64 解码：将字符串转换为二进制字节数据
    # 注意：如果 base64_str 包含前缀如 "data:image/jpeg;base64,"，需要先去除前缀
    if "," in base64_str:
        base64_str = base64_str.split(",")[1]
    
    img_data = base64.b64decode(base64_str)
    
    # 2. 将二进制数据转换为 numpy 一维数组 (uint8 类型)
    # 推荐使用 np.frombuffer，效率高于 np.fromstring (后者已废弃)
    np_arr = np.frombuffer(img_data, np.uint8)
    
    # 3. 使用 cv2.imdecode 解码图像
    # cv2.IMREAD_COLOR: 加载彩色图像 (默认)
    # cv2.IMREAD_GRAYSCALE: 加载灰度图像
    # cv2.IMREAD_UNCHANGED: 加载包含 alpha 通道的图像
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return img



# PIL加载
def load_base64_image(base64_str):
    # 去除前缀
    if "," in base64_str:
        base64_str = base64_str.split(",")
    
    image_data = base64.b64decode(base64_str[1])
    return Image.open(BytesIO(image_data))

def base64_2_BytesIO(base64_str):
    # 去除前缀
    if "," in base64_str:
        base64_str = base64_str.split(",")
    image_data = base64.b64decode(base64_str[1])
    return BytesIO(image_data).getvalue()


def mask_to_base64(best_mask):
    """
    将单通道 mask 数组转换为 base64 字符串 (PNG格式)
    :param best_mask: numpy array, shape (H, W), dtype uint8 (0-255) or bool
    :return: base64 string
    """
    # 1. 数据预处理：确保是 uint8 类型
    # 如果 mask 是 bool 类型或 0/1 整数，需转换为 0/255 的 uint8
    if best_mask.dtype != np.uint8:
        best_mask = best_mask.astype(np.uint8) * 255
    
    # 2. CV2 编码：将图像编码为内存中的字节流
    # cv2.imencode 返回一个元组 (retval, buffer)，我们需要的是 buffer 
    # 使用 '.png' 格式以避免 JPG 压缩带来的伪影
    _, encoded_img = cv2.imencode('.png', best_mask)
    
    # 3. Base64 编码：将字节流转换为 base64 字符串
    base64_str = base64.b64encode(encoded_img).decode('utf-8')
    data_uri = f"data:image/png;base64,{base64_str}"
    return data_uri

def pil_to_base64(image: Image.Image, format: str = "PNG") -> str:
    buffered = BytesIO()
    image.save(buffered, format=format)
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    data_uri = f"data:image/png;base64,{img_str}"
    return data_uri