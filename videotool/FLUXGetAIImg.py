# -------图片生成
import torch
from diffusers import Flux2KleinPipeline
from diffusers.utils import load_image
import sys
import json
# 1. 读取所有传入的数据
input_data = sys.stdin.read()
# 3. 如果需要结构化数据，可以解析 JSON
try:
    data = json.loads(input_data)
    print(f"Parsed JSON key 'prompt': {data.get('prompt')}")
    sys.stdout.flush()
except:
    pass

# 使用 MPS 后端
device = "mps"
dtype = torch.bfloat16

pipe = Flux2KleinPipeline.from_pretrained(
    "black-forest-labs/FLUX.2-klein-4B",
    torch_dtype=dtype,
    # local_files_only=True
)
pipe.enable_model_cpu_offload()  # 节省内存，16GB Mac 完全够用
# 1. 加载输入图片（图生图的参考图）
input_image = load_image("1.png")
input_image1 = load_image("2.png")
prompt = data.get('prompt')

image = pipe(
    prompt=prompt,
    # image=[input_image, input_image1],  # 图生图输入
    height=256,
    width=256,
    guidance_scale=1.0,        # Klein 系列推荐 1.0
    num_inference_steps=4,     # 蒸馏版 4 步
    generator=torch.Generator(device=device).manual_seed(0)
).images

for i, img in enumerate(image):
    img.save(f"result_{i}.png")


