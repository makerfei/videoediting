
function createClipElement(clip, type) {
    const el = document.createElement('div');
    el.className = 'clip' + (state.selectedClipId === clip.id ? ' selected' : '');
    el.dataset.id = clip.id;
    el.dataset.type = type;
    el.style.left = (clip.start * state.scale) + 'px';
    el.style.width = (clip.duration * state.scale) + 'px';
    el.textContent = clip.name;

    const leftHandle = document.createElement('div');
    leftHandle.className = 'handle left';
    el.appendChild(leftHandle);

    const rightHandle = document.createElement('div');
    rightHandle.className = 'handle right';
    el.appendChild(rightHandle);

    return el;
}
// ==================== 查找辅助 ====================
function findClip(id) {
    for (const track of state.tracks) {
        const clip = track.clips.find(c => c.id === id);
        if (clip) return clip;
    }
    return null;
}

function selectClip(clipId, trackId = null) {
    state.selectedClipId = clipId;
    if (trackId) state.selectedTrackId = trackId;
    renderTracks();
    updatePlayheadPosition();
}

function updateClipDOM(clip) {
    const el = document.querySelector(`.clip[data-id="${clip.id}"]`);
    if (el) {
        el.style.left = (clip.start * state.scale) + 'px';
        el.style.width = (clip.duration * state.scale) + 'px';
    }
}


// ==================== 吸附逻辑 ====================
function snapTime(time, currentClipId) {
    const SNAP_THRESHOLD = 0.15; // 吸附阈值（秒）
    let closest = time;
    let minDiff = SNAP_THRESHOLD;
    // 吸附到整数秒
    const rounded = Math.round(time);
    if (Math.abs(time - rounded) < minDiff) {
        closest = rounded;
        minDiff = Math.abs(time - rounded);
    }
    // 吸附到其他片段边缘
    state.tracks.forEach(track => {
        track.clips.forEach(c => {
            if (c.id === currentClipId) return;
            [c.start, c.start + c.duration].forEach(edge => {
                if (Math.abs(time - edge) < minDiff) {
                    closest = edge;
                    minDiff = Math.abs(time - edge);
                }
            });
        });
    });

    return closest;
}


// ==================== 右键菜单 ====================
function showContextMenu(x, y) {
    DOM.contextMenu.style.display = 'block';
    DOM.contextMenu.style.left = x + 'px';
    DOM.contextMenu.style.top = y + 'px';
}

function closeContextMenu() {
    DOM.contextMenu.style.display = 'none';
}

// 复制操作
function duplicateSelectedClip() {
    if (!state.selectedClipId) return;
    const clip = findClip(state.selectedClipId);
    const track = state.tracks.find(t => t.clips.includes(clip));
    if (!track) return;
    const newClip = {
        ...JSON.parse(JSON.stringify(clip)),
        id: 'c' + Date.now(),
        start: clip.start + clip.duration + 0.5,
        name: clip.name + ' (副本)'
    };
    track.clips.push(newClip);
    updateMaxTime();
    renderRuler();
    renderTracks();
    updatePlayheadPosition();
    closeContextMenu();
    showToast('片段已复制');
}

// 删除操作
function deleteSelectedClip() {
    if (!state.selectedClipId) return;
    state.tracks.forEach(t => {
        t.clips = t.clips.filter(c => c.id !== state.selectedClipId);
    });
    state.selectedClipId = null;
    state.selectedTrackId = null;
    updateMaxTime();
    renderRuler();
    renderTracks();
    updatePlayheadPosition();
    closeContextMenu();
    showToast('片段已删除');
}


    function addClipToSelected() {
      console.log("添加片段")
      const targetTrack = state.selectedTrackId
        ? findTrack(state.selectedTrackId)
        : state.tracks[state.tracks.length - 1];
      if (!targetTrack) return;

      const newClip = {
        id: 'c' + Date.now(),
        start: 0,
        duration: 3,
        name: '新片段',
        videoSrc: null
      };

      const lastClip = [...targetTrack.clips].sort((a, b) => (a.start + a.duration) - (b.start + b.duration)).pop();
      if (lastClip) {
        newClip.start = lastClip.start + lastClip.duration //+ 0.5;
      }

      targetTrack.clips.push(newClip);
      updateMaxTime();
      renderRuler();
      renderTracks();
      updatePlayheadPosition();
      showToast('片段已添加，点击预览区加载视频');
    }
