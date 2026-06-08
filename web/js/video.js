
// ==================== 视频预览 ====================

// 视频内容更新
function updateVideoPreview() {
  console.log("updateVideoPreview",state)
  
    myStage.reStart(state)
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
