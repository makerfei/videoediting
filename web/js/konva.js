// 1. 初始化舞台
class myStageClass {
    constructor() {
        this.stage = new Konva.Stage({ container: 'preview-placeholder', width: 1920, height: 1080 });
        this.masterTimeline = null
        let localkeyframes = localStorage.getItem("keyframes")
        this.keyframes = localkeyframes ? JSON.parse(localkeyframes) : []; // 存储关键帧数据 按物体分类。  [{name:"clipid",islaod,trackid,keyframes:[x,y,z,k]}]
        let localInsetkeyframes = localStorage.getItem("insetkeyframes")
        this.insetkeyframes = localInsetkeyframes ? JSON.parse(localInsetkeyframes) : []
        this.imagePool = new ImagePool();
        this.stage.on('click', (e) => {
            this.stageClick(e)
        });
        this.stage.on('wheel', (e) => {
            e.evt.preventDefault();
            this.wheel(e)
        })
    }
    wheel(e) {
        const oldScale = this.stage.scaleX();
        const pointer = this.stage.getPointerPosition();

        // 1. 计算鼠标在“舞台内部坐标系”中的相对位置
        const mousePointTo = {
            x: (pointer.x - this.stage.x()) / oldScale,
            y: (pointer.y - this.stage.y()) / oldScale,
        };

        // 2. 计算新缩放比例
        const delta = e.evt.deltaY < 0 ? 1.1 : 0.9;
        let newScale = oldScale * delta;

        // 设置缩放范围
        const MIN_SCALE = 1; // 建议允许缩小
        const MAX_SCALE = 4;
        newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

        // 3. 应用新缩放
        this.stage.scale({ x: newScale, y: newScale });

        // 4. 计算新的舞台位置（以鼠标为中心）
        let newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        // 5. 【关键】边界限制逻辑
        const stageWidth = this.stage.width();
        const stageHeight = this.stage.height();

        // 获取内容的实际尺寸和位置
        // 假设你的主要内容在一个名为 mainLayer 的层或 group 中
        // 如果没有特定层，可以使用 stage.getClientRect() 获取所有内容的包围盒
        const contentRect = this.stage.getClientRect();
        // 注意：getClientRect() 返回的是绝对坐标，需要转换为相对于 stage(0,0) 的尺寸
        // 更简单的做法：如果你知道内容初始大小是 stageWidth x stageHeight，可以直接用：

        // 方案 A：基于已知内容初始大小（假设内容初始填满舞台）
        const initialContentWidth = stageWidth;
        const initialContentHeight = stageHeight;

        const currentContentWidth = initialContentWidth * newScale;
        const currentContentHeight = initialContentHeight * newScale;

        // 方案 B（更推荐）：基于实际 Layer/Group 的边界
        // const layer = this.mainLayer; // 替换为你的主图层
        // const currentContentWidth = layer.width() * newScale;
        // const currentContentHeight = layer.height() * newScale;

        // --- 开始限制边界 ---

        // 1. 限制左上角：内容不能向右下偏移导致左上留白
        if (newPos.x > 0) {
            newPos.x = 0;
        }
        if (newPos.y > 0) {
            newPos.y = 0;
        }

        // 2. 限制右下角：内容不能向左上偏移导致右下留白
        // 公式：舞台位置 + 内容宽度 >= 舞台宽度
        // 即：舞台位置 >= 舞台宽度 - 内容宽度
        const minX = stageWidth - currentContentWidth;
        const minY = stageHeight - currentContentHeight;

        if (newPos.x < minX) {
            newPos.x = minX;
        }
        if (newPos.y < minY) {
            newPos.y = minY;
        }

        // 3. 特殊情况：如果内容比舞台小（缩放很小），强制居中
        if (currentContentWidth < stageWidth) {
            newPos.x = (stageWidth - currentContentWidth) / 2;
        }
        if (currentContentHeight < stageHeight) {
            newPos.y = (stageHeight - currentContentHeight) / 2;
        }

        this.stage.position(newPos);
        this.stage.batchDraw();

    }


