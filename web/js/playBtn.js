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
    console.log("进行播放",state.currentTime)
    state.isPlaying = true
    updatePlayButtonUI();
    myStage.startPlayback(state.currentTime)
    myAudio.startPlayback(state.currentTime)
    animatePlayhead();




}

function stopPlayback() {
    console.log("停止播放")
    state.isPlaying = false
    updatePlayButtonUI();

    // const video = DOM.previewVideo;
    // video.pause();
    myStage.stopPlayback()
    myAudio.stopPlayback()

    // if (state.animationFrameId) {
    //     cancelAnimationFrame(state.animationFrameId);
    //     state.animationFrameId = null;
    // }
}


// 自动播放中
function animatePlayhead(time) {
    state.currentTime = time
    updatePlayheadPosition();
    updateTimeDisplay()
}
