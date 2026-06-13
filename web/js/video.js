
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

function getActiveClipAtTime(time) {
  for (const track of state.tracks) {
    for (const clip of track.clips) {
      if (time >= clip.start && time < clip.start + clip.duration) {
        return { ...clip, type: track.type };
      }
    }
  }
  return null;
}
