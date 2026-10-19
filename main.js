"use strict";
const colors = ['#9e365e', '#86294e', '#b24370', '#76233f', '#a33760', '#902d59'];
document.querySelectorAll('.hearts').forEach((side, sideIndex) => {
  for (let i = 0; i < 24; i++) {
    const heart = document.createElement('span');
    heart.className = 'pixel-heart';
    heart.style.setProperty('--size', `${18 + ((i * 17 + sideIndex * 11) % 46)}px`);
    heart.style.setProperty('--color', colors[(i + sideIndex * 2) % colors.length]);
    heart.style.left = `${((i * 37 + sideIndex * 19) % 86) - 6}%`;
    heart.style.top = `${i * 4.15}%`;
    heart.style.opacity = `${0.55 + (i % 3) * 0.16}`;
    heart.style.setProperty('--delay', `${-i * 0.73 - sideIndex * 2}s`);
    heart.style.setProperty('--duration', `${4 + (i % 5) * 0.7}s`);
    side.appendChild(heart);
  }
  for (let i = 0; i < 8; i++) {
    const type = (i + sideIndex) % 2 ? 'star' : 'heart';
    const sticker = document.getElementById(`sticker-${type}-template`).content.firstElementChild.cloneNode(true);
    sticker.style.setProperty('--sticker-size', `${36 + ((i * 19 + sideIndex * 13) % 37)}px`);
    sticker.style.setProperty('--sticker-angle', `${((i * 31 + sideIndex * 23) % 75) - 37}deg`);
    sticker.style.setProperty('--float-duration', `${4.5 + ((i * 7 + sideIndex * 3) % 6) * 0.6}s`);
    sticker.style.setProperty('--float-delay', `${-i * 1.3 - sideIndex * 2.1}s`);
    sticker.style.left = `${8 + ((i * 29 + sideIndex * 17) % 47)}%`;
    sticker.style.top = `${3 + i * 12 + ((i * 7 + sideIndex * 3) % 6)}%`;
    side.appendChild(sticker);
  }
});


const tracks = [
  { title: 'we fell in love in october', artist: 'girl in red', slug: 'we-fell-in-love-in-october', color: '#e3b3a3' },
  { title: 'Lovers Rock', artist: 'TV Girl', slug: 'lovers-rock', color: '#deb0c4' },
  { title: 'Looking Out for You', artist: 'Joy Again', slug: 'looking-out-for-you', color: '#cbd7b6' },
  { title: 'Sparks', artist: 'Coldplay', slug: 'sparks', color: '#edcca1' },
  { title: 'Every Breath You Take', artist: 'The Police', slug: 'every-breath-you-take', color: '#c6c8e3' },
  { title: 'Forever', artist: 'Alex G', slug: 'forever', color: '#b9d3cf' }
];
const island = document.querySelector('.music-island');
const status = document.getElementById('music-status');
const playButton = document.getElementById('toggle-play');
const picker = document.getElementById('song-picker');
const cover = document.getElementById('track-cover');
let currentTrack = 0;
let coverRequest = 0;
tracks.forEach((track, index) => picker.add(new Option(track.artist + ' - ' + track.title, index)));
function setPlaying(value) {
  island.classList.toggle('is-playing', value);
  playButton.textContent = value ? '\u2161' : '\u25b6';
  playButton.setAttribute('aria-label', value ? 'Pause' : 'Play');
}
function updateCover(track) {
  cover.hidden = true;
  island.classList.remove('has-cover');
  cover.alt = track.title + ' - ' + track.artist;
  cover.src = 'assets/covers/' + track.slug + '.jpg';
}
cover.addEventListener('load', () => { cover.hidden = false; island.classList.add('has-cover'); });
cover.addEventListener('error', () => { cover.hidden = true; island.classList.remove('has-cover'); });
function selectTrack(index, autoplay = true) {
  currentTrack = (index + tracks.length) % tracks.length;
  const track = tracks[currentTrack];
  setPlaying(false);
  document.getElementById('track-title').textContent = track.title;
  document.getElementById('track-artist').textContent = track.artist;
  island.style.setProperty('--label-color', track.color);
  picker.value = String(currentTrack);
  updateCover(track);
  if (autoplay) window.localPlay?.(currentTrack);
}
document.getElementById('previous-track').addEventListener('click', () => selectTrack(currentTrack - 1));
document.getElementById('next-track').addEventListener('click', () => selectTrack(currentTrack + 1));
picker.addEventListener('change', () => selectTrack(Number(picker.value)));
playButton.addEventListener('click', () => window.localToggle?.());
selectTrack(0, false);

// Pointer capture supports mouse, pen, and touch without stealing player clicks.
const handle = document.querySelector('.drag-handle');
let corner = 'bottom-right';
let drag = null;
function snap(nextCorner) {
  corner = nextCorner;
  const margin = 12;
  const maxX = Math.max(margin, innerWidth - island.offsetWidth - margin);
  const maxY = Math.max(margin, innerHeight - island.offsetHeight - margin);
  island.style.left = `${corner.endsWith('right') ? maxX : margin}px`;
  island.style.top = `${corner.startsWith('bottom') ? maxY : margin}px`;
}
handle.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  const rect = island.getBoundingClientRect();
  drag = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  handle.setPointerCapture(event.pointerId);
  island.classList.add('dragging');
});
handle.addEventListener('pointermove', (event) => {
  if (!drag) return;
  island.style.left = `${Math.max(0, Math.min(innerWidth - island.offsetWidth, event.clientX - drag.x))}px`;
  island.style.top = `${Math.max(0, Math.min(innerHeight - island.offsetHeight, event.clientY - drag.y))}px`;
});
function endDrag() {
  if (!drag) return;
  drag = null;
  island.classList.remove('dragging');
  const rect = island.getBoundingClientRect();
  snap(`${rect.top + rect.height / 2 < innerHeight / 2 ? 'top' : 'bottom'}-${rect.left + rect.width / 2 < innerWidth / 2 ? 'left' : 'right'}`);
}
handle.addEventListener('pointerup', endDrag);
handle.addEventListener('pointercancel', endDrag);
handle.addEventListener('lostpointercapture', endDrag);
handle.addEventListener('keydown', (event) => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
  event.preventDefault();
  let [vertical, horizontal] = corner.split('-');
  if (event.key === 'ArrowLeft') horizontal = 'left';
  if (event.key === 'ArrowRight') horizontal = 'right';
  if (event.key === 'ArrowUp') vertical = 'top';
  if (event.key === 'ArrowDown') vertical = 'bottom';
  snap(`${vertical}-${horizontal}`);
});
window.addEventListener('resize', () => snap(corner));
snap(corner);
