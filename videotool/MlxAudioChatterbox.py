from mlx_audio.tts.generate import generate_audio
from mlx_audio.tts.utils import load_model
import sys
import json



def MlxAudioChatterbox(data):

    text,ref_audio,exaggeration,speed = data
    # 加载模型
    model = load_model("mlx-community/chatterbox-4bit")
    # 生成音频并保存为MP3
    generate_audio(
        volume=1.6,
        text=data.get("text"),
        model=model,
        # ref_audio=ref_audio,  # 参考音频用于音色克隆
        exaggeration= float(data.get("exaggeration"))  ,        # 增强情感表达
        speed= float(data.get("speed")),               # 加快语速体现激动
        lang_code="zh",          # 指定中文语言
        audio_format="mp3",
        bitrate="192k", 
        file_path = "aa.mp3"
        # file_prefix="csm_emotional_output"
    )






# input_data = sys.stdin.read()
input_data = {
    "text":"你好",
    "ref_audio":"",
    "exaggeration":0.7,
    "speed":0.4
}
input_data = json.dumps(input_data, ensure_ascii=False)

data = json.loads(input_data)


MlxAudioChatterbox(data)