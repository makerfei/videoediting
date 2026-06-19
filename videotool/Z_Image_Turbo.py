import os
os.environ['MLXLM_USE_MODELSCOPE'] = 'True'
import torch
from modelscope import ZImagePipeline
from PIL import Image
import torchvision.transforms as transforms

# 1. 加载模型
device = "cuda" if torch.cuda.is_available() else "mps"
pipe = ZImagePipeline.from_pretrained(
    "Tongyi-MAI/Z-Image-Turbo",
    torch_dtype=torch.bfloat16,
    low_cpu_mem_usage=False,
)
pipe.to(device)
# 如果显存不足开启CPU卸载
pipe.enable_model_cpu_offload()

# 2. 预处理输入参考图
def load_and_preprocess_image(image_path, target_size=(1024, 1024)):
    img = Image.open(image_path).convert("RGB")
    transform = transforms.Compose([
        transforms.Resize(target_size),
        transforms.ToTensor(),
        transforms.Normalize([0.5], [0.5])
    ])
    return transform(img).unsqueeze(0).to(device, dtype=torch.bfloat16)

input_image = load_and_preprocess_image("你的参考图路径.jpg")

# 3. 图生图核心参数
prompt = "你的描述提示词，例如：将这幅油画改为二次元风格，高清细节"
strength = 0.6  # 重绘强度，0-1，越大变化越多，越小保留原图越多
num_inference_steps = 9
guidance_scale = 0.0

# 4. 生成图像
with torch.no_grad():
    # 获取初始latent
    init_latents = pipe.encode_image(input_image)
    # 添加噪声
    noise = torch.randn_like(init_latents)
    init_latents = (1 - strength) * init_latents + strength * noise
    
    # 执行推理
    output = pipe(
        prompt=prompt,
        latents=init_latents,
        num_inference_steps=num_inference_steps,
        guidance_scale=guidance_scale
    )

# 5. 保存结果
output.images[0].save("output.png")
