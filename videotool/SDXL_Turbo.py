
import torch
from diffusers import  AutoPipelineForImage2Image
from diffusers.utils import load_image
import sys
import json
from tool import *

def SDXLTurbo(data):
    pipe = AutoPipelineForImage2Image.from_pretrained(
        "stabilityai/sdxl-turbo",
        torch_dtype=torch.float16,
        variant="fp16",
        load_in_4bit=True  # 运行时4-bit量化
    )
    pipe.to("mps") # Apple Silicon Mac 用户
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
        prompt=prompt,
        num_inference_steps=1,
        guidance_scale=0.0
    ).images

    base64data = pil_to_base64(image[0])   
    print("--完成--")
    res = {"base64": base64data ,"width":image[0].width,"height":image[0].height}
    print(json.dumps(res))

input_data = sys.stdin.read()
data = json.loads(input_data)
SDXLTurbo(data)