    reSetKeyframes(inData) {
        this.keyframes = inData.keyframes
        this.insetkeyframes = inData.insetkeyframes
    }
    async reStart(instate) {
        // 一行代码替代整个循环
        this.stage.destroyChildren();
        if (this.masterTimeline) this.masterTimeline.kill();
        altconHideUI()
        this.shape = {}// 存储所有形状引用 轨道和元素混用
        this.state = {
            ...instate,
            tracks: instate.tracks.filter(f => f.type === "video"),
            scale: instate.tracks.find(s => s.type == "scale"),
            show: instate.tracks.find(s => s.type == "show"),
        }
        // 获取
        await this.imagePool.preloadAll(getTracksImage(this.state.tracks))

        this.tr = null;
        this.selectedNode = null;
        this.selectedclipId = null;
        this.selectedtrackId = null

        this.createTr()
        this.createLayer()
        this.createNode()
        this.delErrorkeyframes()
        this.rebuildTimeline()

    }
    createTr() {
        this.tr = new Konva.Transformer({
            // --- 外框样式 ---
            borderStroke: '#ff0000',      // 红色边框
            borderStrokeWidth: 8,         // 边框加粗为 3px
            borderDash: [6, 2],           // 虚线间隔

            // --- 控制手柄样式 ---
            anchorSize: 30,               // 手柄变大
            anchorFill: '#ffff00',        // 黄色填充
            anchorStroke: '#000000',      // 黑色描边
            anchorStrokeWidth: 8,         // 描边加粗
            // --- 功能配置 ---
            rotateEnabled: true,
            keepRatio: true
        });
        // 1. 监听变换结束（缩放、旋转）
        this.tr.on('transformend', () => {
            // this.stage.draw();
            // getResult(konvaImg);
        });
    }
    // 创建图层
    createLayer() {

        // 重要：重绘舞台以反映变化
        // this.stage.draw();
        this.state.tracks.forEach((e, i) => {
            const layer = new Konva.Layer();
            // layer.setZIndex(i)
            this.shape[e.id] = layer
            layer.add(this.tr);
            this.stage.add(layer)
        })
    }
    // 创建createNode
    createNode() {
        this.state.tracks.forEach((t, i) => {
            t.clips.forEach((c, j) => {
                let track = t;
                let clip = c
                if (this.shape[clip.id]) return;
                let img = this.imagePool.get(c.src, 0)
                const konvaImg = new Konva.Image({
                    x: clip.x > -1 ? clip.x : 100,
                    y: clip.y > -1 ? clip.y : 100,
                    width: clip.width ? clip.width : img.width,
                    height: clip.height ? clip.height : img.height,
                    image: img,
                    draggable: true,
                });
                this.shape[track.id].add(konvaImg);
                konvaImg.visible(false)
                this.shape[clip.id] = konvaImg
                this.addDefKeyframes(track, clip)
                konvaImg.on('click', (e) => {
                    altconShowUI()
                    console.log('图片被点击了！');
                    e.cancelBubble = true; // ✅ 关键：阻止冒泡
                    this.tr.nodes([konvaImg]);
                    this.shape[track.id].batchDraw();
                    this.selectedNode = konvaImg;
                    this.selectedclipId = clip.id;
                    this.selectedtrackId = track.id;
                    let keyframe = this.keyframes.find(s => s.clipid === clip.id)
                    let insetkeyframesItem = this.insetkeyframes.find(k => k.clipid == clip.id)
                    myitemKeyframe.show(keyframe, insetkeyframesItem)
                });
                // 2. 监听拖拽结束（移动位置）
                konvaImg.on('dragend', () => {
                    // this.stage.draw();
                });
            })
        })
    }

