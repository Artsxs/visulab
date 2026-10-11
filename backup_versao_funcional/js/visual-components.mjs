// Componentes visuais modulares e reutilizáveis do VisuLab.
// Compatível com o padrão de qualidade da animação de fotossíntese.
import { svg } from './visual-elements.mjs';

/**
 * Cria e configura o contêiner de cena SVG padrão 800x420 com definições e proporções padronizadas.
 */
export class VisualScene {
  constructor(options = {}) {
    this.width = options.width || 800;
    this.height = options.height || 420;
    this.className = options.className || '';
    this.id = options.id || '';
    this.ariaLabel = options.ariaLabel || 'Cena interativa educativa';
    this.root = svg('svg', {
      viewBox: `0 0 ${this.width} ${this.height}`,
      class: `visual-scene ${this.className}`.trim(),
      role: 'img',
      'aria-label': this.ariaLabel,
      focusable: 'false',
    });
    this.defs = svg('defs');
    this.root.append(this.defs);
  }

  addLinearGradient(id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) {
    const grad = svg('linearGradient', { id, x1, y1, x2, y2 });
    stops.forEach(([offset, color, opacity]) => {
      const attrs = { offset: String(offset), 'stop-color': color };
      if (opacity !== undefined) attrs['stop-opacity'] = String(opacity);
      grad.append(svg('stop', attrs));
    });
    this.defs.append(grad);
    return grad;
  }

  addRadialGradient(id, stops, cx = 0.5, cy = 0.5, r = 0.5) {
    const grad = svg('radialGradient', { id, cx, cy, r });
    stops.forEach(([offset, color, opacity]) => {
      const attrs = { offset: String(offset), 'stop-color': color };
      if (opacity !== undefined) attrs['stop-opacity'] = String(opacity);
      grad.append(svg('stop', attrs));
    });
    this.defs.append(grad);
    return grad;
  }

