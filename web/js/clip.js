
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
function deleteSelectedClipOrTrack() {
    if (!state.selectedTrackId && !state.selectedClipId) return;
    // 删除轨道
    if (state.selectedTrackId && !state.selectedClipId) {
        state.tracks = state.tracks.filter(c => c.id !== state.selectedTrackId);
    } else { //删除片段
        state.tracks.forEach(t => {
            t.clips = t.clips.filter(c => c.id !== state.selectedClipId);
        });
    }
    state.selectedClipId = null;
    state.selectedTrackId = null;
    updateMaxTime();
    renderRuler();
    renderTracks();
    updatePlayheadPosition();
    closeContextMenu();
    showToast('片段已删除');
}


function changeSelectedClipOrTrack(Arrow) { //ArrowUp ArrowDown
    if (!state.selectedTrackId && !state.selectedClipId) return;
    // 判断选择的轨道

    let selectindex = -1;
    let nearTrack = {
        upimg: -1,
        upaudio: -1,
        downimg: -1,
        downaudio: -1
    }

    for (let index = 0; index < state.tracks.length; index++) {
        if (state.tracks[index].id === state.selectedTrackId) {
            selectindex = index
        } else if (selectindex == -1) {
            if (state.tracks[index].type == "audio") {
                nearTrack.upaudio = index
            } else {
                nearTrack.upimg = index
            }
        } else {
            if (state.tracks[index].type == "audio") {
                if (nearTrack.downaudio == -1) {
                    nearTrack.downaudio = index
                }
            } else {
                if (nearTrack.downimg == -1) {
                    nearTrack.downimg = index
                }
            }
        }
    }
    console.log(nearTrack)

    // 交换轨道位置
    if (state.selectedTrackId && !state.selectedClipId) {
        let chang = Arrow == "ArrowUp" ? -1 : "ArrowDown" ? 1 : 0;
        changindex = chang + selectindex
        if (state.tracks[changindex]) {
            [state.tracks[changindex], state.tracks[selectindex]] = [state.tracks[selectindex], state.tracks[changindex]]
        } else {
            console.log("超出范围")
        }

    } else { //换片段片段

    
        let changeitemindex = -1
        if (Arrow == "ArrowUp") {
            if (state.tracks[selectindex].type == "audio" && nearTrack.upaudio != -1) {
                changeitemindex = nearTrack.upaudio
            } else if (nearTrack.upimg != -1) {
                changeitemindex = nearTrack.upimg
            }
        } else if (Arrow == "ArrowDown") {
            if (state.tracks[selectindex].type == "audio" && nearTrack.downaudio != -1) {
                changeitemindex = nearTrack.downaudio
            } else if (nearTrack.downimg != -1) {
                changeitemindex = nearTrack.downimg
            }
        }

        if (changeitemindex != -1) {
           let changeitemid   = state.tracks[changeitemindex].id
           let changeitem = null
             // 找出并删除 和修改
            state.tracks.forEach(t => {
                t.clips.forEach(item =>{
                    if(item.id==state.selectedClipId){
                        changeitem = {...item} 
                    }
                })
            });

           changeitem&& state.tracks[changeitemindex].clips.push(changeitem)

            // 找出并删除 和修改
            state.tracks.forEach(t => {
                t.clips = t.clips.filter(c => {
                    return c.id !== state.selectedClipId ||t.id!==state.selectedTrackId
                })
            });

            state.selectedTrackId = changeitemid
        }
    }
    // state.selectedClipId = null;
    // state.selectedTrackId = null;
    updateMaxTime();
    renderRuler();
    renderTracks();
    updatePlayheadPosition();
    closeContextMenu();
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
