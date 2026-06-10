/**
 * 合并多个音频URL并播放，支持自定义开始时间和重叠
 * @param {Array<{url: string, startTime: number}>} audioConfigs - 音频配置数组
 * @param {number} masterDuration - (可选) 主轨道总时长，如果不传则自动计算
 */
async function playOverlappedAudio(audioConfigs, masterDuration = null) {
    // 1. 创建 AudioContext
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    try {
        // 2. 并行加载并解码所有音频文件
        // 保留原始 buffer 以便后续处理
        const loadedData = await Promise.all(
            audioConfigs.map(async (config) => {
                const response = await fetch(config.url);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                return {
                    buffer: audioBuffer,
                    startTime: config.startTime // 用户设定的开始时间（秒）
                };
            })
        );

        if (loadedData.length === 0) return;

        // 3. 确定主轨道的参数（采样率、声道数）
        // 假设所有音频采样率和声道数一致，以第一个为准
        const sampleRate = loadedData[0].buffer.sampleRate;
        const numberOfChannels = loadedData[0].buffer.numberOfChannels;

        // 4. 计算主轨道所需的总长度
        let maxEndTime = 0;
        loadedData.forEach(({ buffer, startTime }) => {
            const endTime = startTime + buffer.duration;
            if (endTime > maxEndTime) {
                maxEndTime = endTime;
            }
        });
        
        // 如果用户指定了更长的 duration，则使用用户的
        const finalDuration = masterDuration ? Math.max(masterDuration, maxEndTime) : maxEndTime;
        const totalSamples = Math.ceil(finalDuration * sampleRate);

        // 5. 创建空的合并缓冲区
        const mergedBuffer = audioCtx.createBuffer(
            numberOfChannels,
            totalSamples,
            sampleRate
        );

        // 6. 将每个音频数据写入合并缓冲区（支持重叠叠加）
        loadedData.forEach(({ buffer, startTime }) => {
            const startOffsetInSamples = Math.floor(startTime * sampleRate);
            
            // 遍历每个声道
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const targetData = mergedBuffer.getChannelData(channel);
                const sourceData = buffer.getChannelData(channel);
                
                // 将源音频数据叠加到目标位置
                for (let i = 0; i < sourceData.length; i++) {
                    const targetIndex = startOffsetInSamples + i;
                    
                    // 确保不越界
                    if (targetIndex < totalSamples) {
                        // 简单叠加：直接相加
                        // 注意：如果重叠部分很多，音量可能会爆炸，建议后续做限幅处理
                        targetData[targetIndex] += sourceData[i];
                    }
                }
            }
        });

        // 7. 【重要】防止爆音（Clipping）
        // 遍历所有数据，如果超过 [-1, 1] 范围，进行压缩或裁剪
        // 这里使用简单的硬裁剪（Hard Clipping），生产环境建议使用动态范围压缩
        for (let channel = 0; channel < numberOfChannels; channel++) {
            const data = mergedBuffer.getChannelData(channel);
            for (let i = 0; i < data.length; i++) {
                if (data[i] > 1) data[i] = 1;
                else if (data[i] < -1) data[i] = -1;
            }
        }

        // 8. 播放合并后的音频
        const source = audioCtx.createBufferSource();
        source.buffer = mergedBuffer;
        source.connect(audioCtx.destination);
        
        source.start(0); // 立即播放
        
        source.onended = () => {
            console.log('重叠音频播放结束');
            // audioCtx.close(); 
        };

    } catch (error) {
        console.error('音频合并或播放失败:', error);
    }
}

// --- 使用示例 ---

const audioConfigs = [
    { url: '1.mp3', startTime: 0 },   // 第0秒开始
    { url: '2.mp3', startTime: 1.5 }, // 第1.5秒开始（与sound1重叠）
  
];

document.getElementById('playBtn').addEventListener('click', () => {
    playOverlappedAudio(audioConfigs);
});
