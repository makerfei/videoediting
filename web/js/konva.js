// 1. 初始化舞台
class myStageClass {
    constructor(instate) {
        this.stage = new Konva.Stage({ container: 'preview-placeholder', width: 1920, height: 1080 });
        this.masterTimeline = null
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

        this.state = {
            ...instate,
            tracks: instate.tracks.filter(f => f.type !== "audio")
        }
        this.shape = {}// 存储所有形状引用 轨道和元素混用
        this.keyframes = []; // 存储关键帧数据 按物体分类。  [{name:"clipid",trackid,keyframes:[x,y,z,k]}]
        this.tr = null;
        this.selectedNode = null;

        this.createTr()
        this.createLayer()
        this.createNode()

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

            // getResult(konvaImg);
        });
    }

    // 创建图层
    createLayer() {
        this.state.tracks.forEach((e, i) => {
            const layer = new Konva.Layer();
            layer.setZIndex(this.state.tracks.length - i - 1)
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
        const konvaImg = new Konva.Image({
            x: 100,
            y: 100,
            width: img.width,
            height: img.height,
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
            let keyframe = this.keyframes.find(s => s.clipid === clip.id)
            myitemKeyframe.show(keyframe)




        });
        // 2. 监听拖拽结束（移动位置）
        konvaImg.on('dragend', () => {
            // getResult(konvaImg);
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
        let keyframe = this.keyframes.find(s => s.name === c.id)
        if (!keyframe || !keyframe.key || keyframe.key.length < 2) {
            let rect = this.shape[c.id]
            this.keyframes.push({
                clipid: c.id,
                trackid: t.id,
                key: [
                    { "time": c.start, data: { x: rect.x(), y: rect.y(), rotation: rect.rotation(), scaleX: 1, scaleY: 1, opacity: 1 } },
                    { "time": c.start + c.duration, data: { x: rect.x(), y: rect.y(), rotation: rect.rotation(), scaleX: 1, scaleY: 1, opacity: 1 } }
                ]
            })
            // 加点就重新构建
            this.rebuildTimeline()
        }
    }

    //  --- 核心逻辑：重建时间轴 ---
    rebuildTimeline() {
        if (this.masterTimeline) this.masterTimeline.kill();
        if (this.keyframes.length === 0) return;
        this.masterTimeline = gsap.timeline({
            paused: true,
            onComplete: () => {
                state.currentTime = 0
                this.masterTimeline.time(0)
                stopPlayback()
            },
            onStart: () => {
            },
            onUpdate: () => {


            }
        });
        for (let i = 0; i < this.keyframes.length; i++) {
            const currItem = this.keyframes[i];
            let clip = this.shape[currItem.clipid]

            for (let j = 0; j < currItem.key.length; j++) {
                const curr = currItem.key[j];
                const next = j < (currItem.key.length - 1) ? currItem.key[j + 1] : null;

                // 计算开始时间：如果是第一帧，时间为0；否则为上一帧的时间
                const startTime = curr.time;
                // 计算持续时间：如果是第一帧，无需duration；否则为当前帧与上一帧的时间差
                const duration = next ? (next.time - curr.time) : 0;
                // 【其他帧】保持原有动画效果
                if (duration > 0) {
                    this.masterTimeline.to(clip, {
                        ...curr.data,
                        duration: duration,
                        ease: "power1.inOut",
                        onStart: () => {
                            clip.visible(true); // 确保动画开始时元素是可见的
                            clip.opacity(1);    // 确保起始透明度正确（如果 curr.data 不包含 opacity 起始值）
                        },
                        onComplete: () => {
                            clip.visible(false); // 动画结束后隐藏
                        }
                    }, startTime); // 注意：to 动画通常从上一帧时间点开始
                }
                // else {
                //     // 如果时间差为0，也瞬间设置
                //     this.masterTimeline.set(clip, {
                //         ...curr.data
                //     }, startTime);
                // }

            }
        }
        this.contorlClipVisible()

    }
    //  调整时间
    syncToTime(time) {
        if (!this.masterTimeline) return;
        console.log("syncToTime", time)
        this.contorlClipVisible(time)
        this.masterTimeline.time(time);
        // console.log("视频内部当前时间",time)
    }


    contorlClipVisible(time=0) {
        for (let i = 0; i < this.keyframes.length; i++) {
            const currItem = this.keyframes[i];
            let clip = this.shape[currItem.clipid]
            const curr = currItem.key[0];
            const last = currItem.key[currItem.key.length - 1]
            // 计算开始时间：如果是第一帧，时间为0；否则为上一帧的时间
            const startTime = curr.time;
            const endTime = last.time
            // 计算持续时间：如果是第一帧，无需duration；否则为当前帧与上一帧的时间差
            if (startTime <= time && endTime > time) {
                clip.visible(true); // 确保动画开始时元素是可见的
                clip.opacity(1);    // 确保起始透明度正确（如果 curr.data 不包含 opacity 起始值）
            } else {
                clip.visible(false);
            }
        }
    }

    startPlayback(time) {
        if (!this.masterTimeline) return;
        this.masterTimeline.resume();
        // this.masterTimeline.restart();
    }
    stopPlayback(time) {
        if (!this.masterTimeline) return;
        this.masterTimeline.pause();
    }
}

myStage = new myStageClass(state)






