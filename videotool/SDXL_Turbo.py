
import torch
from diffusers import AutoPipelineForText2Image
from PIL import Image

# 1. 加载模型
# 使用 float16 精度以节省显存并加速推理
pipe = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/sdxl-turbo",
    torch_dtype=torch.float16,
    variant="fp16",
    load_in_4bit=True  # 运行时4-bit量化
)

# 2. 移动模型到 GPU (如果可用)
if torch.cuda.is_available():
    pipe.to("cuda")
elif torch.backends.mps.is_available():
    pipe.to("mps") # Apple Silicon Mac 用户

# 3. 定义提示词
prompt = "A cinematic shot of a baby raccoon wearing an intricate italian priest robe."

# 4. 生成图像
# num_inference_steps=1 是 Turbo 的核心，速度极快
# guidance_scale=0.0 或极低值，符合 Turbo 的训练特性
image = pipe(
    prompt=prompt,
    num_inference_steps=1,
    guidance_scale=0.0
).images

# 5. 保存或显示图像
image.save("sdxl_turbo_output.png")
image.show()
