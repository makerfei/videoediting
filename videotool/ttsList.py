from indextts.infer_v2 import IndexTTS2
import torchaudio
import sys
import json
import time
import numpy as np
import soundfile as sf
import contextlib
import io
import re

def trim_silence(audio_data, threshold_ratio=0.001):
    """
    鲁棒性更强的静音裁剪函数
    """
    if audio_data is None or len(audio_data) == 0:
        return audio_data, (0, 0)
    
    # 1. 预处理：如果是立体声，转为单声道用于检测
    if audio_data.ndim > 1:
        detect_data = audio_data.mean(axis=1)
    else:
        detect_data = audio_data

    # 2. 计算动态阈值
    max_amp = np.max(np.abs(detect_data))
    if max_amp < 1e-6:
        return audio_data, (0, len(audio_data))
    
    threshold = max_amp * threshold_ratio
    
    # 3. 获取非静音点的索引
    # np.flatnonzero 返回一维数组，包含所有满足条件的索引
    indices = np.flatnonzero(np.abs(detect_data) > threshold)
    
    # 4. 检查是否有有效声音
    if indices.size == 0:
        return audio_data, (0, len(audio_data))
    
    # 5. 【关键修复】安全地提取起始和结束索引
    # .item() 将单元素 numpy 数组转换为 Python 原生 int
    # indices 是第一个索引，indices[-1] 是最后一个索引
    start_idx = indices.item(0)      # 获取第一个元素并转为原生 int
    end_idx = indices.item(-1) + 1   # 获取最后一个元素并转为原生 int，然后+1
    
    # 6. 裁剪音频
    trimmed_audio = audio_data[start_idx:end_idx]
    
    return trimmed_audio, (start_idx, end_idx)

def getTTSdata(text,emo_text,spk_audio_prompt,track,emo_audio_prompt,tts):
    output_path = f"AiSound/{int(time.time() * 1000)}.wav"
    use_emo_text = True
    if emo_text =="":
        use_emo_text = False
        emo_text = None
    if emo_audio_prompt =="":
        emo_audio_prompt = None
    
     # 生成语音
    f = io.StringIO()
    with contextlib.redirect_stdout(f):
        tts.infer(
            text=text,
            spk_audio_prompt=spk_audio_prompt,  # 音色参考音频
            emo_audio_prompt=emo_audio_prompt,
            output_path=output_path,
            emo_text=emo_text,       # 传入情感描述文本
            use_emo_text=use_emo_text,      # 【关键】必须显式启用文本情感分析
            emo_alpha=0.8,           # 情感描述对最终结果的影响权重 (0.0-1.0)
            verbose=True
        )
    output = f.getvalue()

    match = re.search(r"detected emotion vectors from text:\s*(\{.*?\})", output)
    if match:
        emo_str = match.group(1).replace("'", '"') # 替换单引号为双引号以符合JSON格式
        emo_dict = json.loads(emo_str)


    audio_data, sr = sf.read(output_path)
    trimmed_audio, (start, end) = trim_silence(audio_data, threshold_ratio=0.02)
    sf.write(output_path, trimmed_audio, sr)
    duration = len(trimmed_audio) / sr
   

    return {
                "text":text,
                "emo_text": emo_text,
                "spk_audio_prompt": spk_audio_prompt,
                "track":track,
                "duration":  duration,
                "output_path":  output_path,
                "emo_audio_prompt":emo_audio_prompt,
                "emo_dict":emo_dict
            }



def tts(data):
    # 初始化模型
    res = []
    tts = IndexTTS2(cfg_path="/Users/zhangfei/Desktop/videoediting/index-tts/checkpoints/config.yaml", model_dir="/Users/zhangfei/Desktop/videoediting/index-tts/checkpoints")
    list = data.get("list")
    for item in list:
        res.append(getTTSdata(item["text"],item.get("emo_text",""),item["spk_audio_prompt"],item["track"],item.get("emo_audio_prompt",""),tts))

    print("--完成--")
    print(json.dumps(res))

input_data = sys.stdin.read()
data = json.loads(input_data)
tts(data)