    // 其他位置点击
    stageClick(e) {
        if (e.target === this.stage) {
            console.log('点击了空白处');
            this.tr.nodes([]);
            altconHideUI()
            // this.stage.draw()
        }
    }
    // addDefKeyframes 添加默认的Keyframes
    addDefKeyframes(t, c) {
        let keyframe = this.keyframes.find(s => s.clipid === c.id)
        if (!keyframe || !keyframe.key || keyframe.key.length < 2) {
            let rect = this.shape[c.id]
            this.keyframes.push({
                clipid: c.id,
                trackid: t.id,
                key: [
                    { "time": c.start, data: { src: c.src, x: rect.x(), y: rect.y(), width: rect.width(), height: rect.height(), rotation: rect.rotation(), scaleX: rect.scaleX(), scaleY: rect.scaleY(), opacity: 1 } },
                    { "time": c.start + c.duration, data: { src: c.src, x: rect.x(), y: rect.y(), width: rect.width(), height: rect.height(), rotation: rect.rotation(), scaleX: rect.scaleX(), scaleY: rect.scaleY(), opacity: 1 } }
                ]
            })
        } else {
            keyframe.trackid = t.id
            keyframe.key[0]["time"] = c.start
            keyframe.key[1]["time"] = c.start + c.duration
        }

        this.keyframes.sort((a, b) => a.key[0].time - b.key[0].time)


    }

    //  --- 核心逻辑：重建时间轴 ---
    rebuildTimeline() {
        const _this = this;
        if (this.masterTimeline) this.masterTimeline.kill();
        if (this.keyframes.length === 0) return;
        this.masterTimeline = gsap.timeline({
            paused: true,
            onComplete: () => {
                console.log("rebuildTimeline线程完成")
                this.syncToTime(0)
                stopPlayback()
            },
            onStart: () => {

            },
            onUpdate: function () {
                _this.state.currentTime = _this.masterTimeline.time()
                animatePlayhead(_this.masterTimeline.time())
            }
        });
        let finalkeyframes = []
        for (let i = 0; i < this.keyframes.length; i++) {
            const currItem = this.keyframes[i];
            let clip = this.shape[currItem.clipid]
            // 获取其插入的关键帧
            let inSertkey = this.insetkeyframes.find(k => k.clipid == currItem.clipid)

            let startTime = currItem.key[0].time
            let endTime = currItem.key[currItem.key.length - 1].time;
            let newCurrtimeKey = []

            // 找出当前的人物属性
            let stateTrack = this.state.tracks.find(i => i.id == currItem.trackid)
            let stateClip = stateTrack.clips.find(i => i.id == currItem.clipid)
            
            let categorize =  stateClip.categorize

            
               
           


            newCurrtimeKey.push({ ...currItem.key[0], data: { ...currItem.key[0].data, trackid: currItem.trackid, categorize } })

            if (inSertkey) {
                inSertkey.key.forEach(k => {
                    if ((startTime + k.time) < endTime) {
                        newCurrtimeKey.push({
                            ...k, data: { ...k.data, trackid: currItem.trackid, categorize },
                            time: startTime + k.time,
                        })
                    }
                })
            }

            newCurrtimeKey.push({ ...currItem.key[1], data: { ...currItem.key[1].data, trackid: currItem.trackid, categorize } })

            for (let j = 0; j < newCurrtimeKey.length; j++) {

                const curr = newCurrtimeKey[j];
                const prev = j > 0 ? newCurrtimeKey[j - 1] : null;
                // 计算开始时间：如果是第一帧，时间为0；否则为上一帧的时间
                const startTime = curr.time;

                const prevImage = prev ? prev.data.src : null;
                const currImage = curr.data.src;
                // 计算持续时间：如果是第一帧，无需duration；否则为当前帧与上一帧的时间差
                const duration = prev ? (curr.time - prev.time) : 0;

                duration ? finalkeyframes.push({
                    clip,
                    data: curr.data,
                    duration: duration,
                    startTime: prev.time,

                }) : finalkeyframes.push({
                    clip,
                    data: curr.data,
                    startTime: curr.time,
                })
            }
        }
        finalkeyframes.sort((a, b) => b.startTime - b.startTime)
        console.log(finalkeyframes)

        // 页面元素动画

        for (let k = 0; k < finalkeyframes.length; k++) {
            let finalkeyframesItem = finalkeyframes[k]
            let clip = finalkeyframesItem.clip
            let duration = finalkeyframesItem.duration
            let startTime = finalkeyframesItem.startTime
            let data = finalkeyframesItem.data

            const { x, y, scaleX, scaleY, rotation, opacity, width, height, trackid } = data;

            clip ? duration ? this.masterTimeline.to(clip, {
                x, y, rotation, scaleX, scaleY, width, height,
                duration: duration,
                ease: "none",
                onStart: () => {

                    console.log("onStart动画显示开始")
                    clip.visible(this.isShowClipByShowTrack(_this.state.currentTime, trackid)); // 确保动画开始时元素是可见的
                    // clip.opacity(1);    // 确保起始透明度正确（如果 curr.data 不包含 opacity 起始值）
                },
                onComplete: () => {
                    console.log("onComplete动画结束后隐藏")
                    clip.visible(false); // 动画结束后隐藏
                },
                onUpdate: () => {
                        
                    // 展示图片全凭逻辑画
                    clip.visible(this.isShowClipByShowTrack(_this.state.currentTime, trackid));
                    //需要合成标识
                    if (data.categorize == "person") {
                        let fps = 24;
                        
                        if (Math.floor((_this.state.currentTime * fps) % 1) == 0) {
                            // 图片人物的逻辑
                            clip.image( personLinkTrack({...data,currentTime:_this.state.currentTime}))

                           
                        }
                    } else if (data.src.toLowerCase().endsWith('.gif') && _this.state.currentTime > startTime) {
                        let fps = _this.imagePool.gifFpt(data.src)
                        if (Math.floor((_this.state.currentTime * fps) % 1) == 0) {
                            // 此处判断
                            let index = Math.floor(((_this.state.currentTime - startTime) * fps) / 1)
                            clip.image(_this.imagePool.get(data.src, index))
                            clip.getLayer().batchDraw();
                        }
                    }
                }
            }, startTime) : this.masterTimeline.set(clip, { x, y, rotation, scaleX, scaleY, width, height }, startTime) : null;
        }

        // 主窗口动画

        this.state.scale && this.state.scale.clips.forEach(s => {
            s.duration > 0.4 ? this.masterTimeline.to(this.stage, {
                x: s.x,
                y: s.y,
                scaleX: s.scale,
                scaleY: s.scale,
                duration: s.duration,
                ease: "none",
                onUpdate: () => this.stage.batchDraw()
            }, s.start) :
                this.masterTimeline.set(this.stage, {
                    x: s.x,
                    y: s.y,
                    scaleX: s.scale,
                    scaleY: s.scale,

                    onUpdate: () => this.stage.batchDraw()
                }, s.start)
        })


        this.savelocaKeyframes()
        this.syncToTime(state.currentTime)
    }

