# -------图片生成
import torch
from diffusers import Flux2KleinPipeline
from diffusers.utils import load_image
import sys
import json
from tool import *
# 1. 读取所有传入的数据
# 1. 读取所有传入的数据

def  getFluxImage(data):
    # 使用 MPS 后端
    device = "mps"
    dtype = torch.bfloat16
    pipe = Flux2KleinPipeline.from_pretrained(
        "black-forest-labs/FLUX.2-klein-4B",
        torch_dtype=dtype,
    )
    pipe.enable_model_cpu_offload()  # 节省内存，16GB Mac 完全够用
    # 1. 加载输入图片（图生图的参考图）
    # input_image = load_image("1.png")
    # input_image1 = load_image("2.png")
    imageList = []
    prompt = data.get('prompt')
    rate= data.get('rate')
    input_image_list =  data.get('input_image_list') or []
    if(input_image_list):
        for item in input_image_list: 
          imageList.append(load_image(load_base64_image(item)))  
            
    image = pipe(
        prompt=prompt,
        image=imageList,  # 图生图输入
        height=256*rate,
        width=256*rate,
        guidance_scale=1.0,        # Klein 系列推荐 1.0
        num_inference_steps=4,     # 蒸馏版 4 步
        generator=torch.Generator(device=device).manual_seed(0)
    ).images
    base64data = pil_to_base64(image[0])   
    print("--完成--")
    res = {"base64": base64data ,"width":image[0].width,"height":image[0].height}
    print(json.dumps(res))


input_data = sys.stdin.read()
data = json.loads(input_data)
getFluxImage(data)
