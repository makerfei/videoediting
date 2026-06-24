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

        this.listeners()
        this.render()
    }

    listeners() {
        let soundSumbitEl = document.getElementById("soundSumbit")
        soundSumbit.onclick = () => {
            axios.post('/api/script_api', {
                script_path: "../videotool/tts.py",
                input_value: {
                    text: "我真的太开心了",
                    emo_text:"很生气",
                    spk_audio_prompt: "sound/voice_01.wav"
                },
                venv_python_path: "/Users/zhangfei/miniconda3/envs/indextts_clean/bin/python"
            }).then(res=>{
                 let data = JSON.parse(res.data)
                 let{src,duration} = data
                 debugger
            })





        }
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

