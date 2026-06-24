class Sound {
    constructor() {
        this.soundList = []; //{"name","ee","type":"mp3"}
        this.isRunAi = false
        this.soundEmoList = [
            { name: "开心愉悦", list: ["非常开心地笑着说", "语气轻快愉悦", "带着笑意说话"] },
            { name: "悲伤低落", list: ["语气哽咽难过", "带着哭腔悲伤地说", "情绪很低落"] },
            { name: "愤怒激动", list: ["生气地大声质问", "语气愤怒暴躁", "带着怒火说话"] },
            { name: "害怕慌张", list: ["非常害怕，声音发抖", "慌张急促地说", "吓得声音发颤"] },
            { name: "平静中性", list: ["语气平稳自然", "用平常的语速平静讲述", "不带明显情绪"] },
            { name: "旁白讲解", list: ["用温和舒缓的语气讲解", "专业沉稳的播音腔"] },
            { name: "日常对话", list: ["像朋友聊天一样轻松自然", "生活化的口语语气"] },
            { name: "紧急提示", list: ["语速急促，语气紧张", "急切地大声提醒"] }
        ]
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
        soundSumbit.onclick = async () => {
            if (this.isRunAi) {
                showToast("正在运行中")
                return
            }
            this.isRunAi = true
            let currTime = state.currentTime

            // 解析获取
            let soundInputEl = document.getElementById("soundInput").value
            let soundList = soundInputEl.split("\n")
            let soundjsonList = []
            soundList.forEach(soundItem => {
                if (soundItem) {
                    let [soundPerson, SoundTxt] = soundItem.split(":")
                    let [track, soundPath,type, value] = soundPerson.split(">")
                   
                    let emo_audio_prompt = ""
                    let emo_text = ""
                    if(type=="emo_audio_prompt"){
                        emo_audio_prompt = value
                    }else if(type=="emo_text"){
                        emo_text = value
                    }



                    soundjsonList.push({
                        text: SoundTxt,
                        emo_text: emo_text,
                        spk_audio_prompt: "sound/" + soundPath,
                        track: track,
                        emo_audio_prompt:emo_audio_prompt
                    })
                }

            })

            await axios.post('/api/script_api', {
                script_path: "../videotool/ttsList.py",
                input_value: {
                    list: soundjsonList
                },
                venv_python_path: "/Users/zhangfei/miniconda3/envs/indextts_clean/bin/python"
            }).then(res => {
                let list = JSON.parse(res.data)
                list.forEach(item => {
                    let { text, emo_text, spk_audio_prompt, track, duration, output_path } = item
                    addSoundClip({
                        src: output_path,
                        duration,
                        spk: spk_audio_prompt,
                        text: text,
                        start: currTime,
                        trackId: track
                    })
                    currTime += duration
                })



            })

            this.isRunAi = false

        }
    }
    render() {
        let soundListEl = document.getElementById("soundList")
        let soundInputEl = document.getElementById("soundInput")
        let dEl = document.createElement("div")

        // 加载人物
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

        let EEl = document.createElement("div")
        // 加载情绪
        this.soundEmoList.forEach(p => {
            let sEl = document.createElement("div")

            sEl.innerText = p.name
            p.list.forEach(t => {
                let TEL = document.createElement("span")
                TEL.innerHTML = t
                TEL.onclick = () => {
                    soundInputEl.value += `emo_text>${t}:`
                }

                sEl.append(TEL)
            })

            EEl.append(sEl)
        })
        soundListEl.append(EEl)



    }
}

