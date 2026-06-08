class itemKeyframe {
    constructor() {

    }
    show(keyframe) {
        this.setkeyframetxt(keyframe)
        this.setkeyframelist(keyframe)
        this.setclick()
    }


    setclick() {
        let keyframelistEl = document.getElementById("keyframelist")
        keyframelistEl.addEventListener('click', (e) => {
            // e.target 是实际被点击的元素
            // closest('div') 向上查找最近的 div 父元素
            const clipEl = e.target.closest('.keyset');
            // 防止点击到容器本身导致 clipEl 为 null
            if (!clipEl) return;
            let id = clipEl.dataset.id;   // 获取 data-id 属性
            let type = clipEl.dataset.type; // 获取 data-type 属性
            console.log("Clicked ID:", id, "Type:", type);
            
            if (type == "firstkey") {
                myStage.setKeyframesPost(id, 0)

            } else if (type == "lastkey") {
                myStage.setKeyframesPost(id, 1)
            } else if (id) {

            }
            showToast("设置成功")

        });

    }
    setkeyframetxt(keyframe) {
        const formattedJson = JSON.stringify(keyframe, null, 2);
        document.getElementById("json-preview").textContent = formattedJson;
    }
    setkeyframelist(keyframe) {

        let { keyframes } = myStage.getItemAllKeylist(keyframe.clipid)
        let firstkey = keyframes.key[0]
        let lastkey = keyframes.key[1]

        let keyframelistEl = document.getElementById("keyframelist")
        let ellist = `<div class="keyset" data-id="${keyframe.clipid}" data-type="firstkey" ><span>${firstkey.time}</span><span>设置</span></div>
                    <div class="keyset" data-id="${keyframe.clipid}" data-type="lastkey"  ><span>${lastkey.time}</span><span>设置</span></div>
        `

        keyframelistEl.innerHTML = ellist
    }

}

myitemKeyframe = new itemKeyframe()