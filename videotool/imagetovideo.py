# 合成视频
import subprocess
import os
import sys
import json
import shutil
def clear_folder(folder_path):
    """
    清除文件夹内的所有文件和子目录，但保留文件夹本身
    """
    if not os.path.exists(folder_path):
        print(f"文件夹不存在: {folder_path}")
        return

    # 1. 删除整个文件夹
    shutil.rmtree(folder_path)
    
    # 2. 重新创建空文件夹
    os.makedirs(folder_path)
    print(f"文件夹已清空: {folder_path}")

# 使用示例
clear_folder('uploaded_frames')

def images_to_video_ffmpeg(image_folder,audio_path ,output_video_path, fps=24, img_pattern='frame_%05d.png'):
    """
    使用 FFmpeg 合成视频
    :param img_pattern: FFmpeg 的文件名模式，例如 frame_%05d.png 对应 frame_00001.png
    """
    # 构建 FFmpeg 命令
    # -r: 帧率
    # -i: 输入文件模式
    # -c:v: 视频编码器 (libx264 用于 mp4)
    # -pix_fmt: 像素格式 (yuv420p 兼容性最好)
    cmd = [
        'ffmpeg',
        '-y',                 # 1. 覆盖输出文件
        '-r', str(fps),       # 2. 输入图片的帧率
        '-i', os.path.join(image_folder, img_pattern), # 3. 输入图片序列
        '-i', audio_path,     # 4. 【新增】输入音频文件
        '-c:v', 'libx264',    # 5. 视频编码器 (H.264)
        '-pix_fmt', 'yuv420p',# 6. 像素格式 (兼容性好)
        '-c:a', 'aac',        # 7. 【新增】音频编码器 (AAC，MP4标准音频)
        '-b:a', '192k',       # 8. 【新增】音频比特率 (可选，默认通常够用)
        '-shortest',          # 9. 【重要】以最短的流为准结束视频 (防止音频比视频长时黑屏继续播放)
        output_video_path
    ]
    try:
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print(f"视频已保存至: {output_video_path}")
        clear_folder(image_folder)
        if os.path.exists(audio_path):
            os.remove(audio_path)

    except FileNotFoundError:
        print("错误: 未找到 FFmpeg。请确保已安装并添加到系统 PATH。")
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg 错误: {e.stderr.decode()}")


# 1. 读取所有传入的数据
input_data = sys.stdin.read()
# 3. 如果需要结构化数据，可以解析 JSON
try:
    data = json.loads(input_data)
    print(data)
    # 使用示例
    images_to_video_ffmpeg('../uploaded_frames','../audio.wav', '../../output.mp4', fps=48, img_pattern='frame_%05d.png')
    print("--完成--")
    print('{"state": "视频生成完成"}')
    sys.stdout.flush()
except:
    print("--完成--")
    print('{"state": "图片转视频程序运行错误"}')
    pass

