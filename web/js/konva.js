// 1. 初始化舞台
class myStageClass {
    constructor(instate) {
        this.stage = new Konva.Stage({ container: 'preview-placeholder', width: 1920, height: 1080 });
        this.masterTimeline = null
        this.keyframes = []; // 存储关键帧数据 按物体分类。  [{name:"clipid",islaod,trackid,keyframes:[x,y,z,k]}]

        this.insetkeyframes = []

        this.stage.on('click', (e) => {
            this.stageClick(e)
        });
        this.reStart(instate)

    }
    reStart(instate) {
        const layers = this.stage.getChildren(); // 获取所有图层
        // 遍历并销毁每个图层
        layers.forEach((layer) => {
            layer.destroy();
        });
        // 重要：重绘舞台以反映变化
        this.stage.draw();
        this.keyframes.forEach(e => {
            e = { ...e, isload: false }
        })

        this.shape = {}// 存储所有形状引用 轨道和元素混用
        this.state = {
            ...instate,
            tracks: instate.tracks.filter(f => f.type !== "audio")
        }
        console.log('-----', this.state)
        this.tr = null;
        this.selectedNode = null;
        this.selectedclipId = null;
        this.selectedtrackId = null

        this.createTr()
        this.createLayer()
        this.createNode()
        // this.rebuildTimeline()

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
            this.stage.draw();
            // getResult(konvaImg);
        });
    }

    // 创建图层
    createLayer() {
        this.state.tracks.forEach((e, i) => {
            const layer = new Konva.Layer();
            layer.setZIndex(i)
            this.shape[e.id] = layer
            layer.add(this.tr);
            this.stage.add(layer)
        })
    }
    // 创建createNode
    createNode() {
        this.state.tracks.forEach((t, i) => {
            t.clips.forEach((c, j) => {
                const img = new Image();
                img.src = c.src;
                img.onload = () => {
                    this.imageOnload(t, c, img)
                }
            })
        })
    }
    imageOnload(track, clip, img) {

        if (this.shape[clip.id]) return;
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
            console.log('图片被点击了！');
            e.cancelBubble = true; // ✅ 关键：阻止冒泡
            this.tr.nodes([konvaImg]);
            this.shape[track.id].batchDraw();
            this.selectedNode = konvaImg;
            this.selectedclipId = clip.id;
            this.selectedtrackId = track.id;

            let keyframe = this.keyframes.find(s => s.clipid === clip.id)
            let insetkeyframesItem = this.insetkeyframes.find(k => k.clipid == clip.id)
            myitemKeyframe.show(keyframe,insetkeyframesItem)
        });
        // 2. 监听拖拽结束（移动位置）
        konvaImg.on('dragend', () => {
            this.stage.draw();
        });

    };
    // 其他位置点击
    stageClick(e) {
        if (e.target === this.stage) {
            console.log('点击了空白处');
            this.tr.nodes([]);
            this.stage.draw()
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
                isload: true,
                key: [
                    { "time": c.start, data: { x: rect.x(), y: rect.y(), width: rect.width(), height: rect.height(), rotation: rect.rotation(), scaleX: rect.scaleX(), scaleY: rect.scaleY(), opacity: 1 } },
                    { "time": c.start + c.duration, data: { x: rect.x(), y: rect.y(), width: rect.width(), height: rect.height(), rotation: rect.rotation(), scaleX: rect.scaleX(), scaleY: rect.scaleY(), opacity: 1 } }
                ]
            })
        } else {
            keyframe.isload = true
            keyframe.trackid = t.id
            keyframe.key[0]["time"] = c.start
            keyframe.key[1]["time"] = c.start + c.duration
        }
        // 加点就重新构建
        this.rebuildTimeline()

    }

    //  --- 核心逻辑：重建时间轴 ---
    rebuildTimeline() {
        const _this = this;
        if (this.masterTimeline) this.masterTimeline.kill();
        let isloadkeyframes = this.keyframes.filter(k => k.isload)


        if (isloadkeyframes.length === 0) return;
        this.masterTimeline = gsap.timeline({
            paused: true,
            onComplete: () => {
                console.log("rebuildTimeline线程完成")
                state.currentTime = 0
                this.masterTimeline.time(0)
                this.contorlClipVisible(0)
                stopPlayback()
            },
            onStart: () => {
                // _this.masterTimeline.time(state.currentTime)
            },
            onUpdate: function () {
                console.log(_this.state.currentTime, "----", _this.masterTimeline.time())

                if (_this.state.currentTime >= _this.masterTimeline.time()) {
                    _this.syncToTime(state.currentTime)
                    animatePlayhead(state.currentTime)

                } else {
                    _this.state.currentTime = _this.masterTimeline.time()
                    animatePlayhead(_this.masterTimeline.time())
                }
            }
        });



        for (let i = 0; i < isloadkeyframes.length; i++) {
            const currItem = isloadkeyframes[i];
            let clip = this.shape[currItem.clipid]
            // 获取其插入的关键帧
            let inSertkey = this.insetkeyframes.find(k=>k.clipid==currItem.clipid) 
            let startTime =  currItem.key[0].time
            let endTime =  currItem.key[currItem.key.length-1].time;

            let newCurrtimeKey = []
            newCurrtimeKey.push(currItem.key[0])

            if(inSertkey){
                inSertkey.key.forEach(k=>{
                     if((startTime+k.time)<endTime){
                        newCurrtimeKey.push({
                            ...k,
                            time:startTime+k.time
                        })
                     }
                })
            }
            newCurrtimeKey.push(currItem.key[1])

            
            for (let j = 0; j < newCurrtimeKey.length; j++) {
                const curr =newCurrtimeKey[j];
                const prev = j >0 ?newCurrtimeKey[j - 1] : null;

                // 计算开始时间：如果是第一帧，时间为0；否则为上一帧的时间
                const startTime = curr.time;
                // 计算持续时间：如果是第一帧，无需duration；否则为当前帧与上一帧的时间差
                const duration = prev ? ( curr.time - prev.time): 0;
                // 【其他帧】保持原有动画效果
                if (j > 0) {
                    this.masterTimeline.to(clip, {
                        ...curr.data,
                        duration: duration,
                        ease: "power1.inOut",
                        onStart: () => {
                            console.log("onStart动画显示开始")
                            clip.visible(true); // 确保动画开始时元素是可见的
                            clip.opacity(1);    // 确保起始透明度正确（如果 curr.data 不包含 opacity 起始值）
                        },
                        onComplete: () => {
                            console.log("onComplete动画结束后隐藏")
                            clip.visible(false); // 动画结束后隐藏
                        }
                    }, prev.startTime); // 注意：to 动画通常从上一帧时间点开始
                } else {
                    // 如果时间差为0，也瞬间设置
                    this.masterTimeline.set(clip, {
                        ...curr.data
                    }, startTime);
                }

            }
        }
        this.contorlClipVisible(state.currentTime)

    }
    //  调整时间
    syncToTime(time) {
        console.log("syncToTime", time)
        if (!this.masterTimeline) return;
        console.log("syncToTime", time)
        this.contorlClipVisible(time)
        this.state.currentTime = time
        state.currentTime = time
        this.masterTimeline.time(time);
        this.stage.draw()

        // console.log("视频内部当前时间",time)
    }
    contorlClipVisible(time) {
        if (time == null) {
            console.log("contorlClipVisible 传入时间")
        }
        console.log("contorlClipVisible", time)
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
            try {
                if (startTime <= time && endTime > time) {
                    clip.visible(true); // 确保动画开始时元素是可见的
                    clip.opacity(1);    // 确保起始透明度正确（如果 curr.data 不包含 opacity 起始值）
                } else {
                    clip.visible(false);
                }
            } catch (error) {
                console.log("错误触发contorlClipVisible", error)
            }
        }
    }

    startPlayback(time) {
        if (!this.masterTimeline) return;
        this.syncToTime(time)
        this.masterTimeline.resume();
        // this.masterTimeline.restart();
    }
    stopPlayback(time) {
        if (!this.masterTimeline) return;
        this.masterTimeline.pause();
    }

    //------- 对关键帧的操作--------
    getItemAllKeylist(clipid) {
        let keyframes = this.keyframes.find(k => k.clipid == clipid)
        return { keyframes }
    }
    setKeyframesPost(clipid, index) {
        let keyframes = this.keyframes.find(k => k.clipid == clipid)
        let rect = this.shape[clipid]
        // ✅ 正确：获取相对于舞台的绝对坐标

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








