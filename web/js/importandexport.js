class importandexportClass {
    constructor(inMyState, inMyStage) {
        this.state = inMyState
        this.myStage = inMyStage
    }
    exportData() {
        let outputdatajson = {
            path:`${this.state.name}.json`,
            data:{
                 state: this.state,
            keyframes: this.myStage.keyframes,
            insetkeyframes: this.myStage.insetkeyframes
            }
        }
        axios.post('/api/exportData', outputdatajson)
            .then(response => {
                showToast(`提交成功，ID: ${outputdatajson.state.name}`)
            })
            .catch(error => {
                showToast(`提交失败: ${error}`)
            });
    }

}

// ==================== 数据导出/导入 ====================
function exportData() {
    let importandexport = new importandexportClass(state, myStage)
    importandexport.exportData()


    // const data = {
    //     scale: state.scale,
    //     currentTime: state.currentTime,
    //     maxTime: state.maxTime,
    //     tracks: state.tracks
    // };
    // const json = JSON.stringify(data, null, 2);
    // const blob = new Blob([json], { type: 'application/json' });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = 'timeline_project.json';
    // a.click();
    // URL.revokeObjectURL(url);
    // showToast('项目已导出');
}