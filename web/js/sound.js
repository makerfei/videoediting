class Sound {
    constructor() {
        this.soundList = []; //{"name","ee","type":"mp3"}
        this.getSoundContent()
    }

    async getSoundContent() {
        this.soundList = []
        let list = await axios.post('/api/pageOperation/getSourceData', { source: "sound" })
        list.data.files.forEach(element => {
            // "sound/张某/伤撒心.wav"
            let [name, type] = element.split("/")[1].split(".")
            this.soundList.push({ name, type })
        });

        this.render()
    }

    render() {

        let soundListEl = document.getElementById("soundList")
        let soundInputEl = document.getElementById("soundInput")
        let dEl = document.createElement("div")

        this.soundList.forEach(p => {
                let sEl = document.createElement("span")
                sEl.innerText = p.name
                sEl.onclick = () => {
                    let track = state.selectedTrackId && state.tracks.find(i => i.id == state.selectedTrackId)
                    if (!track || !(track.type == "audio")) {
                        showToast("请选择audio轨道")
                        return
                    }
                    soundInputEl.value += `\n${track.id}>${p.name}.${p.type}>`
                }
            dEl.append(sEl)
        })
        soundListEl.append(dEl)

    }
}

