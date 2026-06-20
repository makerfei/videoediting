
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
    prompt = data.get('prompt')
    rate= data.get('rate')
    input_image =  load_image(load_base64_image(data.get('input_image')))     
  
        
    image = pipe(
        prompt,
        image=input_image,  # 图生图输入
        num_inference_steps=2, 
        strength=0.5,
        guidance_scale=0.0
    ).images
    

    base64data = pil_to_base64(image[0])   
    print("--完成--")
    res = {"base64": base64data ,"width":image[0].width,"height":image[0].height}
    print(json.dumps(res))

input_data = sys.stdin.read()
data = json.loads(input_data)
SDXLTurbo(data)



