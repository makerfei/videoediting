const tl = gsap.timeline({
    // --- 常用控制 ---
    paused: true,       // 【重要】创建后是否暂停。设为 true 可手动控制播放时机
    repeat: 0,          // 重复次数。-1 为无限循环
    yoyo: false,        // 是否往返运动（配合 repeat 使用）
    delay: 0,           // 开始前的延迟时间（秒）

    // --- 回调函数 (Hooks) ---
    onStart: () => { console.log("开始"); },
    onComplete: () => { console.log("结束"); },
    onReverseComplete: () => { console.log("回放结束"); },
    
    // 【Konva 关键】每帧更新回调
    // 注意：通常不在这里写 batchDraw，而是在每个 .to() 中写，
    // 但如果所有动画都操作同一图层，也可以在这里统一处理（需配合 invalidate）
    onUpdate: () => { 
        // 如果所有动画都在同一个 layer，可以在此统一重绘
        // layer.batchDraw(); 
    }
});
