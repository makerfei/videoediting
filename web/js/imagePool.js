/**
 * 纯图片预加载池 (Image Preload Pool)
 * 仅负责加载和缓存 HTMLImageElement，不涉及 Konva 节点管理
 */
class ImagePool {
    constructor() {
        this.imageList = new Map();
        this.setdefimg()
    }
    async setdefimg() {
        let img = await createEmptyPngCanvas(200, 200)
      
        this.imageList.set("", img)
    }

    /**
     * 预加载单张图片
     * @param {string} url - 图片地址
     * @returns {Promise<HTMLImageElement>} - 返回加载完成的 Image 对象
     */

    imageType(url) {
        let isGif = url.toLowerCase().endsWith('.gif')
        let isPngOrjpg = url.toLowerCase().endsWith('.png') || url.toLowerCase().endsWith('.jpg')
        return { isGif, isPngOrjpg }
    }
    preload(url) {
        let { isGif, isPngOrjpg } = this.imageType(url)
        return isPngOrjpg ? this.preloadImage(url) :
            isGif ? this.preloadGif(url) : Promise.resolve()
    }

    preloadGif(url) {

        return new Promise(async (resolve, reject) => {
            if (this.imageList.get(url)) {
                resolve()
            }
            // 1. 获取 GIF 的二进制数据
            const response = await fetch(url);
            const buffer = await response.arrayBuffer();
            const data = new Uint8Array(buffer);
            // 2. 创建 ImageDecoder
            const imageDecoder = new ImageDecoder({
                data: buffer,
                type: 'image/gif'
            });
            // 3. 等待元数据加载完成
            await imageDecoder.completed
            setTimeout(async () => {
                const track = imageDecoder.tracks.selectedTrack;
                const frameCount = track.frameCount;
                console.log("frameCount----gif", frameCount)
                const frames = [];
                // 4. 逐帧解码
                let durationcount = 0
                for (let i = 0; i < frameCount; i++) {
                    // decode 返回一个 Promise，解析后得到 VideoFrame 或 ImageBitmap
                    const result = await imageDecoder.decode({ frameIndex: i });
                    // 将帧转换为 CanvasImageSource (ImageBitmap)
                    // 注意：VideoFrame 需要绘制到 canvas 或直接使用 createImageBitmap
                    const bitmap = await createImageBitmap(result.image);

                    frames.push({
                        image: bitmap,
                        fps: Math.floor(1000000 / result.image.duration)  //fps 帧持续时间（微秒）
                    });
                    // 关闭上一帧以释放内存
                    result.image.close();
                }
                this.imageList.set(url, frames)
                resolve()
            }, 50);
        })
    }
    preloadImage(url) {
        return new Promise(async (resolve, reject) => {
            if (this.imageList.get(url)) {
                resolve()
            }
            const img = new Image();
            // 处理跨域问题（Konva 导出图片时需要）
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                this.imageList.set(url, img)
                resolve(img);

            };
            img.src = url;
        })
    }

    /**
     * 批量预加载图片
     * @param {string[]} urls - 图片地址数组
     * @returns {Promise<HTMLImageElement[]>} - 所有图片加载完成后返回数组
     */
    preloadAll(urls) {
        const promises = []
       let newurls = [...urls,"image/2.png"]
        newurls.forEach(url => {
            promises.push(this.preload(url))
        })
        return Promise.all(promises);
    }
    // 此处有循环播放的意思
    get(url, index = 0) {
        if (!this.imageList.has(url)) return null;
        let { isGif, isPngOrjpg } = this.imageType(url)
        return isPngOrjpg ? this.imageList.get(url) :
            isGif ? this.imageList.get(url)[index % this.imageList.get(url).length].image :
                this.imageList.get("")
    }
    // 播放一次消失
    getGifloopOneHide(url, index = 0) {
        if (!this.imageList.has(url)) return null;
        if (index < this.imageList.get(url).length) {
            return this.imageList.get(url)[index].image
        } else {
            return this.imageList.get("")
        }
    }
    // 播放一次消失
    getGifloopOneStopFirst(url, index = 0) {
        if (!this.imageList.has(url)) return null;
        if (index < this.imageList.get(url).length) {
            return this.imageList.get(url)[index].image
        } else {
            return this.imageList.get(url)[0].image
        }
    }
    getGifloopOneStopEnd(url, index = 0) {
        if (!this.imageList.has(url)) return null;
        if (index < this.imageList.get(url).length) {
            return this.imageList.get(url)[index].image
        } else {
            return this.imageList.get(url)[this.imageList.get(url).length - 1].image
        }
    }




    gifFpt(url) {
        if (!this.imageList.has(url)) return null;
        let { isGif, isPngOrjpg } = this.imageType(url)
        return isPngOrjpg ? 24 :
            isGif ? this.imageList.get(url)[0].fps :
                24


    }
    /**
     * 清除缓存
     * @param {string} [url] - 可选，指定清除某张图，不传则清空所有
     */
    clear(url) {
        if (url) {
            this.imageList.delete(url);
        } else {
            this.imageList.clear();
        }
    }
}


function getTracksImage(tracks = []) {
    let imageList = []
    tracks.forEach(t => {
        t.clips.forEach((c) => {
            imageList.push(c.src)
        })
    })
    return imageList
}

async function createEmptyPngCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    // 填充白色背景（PNG 默认透明，如需白色需手动填充）
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
   return canvas
  
}


// const pngBlob = await createEmptyPngBlob(200, 200);


async function getGifFrames(url) {
    // 1. 获取 GIF 的二进制数据
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();

    // 2. 创建 ImageDecoder
    const imageDecoder = new ImageDecoder({
        data: buffer,
        type: 'image/gif'
    });

    // 3. 等待元数据加载完成
    await imageDecoder.completed;

    const track = imageDecoder.tracks.selectedTrack;
    const frameCount = track.frameCount;
    const frames = [];

    // 4. 逐帧解码
    for (let i = 0; i < frameCount; i++) {
        // decode 返回一个 Promise，解析后得到 VideoFrame 或 ImageBitmap
        const result = await imageDecoder.decode({ frameIndex: i });

        // 将帧转换为 CanvasImageSource (ImageBitmap)
        // 注意：VideoFrame 需要绘制到 canvas 或直接使用 createImageBitmap
        const bitmap = await createImageBitmap(result.image);

        frames.push({
            image: bitmap,
            duration: result.image.duration // 帧持续时间（微秒）
        });

        // 关闭上一帧以释放内存
        result.close();
    }

    return frames;
}




