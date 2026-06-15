










// 基本绘画内容 canvas
function getimage(width, height, c, s) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d'); // 假设画布大小 200x200
     // 填充白色背景（PNG 默认透明，如需白色需手动填充）
    ctx.drawImage(myStage.imagePool.get("image/2.png"),-(c-s)*100,-(c-s)*100)
    return canvas

}









// // 1. 初始化 Regl
// const regl = createREGL({
//     canvas: document.getElementById('glCanvas')
// });

// // 2. 模拟大量数据 (100,000 个点)
// const numPoints = 100000;
// const rawData = Array.from({ length: numPoints }, () => ({
//     x: Math.random() * 100,
//     y: Math.random() * 100,
//     size: Math.random() * 5 + 1,
//     color: [Math.random(), Math.random(), Math.random()]
// }));

// // 3. 使用 D3 创建比例尺 (将数据映射到 -1 到 1 的 WebGL 坐标空间)
// // WebGL 坐标系中心是 (0,0)，范围是 [-1, 1]
// const xScale = d3.scaleLinear()
//     .domain([0, 100])
//     .range([-1, 1]);

// const yScale = d3.scaleLinear()
//     .domain([0, 100])
//     .range([1, -1]); // 注意：WebGL Y轴向上为正，所以这里反转

// // 4. 将数据转换为 TypedArray (GPU 需要这种连续内存格式)
// // 格式: [x, y, size, r, g, b, x, y, size, r, g, b, ...]
// const positions = new Float32Array(numPoints * 6); 

// rawData.forEach((d, i) => {
//     const offset = i * 6;
//     positions[offset]     = xScale(d.x);     // x
//     positions[offset + 1] = yScale(d.y);     // y
//     positions[offset + 2] = d.size;          // point size
//     positions[offset + 3] = d.color;      // r
//     positions[offset + 4] = d.color;      // g
//     positions[offset + 5] = d.color;      // b
// });

// // 5. 创建缓冲区 Buffer
// const positionBuffer = regl.buffer({
//     data: positions,
//     usage: 'static' // 数据不变用 static，频繁更新用 dynamic/stream
// });

// // 6. 定义顶点着色器 (Vertex Shader)
// // 负责处理每个点的位置和大小
// const vertShader = `
//     precision mediump float;
//     attribute vec2 position; // x, y
//     attribute float pointSize;
//     attribute vec3 color;
    
//     varying vec3 vColor;
    
//     void main() {
//         vColor = color;
//         gl_Position = vec4(position, 0, 1);
//         gl_PointSize = pointSize; 
//     }
// `;

// // 7. 定义片元着色器 (Fragment Shader)
// // 负责处理每个像素的颜色
// const fragShader = `
//     precision mediump float;
//     varying vec3 vColor;
    
//     void main() {
//         // 画一个圆点，而不是方块
//         vec2 coord = gl_PointCoord - vec2(0.5);
//         if(length(coord) > 0.5) discard;
        
//         gl_FragColor = vec4(vColor, 1.0);
//     }
// `;

// // 8. 创建 Regl 绘制命令
// const drawPoints = regl({
//     vert: vertShader,
//     frag: fragShader,
//     attributes: {
//         position: {
//             buffer: positionBuffer,
//             offset: 0,
//             stride: 24, // 6个float * 4字节 = 24字节
//             size: 2     // vec2 (x, y)
//         },
//         pointSize: {
//             buffer: positionBuffer,
//             offset: 8,  // 跳过前2个float
//             stride: 24,
//             size: 1     // float
//         },
//         color: {
//             buffer: positionBuffer,
//             offset: 12, // 跳过前3个float
//             stride: 24,
//             size: 3     // vec3 (r, g, b)
//         }
//     },
//     count: numPoints,
//     primitive: 'points',
//     blend: {
//         enable: true,
//         func: {
//             srcRGB: 'src alpha',
//             srcAlpha: 1,
//             dstRGB: 'one minus src alpha',
//             dstAlpha: 1
//         }
//     },
//     depth: { enable: false } // 2D不需要深度测试
// });

// // 9. 渲染循环
// function frame() {
//     // 清空画布
//     regl.clear({
//         color: [0.1, 0.1, 0.1, 1],
//         depth: 1
//     });
    
//     // 执行绘制命令
//     drawPoints();
    
//     requestAnimationFrame(frame);
// }

// frame();

// // 10. 处理窗口缩放
// window.addEventListener('resize', () => {
//     regl.resize();
// });




