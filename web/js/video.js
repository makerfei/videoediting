
// ==================== 视频预览 ====================

// 视频内容更新
function updateVideoPreview() {


  state.tracks.forEach(t => {
    t.clips.sort((a, b) => a.start - b.start);
  });
  console.log("updateVideoPreview", state)

  // 进入之前 先把类分好
  let timer
  if (timer) {
    clearTimeout(timer);
  }

  // 重新设置定时器
  timer = setTimeout(() => {
    // 使用 apply 确保 this 指向正确，并传递参数
      myStage.reStart(state)
    // func.apply(this, args);
  }, 1000);




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
