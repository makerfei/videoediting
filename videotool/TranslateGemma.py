import os
os.environ['MLXLM_USE_MODELSCOPE'] = 'True'
# 必须在导入 mlx_lm 之前设置
os.environ['HF_HUB_OFFLINE'] = '1' 
from mlx_lm import load, generate
import sys
import json


def TranslateGemma(data):
    # 1. 加载模型
    model_name = "mlx-community/translategemma-12b-it-4bit"
    model, tokenizer = load(model_name)
    promptTxt = data.get("prompt")
    # 2. 构建符合模板要求的消息结构
    messages = [
        {
            "role": "user", 
            "content": [
                {
                    "type": "text",
                    "source_lang_code": "zh",
                    "target_lang_code": "en",
                    "text": promptTxt,
                    "image": None
                }
            ]
        }
    ]

    # 应用聊天模板
    prompt = tokenizer.apply_chat_template(
        messages, 
        add_generation_prompt=True
    )

    # 3. 生成响应 (关键修改部分)
    # 注意：旧版 mlx-lm 可能只支持 temp, top_p, max_tokens 等基础参数
    # 我们显式设置 max_tokens 防止无限循环，设置 temp 降低随机性

    response = generate(
        model, 
        tokenizer, 
        prompt=prompt, 
        verbose=True,
        max_tokens=50,       # 【重要】严格限制最大生成长度，防止刷屏
    )

    clean = response.split("<end_of_turn>")[0].strip()
    print("--完成--")
    res = {"prompt": clean}
    print(json.dumps(res))

input_data = sys.stdin.read()
data = json.loads(input_data)
TranslateGemma(data)