import torch
from diffusers import ZImagePipeline

# 1. 加载模型管道
# 在支持的 GPU 上使用 bfloat16 以获得最佳性能
pipe = ZImagePipeline.from_pretrained(
    "/Users/zhangfei/.cache/modelscope/hub/models/Tongyi-MAI/Z-Image-Turbo",
    torch_dtype=torch.bfloat16,
    # low_cpu_mem_usage=False,
)
pipe.to("mps") # 将模型移至 GPU

# [可选] 启用注意力后端以提升效率（如果硬件支持）
# pipe.transformer.set_attention_backend("flash") # 启用 Flash-Attention-2
# pipe.transformer.set_attention_backend("_flash_3") # 启用 Flash-Attention-3

# [可选] 模型编译以加速推理（首次运行编译时间较长）
# pipe.transformer.compile()

# [可选] 启用 CPU 卸载以节省显存
# pipe.enable_model_cpu_offload()

# 2. 准备提示词
prompt = "一位身穿红色汉服的年轻中国女子，刺绣精美。妆容完美，额头有红色花卉图案。复杂的发髻高耸，戴着金色凤凰头饰，点缀着红花和珠串。手持圆形折扇，扇面绘有仕女、树木和飞鸟。霓虹闪电灯（⚡️）发出明亮的黄色光芒，悬浮于伸出的左掌之上。柔和的室外夜景背景，远处有轮廓分明的多层宝塔（西安大雁塔）和模糊的彩色灯光。"

# 3. 生成图像
image = pipe(
    prompt=prompt,
    height=512,
    width=512,
    num_inference_steps=9, # 这实际上对应 8 次 DiT 前向传播
    guidance_scale=0.0,    # Turbo 模型必须将引导尺度设为 0
    generator=torch.Generator("mps").manual_seed(42), # 固定随机种子以复现结果
).images

# 4. 保存图像
image[0].save("example_turbo.png")
