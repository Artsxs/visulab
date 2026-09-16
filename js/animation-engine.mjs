import { renderScene, actionFrames } from './scene-renderer.mjs';
export class AnimationEngine {
  constructor(stage, { onChange = () => {}, onProgress = () => {}, reducedMotion = false } = {}) {
    Object.assign(this, { stage, onChange, onProgress, reducedMotion, index: 0, elapsed: 0, speed: 1, playing: false, animations: [], frame: 0 });
  }
  load(experience) { this.destroy(); this.experience = experience; this.index = 0; this.elapsed = 0; this.mount(); this.play(); }
  mount() {
    this.animations.forEach(a => a.cancel());
    this.animations = [];
    const { root, targets } = renderScene(this.stage, this.experience, this.index);
    if (!this.reducedMotion && typeof root.animate === 'function') {
      this.animations.push(root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, fill: 'both' }));
      for (const action of this.experience.cenas[this.index].acoes) {
        const target = targets.get(action.alvo);
        if (!target) continue;
        // Cada ação recebe um grupo próprio, evitando que transforms simultâneos se sobrescrevam.
        const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        target.motion.parentNode.insertBefore(wrapper, target.motion);
        wrapper.append(target.motion);
        this.animations.push(wrapper.animate(actionFrames(action, target.element), { duration: action.duracaoMs, delay: action.atrasoMs, fill: 'both', easing: 'ease-in-out' }));
      }
      this.animations.forEach(a => { a.pause(); a.currentTime = this.elapsed; });
    }
    this.notify();
  }
  notify() { this.onChange(this); this.progress(); }
  progress() {
    if (!this.experience) return;
    const total = this.experience.cenas.reduce((sum, s) => sum + s.duracaoMs, 0);
    const before = this.experience.cenas.slice(0, this.index).reduce((sum, s) => sum + s.duracaoMs, 0);
    this.onProgress((before + (this.reducedMotion ? this.experience.cenas[this.index].duracaoMs : this.elapsed)) / total);
  }
  tick = now => {
    if (!this.playing) return;
    const delta = Math.max(0, now - this.lastTime) * this.speed;
    this.lastTime = now;
    this.elapsed += delta;
    let duration = this.experience.cenas[this.index].duracaoMs;
    while (this.elapsed >= duration) {
      if (this.index === this.experience.cenas.length - 1) { this.elapsed = duration; this.pause(); break; }
      else { this.index++; this.elapsed -= duration; this.mount(); duration = this.experience.cenas[this.index].duracaoMs; }
    }
    this.animations.forEach(a => { a.currentTime = this.elapsed; });
    this.progress();
    if (this.playing) this.frame = requestAnimationFrame(this.tick);
  };
  play() {
    if (!this.experience || this.reducedMotion || this.playing) { this.notify(); return; }
    if (this.index === this.experience.cenas.length - 1 && this.elapsed >= this.experience.cenas[this.index].duracaoMs) this.seek(0);
    this.playing = true; this.lastTime = performance.now(); this.notify();
    this.frame = requestAnimationFrame(this.tick);
  }
  pause() { this.playing = false; cancelAnimationFrame(this.frame); this.notify(); }
  seek(index) { if (!this.experience) return; this.index = Math.max(0, Math.min(this.experience.cenas.length - 1, index)); this.elapsed = 0; this.lastTime = performance.now(); this.mount(); }
  restart() { this.seek(0); this.play(); }
  setSpeed(speed) { if ([0.5, 1, 1.5, 2].includes(speed)) this.speed = speed; }
  setReducedMotion(value) { this.reducedMotion = value; if (value) this.pause(); if (this.experience) this.mount(); }
  destroy() { cancelAnimationFrame(this.frame); this.playing = false; this.animations.forEach(a => a.cancel()); this.animations = []; this.experience = null; this.stage.replaceChildren(); }
}
