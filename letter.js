"use strict";
const envelope = document.querySelector('.closed-envelope');
const letter = document.getElementById('love-letter');
const ribbons = document.querySelectorAll('.photo-ribbon');
let photoFiles = window.sitePhotos?.photos || [];
const pinterestPhoto = file => ({ src: 'assets/pinterest/' + encodeURIComponent(file), alt: 'Романтичная картинка из Pinterest', decorative: true });
let decorativePhotos = (window.sitePhotos?.pinterest || []).map(pinterestPhoto);

function shufflePhotos(photos) {
  const shuffled = [...photos];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function renderPhotos() {
  ribbons.forEach((ribbon, row) => {
    const track = ribbon.querySelector('.photo-track');
    track.replaceChildren();
    const files = photoFiles.length ? photoFiles : Array(8).fill(null);
    const ordered = row ? [...files].reverse() : files;
    const randomDecor = shufflePhotos(decorativePhotos);
    const sequence = Array.from({ length: Math.max(ordered.length, randomDecor.length) }, (_, index) => {
      const file = ordered[index % ordered.length];
      const personal = file ? { src: 'assets/photos/' + encodeURIComponent(file), alt: 'Наше совместное фото' } : null;
      return randomDecor.length ? [personal, randomDecor[index % randomDecor.length]] : [personal];
    }).flat();
    track.style.animationDuration = `${Math.max(8, sequence.length) * (row ? 3.5 : 3)}s`;
    // Identical groups create a seamless loop, including with only one photo.
    for (let copy = 0; copy < 2; copy++) {
      const group = document.createElement('div');
      group.className = 'photo-group';
      if (copy) group.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < Math.max(8, sequence.length); i++) {
        const file = sequence[i % sequence.length];
        const frame = document.createElement('div');
        frame.className = 'memory-frame';
        if (file?.decorative) frame.classList.add('decorative-frame');
        const placeholder = document.createElement('span');
        placeholder.className = 'memory-placeholder';
        placeholder.textContent = '♡';
        frame.append(placeholder);
        if (file) {
          const img = document.createElement('img');
          img.alt = file.alt;
          img.decoding = 'async';
          img.addEventListener('load', () => { placeholder.hidden = true; });
          img.addEventListener('error', () => img.remove());
          img.src = file.src;
          frame.append(img);
        }
        const sticker = document.createElement('img');
        sticker.className = `memory-sticker sticker-corner-${(i + row) % 4}`;
        sticker.src = `assets/floating/sticker-${((i + row) % 4) + 1}.png`;
        sticker.alt = '';
        sticker.setAttribute('aria-hidden', 'true');
        sticker.draggable = false;
        frame.append(sticker);
        group.append(frame);
      }
      track.append(group);
    }
  });
}

function setLetterOpen(open) {
  document.querySelector('.content-collage').hidden = !open;
  letter.hidden = !open;
  ribbons.forEach(ribbon => { ribbon.hidden = !open; });
  envelope.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('letter-open', open);
  if (open) letter.focus({ preventScroll: true });
  else envelope.focus({ preventScroll: true });
}
envelope.addEventListener('click', () => setLetterOpen(true));
envelope.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    setLetterOpen(true);
  }
});
document.querySelector('.close-letter').addEventListener('click', () => setLetterOpen(false));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.body.classList.contains('letter-open')) setLetterOpen(false);
});
renderPhotos();
fetch('assets/pinterest/photos.json', { cache: 'no-store' }).then(response => {
  if (!response.ok) throw new Error('Pinterest list unavailable');
  return response.json();
}).then(files => {
  decorativePhotos = files.filter(file => typeof file === 'string' && /^[^/\\]+\.(jpe?g|png|webp|avif|gif)$/i.test(file)).map(file => ({
    src: 'assets/pinterest/' + encodeURIComponent(file), alt: 'Романтичная картинка из Pinterest', decorative: true
  }));
  renderPhotos();
}).catch(() => { /* Empty folder: keep personal photos and heart frames. */ });
fetch('assets/photos/photos.json', { cache: 'no-store' }).then(response => {
  if (!response.ok) throw new Error('Photo list unavailable');
  return response.json();
}).then(files => {
  photoFiles = files.filter(file => typeof file === 'string' && /^[^/\\]+\.(jpe?g|png|webp|avif)$/i.test(file));
  renderPhotos();
}).catch(() => { /* Keep the decorative frames until photos are added. */ });
