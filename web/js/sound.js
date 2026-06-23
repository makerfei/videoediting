class Sound {
    constructor() {
        this.soundList = []; //{name:"",list:[{"name","ee","type":"mp3"}]}
        this.getSoundContent()
    }

    async getSoundContent() {
        let list = await axios.post('/api/pageOperation/getSourceData', { source: "sound" })
        let awaitAll = []
        list.data.files.forEach(element => {
            let p = new Promise((resolve, reject) => {
                axios.post('/api/pageOperation/getSourceData', { source: element }).then(res => {
                    res.data.files.forEach(s => {
                        // "sound/张某/伤撒心.wav"
                        let [name, type] = s.split("/")[2].split(".")
                        let person = s.split("/")[1]
                        let soundItem = this.soundList.find(i => i.name == person)
                        if (soundItem) {
                            soundItem.list.push({ name, type })
                        } else {
                            this.soundList.push({ name: person, list: [{ name, type }] })
                        }
                        resolve()
                    })


                })
            })
            awaitAll.push(p)
        });
        await Promise.all(awaitAll)
        this.render()
    }

    render() {

        let soundListEl = document.getElementById("soundList")
        let soundInputEl = document.getElementById("soundInput")
        this.soundList.forEach(p => {
            let PEl = document.createElement("div")
            let PNEl = document.createElement("span")
            PNEl.innerText = p.name
            PEl.append(PNEl)
            p.list.forEach(s => {
                let sEl = document.createElement("span")
                sEl.innerText = s.name
                sEl.onclick = () => {
                    
                    let track = state.selectedTrackId && state.tracks.find(i => i.id == state.selectedTrackId)
                    if (!track || !(track.type == "audio")) {
                        showToast("请选择audio轨道")
                        return
                    }

                    soundInputEl.value += `\n${track.id}>${p.name}>${s.name}.${s.type}:`

                }
                PEl.append(sEl)
            })
            soundListEl.append(PEl)
        })
    }
}

