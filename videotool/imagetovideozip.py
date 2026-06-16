# 压缩包合成视频
import subprocess
import os
import sys
import json
import zipfile
from PIL import Image
import io

def zip_to_video_ffmpeg(zip_path, audio_path, output_video_path, fps=24, img_pattern_prefix='frame_'):
    """
    直接从 ZIP 压缩包读取图片序列并合成视频，无需解压到磁盘。
    
    :param zip_path: ZIP 文件路径
    :param audio_path: 音频文件路径
    :param output_video_path: 输出视频路径
    :param fps: 帧率
    :param img_pattern_prefix: 图片文件名前缀，用于排序和筛选 (例如 'frame_')
    """
    
    # 1. 打开 ZIP 文件并获取所有图片文件名
  
    z= zipfile.ZipFile(zip_path, 'r') 
    # 获取所有文件名
    all_names = z.namelist()
    
    # 筛选出图片文件 (png, jpg, jpeg) 并包含特定前缀
    # 注意：ZIP 中可能包含文件夹，需排除以 '/' 结尾的名称
    image_files = [
        name for name in all_names 
        if not name.endswith('/') and 
        name.lower().endswith(('.png', '.jpg', '.jpeg')) and
        os.path.basename(name).startswith(img_pattern_prefix)
    ]
        
    if not image_files:
        print(f"错误: 在 ZIP {zip_path} 中未找到以 '{img_pattern_prefix}' 开头的图片文件。")
        return

    # 自然排序非常重要，确保 frame_00001 在 frame_00002 之前
    # 简单的字符串排序通常足够，如果文件名是 frame_1, frame_10 这种非补零格式，则需要更复杂的排序
    image_files.sort()
    
    # 2. 读取第一张图片以获取视频分辨率 (Width x Height)
    # FFmpeg 接收 raw video 时需要明确知道分辨率
    first_img_name = image_files[0]
    with z.open(first_img_name) as img_file:
        first_img = Image.open(img_file)
        width, height = first_img.size
        # 确保尺寸是偶数 (H.264 要求)
        if width % 2 != 0: width -= 1
        if height % 2 != 0: height -= 1
        
    print(f"检测到分辨率: {width}x{height}, 帧数: {len(image_files)}")
#     cmd = [
#     'ffmpeg',
#     '-y',                 # 1. 覆盖输出文件
#     '-r', str(fps),       # 2. 输入图片的帧率
#     '-i', os.path.join(image_folder, img_pattern), # 3. 输入图片序列
#     '-i', audio_path,     # 4. 【新增】输入音频文件
#     '-c:v', 'libx264',    # 5. 视频编码器 (H.264)
#     '-pix_fmt', 'yuv420p',# 6. 像素格式 (兼容性好)
#     '-c:a', 'aac',        # 7. 【新增】音频编码器 (AAC，MP4标准音频)
#     '-b:a', '192k',       # 8. 【新增】音频比特率 (可选，默认通常够用)
#     '-shortest',          # 9. 【重要】以最短的流为准结束视频 (防止音频比视频长时黑屏继续播放)
#     output_video_path
# ]
   

    # 3. 构建 FFmpeg 命令
    # -f rawvideo: 输入格式为原始视频
    # -pixel_format rgb24: 输入像素格式为 RGB (Pillow 默认导出格式)
    # -video_size WxH: 输入视频尺寸
    # -framerate fps: 输入帧率
    # -i -: 从标准输入读取数据
    cmd = [
        'ffmpeg',
        '-y',                 # 覆盖输出
        '-f', 'rawvideo',     # 输入格式：原始视频流
        '-pixel_format', 'rgb24', # 输入像素格式：RGB
        '-video_size', f'{width}x{height}', # 输入分辨率
        '-framerate', str(fps), # 输入帧率
        '-i', '-',             # 从 stdin 读取视频流
        '-i', audio_path,      # 音频输入
        '-c:v', 'libx264',    # 视频编码 H.264
        '-pix_fmt', 'yuv420p',# 输出像素格式 (兼容大多数播放器)
        '-c:a', 'aac',        # 音频编码 AAC
        '-b:a', '192k',       # 音频比特率
        '-shortest',          # 以最短流为准结束
        output_video_path
    ]

   
    process = subprocess.Popen(
        cmd, 
        stdin=subprocess.PIPE, 
        stdout=subprocess.PIPE, 
        stderr=subprocess.PIPE
    )
    

  
    for img_name in image_files:
        with z.open(img_name) as img_file:
            # 使用 Pillow 打开图片
            img = Image.open(img_file)
            # 转换模式为 RGB (去除透明通道等，确保每个像素3字节)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            # 如果尺寸不一致，这里可以选择 resize 或报错，假设所有帧尺寸一致
            # img = img.resize((width, height)) 
            # 获取原始字节数据
            raw_data = img.tobytes()
            # 写入 FFmpeg 的标准输入
            process.stdin.write(raw_data)


        
    # 关闭 stdin，告诉 FFmpeg 输入结束
    process.stdin.close()
    z.close()
        
        # 等待 FFmpeg 完成处理
    stdout, stderr = process.communicate()
    
    if process.returncode == 0:
        print(f"✅ 视频成功保存至: {output_video_path}")
        # 可选：处理完后删除原始 ZIP 或音频
        # if os.path.exists(zip_path): os.remove(zip_path)
        # if os.path.exists(audio_path): os.remove(audio_path)
    else:
        print(f"❌ FFmpeg 处理出错:")
        print(stderr.decode())

   

# ==========================================
# 主程序入口示例
# ==========================================

if __name__ == '__main__':
    # 模拟从 stdin 接收 JSON 配置 (保留你原有的逻辑结构)
    # 在实际调用中，你可以直接调用上面的函数，或者通过 stdin 传入参数
    
    # 示例硬编码参数测试 (请替换为你的实际文件路径)
    ZIP_FILE = '../images.zip'  # 你的 ZIP 包路径
    AUDIO_FILE = '../audio.wav'          # 你的音频路径
    OUTPUT_FILE = '../../output.mp4'        # 输出视频路径
    
    # 检查文件是否存在
    if not os.path.exists(ZIP_FILE):
        print(f"找不到 ZIP 文件: {ZIP_FILE}")
    elif not os.path.exists(AUDIO_FILE):
        print(f"找不到音频文件: {AUDIO_FILE}")
    else:
        # 执行转换
        zip_to_video_ffmpeg(
            zip_path=ZIP_FILE,
            audio_path=AUDIO_FILE,
            output_video_path=OUTPUT_FILE,
            fps=24,
            img_pattern_prefix='frame_'
        )
