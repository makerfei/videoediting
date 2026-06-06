 // ==================== 事件监听绑定 ====================
    function setupEventListeners() {
      // 时间轴点击跳转
      DOM.ruler.addEventListener('click', handleTimelineClick);

      DOM.tracksContainer.addEventListener('click', (e) => {
        if (!e.target.closest('.clip')) handleTimelineClick(e);
      });

      // 播放头手柄拖拽
      DOM.playheadHandle.addEventListener('mousedown', handlePlayheadDragStart);

      // 片段交互（事件委托）
      DOM.tracksContainer.addEventListener('mousedown', (e) => {
        console.log("  tracksContainer mousedown")
        const clipEl = e.target.closest('.clip');
        if (!clipEl) return;

        const clipId = clipEl.dataset.id;
        const trackId = clipEl.closest('.track').dataset.id;
        const clip = findClip(clipId);
        if (!clip) return;

        // 被选中的点亮
        selectClip(clipId, trackId);

        if (e.target.classList.contains('handle')) {
          console.log("进行拉长或缩短视频")
          const isLeft = e.target.classList.contains('left');
          state.dragState = {
            type: isLeft ? 'resize-l' : 'resize-r',
            clipId,
            startX: e.clientX,
            originalStart: clip.start,
            originalDuration: clip.duration
          };
        } else {
          console.log("判断为移动")
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
        if (clipEl) {
          e.preventDefault();
          selectClip(clipEl.dataset.id);
          showContextMenu(e.clientX, e.clientY);
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
        }
        if (e.code === 'Delete' && state.selectedClipId) {
          deleteSelectedClip();
        }
      });
      // -----------------视频播放放反传代码设置
      // 视频时间更新时同步播放头
      // DOM.previewVideo.addEventListener('timeupdate', () => {
      //   if (state.playheadDrag) return; // 拖拽播放头时不反向同步
      //   if (!state.isPlaying) return;
      //   const activeClip = getActiveClipAtTime(state.currentTime);
      //   if (activeClip) {
      //     const clipTime = DOM.previewVideo.currentTime;
      //     const absTime = activeClip.start + clipTime;
      //     if (Math.abs(state.currentTime - absTime) > 0.05) {
      //       state.currentTime = absTime;
      //       updatePlayheadPosition();
      //       updateTimeDisplay();
      //     }
      //   }
      // });

      // 拖放视频文件到预览区
      const previewSection = document.getElementById('preview-section');
      previewSection.addEventListener('dragover', (e) => { e.preventDefault(); });
      previewSection.addEventListener('drop', (e) => {
        // e.preventDefault();
        // const file = e.dataTransfer.files;
        // if (file && file.type.startsWith('video/')) {
        //   loadVideoFile(file);
        // }
      });
      previewSection.addEventListener('click', (e) => {
        if (e.target === previewSection || e.target === DOM.previewPlaceholder || e.target.closest('.preview-placeholder')) {
          // const input = document.createElement('input');
          // input.type = 'file';
          // input.accept = 'video/*';
          // input.onchange = () => { if (input.files) loadVideoFile(input.files); };
          // input.click();
        }
      });
    }

  
