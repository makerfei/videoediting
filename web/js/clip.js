
function createClipElement(clip, type) {
    const el = document.createElement('div');
    el.className = 'clip' + (state.selectedClipId === clip.id ? ' selected' : '');
    el.dataset.id = clip.id;
    el.dataset.type = type;
    el.style.left = (clip.start * state.scale) + 'px';
    el.style.width = (clip.duration * state.scale) + 'px';
    el.textContent = clip.name;

    if (clip.type == "image") {
        el.style.backgroundImage = `url('${clip.src}')`
    }

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

function updataAllUI() {
    updateMaxTime();
    renderRuler();
    renderTracks();
    updatePlayheadPosition();
    closeContextMenu();
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
    updataAllUI()
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
    updataAllUI()
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
        let chang = (Arrow == "ArrowUp" || Arrow == "KeyW") ? -1 : (Arrow == "ArrowDown" || Arrow == "KeyS") ? 1 : 0;
        changindex = chang + selectindex
        if (state.tracks[changindex]) {
            [state.tracks[changindex], state.tracks[selectindex]] = [state.tracks[selectindex], state.tracks[changindex]]
        } else {
            console.log("超出范围")
        }

    } else { //换片段片段


        let changeitemindex = -1
        if (Arrow == "ArrowUp" || Arrow == "KeyW") {
            if (state.tracks[selectindex].type == "audio" && nearTrack.upaudio != -1) {
                changeitemindex = nearTrack.upaudio
            }
            if (state.tracks[selectindex].type != "audio" && nearTrack.upimg != -1) {
                changeitemindex = nearTrack.upimg
            }
        } else if (Arrow == "ArrowDown" || Arrow == "KeyS") {
            if (state.tracks[selectindex].type == "audio" && nearTrack.downaudio != -1) {
                changeitemindex = nearTrack.downaudio
            }
            if (state.tracks[selectindex].type != "audio" && nearTrack.downimg != -1) {
                changeitemindex = nearTrack.downimg
            }
        }

        if (changeitemindex != -1) {
            let changeitemid = state.tracks[changeitemindex].id
            let changeitem = null
            // 找出并删除 和修改
            state.tracks.forEach(t => {
                t.clips.forEach(item => {
                    if (item.id == state.selectedClipId) {
                        changeitem = { ...item }
                    }
                })
            });

            changeitem && state.tracks[changeitemindex].clips.push(changeitem)

            // 找出并删除 和修改
            state.tracks.forEach(t => {
                t.clips = t.clips.filter(c => {
                    return c.id !== state.selectedClipId || t.id !== state.selectedTrackId
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


// 添加新片段
function addPersonToClip({ imgSrc, jsonSrc }) {
    let track = state.selectedTrackId && state.tracks.find(i => i.id == state.selectedTrackId)
    if (!track || !track.type == "video") {
        showToast("请选择视频轨道")
        return
    }
    let pathList = jsonSrc.split("/")
    let id = pathList[pathList.length - 1].split(".")[0]
    const newClip = {
        id: id + "-" + new Date().getTime(),
        categorize: "person",
        start: state.currentTime,
        duration: 3,
        name: id,
        src: imgSrc,
        jsonSrc,
        type: "image",
        width: 600,
        height: 600,
        x: 0,
        y: 0
    };
    track.clips.push(newClip);
    updataAllUI()
    showToast('片段已添加，点击预览区加载视频');
}

function addActionToClip({ categorization, name, actionName }) {
    let track = state.selectedTrackId && state.tracks.find(i => i.id == state.selectedTrackId)

    if (!track || !(track.type == "action")) {
        showToast("请选择视频轨道")
        return
    }
    let id = name.split(".")[0]
    const newClip = {
        id: id + "-" + new Date().getTime(),
        categorize: "action",
        start: state.currentTime,
        duration: 3,
        name: "姿态-" + actionName + "-" + categorization,
        categorization,
        actionName
    };
    track.clips.push(newClip);
    updataAllUI()
    showToast('片段已添加，点击预览区加载视频');
}

function addMoveToClip({ categorization, name, moveName }) {
    let track = state.selectedTrackId && state.tracks.find(i => i.id == state.selectedTrackId)
    if (!track || !(track.type == "action")) {
        showToast("请选择视频轨道")
        return
    }
    let id = name.split(".")[0]
    const newClip = {
        id: id + "-" + new Date().getTime(),
        categorize: "action",
        start: state.currentTime,
        duration: 3,
        name: "动画-" + moveName + "-" + categorization,
        categorization,
        moveName
    };
    track.clips.push(newClip);
    updataAllUI()
    showToast('片段已添加，点击预览区加载视频');
}



function addFaceClip({ imgSrc, name }) {
    let track = state.selectedTrackId && state.tracks.find(i => i.id == state.selectedTrackId)
    if (!track || !(track.type == "face")) {
        showToast("请选择视频轨道")
        return
    }

    let id = name.split(".")[0]
    const newClip = {
        id: id + "-" + new Date().getTime(),
        categorize: "face",
        start: state.currentTime,
        duration: 3,
        name: name,
        src: imgSrc,
        type: "image",
    };
    track.clips.push(newClip);
    updataAllUI()
    showToast('片段已添加，点击预览区加载视频');

}


function addAudioClip({ src, name }) {
    let track = state.selectedTrackId && state.tracks.find(i => i.id == state.selectedTrackId)
    if (!track || !(track.type == "audio")) {
        showToast("请选择audio轨道")
        return
    }


    let id = name.split(".")[0]
    const newClip = {
        id: id + "-" + new Date().getTime(),
        categorize: "audio",
        start: state.currentTime,
        duration: 3,
        name: name,
        src: src,
    };
    track.clips.push(newClip);
    updataAllUI()
    showToast('片段已添加，点击预览区加载视频');

}
function addEmo_audio_prompt({ src, name }) {

    let soundInputEl = document.getElementById("soundInput")
    soundInputEl.value += `emo_audio_prompt>${src}:`
}


// ai返回声音显示
function addSoundClip({ src, text, trackId, start, duration, spk }) {
    let track = state.tracks.find(i => i.id == trackId)
    const newClip = {
        id: src.split(".")[0].replace("/", "_"),
        categorize: "audio",
        start: start,
        duration: duration,
        name: text,
        src: src,
    };
    track.clips.push(newClip);
    updataAllUI()
    showToast('片段已添加，点击预览区加载视频');
}

function addImgtoClip({ src, name }) {

    let track = state.selectedTrackId && state.tracks.find(i => i.id == state.selectedTrackId)
    if (!track || !(track.type == "video")) {
        showToast("请选择视频轨道")
        return
    }

    let img = new Image()
    img.onload = () => {
        const newClip = {
            id: name + "-" + new Date().getTime(),
            categorize: "video",
            start: state.currentTime,
            duration: 3,
            name: name,
            src: src,
            type: "image",
            width: img.width,
            height: img.height,
            x: 0,
            y: 0
        };
        track.clips.push(newClip);
        updataAllUI()
        showToast('片段已添加，点击预览区加载视频');
    }
    img.src = src
}


function addScaleClip() {
    let track = state.selectedTrackId && state.tracks.find(i => i.id == state.selectedTrackId)
    if (!track || !(track.type == "scale")) {
        showToast("请选择缩放轨道")
        return
    }
    const scale =  Number(myStage.stage.scaleX()).toFixed(2) ;
    const x =Math.floor( myStage.stage.x()) 
    const y = Math.floor( myStage.stage.y())   
    const newClip = {
        id: "scale" + "-" + new Date().getTime(),
        categorize: "scale",
        start: state.currentTime,
        duration: 3,
        name: `(${x},${y})*${scale}`,
        x, y, scale
    };
    track.clips.push(newClip);
    updataAllUI()
    showToast('片段已添加，点击预览区加载视频');


}
