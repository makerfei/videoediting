
// ==================== 视频预览 =================
// 视频内容更新
function updateVideoPreview() {
  myState.dataToKonva((instate) => {
    console.log("画布重新画 ----reStart---- 画布重新画")
    stopPlayback()
    myStage.reStart(instate)
    myAudio.reStart(instate)
  })

}
