
function personLinkTrack(data) {
    let { width, height, src, trackid, currentTime } = data
    let pathList = src.split("/")
    let person = myState.personList[`${pathList[2]}${pathList[3].split(".")[0]}`]





    let face = person.find(i => i.name == "头")
    let note = JSON.parse(face.note)
    let soundTrack = state.tracks.find(i => i.type == "audio" && i.id.split("-")[1] == trackid.split("-")[1])
    
    // 有他的声音轨道 脸跟着声音走
    if (soundTrack) {
        let { currClipSound, preClipSound } = currTimeClip(currentTime, soundTrack)
        if (currClipSound) {
            const SpeakValue = (Math.sin((currentTime - currClipSound.start) * 15) + 1) / 2;
            note = { ...note, ...currClipSound.emo_dict, isSpeak: true, SpeakValue,
                
                // "X":(note.X+Math.sin((currentTime - currClipSound.start) * 15)*3),
                "Y":(note.Y+Math.sin((currentTime - currClipSound.start) * 15)*3),
            
            }
        } else if (preClipSound) {
            note = { ...note, ...preClipSound.emo_dict }
        }
    }




    return getimage(width, height, [
        ...person.filter(i => i.name !== "头"),
        {
            ...face,
            note: JSON.stringify(note)

        }
    ])
}

//



// 判断show图层是否选中次图层
function currTimeClip(currTime, soundTrack) {
    let currClipSound = null;
    let preClipSound = null


    soundTrack.clips.forEach(c => {
        if (c.start <= currTime && (c.start + c.duration) > currTime) {
            currClipSound = c;
        } else if ((c.start + c.duration) < currTime && !currClipSound) {
            preClipSound = c
        }
    })
    return { currClipSound, preClipSound }
}



