






// 加载数据
function importData(input) {
    const file = input.files;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        AllNewStart(data)
    };
    reader.readAsText(file[0], 'UTF-8');
    input.value = '';
}

// ==================== Toast ====================
function showToast(msg) {
    DOM.toast.textContent = msg;
    DOM.toast.classList.add('show');
    clearTimeout(DOM.toast._timeout);
    DOM.toast._timeout = setTimeout(() => DOM.toast.classList.remove('show'), 1800);
}



function cropImageByCoords(img, x1, y1, x2, y2,rate=1) {
    return new Promise((resolve) => {
        let myimg = new Image()
        myimg.onload = () => {
            // 1. 计算裁剪尺寸和起始点
            const width = Math.abs(x2 - x1);
            const height = Math.abs(y2 - y1);
            const startX = Math.min(x1, x2);
            const startY = Math.min(y1, y2);

            // 2. 创建临时 Canvas
            const canvas = document.createElement('canvas');
            canvas.width =  Math.floor( width*rate) ;
            canvas.height =Math.floor( height*rate);
            const ctx = canvas.getContext('2d');

            // 3. 执行切图 (源x, 源y, 源宽, 源高, 目标x, 目标y, 目标宽, 目标高)
            ctx.drawImage(myimg, startX, startY, width, height, 0, 0, canvas.width, canvas.height);
            
            resolve({
                base64: canvas.toDataURL('image/png')
            });
            // canvas.toBlob((blob) => {
            //     resolve({
            //         base64: canvas.('image/png'),
            //         blob: blob
            //     });
            // }, 'image/png');
        }
        myimg.src = img
    });
}
