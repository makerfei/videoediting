from indextts.infer_v2 import IndexTTS2
import torchaudio
import sys
import json
import time
def tts(data):
    # 初始化模型
    tts = IndexTTS2(cfg_path="/Users/zhangfei/Desktop/videoediting/index-tts/checkpoints/config.yaml", model_dir="/Users/zhangfei/Desktop/videoediting/index-tts/checkpoints")
    # 待合成的文本
    text = data.get("text")
    # 情感描述提示词：用自然语言描述说话人的心理状态或语气
    # 这里描述一种极度恐惧和惊慌的状态
    emo_text =data.get("emo_text")
    spk_audio_prompt = data.get("spk_audio_prompt")
    output_path = f"AiSound/{int(time.time() * 1000)}.wav"
    # 生成语音
    tts.infer(
        text=text,
        spk_audio_prompt=spk_audio_prompt,  # 音色参考音频
        output_path=output_path,
        emo_text=emo_text,       # 传入情感描述文本
        use_emo_text=True,      # 【关键】必须显式启用文本情感分析
        emo_alpha=0.8,           # 情感描述对最终结果的影响权重 (0.0-1.0)
        verbose=True
    )
    # load 返回波形数据和采样率
    waveform, sample_rate = torchaudio.load(output_path)
    # 时长 = 总样本数 / 采样率
    duration = waveform.shape[1] / sample_rate
   
    print("--完成--")
    res = {"src":output_path,"duration":duration}
    print(json.dumps(res))

input_data = sys.stdin.read()
data = json.loads(input_data)
tts(data)

