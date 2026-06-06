// 下面的滑动区域保持在视野内
function autoScrollToPlayhead() {
    console.log("autoScrollToPlayhead 下面的滑动区域保持在视野内")

    const container = DOM.scrollContainer;
    const playheadLeft = state.currentTime * state.scale;
    const viewLeft = container.scrollLeft;
    const viewRight = viewLeft + container.clientWidth;

    if (playheadLeft > viewRight - 100) {
        container.scrollLeft = playheadLeft - container.clientWidth + 100;
    } else if (playheadLeft < viewLeft + 50) {
        container.scrollLeft = playheadLeft - 50;
    }
}


function seekTo(time) {
    console.log("seekTo  视频部分 页面更新")
    state.currentTime = Math.max(0, Math.min(time, state.maxTime));
    updatePlayheadPosition();
    updateTimeDisplay();
    updateVideoPreview();
}


// ==================== 缩放 ====================
function zoomTimeline(delta) {
    const newScale = state.scale + delta;
    if (newScale >= 20 && newScale <= 400) {
        state.scale = newScale;
        renderRuler();
        renderTracks();
        updatePlayheadPosition();
    }
}
