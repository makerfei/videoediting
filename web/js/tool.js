






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



// 但双击绑定
function bindClickEvents(el, onSingle, onDouble, delay = 250) {
  let timer = null;
  el.addEventListener('click', () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      onDouble && onDouble();
    } else {
      timer = setTimeout(() => {
        onSingle && onSingle();
        timer = null;
      }, delay);
    }
  });
}


function openCustomWindow(url) {
  const width = 800;
  const height = 600;
  // 计算居中位置
  const left = (screen.width - width) / 2;
  const top = (screen.height - height) / 2;

  const features = `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`;
  
  // 打开新窗口
  const newWin = window.open(url, 'customWindow', features);

  // 检查是否被拦截
  if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
    alert('弹窗被浏览器拦截，请允许本站弹出窗口！');
  }
}
