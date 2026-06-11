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

    console.log(`开始上传: 总帧数 ${totalFrames}, 时长 ${tl.totalDuration()}s`);
    inmyStage.syncToTime(0)

    for (let i = 0; i < totalFrames; i++) {
        const time = i / fps;
        // 1. 设置时间轴并重绘
        // 使用 Math.min 防止超出总时长
        tl.time(Math.min(time, tl.totalDuration()));
        stage.batchDraw();
        // 2. 获取图像数据 (Base64)
        // pixelRatio: 2 可以提高清晰度，但会增加数据量，请根据带宽调整
        const dataURL = stage.toDataURL({ pixelRatio: 1 });
        // 提取 base64 内容部分 (去掉 "data:image/png;base64," 前缀)
        const base64Data = dataURL.split(',');
        const filename = `frame_${String(i).padStart(5, '0')}.png`;
        try {
            // 3. 将 Base64 转换为 Blob 以便上传
            // 注意：toDataURL 默认通常是 image/png
            const blob = base64ToBlob(base64Data, 'image/png');
            // 4. 构建 FormData
            const formData = new FormData();
            formData.append('file', blob, filename); // 'file' 是后端接收文件的字段名，需与后端约定
            formData.append('index', i); // 可选：传递帧索引，方便后端排序
            formData.append('total', totalFrames); // 可选：传递总帧数
            // 5. 发送请求到后端接口
            const response = await fetch(UPLOAD_API_URL, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // 可选：解析后端返回结果
            // const result = await response.json();
            console.clear();
            console.log(`✅ 已上传: ${i + 1}/${totalFrames} - ${filename}`);
        } catch (error) {
            console.error(`❌ 上传失败 (帧 ${i}):`, error);
            // 这里可以选择中断循环 break; 或者继续尝试下一帧
        }
        // 【重要】可选：添加短暂延迟，防止请求过快导致浏览器卡顿或服务器限流
        // await new Promise(resolve => setTimeout(resolve, 50)); 
    }

    console.log('🎉 所有帧上传完成！ ', (Date.now() - timestamp) / 1000, '秒');

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
