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


// ==================== 轨道与片段管理 ====================

function getTextByTpye(type) {
    let typeTxt = type == "video" ? "📹 图像" :
        type == "audio" ? "🎵 音频" :
            type == "action" ? "🏃‍♂️ 动作" :
                type == "scale" ? "🔎 缩放" :
                    type == "face" ? "🫥  表情" : "未分类"
    return typeTxt
}

function trackHasTheSameId(id, type) {
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
    if (state.selectedTrackId) {
        let value = document.getElementById("trackInputId").value
        let selectedTrack = state.tracks.find((t) => t.id == state.selectedTrackId)

        if (trackHasTheSameId(value, selectedTrack.type)) {
            return
        }
        selectedTrack.name = getTextByTpye(selectedTrack.type) + (value),
            selectedTrack.id = value
        state.selectedTrackId = value
        renderTracks();
    }
}

function addTrack(type) {
    console.log("轨道与片段管理")
    let value = document.getElementById("trackInputId").value
    if (!value) {
        showToast("没有填ID")
        return
    }
    if (trackHasTheSameId(value, type)) {
        return
    }

    state.tracks.push({
        id: value,
        type,
        name: getTextByTpye(type) + (value),
        clips: []
    });
    renderTracks();
    updatePlayheadPosition();
    DOM.scrollContainer.scrollTop = DOM.scrollContainer.scrollHeight;
    showToast(`${getTextByTpye(type)}轨道已添加`);
}
