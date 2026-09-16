import { renderScene, actionFrames } from './scene-renderer.mjs';

// Um relógio controla SVG, templates locais, texto e progresso. As animações
// WAAPI ficam pausadas: somente o tempo deste relógio altera sua posição.
export class AnimationEngine {
  constructor(stage, { onChange = () => {}, onProgress = () => {}, reducedMotion = false, renderer = renderScene } = {}) {
    Object.assign(this, { stage, onChange, onProgress, reducedMotion, renderer, index: 0, elapsed: 0, speed: 1, playing: false, animations: [], frame: 0, generation: 0, cache: new Map() });
  }
  load(experience) {
    this.destroy(); this.experience = experience; this.index = 0; this.elapsed = 0;
    this.offsets = experience.cenas.map((_, i) => experience.cenas.slice(0, i).reduce((sum, s) => sum + s.duracaoMs, 0));
    this.total = experience.cenas.reduce((sum, s) => sum + s.duracaoMs, 0);
    this.mount(); this.play();
  }
  mount() {
    this.animations.forEach(a => { a.pause(); a.currentTime = 0; });
    let cached = this.cache.get(this.index);
    if (!cached) {
      const { root, targets, actions, animations = [] } = this.renderer(this.stage, this.experience, this.index);
      if (typeof root.animate === 'function') {
        for (const action of actions || []) {
          const target = targets.get(action.alvo);
          if (!target) continue;
          const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          target.motion.parentNode.insertBefore(wrapper, target.motion);
          wrapper.append(target.motion);
          animations.push(wrapper.animate(actionFrames(action, target.element), {
            duration: action.duracaoMs, delay: action.atrasoMs, fill: 'both',
            easing: ['mover', 'fluir', 'girar'].includes(action.tipo) ? 'linear' : 'ease-in-out',
          }));
        }
      }
      cached = { nodes: [...this.stage.childNodes], animations };
      this.cache.set(this.index, cached);
    } else this.stage.replaceChildren(...cached.nodes);
    this.animations = cached.animations;
    this.applyTime(); this.notify();
  }
  applyTime() {
    for (const animation of this.animations) {
      animation.pause();
      // Em movimento reduzido, mostra o resultado da transformação, inclusive
      // elementos que só aparecem no fim, em vez de omitir a ação educativa.
      animation.currentTime = this.reducedMotion ? this.experience.cenas[this.index].duracaoMs : this.elapsed;
    }
  }
  notify() { this.onChange(this); this.progress(); }
  progress() {
    if (!this.experience) return;
    this.onProgress((this.offsets[this.index] + (this.reducedMotion ? this.experience.cenas[this.index].duracaoMs : this.elapsed)) / this.total);
  }
  advance(now) {
    this.elapsed += Math.max(0, now - this.lastTime) * this.speed;
    this.lastTime = now;
    const oldIndex = this.index;
    while (this.elapsed >= this.experience.cenas[this.index].duracaoMs && this.index < this.experience.cenas.length - 1) {
      this.elapsed -= this.experience.cenas[this.index++].duracaoMs;
    }
    const duration = this.experience.cenas[this.index].duracaoMs;
    const ended = this.index === this.experience.cenas.length - 1 && this.elapsed >= duration;
    if (ended) { this.elapsed = duration; this.playing = false; }
    // Um quadro atrasado não monta cenas intermediárias que ninguém verá.
    if (oldIndex !== this.index) this.mount();
    this.applyTime(); this.progress();
    if (ended) this.notify();
  }
  tick = now => {
    if (!this.playing) return;
    cancelAnimationFrame(this.frame); this.frame = 0;
    this.advance(now);
    if (this.playing) this.schedule();
  };
  schedule() {
    cancelAnimationFrame(this.frame);
    const generation = this.generation;
    this.frame = requestAnimationFrame(now => { if (generation === this.generation) this.tick(now); });
  }
  play() {
    if (!this.experience || this.reducedMotion || this.playing) { this.notify(); return; }
    if (this.index === this.experience.cenas.length - 1 && this.elapsed >= this.experience.cenas[this.index].duracaoMs) this.seek(0);
    this.playing = true; this.lastTime = performance.now(); this.notify(); this.schedule();
  }
  pause() { this.playing = false; cancelAnimationFrame(this.frame); this.frame = 0; this.notify(); }
  seek(index) {
    if (!this.experience) return;
    this.index = Math.max(0, Math.min(this.experience.cenas.length - 1, index));
    this.elapsed = 0; this.lastTime = performance.now(); this.mount();
  }
  restart() { this.seek(0); this.play(); }
  setSpeed(speed) {
    if (![0.5, 1, 1.5, 2].includes(speed)) return;
    // Liquida o intervalo com a velocidade anterior antes de trocar a taxa.
    if (this.playing) this.advance(performance.now());
    this.speed = speed;
  }
  setReducedMotion(value) {
    this.reducedMotion = value;
    if (value) this.pause();
    if (this.experience) { this.applyTime(); this.notify(); }
  }
  destroy() {
    this.generation++; cancelAnimationFrame(this.frame); this.frame = 0; this.playing = false;
    for (const entry of this.cache.values()) entry.animations.forEach(a => a.cancel());
    this.cache.clear(); this.animations = []; this.experience = null; this.stage.replaceChildren();
  }
}
