function renderTracks() {
    DOM.tracksContainer.innerHTML = '';
    DOM.tracksContainer.style.width = (state.maxTime * state.scale) + 'px';
    state.tracks.forEach((track, i) => {
        const trackEl = document.createElement('div');
        if (state.selectedTrackId == track.id) {
            trackEl.className = 'track selected'
        } else {
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
    updateVideoPreview()
}
// ==================== 查找辅助 ====================
function findTrack(id) {
    return state.tracks.find(t => t.id === id);
}



// ==================== 轨道与片段管理 ====================
function trackHasTheSameId(id) {
    let hasThisId = false
    state.tracks.forEach(t => {
        if (id === t.id) {
            hasThisId = true
        }
    })
    if (hasThisId) {
        showToast("trackID重复")
    }
    return hasThisId
}


function changeTrackId() {
    let value = document.getElementById("trackInputId").value
    if (trackHasTheSameId(value)) {
        return
    }
    if (state.selectedTrackId) {
        let selectedTrack = state.tracks.find((t) => t.id == state.selectedTrackId)
        selectedTrack.name =(selectedTrack.type === 'video' ? '📹 图像 ' : '🎵 音频 ') + "ID :" + (value),
        selectedTrack.id = value
        state.selectedTrackId = value
    }
    renderTracks();
}



function addTrack(type) {
    console.log("轨道与片段管理")
    let value = document.getElementById("trackInputId").value
    if (!value) {
        showToast("没有填ID")
        return
    }
    if (trackHasTheSameId(value)) {
        return
    }
    state.tracks.push({
        id: value,
        type,
        name: (type === 'video' ? '📹 图像 ' : '🎵 音频 ') + "ID :" + (value),
        clips: []
    });
    renderTracks();
    updatePlayheadPosition();
    DOM.scrollContainer.scrollTop = DOM.scrollContainer.scrollHeight;
    showToast(`${type === 'video' ? '视频' : '音频'}轨道已添加`);
}
