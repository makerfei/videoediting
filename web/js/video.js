
// ==================== 视频预览 ====================
updatetime = () => {
  this.timer = null
  function restart(instate) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      console.log("画布重新画 ----reStart---- 画布重新画")
      stopPlayback()
      myStage.reStart(instate)
      myAudio.reStart(instate)
    }, 1000);

  }
  return restart
}

let restart = updatetime()

// 视频内容更新
function updateVideoPreview() {
  state.tracks.forEach(t => {
    t.clips.sort((a, b) => a.start - b.start);
  });
  restart(state)

  // 重新设置定时器
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
