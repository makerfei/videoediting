/**
 * 纯图片预加载池 (Image Preload Pool)
 * 仅负责加载和缓存 HTMLImageElement，不涉及 Konva 节点管理
 */
class ImagePool {
    constructor() {
        this.imageList = new Map()
    }
    /**
     * 预加载单张图片
     * @param {string} url - 图片地址
     * @returns {Promise<HTMLImageElement>} - 返回加载完成的 Image 对象
     */
    preload(url) {
        return new Promise(async (resolve, reject) => {
            if (this.imageList.get(url)) {
                resolve()
            }
            const img = new Image();
            // 处理跨域问题（Konva 导出图片时需要）
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                resolve(img);
                this.imageList.set(url, img)
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
        urls.forEach(url => {
            promises.push(this.preload(url))
        })
        return Promise.all(promises);
    }
    get(url,i=0) {
        if (!this.imageList.has(url)) return null;
        return this.imageList.get(url);
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








class GifPool {
    constructor() {
        // 缓存 Map: key为url, value为 Promise<HTMLImageElement>
        this.cache = new Map();
    }
    preload(url) {
        return new Promise(async (resolve, reject) => {
            // 1. 如果缓存中已有（无论是否正在加载），直接返回对应的 Promise
            if (this.cache.has(url)) {
                resolve(this.cache.get(url));
            }

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


        })













        // 2. 创建新的 Promise 进行加载
        const promise = new Promise((resolve, reject) => {
            const img = new Image();

            // 处理跨域问题（Konva 导出图片时需要）
            img.crossOrigin = "Anonymous";

            img.onload = () => {
                resolve(img);
            };

            img.onerror = (err) => {
                console.error(`ImagePool: Failed to load ${url}`, err);
                // 加载失败时从缓存移除，允许重试
                this.cache.delete(url);
                reject(err);
            };

            img.src = url;
        });

        // 3. 存入缓存
        this.cache.set(url, promise);

        return promise;
    }






}

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

// // 使用示例
// getGifFrames('1.gif').then(frames => {
//     console.log(`共 ${frames.length} 帧`);
//     // frames.image 是第一帧的 ImageBitmap
//     // 可以直接用于 Konva: new Konva.Image({ image: frames.image })
// });






// --- 使用示例 ---

// // 1. 实例化
// const imagePool = new ImagePool();

// // 2. 预加载资源（通常在应用启动时）
// const assets = [
//     'https://picsum.photos/200/300?random=1',
//     'https://picsum.photos/200/300?random=2',
//     'https://picsum.photos/200/300?random=3'
// ];
