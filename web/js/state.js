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
            this.state = StorageState || this.defData()
        }


        document.getElementById("fillName").value = this.state.name
    }

    // 更新排序
    updataStateTracks() {
        this.state.tracks.forEach(t => {
            t.clips.sort((a, b) => a.start - b.start);
        });
    }
    async dataToKonva(callback) {
        
        await this.autoAllLoadPersonImageData()
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
                //             id: 'c21', type: "image", categorize: "person", start: 0, duration: 10, x: 0, y: 0, width: 1920, height: 1080, name: '张三', src: "image/1.jpg"
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

    // 自动加载人物图片的imagepool
    autoAllLoadPersonImageData() {
        return new Promise(async (resolvemain, reject) => {
            
            let loadList = []
            // 获取所有需要加载的列表
            this.state.tracks.forEach((track) => {
                track.clips.forEach(clip => {
                    if (clip.categorize == "person") {
                        loadList.push(clip)
                    }
                })
            })
            let awaitFile = []
            for (let i = 0; i < loadList.length; i++) {
                let clip = loadList[i]
                let file = new Promise((resolve, reject) => {
                    axios(clip.jsonSrc).then(res => {
                        clip.images = res.data.images
                        resolve()
                    })
                })
                awaitFile.push(file)
            }
            await Promise.all(awaitFile)
            let awaitImg = []
            for (let i = 0; i < loadList.length; i++) {
                let clip = loadList[i]
                clip.images.forEach(item => {
                    let p = new Promise((resolve, reject) => {
                        item.img = new Image()
                        item.img.onload = () => {
                            resolve()
                        }
                        item.img.src = item.src
                    })
                    awaitImg.push(p)
                })
            }
            await Promise.all(awaitImg)
            resolvemain()
        })
    }

}


// ==================== 视频预览 =================
// 视频内容更新
function updateVideoPreview() {
  myState.dataToKonva((instate) => {
    console.log("画布重新画 ----reStart---- 画布重新画")
    stopPlayback()
    myStage.reStart(instate)
    myAudio.reStart(instate)
  })

}