  addArrowMarker(id, color = 'currentColor', size = 7) {
    const marker = svg('marker', {
      id,
      viewBox: '0 0 10 10',
      refX: '8',
      refY: '5',
      markerWidth: String(size),
      markerHeight: String(size),
      orient: 'auto-start-reverse',
    });
    marker.append(svg('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: color }));
    this.defs.append(marker);
    return marker;
  }

  addBackdrop(content) {
    const g = svg('g', { class: 'visual-backdrop', 'aria-hidden': 'true' });
    if (typeof content === 'string') {
      g.innerHTML = content;
    } else if (Array.isArray(content)) {
      content.forEach(node => g.append(node));
    } else if (content) {
      g.append(content);
    }
    this.root.append(g);
    return g;
  }

  addStepGroup(stepIndex, className = '') {
    const g = svg('g', {
      class: `visual-focus visual-focus--step-${stepIndex} ${className}`.trim(),
      'data-visual-step': String(stepIndex),
    });
    this.root.append(g);
    return g;
  }

  getElement() {
    return this.root;
  }
}

/**
 * Controlador de animações para elementos vetoriais SVG (Web Animations API nativa).
 */
export class AnimatedObject {
  static animate(node, frames, options = {}) {
    if (!node || typeof node.animate !== 'function') return null;
    const duration = options.duration || 3000;
    const delay = options.delay || 0;
    const easing = options.easing || 'ease-in-out';
    const iterations = options.iterations || Infinity;
    const fill = options.fill || 'both';
    return node.animate(frames, { duration, delay, easing, iterations, fill });
  }

  static pulse(node, minScale = 0.95, maxScale = 1.08, duration = 2200) {
    return this.animate(node, [
      { transform: `scale(${minScale})`, opacity: 0.9 },
      { transform: `scale(${maxScale})`, opacity: 1 },
      { transform: `scale(${minScale})`, opacity: 0.9 },
    ], { duration });
  }

  static float(node, dy = 16, duration = 2800) {
    return this.animate(node, [
      { transform: 'translateY(0px)' },
      { transform: `translateY(-${dy}px)` },
      { transform: 'translateY(0px)' },
    ], { duration });
  }

  static vibrate(node, intensity = 4, duration = 1200) {
    const frames = [0, -intensity, intensity, -intensity / 2, intensity / 2, 0]
      .map(x => ({ transform: `translateX(${x}px)` }));
    return this.animate(node, frames, { duration });
  }

  static reveal(node, duration = 1500) {
    return this.animate(node, [{ opacity: 0 }, { opacity: 1 }], { duration, iterations: 1 });
  }
}

/**
 * Gerador de setas de fluxo com setas e linhas tracejadas dinâmicas.
 */
export class FlowArrow {
  static create(d, options = {}) {
    const color = options.color || 'currentColor';
    const width = options.width || 6;
    const marker = options.markerId ? `url(#${options.markerId})` : '';
    const className = options.className || 'visual-arrow';
    const attrs = {
      d,
      fill: 'none',
      stroke: color,
      'stroke-width': String(width),
      'stroke-linecap': 'round',
      class: className,
    };
    if (marker) attrs['marker-end'] = marker;
    return svg('path', attrs);
  }

  static animateFlow(node, dashOffset = -72, duration = 2000) {
    return AnimatedObject.animate(node, [
      { strokeDashoffset: 0 },
      { strokeDashoffset: dashOffset },
    ], { duration, easing: 'linear' });
  }
}

/**
 * Gerador de efeitos de partículas (cinzas, gotas, bolhas, fótons).
 */
export class ParticleEffect {
  static createStream(container, count, generator, baseDelay = 180) {
    const particles = [];
    for (let i = 0; i < count; i++) {
      const node = generator(i);
      container.append(node);
      particles.push({ node, delay: i * baseDelay });
    }
    return particles;
  }

  static animateRise(particles, totalDy = 50, duration = 3000) {
    const animations = [];
    particles.forEach(({ node, delay }) => {
      const anim = AnimatedObject.animate(node, [
        { transform: 'translate(0px, 0px)', opacity: 0 },
        { opacity: 1, offset: 0.2 },
        { transform: `translate(0px, -${totalDy}px)`, opacity: 0.1 },
      ], { duration, delay });
      if (anim) animations.push(anim);
    });
    return animations;
  }

  static animateFall(particles, totalDy = 120, duration = 2200) {
    const animations = [];
    particles.forEach(({ node, delay }) => {
      const anim = AnimatedObject.animate(node, [
        { transform: 'translateY(0px)', opacity: 0 },
        { opacity: 1, offset: 0.25 },
        { transform: `translateY(${totalDy}px)`, opacity: 0.3 },
      ], { duration, delay });
      if (anim) animations.push(anim);
    });
    return animations;
  }
}

/**
 * Gerador de legenda contextual e acessível.
 */
export class Legend {
  static render(container, items) {
    if (!container) return;
    container.replaceChildren();
    items.forEach(([color, label]) => {
      const item = document.createElement('span');
      item.className = 'visualizer-legend__item';
      const dot = document.createElement('span');
      dot.className = 'visualizer-legend__dot';
      dot.style.setProperty('--legend-color', color);
      dot.setAttribute('aria-hidden', 'true');
      item.append(dot, document.createTextNode(label));
      container.append(item);
    });
  }
}

/**
 * Gerenciador da linha de etapas e sincronização com o relógio de animação.
 */
export class StepTimeline {
  static updateFocus(stage, activeStep) {
    if (!stage) return;
    const focusGroups = stage.querySelectorAll('[data-visual-step]');
    focusGroups.forEach(group => {
      const step = Number(group.dataset.visualStep);
      const isActive = step === activeStep;
      group.classList.toggle('is-active', isActive);
      group.setAttribute('aria-hidden', String(!isActive));
    });
  }
}

/**
 * Molde base para criação de temas didáticos padronizados.
 */
export class ThemeTemplate {
  constructor(config) {
    this.id = config.id;
    this.title = config.title;
    this.discipline = config.discipline || 'ciencias';
    this.summary = config.summary;
    this.simplifications = config.simplifications || '';
    this.curiosity = config.curiosity || '';
    this.conclusion = config.conclusion || '';
    this.steps = config.steps || [];
    this.legend = config.legend || [];
    this.svgTemplateId = config.svgTemplateId;
    this.animateStep = config.animateStep || (() => []);
  }

  toExperience() {
    return {
      versao: '1.0',
      disciplina: this.discipline,
      titulo: this.title,
      resumo: this.summary,
      tipoVisual: this.id,
      simplificacoes: this.simplifications,
      etapas: this.steps.map(s => ({
        titulo: s.title,
        explicacao: s.description,
      })),
      cenas: this.steps.map(s => ({
        titulo: s.title,
        objetivo: s.title,
        explicacao: s.description,
        duracaoMs: 6000,
        elementos: [],
        acoes: [],
      })),
      conclusao: this.conclusion || this.summary,
      curiosidade: this.curiosity || '',
      origem: 'local',
      fallback: false,
    };
  }
}
