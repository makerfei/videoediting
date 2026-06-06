function renderTracks() {
    DOM.tracksContainer.innerHTML = '';
    DOM.tracksContainer.style.width = (state.maxTime * state.scale) + 'px';
    state.tracks.forEach((track,i) => {
        const trackEl = document.createElement('div');
        if(state.selectedTrackId == track.id) {
            trackEl.className = 'track selected'
        }else{
             trackEl.className = 'track'
        }
        trackEl.dataset.id = track.id;
        const label = document.createElement('div');
        label.className = 'track-label';
        label.textContent = track.name;
        trackEl.appendChild(label);

        track.clips.forEach(clip => {
            const clipEl = createClipElement(clip, track.type);
            trackEl.appendChild(clipEl);
        });

        DOM.tracksContainer.appendChild(trackEl);
    });

    // 重新挂载播放头到 tracksContainer
    if (DOM.playhead.parentNode !== DOM.tracksContainer) {
        DOM.tracksContainer.appendChild(DOM.playhead);
    }
}
// ==================== 查找辅助 ====================
function findTrack(id) {
    return state.tracks.find(t => t.id === id);
}



// ==================== 轨道与片段管理 ====================
function addTrack(type) {

    console.log("轨道与片段管理")
    const id = 't' + Date.now();
    state.tracks.push({
        id,
        type,
        name: (type === 'video' ? '📹 视频轨道 ' : '🎵 音频轨道 ') + (state.tracks.length + 1),
        clips: []
    });
    renderTracks();
    updatePlayheadPosition();
    DOM.scrollContainer.scrollTop = DOM.scrollContainer.scrollHeight;
    showToast(`${type === 'video' ? '视频' : '音频'}轨道已添加`);
}
