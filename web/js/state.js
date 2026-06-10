// ==================== 状态管理 ====================

class myStateClass {
    constructor() {
        this.state = this.defData()

    }
    defData() {
        return {
            
            name: "videoJsonData/jjqq",
            scale: 100, // 像素/秒
            currentTime: 0, // 当前播放时间（秒）
            isPlaying: false,
            maxTime: 30, // 时间轴总时长（秒），动态更新
            tracks: [
                {
                    id: 'vtid', type: 'video', name: '图像轨道 1',
                    clips: [
                        {
                            id: 'c21', type: "image", categorize: "persion", start: 0, duration: 10, x: 0, y: 0, width: 1920, height: 1080, name: '张三', src: "image/1.jpg"
                        }
                    ]
                },
                {
                    id: 'vtid2', type: 'video', name: '图像轨道 1',
                    clips: [
                        { id: 'c2', type: "image", start: 0, duration: 2,  x: 0, y: 0,   name: '22222222', src: "gif/3.gif" },

                        { id: 'c22', type: "image", start: 0, duration: 2, x: 0, y: 0,   name: '22222222', src: "gif/2.gif" }
                    ]
                },
                {
                    id: 'atid', type: 'audio', name: '音频轨道 1',
                    clips: [
                        { id: 'c3', start: 0, duration: 10, name: '12221dfdfd放豆腐的方法德国的v分丰富的vv根本不够丰富v的v', audioSrc: null }
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
    }

    get() {
        return this.state
    }
}