    // 删除错误的keyframes 和 insetkeyframes
    delErrorkeyframes() {
        this.keyframes = this.keyframes.filter(k => {
            return this.shape[k.clipid];
        });
        this.insetkeyframes = this.insetkeyframes.filter(k => {
            return this.shape[k.clipid];
        });
    }
    //  调整时间
    syncToTime(time) {
        if (!this.masterTimeline) return;
        console.log("syncToTime", time)
        this.contorlClipVisible(time)
        this.state.currentTime = time
        state.currentTime = time
        this.masterTimeline.time(time);
    }

    // 判断show图层是否选中次图层
    isShowClipByShowTrack(currTime, showType) {
        let isShow = !this.state.show;
        this.state.show && this.state.show.clips.forEach(c => {
            if (c.start <= currTime && (c.start + c.duration) > currTime && c.name == showType.split("-")[0]) {
                isShow = true
            }
        })
        return isShow
    }
    contorlClipVisible(time) {
        if (time == null) {
            console.log("contorlClipVisible 传入时间")
        }
        for (let i = 0; i < this.keyframes.length; i++) {
            const currItem = this.keyframes[i];
            let clip = this.shape[currItem.clipid]
            if (!clip) return
            const curr = currItem.key[0];
            const last = currItem.key[currItem.key.length - 1]
            // 计算开始时间：如果是第一帧，时间为0；否则为上一帧的时间
            const startTime = curr.time;
            const endTime = last.time
            // 计算持续时间：如果是第一帧，无需duration；否则为当前帧与上一帧的时间差

            // 添加show轨道是否选中逻辑
            if (startTime <= time && endTime > time && this.isShowClipByShowTrack(time, currItem.trackid)) {
                clip.visible(true); // 确保动画开始时元素是可见的
                // clip.opacity(1);    // 确保起始透明度正确（如果 curr.data 不包含 opacity 起始值）
            } else {
                clip.visible(false);
            }

        }
    }

