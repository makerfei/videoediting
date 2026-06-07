
/**
 * LayerStudio Core Logic
 * 实现图层的 CRUD、变换操作、数据序列化及动画播放
 */

// --- 状态管理 ---
const state = {
    layers: [], // 存储所有图层数据 { id, type, x, y, width, height, rotation, opacity, content, src }
    selectedId: null,
    frames: [], // 存储关键帧快照
    isPlaying: false,
    nextId: 1
};

// --- DOM 元素引用 ---
const stage = document.getElementById('stage');
const propertiesPanel = document.getElementById('properties-panel');
const jsonPreview = document.getElementById('json-preview');
const framesList = document.getElementById('frames-list');
const frameCountEl = document.getElementById('frame-count');

// 属性输入框
const inputs = {
    x: document.getElementById('prop-x'),
    y: document.getElementById('prop-y'),
    w: document.getElementById('prop-w'),
    h: document.getElementById('prop-h'),
    rot: document.getElementById('prop-rot'),
    rotRange: document.getElementById('prop-rot-range'),
    opacity: document.getElementById('prop-opacity')
};

// --- 初始化 ---
function init() {
    setupEventListeners();
    renderStage();
    updateUI();
}

// --- 核心功能：图层管理 ---

function addLayer(type, contentOrSrc) {
    const id = `layer-${state.nextId++}`;
    const newLayer = {
        id,
        type, // 'image' or 'text'
        x: 100 + Math.random() * 50,
        y: 100 + Math.random() * 50,
        width: type === 'image' ? 200 : 150,
        height: type === 'image' ? 150 : 50,
        rotation: 0,
        opacity: 1,
        content: contentOrSrc, // 文本内容或图片URL
        zIndex: state.layers.length + 1
    };
    
    state.layers.push(newLayer);
    selectLayer(id);
    renderStage();
    updateDataPreview();
}

function deleteLayer(id) {
    state.layers = state.layers.filter(l => l.id !== id);
    if (state.selectedId === id) {
        state.selectedId = null;
        updatePropertiesPanel();
    }
    renderStage();
    updateDataPreview();
}

function selectLayer(id) {
    state.selectedId = id;
    renderStage(); // 重新渲染以更新选中状态样式
    updatePropertiesPanel();
}

function updateLayerData(id, changes) {
    const layer = state.layers.find(l => l.id === id);
    if (layer) {
        Object.assign(layer, changes);
        renderStage(); // 简单起见，全量重绘DOM，生产环境可优化为只更新特定元素样式
        updateDataPreview();
        // 如果正在修改属性，保持面板同步（防止输入框跳动）
        if(state.selectedId === id) {
             // 这里不需要强制刷新输入框值，除非是外部触发的改变
        }
    }
}

// --- 渲染引擎 ---

function renderStage() {
    // 清除除 overlay 外的所有子元素
    const overlay = stage.querySelector('.playing-overlay');
    stage.innerHTML = '';
    if(overlay) stage.appendChild(overlay);

    state.layers.forEach(layer => {
        const el = document.createElement('div');
        el.className = `layer-item ${state.selectedId === layer.id ? 'selected' : ''}`;
        el.id = layer.id;
        
        // 应用样式
        el.style.left = `${layer.x}px`;
        el.style.top = `${layer.y}px`;
        el.style.width = `${layer.width}px`;
        el.style.height = `${layer.height}px`;
        el.style.transform = `rotate(${layer.rotation}deg)`;
        el.style.opacity = layer.opacity;
        el.style.zIndex = layer.zIndex;

        // 内容
        if (layer.type === 'image') {
            const img = document.createElement('img');
            img.src = layer.content;
            img.className = 'w-full h-full object-cover pointer-events-none';
            img.alt = "Layer Image";
            el.appendChild(img);
        } else {
            el.className += ' flex items-center justify-center bg-white border border-gray-300 text-gray-800 font-medium';
            el.innerText = layer.content;
        }

        // 控制手柄 (仅选中时显示，通过CSS控制)
        const controls = document.createElement('div');
        controls.className = 'controls-overlay';
        
        // 旋转手柄
        const rotLine = document.createElement('div');
        rotLine.className = 'rotate-line';
        const rotHandle = document.createElement('div');
        rotHandle.className = 'rotate-handle';
        rotHandle.innerHTML = '<i class="fa-solid fa-rotate-right"></i>';
        rotHandle.onmousedown = (e) => startRotate(e, layer.id);
        
        // 缩放手柄
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        resizeHandle.onmousedown = (e) => startResize(e, layer.id);

        // 删除按钮
        const delBtn = document.createElement('div');
        delBtn.className = 'delete-btn';
        delBtn.innerHTML = '<i class="fa-solid fa-times"></i>';
        delBtn.onclick = (e) => {
            e.stopPropagation();
            deleteLayer(layer.id);
        };

        controls.appendChild(rotLine);
        controls.appendChild(rotHandle);
        controls.appendChild(resizeHandle);
        controls.appendChild(delBtn);
        el.appendChild(controls);

        // 绑定拖拽事件到主体
        el.onmousedown = (e) => {
            if (e.target.closest('.rotate-handle') || e.target.closest('.resize-handle') || e.target.closest('.delete-btn')) return;
            startDrag(e, layer.id);
        };

        stage.appendChild(el);
    });
}

