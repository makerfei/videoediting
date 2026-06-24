class myPageOperationClass {
    constructor() {
        this.topSurcePath = "web"
        this.sourcePath = "source"
        this.typeSelect = "";
        this.categorizationSelect = ""
        this.fillSelect = ""

        this.typeList = []
        this.categorizationList = []
        this.fillList = []

        this.action = []
        this.keyMoveList = []

        this.getTypeListData().then(async () => {
            await this.getCategorizationListData();
            await this.getFillListData()
            this.updataTypeUI()
        })
    }
    // 获取页面数据
    apiAxiosGetFillNameList(name, index) {
        return axios.post('/api/pageOperation/getSourceData', { source: name })
            .then(response => {
                let data = response.data
                let res = []
                data.files.forEach(element => {
                    res.push(element.split("/")[index])
                });
                return res
            })

    }
    // 获取typelist
    getTypeListData() {
        return this.apiAxiosGetFillNameList(this.sourcePath, 1).then(res => {
            this.typeList = res
            if (!this.typeSelect) {
                this.typeSelect = this.typeList[0]
            }
            return res
        })
    }
    // 获取categorizationList
    getCategorizationListData() {
        return this.apiAxiosGetFillNameList(`${this.sourcePath}/${this.typeSelect}`, 2).then(res => {
            this.categorizationList = res
            if (!this.categorizationSelect) {
                this.categorizationSelect = this.categorizationList[0]
            }
            return res
        })
    }

    // 获取图片资源
    getFillListData() {
        return this.apiAxiosGetFillNameList(`${this.sourcePath}/${this.typeSelect}/${this.categorizationSelect}`, 3).then(res => {
            this.fillList = res
            return res
        })

    }
    // 更新页面
    updataTypeUI() {
        let typeUIEL = document.getElementById("typeUI")
        let categorizationListUIEL = document.getElementById("categorizationListUI")
        let fillListUIEL = document.getElementById("fillListUI")

        typeUIEL.innerHTML = '';
        categorizationListUIEL.innerHTML = '';
        fillListUIEL.innerHTML = '';

        this.typeList.forEach(e => {
            let butt = document.createElement("button")
            butt.className = "btn"
            butt.textContent = e
            butt.onclick = (e) => this.typeClick(this, e)
            typeUIEL.appendChild(butt)
            if (this.typeSelect == e) {
                butt.classList.add("btn-primary")
            }
        })
        this.categorizationList.forEach(e => {
            let span = document.createElement("span")
            span.textContent = e
            span.onclick = (e) => this.categorizationClick(this, e)
            categorizationListUIEL.appendChild(span)
            if (this.categorizationSelect == e) {
                span.classList.add("btn-primary")
            }
        })
        this.fillList.forEach(async e => {
            if (this.typeSelect == "动作") {
                let fullname = `${this.sourcePath}/${this.typeSelect}/${this.categorizationSelect}/${e.split(".")[0]}.json`
                let { data } = await axios(fullname)
                this.action[this.categorizationSelect] = data.action
                this.keyMoveList[this.categorizationSelect] = data.keyMoveList
                let zdEl = document.createElement("div")
                zdEl.innerText = "姿态: "
                zdEl.className = "zdel"
                fillListUIEL.append(zdEl)
                data.action.forEach(item => {
                    let zdElItem = document.createElement("span")
                    zdElItem.innerText = item.name
                    zdElItem.onclick = () => { this.fillListClick({ actionName: item.name, source: this.sourcePath, type: this.typeSelect, categorization: this.categorizationSelect, name: e }) }
                    zdEl.append(zdElItem)
                })
                let ddEl = document.createElement("div")
                ddEl.innerText = "动画: "
                ddEl.className = "zdel"
                fillListUIEL.append(ddEl)

                data.keyMoveList.forEach(item => {
                    let ddElItem = document.createElement("span")
                    ddElItem.onclick = () => { this.fillListClick({ moveName: item.name, source: this.sourcePath, type: this.typeSelect, categorization: this.categorizationSelect, name: e }) }
                    ddElItem.innerText = item.name
                    ddEl.append(ddElItem)
                })

            } else if (this.typeSelect == "人物") {

                let img = document.createElement("img")
                img.src = `${this.sourcePath}/${this.typeSelect}/${this.categorizationSelect}/${e}`
                img.onclick = () => { this.fillListClick({ source: this.sourcePath, type: this.typeSelect, categorization: this.categorizationSelect, name: e }) }
                fillListUIEL.appendChild(img)
            } else if (this.typeSelect == "表情") {

                let img = document.createElement("img")
                img.src = `${this.sourcePath}/${this.typeSelect}/${this.categorizationSelect}/${e}`
                img.onclick = () => { this.fillListClick({ source: this.sourcePath, type: this.typeSelect, categorization: this.categorizationSelect, name: e }) }
                fillListUIEL.appendChild(img)

            } else if (this.typeSelect == "音效"||this.typeSelect == "语调") {
                let span = document.createElement("span")
                span.innerHTML = `${e}`
                span.className = "music"
                bindClickEvents(span, () => {
                    let src = `${this.sourcePath}/${this.typeSelect}/${this.categorizationSelect}/${e}`
                    const sound = new Audio(src);
                    sound.play();
                }, () => { this.fillListClick({ source: this.sourcePath, type: this.typeSelect, categorization: this.categorizationSelect, name: e }) })
                fillListUIEL.appendChild(span)
          

            } else {
                let img = document.createElement("img")
                img.src = `${this.sourcePath}/${this.typeSelect}/${this.categorizationSelect}/${e}`
                img.onclick = () => { this.fillListClick({ source: this.sourcePath, type: this.typeSelect, categorization: this.categorizationSelect, name: e }) }
                fillListUIEL.appendChild(img)
            }
        })
    }
    // 主类点击
    typeClick(_this, e) {
        _this.typeSelect = e.currentTarget.textContent;
        _this.categorizationSelect = ""
        _this.fillSelect = ""
        _this.getCategorizationListData().then(() => {
            _this.getFillListData().then(() => {
                _this.updataTypeUI()
            })
        })
    }
    // 副类点击
    categorizationClick(_this, e) {
        _this.categorizationSelect = e.currentTarget.textContent
        _this.fillSelect = ""
        _this.getFillListData().then(() => {
            _this.updataTypeUI()
        })
    }
    // 图片点击
    fillListClick({ source, type, categorization, name, actionName = "", moveName = "" }) {
        let jsonName = name.split(".")[0] + ".json"
        if (type == "人物") {
            let imgSrc = `${this.sourcePath}/${this.typeSelect}/${this.categorizationSelect}/${name}`
            let jsonSrc = `${this.sourcePath}/${this.typeSelect}/${this.categorizationSelect}/${jsonName}`
            addPersonToClip({ imgSrc, jsonSrc })
        } else if (type == "动作") {
            if (actionName) {
                addActionToClip({ categorization, name, actionName })
            } else if (moveName) {
                addMoveToClip({ categorization, name, moveName })
            }
        } else if (type == "表情") {
            let imgSrc = `${this.sourcePath}/${this.typeSelect}/${this.categorizationSelect}/${name}`
            addFaceClip({ imgSrc, name: name.split(".")[0] })
        } else if (type == "音效") {
            let src = `${this.sourcePath}/${this.typeSelect}/${this.categorizationSelect}/${name}`
            addAudioClip({ src, name: name.split(".")[0] })
        } else if (type == "语调") {

            let src = `${this.sourcePath}/${this.typeSelect}/${this.categorizationSelect}/${name}`
            addEmo_audio_prompt({ src, name: name.split(".")[0] })
        } else {
            let src = `${this.sourcePath}/${this.typeSelect}/${this.categorizationSelect}/${name}`
            addImgtoClip({ src, name: name.split(".")[0] })
        }
    }

    // 保存当前工作区
    async saveCurrentWorkspace() {
        let filename = document.getElementById("fillName").value
        if (!filename) {
            showToast("请填写名字")
            return
        }
        let saveData = {
            state: { ...state, name: filename },
            keyframes: myStage.keyframes,
            insetkeyframes: myStage.insetkeyframes
        }
        let fullname = `${this.topSurcePath}/${this.sourcePath}/${this.typeSelect}/${this.categorizationSelect}/${filename}`

        const dataURL = myStage.stage.toDataURL({ pixelRatio: 1 });
        const base64Data = dataURL.split(',');
        const blobImg = base64ToBlob(base64Data, 'image/png');

        const formDataImg = new FormData();
        formDataImg.append('file', blobImg, fullname + ".png"); // 'file' 是后端接收文件的字段名，需与后端约定
        formDataImg.append('index', '00000');


        const blobTxt = new Blob([JSON.stringify(saveData)], { type: "application/json" });
        const formDataTxt = new FormData();
        formDataTxt.append('file', blobTxt, fullname + ".json"); // 'file' 是后端接收文件的字段名，需与后端约定
        formDataTxt.append('index', '00000');
        // 5. 发送请求到后端接口
        const responseTxt = await fetch(UPLOAD_API_URL, { method: 'POST', body: formDataTxt });
        const responseImg = await fetch(UPLOAD_API_URL, { method: 'POST', body: formDataImg });
        if (!responseTxt.ok || !responseTxt.ok) {
            showToast(`上传失败`)
            throw new Error(`HTTP error! status: ${response.status}`);
        } else {
            showToast(`上传成功`)
        }

    }
}
function saveCurrentWorkspaceClick() {

    myPageOperation.saveCurrentWorkspace()

}









