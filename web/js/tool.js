
// ==================== 视频文件加载  已无用   ====================
function loadVideoFile(file) {
    const url = URL.createObjectURL(file);
    DOM.previewVideo.src = url;
    DOM.previewVideo.style.display = 'block';
    DOM.previewPlaceholder.style.display = 'none';
    DOM.previewVideo.play().catch(() => { });

    // 将视频关联到选中的片段或第一个视频片段
    const videoClips = [];
    state.tracks.forEach(t => {
        if (t.type === 'video') t.clips.forEach(c => videoClips.push(c));
    });

    if (state.selectedClipId) {
        const clip = findClip(state.selectedClipId);
        if (clip) clip.videoSrc = url;
    } else if (videoClips.length > 0) {
        videoClips.videoSrc = url;
    }

    showToast('视频已加载 ✅ 点击预览区可替换视频');
}







function importData(input) {
    const file = input.files;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        AllNewStart(data)
    };
    reader.readAsText(file[0], 'UTF-8');
    input.value = '';
}

// ==================== Toast ====================
function showToast(msg) {
    DOM.toast.textContent = msg;
    DOM.toast.classList.add('show');
    clearTimeout(DOM.toast._timeout);
    DOM.toast._timeout = setTimeout(() => DOM.toast.classList.remove('show'), 1800);
}
