
function personLinkTrack(data) {
    let { width, height, src, trackid, currentTime } = data
    let pathList = src.split("/")
    let person = myState.personList[`${pathList[2]}${pathList[3].split(".")[0]}`]

    let face = person.find(i => i.name == "头")
    let note = JSON.parse(face.note)

    //  // 有他的声音轨道 脸跟着声音走
    let soundTrack = state.tracks.find(i => i.type == "audio" && i.id.split("-")[1] == trackid.split("-")[1])
    if (soundTrack) {
        let { currClip: currClipSound, preClip: preClipSound } = currTimeClip(currentTime, soundTrack)
        if (currClipSound.length > 0) {
            currClipSound = currClipSound[0]
            const SpeakValue = (Math.sin((currentTime - currClipSound.start) * 15) + 1) / 2;
            note = {
                ...note, ...currClipSound.emo_dict, isSpeak: true, SpeakValue,
                "X": (note.X + Math.sin((currentTime - currClipSound.start) * 15) * 1),
                "Y": (note.Y + Math.sin((currentTime - currClipSound.start) * 15) * 1),
            }
        } else if (preClipSound) {
            note = { ...note, ...preClipSound.emo_dict }
        }
    }


    // 动作
    let actionTrack = state.tracks.find(i => i.type == "action" && i.id.split("-")[1] == trackid.split("-")[1])
    let Bones = {}
    if (actionTrack) {
        let { currClip: currClipAction, preClip: preClipAction } = currTimeClip(currentTime, actionTrack)
        // 当前动画
        if (currClipAction.length>0) {
            let BonesList = []
            // 把所有动画定格到一瞬
            currClipAction.forEach(c => {
                BonesList.push(getMoveToAction({ start: c.start, duration: c.duration, actionList: c.actionList, currentTime }))
            })
            // 把多个一瞬间融合
            BonesList.forEach(b => {
                for (let key in b) {
                    if (key in Bones) {
                        Bones[key].rotation += b[key].rotation
                        Bones[key].x += b[key].x
                        Bones[key].y += b[key].y
                    } else {
                        Bones[key] = { ...b[key] }
                    }
                }
            })
        } else if (preClipAction) {
            
            Bones = getMoveToAction({ start: preClipAction.start, duration: preClipAction.duration, actionList: preClipAction.actionList, currentTime })
        }
    }

    let personAndBones = []

    person.forEach(e => {
        let BonesItem = {rotation:0,offsetX:0,offsetY:0}
        if (e.name in Bones) {
            BonesItem = {rotation: Bones[e.name].rotation,offsetX: Bones[e.name].x,offsetY: Bones[e.name].y}   
        }
        personAndBones.push({ ...e, ...BonesItem })

    })


    return getimage(width, height, [
        ...personAndBones.filter(i => i.name !== "头"),
        {
            ...face,
            note: JSON.stringify(note)

        }
    ])
}
// 算出一帧动画的姿态
function getMoveToAction({ start, duration, actionList, currentTime }) {
    let time = currentTime
    if (currentTime > (start + duration)) {
        time = start + duration
    }
    if (actionList.length == 1) {
        return actionList[0].Bones
    } else {
        let ratio = 3
        let indexProgress = ((time - start) * ratio) % (actionList.length - 1)
        let index = Math.floor(indexProgress)
        let progress = indexProgress - index;
        let currAction = actionList[index]
        let nextAction = actionList[index + 1]
        let BonesList = {}
        for (let key in currAction.Bones) {
            let rotation = currAction.Bones[key].rotation
            let x = currAction.Bones[key].x
            let y = currAction.Bones[key].y
            if (key in nextAction.Bones) {
                rotation = nextAction.Bones[key].rotation * progress + (1 - progress) * currAction.Bones[key].rotation
                x = nextAction.Bones[key].x * progress + (1 - progress) * currAction.Bones[key].x
                y = nextAction.Bones[key].y * progress + (1 - progress) * currAction.Bones[key].y
            }
            BonesList[key] = { rotation, x, y }
        }
        return BonesList
    }
}





// 判断show图层是否选中次图层
function currTimeClip(currTime, track) {
    let currClip = [];
    let preClip = null
    track.clips.forEach(c => {
        if (c.start <= currTime && (c.start + c.duration) > currTime) {
            currClip.push(c)
        } else if ((c.start + c.duration) < currTime && currClip.length == 0) {
            preClip = c
        }
    })
    return { currClip, preClip }
}



