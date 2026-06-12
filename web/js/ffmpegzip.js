// 假设这是你的后端上传接口地址
const UPLOAD_API_URL = '/api/upload/frame';

/**
 * 辅助函数：将 base64 字符串转换为 Blob 对象
 */
function base64ToBlob(base64, mimeType) {


    const byteCharacters = atob(base64[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}

async function exportAllFramesAsUpload(inmyStage) {
    const timestamp = Date.now();
    console.log(timestamp); // 例如: 1715668800123

    const fps = 24;
    // 确保总帧数计算正确，避免浮点数误差
    let totalFrames = Math.ceil(inmyStage.masterTimeline.totalDuration() * fps);
    let tl = inmyStage.masterTimeline;
    let stage = inmyStage.stage;
    const zip = new JSZip();
    console.log(`开始上传: 总帧数 ${totalFrames}, 时长 ${tl.totalDuration()}s`);
    inmyStage.syncToTime(0)

    for (let i = 0; i < totalFrames; i++) {
        const time = i / fps;
        tl.time(Math.min(time, tl.totalDuration()));
        stage.batchDraw();
        const dataURL = stage.toDataURL({ pixelRatio: 1 });
        const base64Data = dataURL.split(',');
        const filename = `uploaded_frames/frame_${String(i).padStart(5, '0')}.png`;
        const blob = base64ToBlob(base64Data, 'image/png');
        zip.file(`frame_${String(i).padStart(5, '0')}.png`, blob);
        console.log(`✅ 已上传: ${i + 1}/${totalFrames} - ${filename}`);

    }


    const content = await zip.generateAsync({ type: "blob" });

    // 3. 构建 FormData
    const formData = new FormData();
    formData.append('file', content, 'images.zip');
    // 5. 发送请求到后端接口
    const response = await fetch(UPLOAD_API_URL, {
        method: 'POST',
        body: formData
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('🎉 所有帧上传完成！ ', (Date.now() - timestamp) / 1000, '秒');
    await myAudio.uploadFrame()

    axios.post('/api/imagetovideo')
        .then(response => {
            showToast(`视频生成中`)
        })
        .catch(error => {
            showToast(`视频生成失败: ${error}`)
        });
    return
}
// 绑定点击事件
document.getElementById("exportBtnVideo").onclick = function () {
    // 确保 myStage 已经在作用域中可用
    if (typeof myStage !== 'undefined') {
        exportAllFramesAsUpload(myStage);
    } else {
        console.error("myStage 未定义");
    }
};
