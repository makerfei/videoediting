async function exportAllFramesAsZip(inmyStage) {
    const zip = new JSZip();
    let fps = 60
    let totalFrames = inmyStage.masterTimeline.totalDuration()*fps
    let tl = inmyStage.masterTimeline
    let stage = inmyStage.stage

    //        const duration = tl.totalDuration();
    // const fps = 30;
    // const totalFrames = Math.ceil(duration * fps);

    // console.log(`视频时长: ${duration}s`);
    // console.log(`帧率: ${fps}fps`);
    // console.log(`总帧数: ${totalFrames}`);
    for (let i = 0; i < totalFrames; i++) {
        const time = i / fps;

        tl.time(Math.min(time, tl.totalDuration()));
        stage.batchDraw();

        const dataURL = stage.toDataURL({ pixelRatio: 2 });

        // 去掉 base64 前缀
        const base64 = dataURL.split(',')[1];
        const filename = `frame_${String(i).padStart(4, '0')}.png`;

        zip.file(filename, base64, { base64: true });

        console.log(`已打包: ${i + 1}/${totalFrames}`);
    }

    // 生成 ZIP 并下载
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'frames.zip';
    a.click();
    URL.revokeObjectURL(url);

    console.log('✅ ZIP 下载完成！');
}


document.getElementById("exportBtnVideo").onclick=function(){
    exportAllFramesAsZip(myStage)
}
