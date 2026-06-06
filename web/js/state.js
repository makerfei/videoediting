// ==================== 状态管理 ====================
const state = {
    scale: 100, // 像素/秒
    currentTime: 0, // 当前播放时间（秒）
    isPlaying: false,
    maxTime: 30, // 时间轴总时长（秒），动态更新
    tracks: [
        {
            id: 't1', type: 'video', name: '视频轨道 1',
            clips: [
                { id: 'c1', start: 0, duration: 5, name: '开场', videoSrc: null },
                { id: 'c2', start: 6, duration: 4, name: '过渡', videoSrc: null }
            ]
        },
        {
            id: 't2', type: 'audio', name: '音频轨道 1',
            clips: [
                { id: 'c3', start: 0, duration: 10, name: '背景音乐', audioSrc: null }
            ]
        }
    ],
    selectedClipId: null,
    selectedTrackId: null,
    dragState: null, // { type, clipId, startX, originalStart, originalDuration }
    playheadDrag: false,
    animationFrameId: null,
    trackDrag: null,//{  startIndex: index, element: draggedRow, startY: e.clientY, currentY: e.clientY }
};

