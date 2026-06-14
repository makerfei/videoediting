// ==================== 状态管理 ====================

class myStateClass {
    constructor() {
        this.updataKonvaTimer = null
        this.reStart()
    }
    reStart(indata) {
        if (indata) {
            this.state = indata;
        } else {
            // 先获取本地的数据
            let StorageState = localStorage.getItem("state")
            StorageState = StorageState ? JSON.parse(StorageState) : null
            this.state =StorageState || this.defData()
        }
        

        document.getElementById("fillName").value = this.state.name
    }

    // 更新排序
    updataStateTracks() {
        this.state.tracks.forEach(t => {
            t.clips.sort((a, b) => a.start - b.start);
        });
    }

    dataToKonva(callback) {
        this.updataStateTracks();
        this.saveStorage();
        if (this.updataKonvaTimer) {
            clearTimeout(this.updataKonvaTimer);
        }
        this.updataKonvaTimer = setTimeout(() => {
            callback(this.state)
        }, 1000);
    }

    saveStorage() {
        localStorage.setItem("state", JSON.stringify(this.state))
    }
    defData() {
        return {
            name: "",
            scale: 100, // 像素/秒
            currentTime: 0, // 当前播放时间（秒）
            isPlaying: false,
            maxTime: 30, // 时间轴总时长（秒），动态更新
            tracks: [
                // {
                //     id: 'vtid', type: 'video', name: '图像轨道 1',
                //     clips: [
                //         {
                //             id: 'c21', type: "image", categorize: "persion", start: 0, duration: 10, x: 0, y: 0, width: 1920, height: 1080, name: '张三', src: "image/1.jpg"
                //         }
                //     ]
                // },

                // {
                //     id: 'dds', type: 'audio', name: '音频轨道 2',
                //     clips: [
                //         { id: 'c6', start: 8, duration: 10, name: 'sdsd', src: "audio/2.mp3" },
                //         { id: 'c7', start: 1, duration: 3, name: '冒泡', src: "audio/冒泡-WQ20070416.wav" },

                //     ]
                // }
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
