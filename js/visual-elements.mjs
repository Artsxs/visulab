import { PALETTE } from './visual-validator.mjs';

export function svg(tag, attrs = {}, text) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  if (text) node.textContent = text;
  return node;
}

// Todos os traços são vetoriais e locais; preservam alta nitidez em qualquer ampliação.
const paths = {
  agua: 'M0 -9 Q-12 4 -5 8 Q7 14 8 3 Z',
  folha: 'M-8 8 Q-12 -10 9 -9 Q12 10 -8 8 M-8 8 L6 -6',
  arvore: 'M0 10 V-2 M-9 2 L-5 -5 H-8 L0 -13 L8 -5 H5 L9 2 Z',
  nuvem: 'M-10 6 C-18 6 -16 -5 -8 -4 C-8 -14 8 -14 9 -4 C19 -6 19 7 10 7 Z',
  coracao: 'M0 10 C-24 -4 -8 -17 0 -7 C8 -17 24 -4 0 10',
  cidade: 'M-12 10 V-3 H-5 V10 M-3 10 V-11 H4 V10 M6 10 V-5 H12 V10',
  livro: 'M0 -7 Q-7 -12 -13 -7 V10 Q-6 5 0 10 Q6 5 13 10 V-7 Q7 -12 0 -7 V10',
  placa_tectonica: 'M-14 -4 L-2 -7 L-5 3 L-14 6 Z M2 -7 L14 -4 V6 L0 3 L4 -1 Z',
  estomago: 'M-3 -14 L-3 -3 C3 0 1 -10 7 -9 C18 -6 13 10 4 12 C-4 15 -13 7 -9 3 C-5 -1 -6 -6 -6 -14 Z',
  pulmao: 'M-2 -13 V-3 L-5 0 M2 -13 V-3 L5 0 M-5 -8 C-13 -8 -16 8 -10 11 L-3 8 V-4 Z M5 -8 C13 -8 16 8 10 11 L3 8 V-4 Z',
  cerebro: 'M0 -10 C-5 -16 -11 -10 -10 -5 C-17 -3 -15 7 -10 7 C-9 14 -3 14 0 9 C3 14 9 14 10 7 C15 7 17 -3 10 -5 C11 -10 5 -16 0 -10 Z M0 -10 V9 M-9 -3 L-4 0 L-8 5 M9 -3 L4 0 L8 5',
  bacteria: 'M-7 -8 C-16 -3 -11 10 -4 9 L8 5 C17 0 10 -13 3 -11 Z M-9 -9 L-12 -12 M-13 0 H-17 M-6 9 L-7 14 M9 5 L12 9 M10 -8 L14 -11',
  lua: 'M12 0 A12 12 0 1 1 -12 0 A12 12 0 1 1 12 0 M-5 -4 A2 2 0 1 0 -1 -4 M2 5 A2 2 0 1 0 6 5',
  montanha: 'M-16 11 L-3 -12 L13 11 Z M-8 -4 L-3 -1 L1 -6 M3 11 L10 -3 L20 11',
  vulcao: 'M-16 12 L-6 -5 L5 -5 L16 12 Z M-6 -5 L0 0 L5 -5 M-2 -10 L-5 -16 M2 -10 L6 -16',
  dna: 'M-6 -12 C-1 -6 1 -6 6 0 C1 6 -1 6 -6 12 M6 -12 C1 -6 -1 -6 -6 0 C-1 6 1 6 6 12 M-4 -9 H4 M-2 -4 H2 M-2 4 H2 M-4 9 H4',
  foguete: 'M0 -14 C4 -10 6 -4 6 6 L3 8 L4 12 L0 10 L-4 12 L-3 8 L-6 6 C-6 -4 -4 -10 0 -14 Z M-6 4 L-11 9 L-7 10 L-6 7 Z M6 4 L11 9 L7 10 L6 7 Z',
  computador: 'M-10 -9 H10 V4 H-10 Z M-3 4 V8 H3 V4 M-7 8 H7 M-7 -6 H7',
  vacina: 'M-3 -8 H3 V4 H-3 Z M0 4 V9 M-1 -8 V-12 H1 V-8 M-4 -12 H4 M-2 -3 H1 M-2 0 H1',
  virus: 'M0 -5 A5 5 0 1 1 0 5 A5 5 0 1 1 0 -5 M0 -5 V-9 M0 5 V9 M-5 0 H-9 M5 0 H9 M-3.5 -3.5 L-6.5 -6.5 M3.5 3.5 L6.5 6.5 M-3.5 3.5 L-6.5 6.5 M3.5 -3.5 L6.5 -6.5',
  bateria: 'M-6 -9 H6 V10 H-6 Z M-2 -12 H2 V-9 H-2 Z M-4 -5 H4 M-4 -1 H4 M-4 3 H4',
  raio: 'M2 -13 L-5 0 H1 L-2 13 L7 -1 H1 Z',
  engrenagem: 'M-3 -9 H3 L4 -6 L7 -5 L8 -2 L6 1 L7 4 L4 5 L3 8 H-3 L-4 5 L-7 4 L-6 1 L-8 -2 L-7 -5 L-4 -6 Z M0 -3 A3 3 0 1 1 0 3 A3 3 0 1 1 0 -3',
  lampada: 'M-6 -4 C-8 -9 8 -9 6 -4 C5 -1 4 2 4 4 H-4 C-4 2 -5 -1 -6 -4 Z M-3 4 H3 M-2 6 H2 M0 -5 V-2',
  olho: 'M-12 0 Q0 -9 12 0 Q0 9 -12 0 Z M0 -4 A4 4 0 1 1 0 4 A4 4 0 1 1 0 -4 M0 -1.5 A1.5 1.5 0 1 1 0 1.5 A1.5 1.5 0 1 1 0 -1.5',
  telescopio: 'M-8 8 L8 -8 M-9 5 L-5 9 L7 -3 L3 -7 Z M9 -9 L12 -6 L10 -4 L7 -7 Z M0 0 L-4 10 M0 0 L4 10',
  som: 'M-9 -3 H-6 L-2 -7 V7 L-6 3 H-9 Z M1 -3 Q4 0 1 3 M4 -6 Q8 0 4 6',
  ima: 'M-8 8 V-1 C-8 -9 8 -9 8 -1 V8 H4 V-1 C4 -5 -4 -5 -4 -1 V8 Z M-8 4 H-4 M4 4 H8',
  aviao: 'M0 -12 V12 M-11 -1 L0 -6 L11 -1 L0 2 Z M-5 8 L0 6 L5 8 L0 10 Z',
  fogo: 'M0 11 C-8 11 -9 3 -4 -2 C-1 -6 0 -11 0 -11 C2 -8 8 -4 8 2 C8 7 5 11 0 11 Z M0 9 C-3 9 -4 5 -2 2 C-1 0 0 -3 0 -3 C1 -1 3 1 3 4 C3 7 2 9 0 9 Z',
  gota: 'M0 -11 C-7 -2 -7 6 0 9 C7 6 7 -2 0 -11 Z',
  globo: 'M0 -9 A9 9 0 1 1 0 9 A9 9 0 1 1 0 -9 M0 -9 V9 M-9 0 H9 M0 -9 C-5 -9 -5 9 0 9 C5 9 5 -9 0 -9',
  estrela: 'M0 -12 Q0 0 12 0 Q0 0 0 12 Q0 0 -12 0 Q0 0 0 -12 Z',
  buraco_negro: 'M0 -8 A8 8 0 1 1 0 8 A8 8 0 1 1 0 -8 M-12 0 C-12 -6 12 -6 12 0 C12 6 -12 6 -12 0 M0 -3 A3 3 0 1 1 0 3 A3 3 0 1 1 0 -3',
  urna: 'M-8 -3 H8 V9 H-8 Z M-10 -3 H10 V0 H-10 Z M-3 -7 H3 V-3 H-3 Z'
};

