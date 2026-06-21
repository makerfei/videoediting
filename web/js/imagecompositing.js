






// -------- 骨骼类 --------
class Bone {
    constructor(parent, imageData = "") {
        this.parent = parent;
        this.len = 0;
        this.angle = angle;
        this.restAngle = angle;
        this.children = [];
        this.img = null;
        this.origin = { x: 0, y: 0 }
        if (imageData) {
            this.img = imageData.img
            this.origin = { x: this.img.width / 2, y: this.img.height }
            if (imageData.note) {
                let { X, Y } = JSON.parse(imageData.note)
                this.origin = { x: X, y: Y }
            }
            this.len = this.origin.y
        }
        if (parent) parent.children.push(this);
    }
    // 计算绝对位置
    getAbs() {
        if (!this.parent) return { x: 0, y: 0, r: this.angle, img: this.img, origin:this.origin };
        const p = this.parent.getAbs();
        return {
            x: p.x + Math.cos(p.r) * this.parent.len,
            y: p.y + Math.sin(p.r) * this.parent.len,
            r: p.r + this.angle,
            img: this.img,
            origin:this.origin
        };
    }
}

class Person {
    constructor(ctx, width, height, c, s, images) {
        this.ctx = ctx
        this.c = c;
        this.s = s;


        this.timeDifference = this.c - this.s

        let headangle = this.timeDifference
        let spineangle = this.timeDifference
        let lshangle = this.timeDifference
        this.ctx.strokeStyle = '#0f0';
        this.ctx.lineWidth = 1;

        this.ctx.strokeRect(0, 0, width, height);
        // -------- 搭建小人 --------



        const root = new Bone(null);          // 头

        const body = new Bone(root, -Math.PI / 2, images.find(i => i.name == "身体"));

        const head = new Bone(body, 0, images.find(i => i.name == "头"));

        const hair = new Bone(head, 0, images.find(i => i.name == "头发"));

        // const lshoulder = new Bone(head, 80, -Math.PI / 180 * 90);        //右肩
        // const lua = new Bone(lshoulder, 160, 0);                 // 左上臂
        // const lfa = new Bone(lua, 160, 0.5);                   // 左前臂


        // const rshoulder = new Bone(head, 80, Math.PI / 180 * 90);        //右肩
        // const rua = new Bone(rshoulder, 160, 0.6);                  // 右上臂
        // const rfa = new Bone(rua, 160, -0.5);                  // 右前臂


        // const spine = new Bone(head, 250, 0+spineangle);       // 脊椎（向上）




        // const lbutt = new Bone(spine, 80, Math.PI / 180 * 90);                   // 左屁股
        // const lth = new Bone(lbutt, 160, -Math.PI / 180 * 90);                   // 左大腿
        // const lsh = new Bone(lth, 160, 0.2+lshangle);                  // 左小腿

        // const rbutt = new Bone(spine, 80, -Math.PI / 180 * 90);                   // 右屁股
        const rth = new Bone(root, 160, Math.PI / 180 * 90,images.find(i => i.name == "右大腿"));                   // 右大腿
        // const rsh = new Bone(rth, 160, 0);                   // 右小腿

        // / -------- 收集所有骨骼 --------
        this.allBones = [root, body,head,hair];



    }

    drawBone(bone, ox, oy) {
        const BoneCon = bone.getAbs();
        const x1 = BoneCon.x + ox, y1 = BoneCon.y + oy;
        const x2 = x1 + Math.cos(BoneCon.r) * bone.len;
        const y2 = y1 + Math.sin(BoneCon.r) * bone.len;


        if (BoneCon.img) {
            let img = BoneCon.img

            let width = img.width
            let height = img.height
            let origin = BoneCon.origin

            this.ctx.save();
            this.ctx.translate(x1, y1);           // 1. 移动原点到旋转中心
            this.ctx.rotate(BoneCon.r + Math.PI / 2);             // 2. 旋转坐标系
            this.ctx.drawImage(img, -origin.x, -origin.y, width, height); // 3. 居中画图
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
        // let b = this.allBones[1].getAbs()


        // 关节圆点
        this.ctx.beginPath();
        this.ctx.arc(ox, oy, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgb(114, 24, 224)';
        this.ctx.fill();
        // // 关节圆点
        // this.ctx.beginPath();
        // this.ctx.arc(b.x + ox, b.y + oy, 50, 0, Math.PI * 2);
        // this.ctx.fillStyle = '#f00';
        // this.ctx.fill();
    }
}








// 基本绘画内容 canvas
function getimage(width, height, c, s, images) {

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d'); // 假设画布大小 200x200
    // 填充白色背景（PNG 默认透明，如需白色需手动填充）
    new Person(ctx, width, height, c, s, images).drawAll(width / 2, height / 2)

    return canvas.toDataURL("image/png")

}