// --- 交互逻辑：拖拽、缩放、旋转 ---

let dragState = {
    active: false,
    type: null, // 'move', 'resize', 'rotate'
    layerId: null,
    startX: 0,
    startY: 0,
    initialVal: {} // 存储初始状态 {x, y, w, h, rot, centerX, centerY}
};

function getMousePos(e) {
    const rect = stage.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function startDrag(e, id) {
    e.preventDefault();
    e.stopPropagation();
    selectLayer(id);
    
    const layer = state.layers.find(l => l.id === id);
    const pos = getMousePos(e);

    dragState = {
        active: true,
        type: 'move',
        layerId: id,
        startX: pos.x,
        startY: pos.y,
        initialVal: { x: layer.x, y: layer.y }
    };
}

function startResize(e, id) {
    e.preventDefault();
    e.stopPropagation();
    
    const layer = state.layers.find(l => l.id === id);
    const pos = getMousePos(e);

    dragState = {
        active: true,
        type: 'resize',
        layerId: id,
        startX: pos.x,
        startY: pos.y,
        initialVal: { w: layer.width, h: layer.height, x: layer.x, y: layer.y }
    };
}

function startRotate(e, id) {
    e.preventDefault();
    e.stopPropagation();

    const layer = state.layers.find(l => l.id === id);
    const rect = stage.getBoundingClientRect();
    // 计算中心点在视口中的绝对坐标
    const centerX = rect.left + layer.x + layer.width / 2;
    const centerY = rect.top + layer.y + layer.height / 2;
    
    // 计算初始角度
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;

    dragState = {
        active: true,
        type: 'rotate',
        layerId: id,
        startX: e.clientX, // 这里用 clientX 方便计算角度差
        startY: e.clientY,
        initialVal: { rot: layer.rotation, startAngle: startAngle }
    };
}

// 全局鼠标移动监听
window.addEventListener('mousemove', (e) => {
    if (!dragState.active) return;

    const layer = state.layers.find(l => l.id === dragState.layerId);
    if (!layer) return;

    if (dragState.type === 'move') {
        const pos = getMousePos(e);
        const dx = pos.x - dragState.startX;
        const dy = pos.y - dragState.startY;
        
        updateLayerData(layer.id, {
            x: dragState.initialVal.x + dx,
            y: dragState.initialVal.y + dy
        });
        updatePropertiesPanel(); // 实时更新面板数值
    } 
    else if (dragState.type === 'resize') {
        const pos = getMousePos(e);
        const dx = pos.x - dragState.startX;
        const dy = pos.y - dragState.startY;
        
        // 简单的等比或自由缩放，这里演示自由缩放，最小限制 20px
        let newW = Math.max(20, dragState.initialVal.w + dx);
        let newH = Math.max(20, dragState.initialVal.h + dy);

        updateLayerData(layer.id, {
            width: newW,
            height: newH
        });
        updatePropertiesPanel();
    } 
    else if (dragState.type === 'rotate') {
        const rect = stage.getBoundingClientRect();
        const centerX = rect.left + layer.x + layer.width / 2;
        const centerY = rect.top + layer.y + layer.height / 2;
        
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
        const angleDiff = currentAngle - dragState.initialVal.startAngle;
        
        let newRot = dragState.initialVal.rot + angleDiff;
        // 规范化到 0-360
        // newRot = newRot % 360; 
        
        updateLayerData(layer.id, {
            rotation: newRot
        });
        updatePropertiesPanel();
    }
});

window.addEventListener('mouseup', () => {
    if(dragState.active) {
        dragState.active = false;
        updateDataPreview(); // 操作结束后更新完整JSON
    }
});

// --- 属性面板同步 ---

function updatePropertiesPanel() {
    const layer = state.layers.find(l => l.id === state.selectedId);
    
    if (layer) {
        propertiesPanel.classList.remove('opacity-50', 'pointer-events-none');
        inputs.x.value = Math.round(layer.x);
        inputs.y.value = Math.round(layer.y);
        inputs.w.value = Math.round(layer.width);
        inputs.h.value = Math.round(layer.height);
        inputs.rot.value = Math.round(layer.rotation);
        inputs.rotRange.value = layer.rotation % 360;
        inputs.opacity.value = layer.opacity;
    } else {
        propertiesPanel.classList.add('opacity-50', 'pointer-events-none');
    }
}

// 监听面板输入变化
Object.keys(inputs).forEach(key => {
    inputs[key].addEventListener('input', (e) => {
        if (!state.selectedId) return;
        const val = parseFloat(e.target.value);
        
        if (key === 'rot' || key === 'rotRange') {
            updateLayerData(state.selectedId, { rotation: val });
            // 同步另一个旋转输入框
            if(key === 'rot') inputs.rotRange.value = val;
            else inputs.rot.value = val;
        } else if (key === 'x') {
            updateLayerData(state.selectedId, { x: val });
        } else if (key === 'y') {
            updateLayerData(state.selectedId, { y: val });
        } else if (key === 'w') {
            updateLayerData(state.selectedId, { width: val });
        } else if (key === 'h') {
            updateLayerData(state.selectedId, { height: val });
        } else if (key === 'opacity') {
            updateLayerData(state.selectedId, { opacity: val });
        }
    });
});

// --- 数据驱动与播放系统 ---

function recordFrame() {
    // 深拷贝当前 layers 状态
    const frameData = JSON.parse(JSON.stringify(state.layers));
    const timestamp = new Date().toLocaleTimeString();
    
    state.frames.push({
        id: Date.now(),
        time: timestamp,
        data: frameData
    });
    
    renderFramesList();
    updateDataPreview();
    
    // 视觉反馈
    const btn = document.getElementById('btn-record');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> 已记录';
    btn.classList.add('bg-indigo-100');
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('bg-indigo-100');
    }, 1000);
}

