// ==================== 播放控制 ====================
function togglePlay() {
    console.log("播放按钮点击")
    state.isPlaying = !state.isPlaying;
    if (state.isPlaying) {
        startPlayback();
    } else {
        stopPlayback();
    }
}


function updatePlayButtonUI() {
    console.log("更新按钮样式")
    const btn = DOM.playBtn;
    btn.classList.toggle('playing', state.isPlaying);
    btn.classList.toggle('paused', !state.isPlaying);
}

function startPlayback() {
    console.log("进行播放")
    state.isPlaying = true
    updatePlayButtonUI();
    myStage.startPlayback(state.currentTime)
    animatePlayhead();
}

function stopPlayback() {
    console.log("停止播放")
    state.isPlaying = false
    updatePlayButtonUI();

    // const video = DOM.previewVideo;
    // video.pause();
    myStage.stopPlayback(state.currentTime)
    if (state.animationFrameId) {
        cancelAnimationFrame(state.animationFrameId);
        state.animationFrameId = null;
    }
}


// 自动播放中
function animatePlayhead() {
    if (!state.isPlaying) return;
    state.currentTime += 0.016; // ~60fps
    if (state.currentTime >= state.maxTime) {
        state.currentTime = state.maxTime;
        state.isPlaying = false;
        updatePlayButtonUI();
        stopPlayback();
        updatePlayheadPosition();
        updateTimeDisplay();
        updateVideoPreview();
        return;
    }
    updatePlayheadPosition();
    updateTimeDisplay();
    updateVideoPreview();


    // 
    // 同步视频时间
    // const video = DOM.previewVideo;
    // const activeClip = getActiveClipAtTime(state.currentTime);
    // if (activeClip && video.style.display !== 'none') {
    //   const clipTime = state.currentTime - activeClip.start;
    //   if (Math.abs(video.currentTime - clipTime) > 0.1) {
    //     video.currentTime = clipTime;
    //   }
    // }

    // 自动滚动跟随播放头
    autoScrollToPlayhead();
    // requestAnimationFrame(animatePlayhead); 是浏览器 API 调用，表示“在下一次屏幕重绘前执行 animatePlayhead 函数”，通常用于驱动流畅动画（如播放头移动）
    state.animationFrameId = requestAnimationFrame(animatePlayhead);
}
