
function updateMaxTime() {
    let max = 30; // 最小30秒
    state.tracks.forEach(track => {
        track.clips.forEach(clip => {
            const end = clip.start + clip.duration;
            if (end > max) max = end;
        });
    });
    state.maxTime = Math.ceil(max + 5); // 留5秒余地
}

function renderRuler() {
    DOM.ruler.innerHTML = '';
    const totalWidth = state.maxTime * state.scale;
    DOM.ruler.style.width = totalWidth + 'px';

    for (let i = 0; i <= state.maxTime; i++) {
        const tick = document.createElement('div');
        tick.className = 'tick';
        if (i % 5 === 0) tick.classList.add('major');
        tick.style.width = state.scale + 'px';
        tick.textContent = i //+ 's';
        DOM.ruler.appendChild(tick);
    }
    DOM.zoomLevel.textContent = Math.round(state.scale) + '%';
}