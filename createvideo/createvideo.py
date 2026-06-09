from moviepy import *
import json
import os

# 获取配置文件位置
def getconfigjson(path):
    # 获取当前脚本所在的目录
    base_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print(parent_dir)
    file_path = os.path.join(parent_dir, path)      #  'videoJsonData/jjqq.json'              
    # 以只读模式打开文件，指定 utf-8 编码
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data




def create_video_v2(data):
    # 这里用一个白色背景演示
    state = data["state"]
    keyframes = data["keyframes"]
    insetkeyframes = data["insetkeyframes"]
    
    
    background = ColorClip(size=(1920, 1080), color=(255, 255, 255)).with_duration(state["maxTime"])
    
    
    
    
    
    
    # 2. 加载另一个视频并截取后 5 秒
    clip2 = VideoFileClip("3.mp4")
    logo = ImageClip("1.png",duration=3).resized((100, 100))


    

     # 2. 加载 GIF
    gif_clip = VideoFileClip("output.gif", has_mask=True)
    gif_clip = gif_clip.with_duration(gif_clip.duration).with_position(('center', 'center'))  # 设置 GIF 循环播放 3 次
    gif_clip =gif_clip.resized((512, 512))  # 调整 GIF 大小
    
    # 循环到 10 秒（重复5次然后截取）
    n = int(10 / gif_clip.duration) + 1
    looped_clip = concatenate_videoclips([gif_clip] * n).subclipped(0, 10).with_position(('center', 'center'))




 # 设置最终剪辑的持续时间为 clip2 的持续时间

    # 3. 创建标题文字
    title = TextClip(
        text="My V2 Video",
        font_size=60,
        color='yellow'
    )
    title = title.with_position(('center', 'top')).with_duration(5)  # 设置标题持续时间为 5 秒

    def move_func(t):
        # 线性插值：从 -200 移动到 100
        start_x = -200
        end_x = 100
        progress =  int( t / title.duration)   # 0.0 到 1.0
        current_x = start_x + (end_x - start_x) * progress
        return (current_x, 'center')

    # 应用动态位置
    title = title.with_position(move_func)

    final_clip = CompositeVideoClip([
        background,
        clip2,
        title,
        logo,  # 设置 logo 在视频开始时显示
        looped_clip  # 设置 GIF 在视频开始时显示
    ])
    # final_video = video.with_audio(audio)

    bgm = AudioFileClip("1.mp3")
    bgm1 = AudioFileClip("2.wav")

    # 2. 调整背景乐时长和音量
    # 截取与视频等长
    bgm = bgm.with_start(3).with_duration(10)
    bgm1 = bgm1.with_start(5).with_duration(3)
  
    # 降低背景乐音量，避免盖过人声 (0.0 - 1.0)
    # bgm = bgm.with_volume_scaled(1) 
    # 4. 混合音频
    # CompositeAudioClip 将多个音频轨道叠加在一起
    mixed_audio = CompositeAudioClip([bgm, bgm1])
   
    final_clip = final_clip.with_duration(30) 
  
    final_clip = final_clip.with_audio(mixed_audio)
    print("-------") 
    print(final_clip.audio) 
    final_clip.write_videofile("2.mp4", codec="libx264", audio_codec="aac",fps=8)
  
    # 如果是单张图片作为剪辑
    img_clip = ImageClip("0.png")
    # cropped_img = img_clip.with_cropped(x1=50, y1=50, x2=250, y2=250)

    
    # # 5. 拼接两个剪辑
    # final_video = concatenate_videoclips([clip1_with_title, clip2])
    
    # # 6. 导出
    # final_video.write_videofile(
    #     "final_output.mp4",
    #     fps=24,
    #     codec="libx264",
    #     audio_codec="aac"
    # )
    
    # # 7. 关闭资源 (良好习惯)
    # clip1.close()
    # clip2.close()
    # final_video.close()

if __name__ == "__main__":
    data =  getconfigjson('videoJsonData/jjqq.json' )
    create_video_v2(data)



# from moviepy.editor import ImageSequenceClip

# # 按动作顺序列出所有帧
# frames = [
#     "run_01.png", "run_02.png", "run_03.png", "run_04.png",
#     "run_05.png", "run_06.png", "run_07.png", "run_08.png"
# ]

# # 一键生成动画，fps 控制动作速度
# clip = ImageSequenceClip(frames, fps=12)
# clip.write_videofile("run_cycle.mp4")

# Pygame从 MoviePy 切换到 Pygame 做沙雕动画，最大的变化是——‌你可以实时操控角色，而不只是渲染一段固定视频。‌ Pygame