function renderFramesList() {
    frameCountEl.innerText = state.frames.length;
    framesList.innerHTML = '';
    
    if (state.frames.length === 0) {
        framesList.innerHTML = '<div class="text-center text-gray-400 text-sm mt-10 italic">暂无关键帧，点击“记录”添加</div>';
        return;
    }

    state.frames.forEach((frame, index) => {
        const div = document.createElement('div');
        div.className = 'bg-white p-2 rounded border border-gray-200 text-xs flex justify-between items-center hover:border-blue-300 transition cursor-pointer group';
        div.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">#${index + 1}</span>
                <span class="text-gray-500">${frame.time}</span>
            </div>
            <button class="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition" onclick="deleteFrame(${frame.id})">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        div.onclick = (e) => {
            if(e.target.closest('button')) return;
            loadFrame(index);
        };
        framesList.appendChild(div);
    });
}

window.deleteFrame = function(id) {
    state.frames = state.frames.filter(f => f.id !== id);
    renderFramesList();
    updateDataPreview();
}

function loadFrame(index) {
    if (index >= 0 && index < state.frames.length) {
        // 恢复数据
        state.layers = JSON.parse(JSON.stringify(state.frames[index].data));
        state.selectedId = null;
        renderStage();
        updatePropertiesPanel();
        updateDataPreview();
    }
}

function playAnimation() {
    if (state.frames.length < 2) {
        alert("请至少记录两个关键帧以形成动画！");
        return;
    }
    
    if (state.isPlaying) return;
    state.isPlaying = true;
    document.body.classList.add('is-playing');
    
    let currentFrameIndex = 0;
    const intervalTime = 1000; // 每帧停留1秒，实际项目可使用 GSAP 做平滑过渡
    
    const playInterval = setInterval(() => {
        if (currentFrameIndex >= state.frames.length) {
            clearInterval(playInterval);
            state.isPlaying = false;
            document.body.classList.remove('is-playing');
            // 回到第一帧或最后一帧，这里选择回到第一帧
            loadFrame(0);
            return;
        }
        
        loadFrame(currentFrameIndex);
        currentFrameIndex++;
    }, intervalTime);
}

function updateDataPreview() {
    const previewObj = {
        layers: state.layers,
        framesCount: state.frames.length
    };
    jsonPreview.textContent = JSON.stringify(previewObj, null, 2);
}

// --- 事件绑定 ---

function setupEventListeners() {
    // 添加图片
    document.getElementById('btn-add-img').onclick = () => {
        // 使用 Picsum 随机图片
        const randomId = Math.floor(Math.random() * 100);
        addLayer('image', `https://picsum.photos/seed/${randomId}/300/200`);
    };

    // 添加文本
    document.getElementById('btn-add-text').onclick = () => {
        const text = prompt("请输入文本内容:", "Hello World");
        if (text) addLayer('text', text);
    };

    // 记录关键帧
    document.getElementById('btn-record').onclick = recordFrame;

    // 播放
    document.getElementById('btn-play').onclick = playAnimation;

    // 清空舞台
    document.getElementById('btn-clear').onclick = () => {
        if(confirm("确定清空所有图层吗？")) {
            state.layers = [];
            state.selectedId = null;
            renderStage();
            updatePropertiesPanel();
            updateDataPreview();
        }
    };
    
    // 清空关键帧
    document.getElementById('btn-clear-frames').onclick = () => {
        state.frames = [];
        renderFramesList();
        updateDataPreview();
    };

    // 点击空白处取消选中
    stage.addEventListener('mousedown', (e) => {
        if (e.target === stage) {
            state.selectedId = null;
            renderStage();
            updatePropertiesPanel();
        }
    });
}

// 启动
init();