    startPlayback(time) {
        if (!this.masterTimeline) return;
        this.syncToTime(time)
        this.masterTimeline.resume();
        // this.masterTimeline.restart();
    }
    stopPlayback() {
        if (!this.masterTimeline) return;
        this.masterTimeline.pause();
    }

    //------- 对关键帧的操作--------
    savelocaKeyframes() {
        localStorage.setItem("insetkeyframes", JSON.stringify(this.insetkeyframes))
        localStorage.setItem("keyframes", JSON.stringify(this.keyframes))

    }
    getItemAllKeylist(clipid) {
        let keyframes = this.keyframes.find(k => k.clipid == clipid)

        return { keyframes }
    }
    setKeyframesPost(clipid, list) {
        let keyframes = this.keyframes.find(k => k.clipid == clipid)
        let rect = this.shape[clipid]
        // ✅ 正确：获取相对于舞台的绝对坐标
        list.forEach(index => {
            keyframes.key[index].data = {
                ...keyframes.key[index].data,
                x: rect.x(),
                y: rect.y(),
                width: rect.width(),
                height: rect.height(),
                rotation: rect.rotation(),
                scaleX: rect.scaleX(),
                scaleY: rect.scaleY(),
            }
        })
        this.rebuildTimeline()
        let insetkeyframesItem = this.insetkeyframes.find(k => k.clipid == clipid)
        myitemKeyframe.show(keyframes, insetkeyframesItem)
    }
    // 添加过渡动画
    addkeyFrame(time) {

        let insetkeyframesItem = this.insetkeyframes.find(k => k.clipid == this.selectedclipId)
        let trackItem = this.state.tracks.find(t => t.id == this.selectedtrackId)
        let clipItem = trackItem.clips.find(c => c.id == this.selectedclipId)
        let rect = this.selectedNode


        let addItem = {
            time: time - clipItem.start,
            data: {
                // src:clipItem.src,
                src: "image/2.png",
                x: rect.x(),
                y: rect.y(),
                width: rect.width(),
                height: rect.height(),
                rotation: rect.rotation(),
                scaleX: rect.scaleX(),
                scaleY: rect.scaleY(),
            }
        }
        if (insetkeyframesItem) {
            insetkeyframesItem.key.push(addItem)
        } else {
            this.insetkeyframes.push({
                clipid: this.selectedclipId,
                key: [{ ...addItem }]
            })
        }
        // 进行排序
        insetkeyframesItem = this.insetkeyframes.find(k => k.clipid == this.selectedclipId)
        insetkeyframesItem.key.sort((a, b) => a.time - b.time);



        insetkeyframesItem = this.insetkeyframes.find(k => k.clipid == this.selectedclipId)
        let keyframes = this.keyframes.find(k => k.clipid == this.selectedclipId)
        this.rebuildTimeline()

        myitemKeyframe.show(keyframes, insetkeyframesItem)
    }
    delKeyframes(clipid, index) {
        let delkeyframesItem = this.insetkeyframes.find(k => k.clipid == clipid)
        if (!delkeyframesItem) return
        delkeyframesItem.key.splice(index, 1)
        let keyframes = this.keyframes.find(k => k.clipid == this.selectedclipId)
        let keyframesItem = this.insetkeyframes.find(k => k.clipid == clipid)
        this.rebuildTimeline()

        myitemKeyframe.show(keyframes, keyframesItem)

    }
}








