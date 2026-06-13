class myPageOperationClass {
    constructor() {
        this.sourcePath = "source"
        this.typeSelect = "";
        this.categorizationSelect = ""
        this.fillSelect = ""

        this.typeList = []
        this.categorizationList = []
        this.fillList = []


        this.getTypeListData().then(async () => {
            await this.getCategorizationListData();
            await this.getFillListData()


            this.updataTypeUI()
        })
    }
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


    getFillListData() {
        return this.apiAxiosGetFillNameList(`${this.sourcePath}/${this.typeSelect}/${this.categorizationSelect}`, 3).then(res => {
            this.fillList = res
            return res
        })

    }

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
        this.fillList.forEach(e => {
            let img = document.createElement("img")
            img.src = `${this.sourcePath}/${this.typeSelect}/${this.categorizationSelect}/${e}`
            img.onclick = this.fillListClick
            fillListUIEL.appendChild(img)
        })
    }
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
    categorizationClick(_this, e) {
        _this.categorizationSelect = e.currentTarget.textContent
        _this.fillSelect = ""
        _this.getFillListData().then(() => {
            _this.updataTypeUI()
        })



    }
    fillListClick(e) {


    }






}







