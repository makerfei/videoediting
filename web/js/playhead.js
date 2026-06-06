
// ==================== 播放头相关 ====================
function updatePlayheadPosition() {
    const left = state.currentTime * state.scale;
    DOM.playhead.style.left = left + 'px';
}

// 更新显示时间
function updateTimeDisplay() {
    const t = state.currentTime;
    const total = state.maxTime;
    DOM.timeDisplay.textContent = formatTime(t);
    DOM.currentTimeDisplay.textContent = formatTime(t);
    DOM.totalTimeDisplay.textContent = formatTime(total);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
}


// ==================== 时间轴点击跳转 ====================
function handleTimelineClick(e) {
    // 点击标尺或轨道空白区域跳转

    console.log("时间箭头点击触发 点击标尺或轨道空白区域跳转")
    if (e.target.closest('.clip')) return; // 不处理片段点击
    if (e.target.closest('.playhead-handle')) return;

    const rect = DOM.tracksContainer.getBoundingClientRect();
    const x = e.clientX - rect.left + DOM.scrollContainer.scrollLeft;
    const time = x / state.scale;
    seekTo(time);
}



// ==================== 播放头拖拽 ====================
function handlePlayheadDragStart(e) {
    e.stopPropagation();
    state.playheadDrag = true;
    if (state.isPlaying) {
        state.isPlaying = false;
        updatePlayButtonUI();
        stopPlayback();
    }
    //播放头拖拽运动
    function onMove(ev) {
        console.log("播放头拖拽运动")
        if (!state.playheadDrag) return;
        const rect = DOM.tracksContainer.getBoundingClientRect();
        const x = ev.clientX - rect.left + DOM.scrollContainer.scrollLeft;
        const time = Math.max(0, Math.min(x / state.scale, state.maxTime));
        state.currentTime = time;
        updatePlayheadPosition();
        updateTimeDisplay();
        updateVideoPreview();
    }

    function onUp() {
        console.log("播放头拖鼠标抬起")
        state.playheadDrag = false;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
}
