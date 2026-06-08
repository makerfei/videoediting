class itemKeyframe {
    constructor() {

    }
    show(keyframe) {
        this.setkeyframetxt(keyframe)
    }

    setkeyframetxt(keyframe) {
        const formattedJson = JSON.stringify(keyframe, null, 2);
        document.getElementById("json-preview").textContent = formattedJson;
    }

}

myitemKeyframe = new itemKeyframe()