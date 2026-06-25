// ==================== 事件监听绑定 ====================
function setupEventListeners() {
    // 时间轴点击跳转
    DOM.ruler.addEventListener('click', handleTimelineClick);

    //点内容轨道区域
    DOM.tracksContainer.addEventListener('click', (e) => {
        if (!e.target.closest('.clip') && e.target.closest('.track')) {
            console.log("点击空包轨道渲染")
            const trackEl = e.target.closest('.track')
            state.selectedTrackId = trackEl.dataset.id
            state.selectedClipId = null
            renderTracks()
        }
    });

    // 播放头手柄拖拽
    DOM.playheadHandle.addEventListener('mousedown', handlePlayheadDragStart);

    // 片段交互（事件委托）
    DOM.tracksContainer.addEventListener('mousedown', (e) => {
        const clipEl = e.target.closest('.clip');
        const trackEl = e.target.closest('.track')
        if (!trackEl) return;
        const trackId = trackEl.dataset.id
        
        // 页面输入框展示
        if (clipEl && clipEl.dataset.id) {
            document.getElementById("trackInputId").value = clipEl.dataset.id
        } else if (trackEl.dataset.id) {
            document.getElementById("trackInputId").value = trackEl.dataset.id
        }
        //判断为时间长度拖动
        if (clipEl && e.target.classList.contains('handle')) {
            const clipId = clipEl.dataset.id;
            const clip = findClip(clipId);
            if (!clip) return;
            // 被选中的点亮
            selectClip(clipId, trackId);
            console.log("mousedown:进行拉长或缩短视频")
            const isLeft = e.target.classList.contains('left');
            state.dragState = {
                type: isLeft ? 'resize-l' : 'resize-r',
                clipId,
                startX: e.clientX,
                originalStart: clip.start,
                originalDuration: clip.duration
            };
        }
        // 判断为组建位置拖动
        if (clipEl && !e.target.classList.contains('handle')) {
            const clipId = clipEl.dataset.id;
            const clip = findClip(clipId);
            if (!clip) return;
            console.log("mousedown:判断为clipEl位置拖动")
            // 被选中的点亮
            selectClip(clipId, trackId);
            state.dragState = {
                type: 'move',
                clipId,
                startX: e.clientX,
                originalStart: clip.start
            };
        }
    });

    // 全局鼠标移动
    document.addEventListener('mousemove', (e) => {
        // 鼠标运动判断
        if (!state.dragState) return;
        const { type, clipId, startX, originalStart, originalDuration } = state.dragState;
        const clip = findClip(clipId);
        if (!clip) return;

        const deltaX = e.clientX - startX;
        const deltaTime = deltaX / state.scale;

        if (type === 'move') {
            let newStart = originalStart + deltaTime;
            if (newStart < 0) newStart = 0;
            newStart = snapTime(newStart, clipId);
            clip.start = newStart;
        } else if (type === 'resize-l') {
            let newStart = originalStart + deltaTime;
            let newDuration = originalDuration - deltaTime;
            if (newDuration < 0.3) { newDuration = 0.3; newStart = originalStart + originalDuration - 0.3; }
            if (newStart < 0) { newStart = 0; newDuration = originalStart + originalDuration; }
            newStart = snapTime(newStart, clipId);
            clip.start = newStart;
            clip.duration = (originalStart + originalDuration) - newStart;
        } else if (type === 'resize-r') {
            let newDuration = originalDuration + deltaTime;
            if (newDuration < 0.3) newDuration = 0.3;
            clip.duration = newDuration;
        }

        updateClipDOM(clip);
        updateMaxTime();
        updateTimeDisplay();
        renderRuler();
    });

    // 全局鼠标释放
    document.addEventListener('mouseup', () => {
        if (state.dragState) {
            state.dragState = null;
            updateMaxTime();
            renderRuler();
            renderTracks();
            updatePlayheadPosition();
        }
    });

    // 右键菜单
    document.addEventListener('contextmenu', (e) => {
        const clipEl = e.target.closest('.clip');
        const trackEl =  e.target.closest('.track');
        
        if (clipEl||trackEl) {
            if(!clipEl){
                state.selectedTrackId = trackEl.dataset.id
                state.selectedClipId = null
                renderTracks();
            }else{
                selectClip(clipEl.dataset.id);
            }
            showContextMenu(e.clientX, e.clientY);
            e.preventDefault();
        } else {
            closeContextMenu();
        }
    });

    // 点击其他地方关闭菜单
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.context-menu')) closeContextMenu();
    });

    // 滚轮缩放 (Ctrl+滚轮)
    DOM.scrollContainer.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            zoomTimeline(e.deltaY > 0 ? -5 : 5);
        }
    });

    // 空格键播放/暂停
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
            togglePlay();
        }else  if ((e.code === 'ArrowUp' || e.code === 'ArrowDown') && state.selectedTrackId) {
            changeSelectedClipOrTrack(e.code);
        }else if(e.shiftKey&&e.code === 'KeyI'){
            addScaleClip()
        }
    });
    
}


