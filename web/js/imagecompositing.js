
// -------- 骨骼类 --------
class Bone {
    constructor(parent, angle, imageData = "", isUp = true) {
        let rotation = imageData && imageData.rotation || 0
        this.parent = parent;
        this.len = 0;
        this.angle = angle + rotation;
        this.restAngle = angle + rotation;
        this.children = [];
        this.img = null;
        this.origin = { x: 0, y: 0 }
        this.isUp = isUp
        if (imageData) {

            if (imageData.note && JSON.parse(imageData.note).scale) {
                this.img = new Face({ ...JSON.parse(imageData.note), img: imageData.img, width: imageData.width, height: imageData.height }).getCanvas()
            } else {
                this.img = imageData.img
            }
            if (isUp) {
                this.origin = { x: Math.floor(this.img.width / 2), y: this.img.height }
            } else {
                this.origin = { x: Math.floor(this.img.width / 2), y: 0 }
            }

            if (imageData.note) {
                let { X, Y } = JSON.parse(imageData.note)
                if (X && Y) {
                    this.origin = { x: X, y: Y }
                }
            }
            // 设置偏移量
            let offsetX = Number(imageData && imageData.offsetX || 0)
            let offsetY = Number(imageData && imageData.offsetY || 0)
            this.origin.x += offsetX
            this.origin.y += offsetY
            if (isUp) {
                this.len = Math.hypot((this.origin.y), (this.origin.x - this.img.width / 2))
                let r = Math.atan((this.origin.x - this.img.width / 2) / (this.origin.y))
                this.restAngle = this.angle - r;
            } else { //算 偏移量
                this.len = Math.hypot((this.img.height - this.origin.y), (this.img.width / 2 - this.origin.x))
                let r = Math.atan((this.img.width / 2 - this.origin.x) / (this.img.height - this.origin.y))
                this.restAngle = this.angle - r;
            }
        }
        if (parent) parent.children.push(this);
    }
    // 计算绝对位置
    getAbs() {
        if (!this.parent) return { x: 0, y: 0, angle: this.angle, r: this.restAngle, img: this.img, origin: this.origin, isUp: this.isUp };
        const p = this.parent.getAbs();
        return {
            // 此处针对画线
            x: p.x + Math.cos(p.r) * this.parent.len,
            y: p.y + Math.sin(p.r) * this.parent.len,
            r: p.angle + this.restAngle,


            // 此处针对画图
            angle: p.angle + this.angle,
            img: this.img,
            origin: this.origin,

            isUp: this.isUp
        };
    }
}

class Person {
    constructor(ctx, width, height, images) {
        this.ctx = ctx

        // this.timeDifference = this.c - this.s

        // this.ctx.strokeStyle = '#0f0';
        // this.ctx.lineWidth = 1;

        // this.ctx.strokeRect(0, 0, width, height);
        // -------- 搭建小人 --------

        const root = new Bone(null, 0);          // 头
        const body = new Bone(root, -Math.PI / 2, images.find(i => i.name == "身体"), true);

        const bbody = new Bone(root, -Math.PI / 2, images.find(i => i.name == "后身体"), true);

        const head = new Bone(body, 0, images.find(i => i.name == "头"), true);

        const hair = new Bone(head, -Math.PI, images.find(i => i.name == "头发"), false);
        const hairb = new Bone(head, -Math.PI, images.find(i => i.name == "后发"), false);


        const luaP = new Bone(body, -Math.PI / 2 * 1.5, images.find(i => i.name == "左臂距"), false);
        const lua = new Bone(luaP, 0, images.find(i => i.name == "左上臂"), false);                  // 右上臂
        const lfa = new Bone(lua, 0, images.find(i => i.name == "左下臂"), false);
        const lhand = new Bone(lfa, 0, images.find(i => i.name == "左手"), false);                   // 右前臂

        const ruaP = new Bone(body, Math.PI / 2 * 1.5, images.find(i => i.name == "右臂距"), false);
        const rua = new Bone(ruaP, 0, images.find(i => i.name == "右上臂"), false);                  // 右上臂
        const rfa = new Bone(rua, 0, images.find(i => i.name == "右下臂"), false);
        const rhand = new Bone(rfa, 0, images.find(i => i.name == "右手"), false);

        const lthP = new Bone(root, Math.PI / 2 * 1, images.find(i => i.name == "左腿距"), false);
        const lth = new Bone(lthP, Math.PI / 2 * 0, images.find(i => i.name == "左大腿"), false);                   // 右大腿
        const lsh = new Bone(lth, Math.PI / 2 * 0, images.find(i => i.name == "左小腿"), false);
        const lf = new Bone(lsh, Math.PI / 2 * 0, images.find(i => i.name == "左脚"), false);                // 右小腿

        const rthP = new Bone(root, Math.PI / 2 * 1, images.find(i => i.name == "右腿距"), false);
        const rth = new Bone(rthP, Math.PI / 2 * 0, images.find(i => i.name == "右大腿"), false);                   // 右大腿
        const rsh = new Bone(rth, Math.PI / 2 * 0, images.find(i => i.name == "右小腿"), false);
        const rf = new Bone(rsh, Math.PI / 2 * 0, images.find(i => i.name == "右脚"), false);                // 右小腿

        // / -------- 收集所有骨骼 --------
        this.allBones = [root, hairb,
            lhand, lfa, lua,
            bbody,
            rua,
            lsh, lth, lf,
            rsh, rth, rf,
            body, head, hair,
            rhand,rfa, 
        ];
    }
    drawBone(bone, ox, oy) {
        const BoneCon = bone.getAbs();
        const x1 = BoneCon.x + ox, y1 = BoneCon.y + oy;
        const x2 = x1 + Math.cos(BoneCon.r) * bone.len;
        const y2 = y1 + Math.sin(BoneCon.r) * bone.len;
        const isUp = BoneCon.isUp
        if (BoneCon.img) {
            let img = BoneCon.img
            let width = img.width
            let height = img.height
            let origin = BoneCon.origin
            this.ctx.save();
            this.ctx.translate(x1, y1);           // 1. 移动原点到旋转中心
            if (isUp) {
                this.ctx.rotate(BoneCon.angle + Math.PI / 2);             // 2. 旋转坐标系

            } else {
                this.ctx.rotate(BoneCon.angle - Math.PI / 2);             // 2. 旋转坐标系
            }

            this.ctx.drawImage(img, -origin.x, -origin.y, width, height); // 3. 居中画图
            this.ctx.restore();
        }



    }

    drawBonePoint(bone, ox, oy) {
        const BoneCon = bone.getAbs();
        const x1 = BoneCon.x + ox, y1 = BoneCon.y + oy;
        const x2 = x1 + Math.cos(BoneCon.r) * bone.len;
        const y2 = y1 + Math.sin(BoneCon.r) * bone.len;
        const isUp = BoneCon.isUp
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
        for (const b of this.allBones) this.drawBone(b, ox, oy);

        // for (const b of this.allBones) this.drawBonePoint(b, ox, oy);
    }
}

// 基本绘画内容 canvas
function getimage(width, height, images, returnTpe = "canvas") {

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d'); // 假设画布大小 200x200
    // 填充白色背景（PNG 默认透明，如需白色需手动填充）
    new Person(ctx, width, height, images).drawAll(width / 2, height / 2)
    return returnTpe == "canvas" ? canvas : canvas.toDataURL("image/png")

}




