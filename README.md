# videoediting
1920×1080
960 540 

const imageObj = new Image();
imageObj.onload = () => {
  // 2. 创建Konva图片实例，设置裁剪参数
  const konvaImage = new Konva.Image({
    x: 50,  // 图片在画布的X坐标
    y: 50,  // 图片在画布的Y坐标
    image: imageObj,
    width: imageObj.width,   // 图片原始宽度
    height: imageObj.height, // 图片原始高度
    // 定义需要显示的区域：从(100,100)开始，显示200*200的范围
    clipX: 100,
    clipY: 100,
    clipWidth: 200,
    clipHeight: 200
  });
  layer.add(konvaImage);
  layer.draw();
};


background-size: 70px 70px;
    background-position: -40px 0;







class ImagePool {
  constructor() {
    this.pool = {}; // 存储所有图像资源 { id: HTMLImageElement }
    this.preloadQueue = []; // 预加载队列
  }

  // 添加图像到预加载队列
  addImage(id, url) {
    this.preloadQueue.push({ id, url });
  }

  // 开始预加载
  preloadAll(callback) {
    let loadedCount = 0;
    const total = this.preloadQueue.length;

    if (total === 0) {
      callback();
      return;
    }

    this.preloadQueue.forEach(item => {
      const img = new Image();
      img.onload = () => {
        this.pool[item.id] = img;
        loadedCount++;
        if (loadedCount === total) {
          callback(); // 全部加载完成
        }
      };
      img.onerror = () => {
        console.error(`加载失败: ${item.url}`);
        loadedCount++;
        if (loadedCount === total) callback();
      };
      img.src = item.url;
    });

    // 清空队列
    this.preloadQueue = [];
  }

  // 从池中获取图像
  getImage(id) {
    return this.pool[id] || null;
  }

  // 销毁池（释放内存）
  destroy() {
    Object.keys(this.pool).forEach(key => {
      this.pool[key] = null;
    });
    this.pool = {};
  }
}


测试