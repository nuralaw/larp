"use strict";
const audio = document.getElementById('song-audio');
let localSelection = 0;
let loadedTrack = -1;
let waitingForInteraction = false;
function resumeAfterInteraction(event) {
  if (!waitingForInteraction || event.target.closest?.('.record-controls, #song-picker')) return;
  if (event.type === 'keydown' && (event.ctrlKey || event.altKey || event.metaKey)) return;
  playAudio();
}
document.addEventListener('click', resumeAfterInteraction);
document.addEventListener('keydown', resumeAfterInteraction);
async function playAudio() {
  const request = localSelection;
  try { await audio.play(); }
  catch (error) {
    if (request !== localSelection || error.name === 'AbortError') return;
    waitingForInteraction = error.name === 'NotAllowedError';
    status.textContent = waitingForInteraction ? 'Нажми на страницу или ▶, чтобы включить музыку.' : 'Не удалось воспроизвести: assets/audio/' + tracks[currentTrack].slug + '.mp3';
    setPlaying(false);
  }
}
window.localPlay = (index) => {
  localSelection++;
  audio.pause();
  loadedTrack = index;
  audio.src = 'assets/audio/' + tracks[index].slug + '.mp3';
  playAudio();
};
window.localToggle = () => {
  if (loadedTrack !== currentTrack) return window.localPlay(currentTrack);
  if (audio.paused) playAudio();
  else { waitingForInteraction = false; audio.pause(); }
};
audio.addEventListener('playing', () => { waitingForInteraction = false; setPlaying(true); status.textContent = ''; });
audio.addEventListener('pause', () => setPlaying(false));
audio.addEventListener('waiting', () => setPlaying(false));
audio.addEventListener('error', () => { setPlaying(false); status.textContent = 'Не найден файл: assets/audio/' + tracks[currentTrack].slug + '.mp3'; });
audio.addEventListener('ended', () => selectTrack(currentTrack + 1));
playButton.disabled = false;
window.localPlay(currentTrack);
