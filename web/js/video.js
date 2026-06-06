
// ==================== 视频预览 ====================

// 视频内容更新
function updateVideoPreview() {
    console.log("视频内容更新")
    const video = DOM.previewVideo;
    const placeholder = DOM.previewPlaceholder;

    // 检查当前时间点是否有视频片段
    const activeClip = getActiveClipAtTime(state.currentTime);

    // 
    if (activeClip && activeClip.videoSrc) {
        // video.style.display = 'block';
        // placeholder.style.display = 'none';
        // video.src = activeClip.videoSrc;
        // video.currentTime = state.currentTime - activeClip.start;
        console.log("当前时间" + state.currentTime)
    } else if (activeClip && activeClip.type === 'video') {
        // 有视频片段但没有设置视频源
        // video.style.display = 'block';
        // placeholder.style.display = 'none';
        // if (!video.src || video.src === window.location.href) {
        //   // 使用示例视频
        //   video.src = 'https://www.w3schools.com/html/mov_bbb.mp4';
        // }
        // video.currentTime = Math.min(state.currentTime - activeClip.start, video.duration || 0);
    } else {
        // video.style.display = 'none';
        // placeholder.style.display = 'flex';
        // video.pause();
    }
}



    function getActiveClipAtTime(time) {
      for (const track of state.tracks) {
        for (const clip of track.clips) {
          if (time >= clip.start && time < clip.start + clip.duration) {
            return { ...clip, type: track.type };
          }
        }
      }
      return null;
    }
