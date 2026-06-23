class myAudioClass {
    constructor(instate) {
        this.state = {}
        this.allAudio = []
        this.mergedBuffer = null
        this.audioCtx = null
        this.source = null
    }
    async reStart(instate) {
        this.state = {
            ...instate,
            tracks: instate.tracks.filter(f => f.type === "audio")
            //     {
            //             id: 'dds', type: 'audio', name: '音频轨道 2',
            //             clips: [
            //                 { id: 'c6', start: 8, duration: 10, name: 'sdsd', src: "audio/2.mp3" },
            //                 { id: 'c7', start: 1, duration: 3, name: '冒泡', src: "audio/冒泡-WQ20070416.wav" },

            //             ]
            //         }
        }


        this.getAllVideo(this.state.tracks)
       
        this.syntheticVoice(this.allAudio, this.state.maxTime)
    }

    getAllVideo(tracks) {
        this.allAudio = []
        tracks.forEach(t => {
            t.clips.forEach(c => {
                this.allAudio.push(c)
            })
        });
    }


    async syntheticVoice(audioConfigs, masterDuration = null) {
       
        // 1. 创建 AudioContext
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        try {
            // 2. 并行加载并解码所有音频文件
            // 保留原始 buffer 以便后续处理
            const loadedData = await Promise.all(
                audioConfigs.map(async (config) => {
                    const response = await fetch(config.src);
                    const arrayBuffer = await response.arrayBuffer();
                    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                    return {
                        buffer: audioBuffer,
                        startTime: config.start, // 用户设定的开始时间（秒）
                        duration: config.duration
                    };
                })
            );

            if (loadedData.length === 0) return;

            // 3. 确定主轨道的参数（采样率、声道数）
            // 假设所有音频采样率和声道数一致，以第一个为准
            const sampleRate = loadedData[0].buffer.sampleRate;
            const numberOfChannels = loadedData[0].buffer.numberOfChannels;

            // 进行裁剪
            loadedData.forEach((item) => {
                let { buffer, startTime, duration } = item
                if (buffer.duration > duration) {
                    item.buffer = this.cropAudioBuffer(buffer, 0, duration)
                }
            });

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
            this.mergedBuffer = mergedBuffer

        } catch (error) {
            console.error('音频合并或播放失败:', error);
        }
    }




    /**
     * 裁剪 AudioBuffer
     * @param {AudioBuffer} buffer - 原始缓冲区
     * @param {number} startSeconds - 裁剪开始时间（秒）
     * @param {number} durationSeconds - 裁剪持续时间（秒）
     * @returns {AudioBuffer} - 新的裁剪后的缓冲区
     */
    cropAudioBuffer(buffer, startSeconds, durationSeconds) {
        const sampleRate = buffer.sampleRate;
        const channels = buffer.numberOfChannels;

        // 计算采样点索引
        const startOffset = Math.floor(startSeconds * sampleRate);
        const endOffset = Math.min(Math.floor((startSeconds + durationSeconds) * sampleRate), buffer.length);
        const frameCount = endOffset - startOffset;

        if (frameCount <= 0) return null;
        let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        // 创建新的空 Buffer
        const newBuffer = audioCtx.createBuffer(channels, frameCount, sampleRate);

        // 逐个声道复制数据
        for (let channel = 0; channel < channels; channel++) {
            const oldData = buffer.getChannelData(channel);
            const newData = newBuffer.getChannelData(channel);

            // 使用 subarray 或 slice 高效复制
            // oldData.subarray(start, end) 返回一个视图，newData.set 将其写入
            newData.set(oldData.subarray(startOffset, endOffset));
        }

        return newBuffer;
    }




    bufferToWave(abuffer, len) {
        let numOfChan = abuffer.numberOfChannels,
            length = len * numOfChan * 2 + 44,
            buffer = new ArrayBuffer(length),
            view = new DataView(buffer),
            channels = [], i, sample,
            offset = 0,
            pos = 0;

        // 写入 WAV 文件头
        setUint32(0x46464952);                         // "RIFF"
        setUint32(length - 8);                         // file length - 8
        setUint32(0x45564157);                         // "WAVE"

        setUint32(0x20746d66);                         // "fmt " chunk
        setUint32(16);                                 // length = 16
        setUint16(1);                                  // PCM (uncompressed)
        setUint16(numOfChan);
        setUint32(abuffer.sampleRate);
        setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
        setUint16(numOfChan * 2);                      // block-align
        setUint16(16);                                 // 16-bit (hardcoded in this demo)

        setUint32(0x61746164);                         // "data" - chunk
        setUint32(length - pos - 4);                   // chunk length

        // 写入交错数据
        for (i = 0; i < abuffer.numberOfChannels; i++)
            channels.push(abuffer.getChannelData(i));

        while (pos < length) {
            for (i = 0; i < numOfChan; i++) {             // interleave channels
                sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
                view.setInt16(pos, sample, true);          // write 16-bit sample
                pos += 2;
            }
            offset++                                     // next source sample
        }

        // 创建 Blob 并下载
        return new Blob([buffer], { type: "audio/wav" });

        function setUint16(data) {
            view.setUint16(pos, data, true);
            pos += 2;
        }

        function setUint32(data) {
            view.setUint32(pos, data, true);
            pos += 4;
        }
    }

    // // 使用示例
    // const wavBlob = bufferToWave(myAudioBuffer, myAudioBuffer.length);
    // const url = URL.createObjectURL(wavBlob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = 'manual-export.wav';
    // a.click();


    /**
 * 将 AudioBuffer 上传到服务器
 * @param {AudioBuffer} audioBuffer - 音频缓冲区
 * @param {string} uploadUrl - 后端接收文件的接口地址
 * @param {string} fileName - 文件名
 */
    uploadFrame() {
       
        const formData = new FormData();
        const wavBlob = this.bufferToWave(this.mergedBuffer, this.mergedBuffer.length);
        // 字段名必须与后端解析的 name == 'file' 和 name == 'index' 一致
        formData.append('file', wavBlob, 'audio.wav');
        formData.append('index', '00000');
        return fetch(UPLOAD_API_URL, {
            method: 'POST',
            body: formData
            // 不要手动设置 Content-Type，浏览器会自动设置 boundary
        }).then(response => {
            const result = response.json();
            if (response.ok) {
                console.log('上传成功:', result);
            } else {
                console.error('上传失败:', result.error);
            }
            return response
        })
    }


    startPlayback(time) {
       
            // 8. 播放合并后的音频
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.source = this.audioCtx.createBufferSource();
            this.source.buffer = this.mergedBuffer;
            this.source.connect(this.audioCtx.destination);
            this.source.start(0, time);
       

    }
    stopPlayback() {
        this.source && this.source.stop();
    }
}