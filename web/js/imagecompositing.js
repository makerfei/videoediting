






// -------- 骨骼类 --------
class Bone {
    constructor(parent, len, angle, src) {
        this.parent = parent;
        this.len = len;
        this.angle = angle;
        this.restAngle = angle;
        this.src = src
        this.children = [];
        if (parent) parent.children.push(this);
    }
    // 计算绝对位置
    getAbs() {
        if (!this.parent) return { x: 0, y: 0, r: this.angle,src: this.src };
        const p = this.parent.getAbs();
        return {
            x: p.x + Math.cos(p.r) * this.parent.len,
            y: p.y + Math.sin(p.r) * this.parent.len,
            r: p.r + this.angle,
            src: this.src
        };
    }
}

class Person {
    constructor(ctx, width, height, c, s,imagePool) {
        this.ctx = ctx
        this.c =c;
        this.s = s;
        this.imagePool = imagePool

        this.timeDifference = this.c -this.s
        
        let headangle =  this.timeDifference
        let spineangle =this.timeDifference
        let lshangle =this.timeDifference
        this.ctx.strokeStyle = '#0f0';
        this.ctx.lineWidth = 1;

        this.ctx.strokeRect(0, 0, width, height);
        // -------- 搭建小人 --------
        const head = new Bone(null, 180, Math.PI / 180 * 90);          // 头

       

        const lshoulder = new Bone(head, 80, -Math.PI / 180 * 90);        //右肩
        const lua = new Bone(lshoulder, 160, 0);                 // 左上臂
        const lfa = new Bone(lua, 160, 0.5);                   // 左前臂


        const rshoulder = new Bone(head, 80, Math.PI / 180 * 90);        //右肩
        const rua = new Bone(rshoulder, 160, 0.6);                  // 右上臂
        const rfa = new Bone(rua, 160, -0.5);                  // 右前臂


        const spine = new Bone(head, 250, 0+spineangle);       // 脊椎（向上）




        const lbutt = new Bone(spine, 80, Math.PI / 180 * 90);                   // 左屁股
        const lth = new Bone(lbutt, 160, -Math.PI / 180 * 90);                   // 左大腿
        const lsh = new Bone(lth, 160, 0.2+lshangle);                  // 左小腿

        const rbutt = new Bone(spine, 80, -Math.PI / 180 * 90);                   // 右屁股
        const rth = new Bone(rbutt, 160, Math.PI / 180 * 90);                   // 右大腿
        const rsh = new Bone(rth, 160, 0);                   // 右小腿

        // / -------- 收集所有骨骼 --------
        this.allBones = [spine, head, lshoulder, lua, lfa, rshoulder, rua, rfa, lbutt, lth, lsh, rbutt, rth, rsh];



    }

    drawBone(bone, ox, oy) {
        const a = bone.getAbs();
        const x1 = a.x + ox, y1 = a.y + oy;
        const x2 = x1 + Math.cos(a.r) * bone.len;
        const y2 = y1 + Math.sin(a.r) * bone.len;
        
        if (a.src) {
            let img = this.imagePool.get(a.src)
            let width = img.width / 4
            let height = img.height / 4
            this.ctx.save();
            this.ctx.translate(x1, y1);           // 1. 移动原点到旋转中心
            this.ctx.rotate(a.r + 3 * Math.PI / 2);             // 2. 旋转坐标系
            this.ctx.drawImage(img, -width / 2, 0, width, height); // 3. 居中画图
            this.ctx.restore();
        }

        if (bone.len > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.strokeStyle = '#00d2ff';
            this.ctx.lineWidth = 5;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
        }
        // 关节圆点
        this.ctx.beginPath();
        this.ctx.arc(x1, y1, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = '#f00';
        this.ctx.fill();
    }
    drawAll(ox, oy) {
        // // 头部圆圈
        // let bimg = this.imagePool.get("image/11.png")
        // let x1 = 0
        // let y1 = 0
        // this.ctx.drawImage(bimg, x1, y1, bimg.width, bimg.height);

        for (const b of this.allBones) this.drawBone(b, ox, oy);
        let b = this.allBones[1].getAbs()

        
        // // 关节圆点
        // this.ctx.beginPath();
        // this.ctx.arc(b.x + ox, b.y + oy, 50, 0, Math.PI * 2);
        // this.ctx.fillStyle = '#f00';
        // this.ctx.fill();
    }
}








// 基本绘画内容 canvas
function getimage(width, height, c, s,imagePool) {
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d'); // 假设画布大小 200x200
    // 填充白色背景（PNG 默认透明，如需白色需手动填充）
    new Person(ctx, width, height, c, s,imagePool).drawAll(width / 2, 0)

    return canvas.toDataURL("image/png")

}