function icon(name) {
  const g = svg('g', { 'stroke-width': 1.4, fill: 'none', stroke: 'currentColor', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  if (paths[name]) {
    g.append(svg('path', { d: paths[name] }));
  } else if (name === 'oxigenio' || name === 'gas_carbonico') {
    g.append(svg('text', { x: 0, y: 3, 'text-anchor': 'middle', 'font-size': 9, stroke: 'none', fill: 'currentColor', 'font-weight': 'bold' }, name === 'oxigenio' ? 'O₂' : 'CO₂'));
  } else if (name === 'atomo') {
    g.append(svg('circle', { r: 3, fill: 'currentColor' }));
    for (const angle of [0, 60, 120]) {
      g.append(svg('ellipse', { rx: 14, ry: 4.5, fill: 'none', stroke: 'currentColor', transform: `rotate(${angle})` }));
    }
  } else if (name === 'planeta') {
    g.append(svg('circle', { r: 9, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8 }));
    g.append(svg('ellipse', { rx: 15, ry: 4, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.2, transform: 'rotate(-20)' }));
  } else if (name === 'celula') {
    g.append(svg('circle', { r: 10, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8 }));
    g.append(svg('circle', { cx: 2, cy: -1, r: 4, fill: 'currentColor', opacity: 0.8 }));
  } else if (name === 'relogio') {
    g.append(svg('circle', { r: 9, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8 }));
    g.append(svg('path', { d: 'M0 -6 V0 L4 3', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8 }));
  } else {
    g.append(svg('circle', { r: 8, fill: 'currentColor' }));
  }
  return g;
}

export function createVisualElement(e, { label = true } = {}) {
  const position = svg('g', { transform: `translate(${e.x * 8} ${e.y * 4})`, 'data-element-id': e.id });
  const motion = svg('g', { class: 'engine-element-motion' });
  const color = PALETTE[e.cor] || '#3977d5';
  const shape = svg('g', { fill: color, stroke: ['branco', 'claro'].includes(e.cor) ? '#607f9e' : color, 'stroke-width': 2 });
  const w = e.largura * 4, h = e.altura * 2;

  if (e.tipo === 'icone') {
    if (e.icone === 'sol' || e.icone === 'estrela') {
      const coreR = Math.max(14, Math.min(w, h) * 0.7);
      // Halo exterior radiante
      shape.append(svg('circle', { r: coreR + 8, fill: '#f4c542', opacity: 0.28, class: 'engine-glow' }));
      // Núcleo solar com pulsação idêntica à fotossíntese
      shape.append(svg('circle', { r: coreR, fill: '#f4c542', stroke: '#e8ac27', 'stroke-width': 3, class: 'photo-sun-core' }));
      // Raios solares com brilho dinâmico alternado
      const rays = svg('g', { stroke: '#f4c542', 'stroke-width': 3.5, 'stroke-linecap': 'round', class: 'photo-rays' });
      for (let i = 0; i < 8; i++) {
        const rad = (i * 45 * Math.PI) / 180;
        rays.append(svg('line', {
          x1: Math.cos(rad) * (coreR + 3),
          y1: Math.sin(rad) * (coreR + 3),
          x2: Math.cos(rad) * (coreR + 13),
          y2: Math.sin(rad) * (coreR + 13),
        }));
      }
      shape.append(rays);
    } else if (e.icone === 'oxigenio' || e.icone === 'gas_carbonico') {
      const r = Math.max(16, Math.min(w, h));
      shape.append(svg('circle', { r: r + 5, fill: color, opacity: 0.2, class: 'chloroplast-glow' }));
      shape.append(svg('circle', { r, fill: '#ffffff', stroke: color, 'stroke-width': 3.5, class: 'glucose-badge' }));
      shape.append(svg('text', { x: 0, y: 5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 'bold', fill: color, stroke: 'none' }, e.icone === 'oxigenio' ? 'O₂' : 'CO₂'));
    } else {
      const badgeR = Math.max(16, Math.min(w, h));
      // Halo atmosférico sutil
      shape.append(svg('circle', { r: badgeR + 5, fill: color, opacity: 0.18, class: 'engine-glow' }));
      // Base da medalha/ícone
      const badge = svg('circle', { r: badgeR, fill: '#ffffff', stroke: color, 'stroke-width': 2.8, class: 'glucose-badge' });
      shape.append(badge);

      const symbol = icon(e.icone);
      symbol.setAttribute('style', `color: ${color};`);
      symbol.setAttribute('transform', `scale(${Math.max(0.9, Math.min(w / 15, h / 13))})`);

      if (['coracao', 'pulmao'].includes(e.icone)) {
        symbol.classList.add('engine-pulse');
      } else if (['engrenagem', 'turbina'].includes(e.icone)) {
        symbol.classList.add('engine-spin');
      } else if (['atomo', 'celula', 'dna', 'virus', 'vacina'].includes(e.icone)) {
        symbol.classList.add('chloroplast-glow');
      }

      shape.append(symbol);
    }
  } else if (e.tipo === 'circulo') {
    const r = Math.min(w, h);
    shape.append(svg('circle', { r: r + 6, fill: color, opacity: 0.22, class: 'chloroplast-glow' }));
    shape.append(svg('circle', { r, fill: color, stroke: '#ffffff', 'stroke-width': 2.8, class: 'glucose-badge' }));
  } else if (e.tipo === 'particula') {
    // Partícula com flutuação orgânica idêntica aos ciclos naturais da fotossíntese
    shape.setAttribute('class', 'carbon-bubbles engine-particle');
    shape.append(svg('circle', { r: 16, fill: color, opacity: 0.28, class: 'chloroplast-glow' }));
    shape.append(svg('circle', { r: 7.5, fill: color, stroke: '#ffffff', 'stroke-width': 1.8 }));
    shape.append(svg('circle', { cx: -2, cy: -2, r: 2.2, fill: '#ffffff', opacity: 0.85, stroke: 'none' }));
  } else if (e.tipo === 'elipse') {
    shape.append(svg('ellipse', { rx: w + 5, ry: h + 5, fill: color, opacity: 0.2, class: 'chloroplast-glow' }));
    shape.append(svg('ellipse', { rx: w, ry: h, fill: color, stroke: '#ffffff', 'stroke-width': 2.5, class: 'glucose-badge' }));
  } else if (e.tipo === 'retangulo' || e.tipo === 'texto') {
    shape.setAttribute('class', 'glucose-badge');
    shape.append(svg('rect', { x: -w - 3, y: -h - 3, width: (w + 3) * 2, height: (h + 3) * 2, rx: 12, fill: color, opacity: 0.15 }));
    shape.append(svg('rect', { x: -w, y: -h, width: w * 2, height: h * 2, rx: 10, fill: '#ffffff', stroke: color, 'stroke-width': 2.5 }));
    shape.append(svg('path', { d: `M ${-w + 8} ${-h + 4} H ${w - 8}`, stroke: color, 'stroke-width': 3.5, 'stroke-linecap': 'round' }));
  } else if (e.tipo === 'linha' || e.tipo === 'seta') {
    const directed = Number.isFinite(e.destinoX) && Number.isFinite(e.destinoY);
    const dx = directed ? (e.destinoX - e.x) * 8 : w;
    const dy = directed ? (e.destinoY - e.y) * 4 : 0;
    shape.setAttribute('class', 'visual-arrow visual-arrow--flowing');
    shape.append(svg('line', {
      x1: directed ? 0 : -w,
      y1: 0,
      x2: dx,
      y2: dy,
      'stroke-width': 6,
      stroke: color,
      'stroke-linecap': 'round',
      'stroke-dasharray': '14 10',
      class: 'visual-arrow-stream',
    }));
    if (e.tipo === 'seta') {
      shape.append(svg('path', {
        d: 'M-14 -8 L0 0 L-14 8 Z',
        transform: `translate(${dx} ${dy}) rotate(${Math.atan2(dy, directed ? dx : w * 2) * 180 / Math.PI})`,
        fill: color,
        stroke: color,
        'stroke-width': 1.5,
        class: 'visual-arrow-head',
      }));
    }
  } else if (e.tipo === 'onda') {
    shape.setAttribute('class', 'engine-particle');
    shape.append(svg('path', {
      d: 'M-40 0 Q-30 -20 -20 0 T0 0 T20 0 T40 0',
      fill: 'none',
      stroke: color,
      'stroke-width': 4.5,
      'stroke-linecap': 'round',
    }));
  }

  motion.append(shape);
  if (label && e.rotulo) {
    const labelGroup = svg('g', { transform: `translate(0 ${e.tipo === 'texto' ? 0 : Math.max(h, 24) + 18})` });
    const textNode = svg('text', { 'text-anchor': 'middle', class: 'visual-svg-callout' }, e.rotulo);
    textNode.setAttribute('style', 'font-weight: 700; font-size: 15px; fill: var(--color-ink, #243454);');
    labelGroup.append(textNode);
    motion.append(labelGroup);
  }
  position.append(motion);
  return { position, motion };
}
