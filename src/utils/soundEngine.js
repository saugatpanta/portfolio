import { Howl } from 'howler';

const cache = {};
let soundUrls = {};
let muted = false;

export function setSoundUrls(urls) {
  soundUrls = urls || {};
  Object.keys(cache).forEach(k => delete cache[k]);
}

export function setSoundMuted(m) {
  muted = m;
}

export function playSound(name) {
  if (muted) return;
  try {
    const url = soundUrls[name];
    if (!url) return;
    if (!cache[name]) {
      cache[name] = new Howl({ src: [url], volume: 0.5, preload: true });
    }
    cache[name].play();
  } catch (e) {
    // Silent fail
  }
}

export const sounds = {
  boot: () => playSound('boot'),
  login: () => playSound('login'),
  open: () => playSound('open'),
  close: () => playSound('close'),
  minimize: () => playSound('minimize'),
  notification: () => playSound('notification'),
  error: () => playSound('error'),
  startup: () => playSound('startup'),
};

export default { setSoundUrls, setSoundMuted, playSound, sounds };
