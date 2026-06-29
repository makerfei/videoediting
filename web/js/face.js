class Face {
    constructor(faceConfig) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 512;
        this.canvas.height = 512;
        this.ctx = this.canvas.getContext('2d')
        if (faceConfig.width && faceConfig.height) {
            faceConfig.centerX = faceConfig.width / 2
            faceConfig.centerY = faceConfig.height / 2
            faceConfig.scale = Math.min(faceConfig.width / this.canvas.width, faceConfig.height / this.canvas.height);
            this.canvas.width = faceConfig.width;
            this.canvas.height = faceConfig.height;
        }

        const faceConfigMy = {
            centerX: 512 / 2,
            centerY: 512 / 2,
            scale: 1,
            skinColor: '#f5d0b5',
            shadowColor: 'rgba(0,0,0,0.1)',
            happy: 0, angry: 0, sad: 0, surprised: 0,

            viewAngle: 0,
            faceWidthAdd: 0, //额头宽度
            MassAdd: 0,//胖系数
            topYAdd: 0, // 头顶x高度
            chinYAdd: 0, //下巴高度
            browXAdd: 0, //眉毛间距
            browYAdd: 0,//眉毛Y位置

            browColor: "#000000",//眉毛颜色
            browlongAdd: 0,  //眉毛长度
            browWidthAdd: 0, //眉毛宽度

            eyeXadd: 0,//眼睛间距
            eyeYadd: 0,//眼睛Y
            eyeHeightAdd: 0,//
            eyeWidthAdd: 0,
            eyeColor1: "#fff",
            eyeColor2: "#000",
            eyeColor3: "#fff",
            eyeSizeAdd: 2,

            noseWidthAdd: 0,
            noseColor: 'rgba(100, 80, 70, 0.3)',
            noseYAdd: 0,
            noseLongAdd: 30,
            noseColor2: 'rgba(0,0,0,0.05)',

            mouthColor1: "#e5b28f",
            mouthlineWidthAdd: 0,

            mouthWidthAdd: 0,
            mouthYAdd: 0,
            mouthColor2: '#c4694a',

            isSpeak: false,
            SpeakValue: 0,

        };


        this.faceConfig = { ...faceConfigMy, ...faceConfig }
    }

    getBase64() {
        this.drawFace(this.faceConfig)
        return this.canvas.toDataURL()
    }
    getCanvas() {
        this.drawFace(this.faceConfig)
        return this.canvas
    }


    drawFace() {
        let {
            centerX,
            centerY,
            scale,
            skinColor,
            shadowColor,


            happy, angry, sad, surprised,
            viewAngle,
            faceWidthAdd,
            MassAdd,
            topYAdd,
            chinYAdd,
            browXAdd,
            browYAdd,
            browColor,
            browlongAdd,
            browWidthAdd,

            eyeXadd,
            eyeYadd,
            eyeHeightAdd,
            eyeWidthAdd,
            eyeColor1,
            eyeColor2,
            eyeColor3,
            eyeSizeAdd,

            noseWidthAdd,
            noseColor,
            noseYAdd,
            noseLongAdd,
            noseColor2,

            mouthColor1,
            mouthlineWidthAdd,
            mouthYAdd,
            mouthWidthAdd,
            mouthColor2,

            isSpeak,
            SpeakValue,


        } = this.faceConfig
        let ctx = this.ctx
        let canvas = this.canvas

        const rad = viewAngle * Math.PI / 180;
        const isLeftProfile = viewAngle > 10;
        const isRightProfile = viewAngle < -10;
        const isFrontal = !isLeftProfile && !isRightProfile;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 脸部宽度随角度变化
        ctx.drawImage(this.faceConfig.img, 0, 0, this.faceConfig.width, this.faceConfig.height)









        ctx.save();

        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);

        // 1. 绘制脸型 (根据角度变形)
        ctx.beginPath();



        ctx.fillStyle = skinColor;
        ctx.fill();
        // // 侧面阴影增强立体感
        if (viewAngle > 0) {
            // 光从左边来，右边暗
            const grad = ctx.createLinearGradient(-100, 0, 100, 0);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,0.1)');
            ctx.fillStyle = grad;
            ctx.fill();
        } else {
            const grad = ctx.createLinearGradient(100, 0, -100, 0);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,0.1)');
            ctx.fillStyle = grad;
            ctx.fill();
        }
        // 计算综合情感系数

        const h = happy;
        const a = angry;
        const s = sad;
        const u = surprised;

        // 2. 绘制眉毛 (根据角度偏移)
        // 左眉基准 (-60, -60), 右眉基准 (60, -60)
        // 深度 z: 眉毛略微凸出 z=10
        const browZ = 10;
        const leftBrowX = this.projectX(-(150 + browXAdd), browZ, rad);
        const rightBrowX = this.projectX((1 + browXAdd), browZ, rad);

        // 只有当眉毛在视野内才绘制 (简单裁剪)
        if (viewAngle < 60) this.drawEyebrow(leftBrowX, 50 + browYAdd, a, s, u, true, rad, browlongAdd, browWidthAdd, browColor);
        if (viewAngle > -60) this.drawEyebrow(rightBrowX, 50 + browYAdd, a, s, u, false, rad, browlongAdd, browWidthAdd, browColor);

        // 3. 绘制眼睛
        const eyeZ = 25;
        const leftEyeX = this.projectX(-150 - eyeXadd, eyeZ, rad);
        const rightEyeX = this.projectX(0 + eyeXadd, eyeZ, rad);

        if (viewAngle < 70) this.drawEye(leftEyeX, 100 + eyeYadd, a, s, u, h, true, rad, eyeHeightAdd,
            eyeWidthAdd,
            eyeColor1,
            eyeColor2,
            eyeColor3, eyeSizeAdd);
        if (viewAngle > -70) this.drawEye(rightEyeX, 100 + eyeYadd, a, s, u, h, false, rad, eyeHeightAdd,
            eyeWidthAdd,
            eyeColor1,
            eyeColor2,
            eyeColor3, eyeSizeAdd);

        // 4. 绘制鼻子 (关键侧视部件)
        this.drawNose(rad, a, u, noseWidthAdd, noseColor, noseYAdd, noseLongAdd, noseColor2);

        // 5. 绘制嘴巴
        const mouthZ = 20;
        const mouthCenterX = this.projectX(-100, mouthZ, rad);
        this.drawMouth(mouthCenterX, h, a, s, u, rad, mouthColor1, mouthlineWidthAdd, mouthWidthAdd, mouthYAdd, mouthColor2, isSpeak,
            SpeakValue);
        ctx.restore();

    }


    drawEyebrow(x, y, anger, sadness, surprise, isLeft, rad, longAdd = 0, widthAdd = 0, color = "#4a3b32") {
        let ctx = this.ctx
        ctx.beginPath();
        ctx.lineWidth = 8 + widthAdd;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;

        let rotate = 0;
        let offsetY = 0;

        if (isLeft) {
            rotate += anger * 0.4;
            rotate -= sadness * 0.3;
            offsetY -= surprise * 30;
        } else {
            rotate -= anger * 0.4;
            rotate += sadness * 0.3;
            offsetY -= surprise * 30;
        }

        // 侧视时眉毛长度视觉压缩
        const widthScale = Math.cos(rad * 0.3);

        ctx.save();
        ctx.translate(x, y + offsetY);
        ctx.rotate(rotate);

        ctx.moveTo((-25 - longAdd) * widthScale, 0);
        ctx.quadraticCurveTo(0, -5, (25 + longAdd) * widthScale, 0);
        ctx.stroke();
        ctx.restore();
    }

    drawEye(x, y, anger, sadness, surprise, happiness, isLeft, rad,
        eyeHeightAdd = 0, eyeWidthAdd = 0, eyeColor1 = '#fff', eyeColor2 = '#000', eyeColor3 = '#ff', eyeSizeAdd = 1) {

        let ctx = this.ctx

        let eyeHeight = 30 + eyeHeightAdd;

        eyeHeight += surprise * 15;
        eyeHeight -= happiness * 10;
        eyeHeight -= anger * 5;

        let upperLidDrop = sadness * 8;

        // 侧视时眼睛变窄
        const widthScale = Math.max(0.2, Math.cos(rad * 0.5));
        const w = (45 + eyeWidthAdd) * widthScale;

        ctx.fillStyle = eyeColor1;
        ctx.beginPath();
        ctx.moveTo(x - w, y);
        ctx.bezierCurveTo(x - w / 2, y - eyeHeight - upperLidDrop, x + w / 2, y - eyeHeight - upperLidDrop, x + w, y);
        ctx.bezierCurveTo(x + w / 2, y + eyeHeight * 0.8, x - w / 2, y + eyeHeight * 0.8, x - w, y);
        ctx.fill();

        // 瞳孔位置随视角移动
        const pupilOffset = rad * 5;


        // 3. 绘制虹膜 (Iris) - 核心精致部分
        const irisR = 8 * eyeSizeAdd * widthScale*2;
        // 创建复杂径向渐变：模拟光线穿透
        let cx = x + pupilOffset;
        let cy = y + (surprise * 2)
        const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, irisR);
        // grad.addColorStop(0, '#0f172a');      // 瞳孔边缘深色
        // grad.addColorStop(0.3, '#3b82f6');    // 中间亮蓝
        // grad.addColorStop(0.8, '#93c5fd');    // 外层浅蓝
        // grad.addColorStop(1, 'rgba(147, 197, 253, 0.1)'); // 
        
         grad.addColorStop(0, '#0f172a');      // 瞳孔边缘深色
        grad.addColorStop(0.3, '#3b82f6');    // 中间亮蓝
        grad.addColorStop(0.8, '#93c5fd');    // 外层浅蓝
        grad.addColorStop(1, 'rgba(147, 197, 253, 0.1)'); // 边缘融合


        ctx.beginPath();
        ctx.arc(cx, cy, irisR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();


        // 4. 绘制虹膜纹理 (放射状线条，增加细节)
        ctx.save();
        ctx.clip(); // 限制在虹膜范围内
        ctx.beginPath();
        for (let i = 0; i < 360; i += 15) {
            const rad = i * Math.PI / 180;
            ctx.moveTo(cx + Math.cos(rad) * 8, cy + Math.sin(rad) * 8);
            ctx.lineTo(cx + Math.cos(rad) * irisR, cy + Math.sin(rad) * irisR);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();


        // ctx.fillStyle = eyeColor2;
        // ctx.beginPath();
        // ctx.arc(x + pupilOffset, y + (surprise * 2), 8 * eyeSizeAdd * widthScale, 0, Math.PI * 2);
        // ctx.fill();

        ctx.fillStyle = eyeColor3;
        ctx.beginPath();
        ctx.arc(x + pupilOffset -13, y -13 + (surprise * 2), 4 * widthScale, 0, Math.PI * 2);
        ctx.fill();
    }

    drawNose(rad, anger, surprise,
        noseWidthAdd = 0, noseColor = 'rgba(100, 80, 70, 0.3)', noseYAdd = 0, noseLongAdd = 0, noseColor2 = 'rgba(0,0,0,0.05)') {
        let ctx = this.ctx
        ctx.beginPath();
        ctx.lineWidth = 10 + noseWidthAdd;
        ctx.strokeStyle = noseColor;
        ctx.lineCap = 'round';

        // 鼻梁顶点
        const bridgeTopX = this.projectX(-100, 80, rad);

        const addY = noseYAdd;

        const bridgeTopY = 100 + addY;

        // 鼻尖 (最凸出部分 z=40)
        const tipX = this.projectX(-140, 80, rad);
        const tipY = 145 + addY;

        // 鼻底
        const baseX = this.projectX(-100, 80, rad);
        const baseY = 155 + addY + noseLongAdd;

        // 绘制鼻梁侧面轮廓
        ctx.moveTo(bridgeTopX, bridgeTopY);
        ctx.quadraticCurveTo(tipX - (rad * 10), tipY - 10, tipX, tipY);
        // 绘制鼻底
        ctx.quadraticCurveTo(tipX + (rad * 5), baseY, baseX, baseY);
        // 如果是侧视，绘制鼻孔侧面
        if (Math.abs(rad) > 0.2) {
            ctx.moveTo(tipX, tipY);
            ctx.quadraticCurveTo(tipX + (rad * 15), tipY + 5, baseX, baseY);
        }

        ctx.stroke();
        // 鼻影
        if (rad > 0) {
            ctx.fillStyle = noseColor2;
            ctx.beginPath();
            ctx.moveTo(bridgeTopX, bridgeTopY);
            ctx.lineTo(tipX, tipY);
            ctx.lineTo(baseX, baseY);
            ctx.fill();
        }
    }

    drawMouth(centerX, happy, angry, sad, surprised, rad,
        mouthColor1 = "#c48bff",
        mouthlineWidthAdd = 0,
        mouthWidthAdd = 0,
        mouthYAdd = 0,
        mouthColor2 = '#6a003a',
        isSpeak,
        SpeakValue

    ) {
        let ctx = this.ctx
        ctx.beginPath();
        ctx.lineWidth = 10 + mouthlineWidthAdd;
        ctx.lineCap = 'round';
        ctx.strokeStyle = mouthColor1;

        const width = (50 + mouthWidthAdd) * Math.cos(rad * 0.4); // 嘴宽随角度变化
        const baseY = 200 + mouthYAdd;

        let cornerY = baseY;
        cornerY -= happy * 25;
        cornerY += sad * 15;
        cornerY += angry * 10;

        let openAmount = surprised * 30 + angry * 5;

        // 嘴角X坐标随视角偏移
        const leftCornerX = centerX - width;
        const rightCornerX = centerX + width;

        // 上唇
        ctx.moveTo(leftCornerX, cornerY);
        const cupidsBowY = cornerY - (happy * 5) + (angry * 5);

        if (isSpeak) {
            openAmount = SpeakValue * 30
        }



        // 唇峰也随视角轻微偏移
        ctx.quadraticCurveTo(centerX, cupidsBowY, rightCornerX, cornerY);
        if (openAmount > 2) {
            ctx.stroke();
            ctx.beginPath();
            ctx.fillStyle = mouthColor2;
            ctx.moveTo(leftCornerX, cornerY);
            ctx.quadraticCurveTo(centerX, cornerY + openAmount * 2, rightCornerX, cornerY);
            ctx.quadraticCurveTo(centerX, cornerY + -openAmount * 2, leftCornerX, cornerY);
            ctx.fill();
        } else {
            ctx.quadraticCurveTo(centerX, cornerY + 10, leftCornerX, cornerY);
            ctx.stroke();
        }
    }

    // 伪3D投影辅助函数：根据角度计算X坐标偏移和缩放
    projectX(x, z, angleRad) {
        // 简单的弱透视投影模拟
        // x: 原始2D平面上的x坐标
        // z: 深度系数 (正数表示凸出，负数表示凹陷)
        // angleRad: 旋转角度

        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);

        // 旋转后的X坐标
        const rotatedX = x * cos - z * sin;
        // 简单的透视缩放因子 (假设相机在Z轴远处)
        const perspectiveScale = 1 / (1 - (z * sin) * 0.002);

        return rotatedX * perspectiveScale;
    }

}




