import { svg, createVisualElement } from './visual-elements.mjs';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const supporting = new Set(['particula', 'linha', 'seta', 'texto', 'onda']);

export function layoutScene(scene) {
  const elements = scene.elementos.map(e => supporting.has(e.tipo) ? { ...e } : {
    ...e, largura: Math.max(14, e.largura), altura: Math.max(22, e.altura),
  });
  if (!elements.length) return { elements, actions: scene.acoes };
  const bounds = elements.flatMap(e => {
    const points = [{ x: e.x, y: e.y }, ...scene.acoes.filter(a => a.alvo === e.id && a.tipo === 'mover').map(a => ({ x: a.paraX, y: a.paraY }))];
    return points.map(p => ({ left: p.x - e.largura / 2, right: p.x + e.largura / 2, top: p.y - e.altura / 2, bottom: p.y + e.altura / 2 }));
  });
  const left = Math.min(...bounds.map(b => b.left)), right = Math.max(...bounds.map(b => b.right));
  const top = Math.min(...bounds.map(b => b.top)), bottom = Math.max(...bounds.map(b => b.bottom));
  const scale = Math.min(1, 88 / Math.max(1, right - left), 72 / Math.max(1, bottom - top));
  const x = value => 50 + (value - (left + right) / 2) * scale;
  const y = value => 44 + (value - (top + bottom) / 2) * scale;
  return {
    elements: elements.map(e => ({ ...e, x: x(e.x), y: y(e.y), largura: e.largura * scale, altura: e.altura * scale })),
    actions: scene.acoes.map(a => a.tipo === 'mover' ? { ...a, paraX: x(a.paraX), paraY: y(a.paraY) } : { ...a }),
  };
}

export function labelLines(text) {
  const lines = [];
  for (const word of text.split(/\s+/)) {
    for (let offset = 0; offset < word.length; offset += 18) {
      const part = word.slice(offset, offset + 18);
      if (lines.length && `${lines.at(-1)} ${part}`.length <= 18) lines[lines.length - 1] += ` ${part}`;
      else lines.push(part);
    }
  }
  return lines;
}

export const overlaps = (a, b) => a.x < b.x + b.width + 8 && a.x + a.width + 8 > b.x && a.y < b.y + b.height + 8 && a.y + a.height + 8 > b.y;

export function layoutLabels(elements) {
  const placed = [];
  const obstacles = elements.filter(e => !['texto', 'seta', 'linha'].includes(e.tipo)).map(e => ({
    x: e.x * 8 - e.largura * 4, y: e.y * 4 - e.altura * 2,
    width: e.largura * 8, height: e.altura * 4,
  }));
  let legendBottom = 428;
  for (const e of elements.filter(e => e.rotulo)) {
    const lines = labelLines(e.rotulo);
    const width = Math.max(64, Math.max(...lines.map(l => l.length)) * 11 + 24), height = lines.length * 24 + 16;
    const cx = e.x * 8, cy = e.y * 4;
    const candidates = [
      { x: cx - width / 2, y: cy + Math.max(e.altura * 2, 20) + 12 },
      { x: cx - width / 2, y: cy - Math.max(e.altura * 2, 20) - height - 12 },
      { x: cx + e.largura * 4 + 12, y: cy - height / 2 },
      { x: cx - e.largura * 4 - width - 12, y: cy - height / 2 },
    ].map(p => ({ ...p, x: clamp(p.x, -16, 816 - width), width, height }));
    let box = candidates.find(p => p.y >= -16 && p.y + height <= 418
      && !placed.some(b => overlaps(p, b)) && !obstacles.some(b => overlaps(p, b)));
    if (!box) {
      for (let y = 432; !box; y += 96) {
        for (let x = -16; x + width <= 824; x += 216) {
          const candidate = { x, y, width, height };
          if (!placed.some(b => overlaps(candidate, b))) { box = candidate; break; }
        }
      }
      legendBottom = Math.max(legendBottom, box.y + height);
    }
    placed.push({ ...box, id: e.id, lines, anchorX: cx, anchorY: cy });
  }
  return { labels: placed, bottom: legendBottom };
}

function createBackdrop(type, setting) {
  const background = svg('g', { class: 'engine-backdrop', 'aria-hidden': 'true', 'data-setting': setting });
  background.append(svg('rect', { x: -32, y: -30, width: 864, height: 456, rx: 28, class: 'engine-surface' }));
  const context = svg('g', { class: 'engine-context', fill: 'none', 'stroke-width': 2 });
  if (setting === 'natureza') {
    context.append(svg('path', { d: 'M-30 338 Q130 280 285 335 T600 330 T832 335 V424 H-30 Z', class: 'engine-ground' }));
    context.append(svg('path', { d: 'M25 75 Q45 36 65 68 Q90 50 108 79 M664 90 Q686 47 710 78 Q746 57 773 92' }));
  } else if (setting === 'espaco') {
    for (const [x, y] of [[28, 52], [134, 126], [265, 36], [705, 57], [758, 223], [56, 287], [597, 359]]) {
      context.append(svg('path', { d: `M${x-4} ${y} H${x+4} M${x} ${y-4} V${y+4}` }));
    }
    context.append(svg('ellipse', { cx: 400, cy: 190, rx: 345, ry: 160, 'stroke-dasharray': '3 12' }));
  } else if (setting === 'laboratorio') {
    context.append(svg('rect', { x: 16, y: 12, width: 768, height: 376, rx: 32 }));
    for (let x = 56; x < 780; x += 48) context.append(svg('path', { d: `M${x} 14 V24 M${x} 376 V388` }));
  } else if (setting === 'historico') {
    for (let y = 64; y < 370; y += 70) context.append(svg('path', { d: `M16 ${y} H784`, 'stroke-dasharray': '2 12' }));
    context.append(svg('path', { d: 'M16 32 H68 M16 32 V72 M784 368 H732 M784 368 V328' }));
  }
  const structure = svg('g', { class: 'engine-structure', fill: 'none', 'stroke-width': 2 });
  if (['ciclo', 'movimento', 'microscopico'].includes(type)) structure.append(svg('ellipse', { cx: 400, cy: 180, rx: type === 'microscopico' ? 220 : 290, ry: 136, 'stroke-dasharray': '6 10' }));
  else if (type === 'comparacao') {
    for (const x of [8, 416]) structure.append(svg('rect', { x, y: 8, width: 376, height: 388, rx: 20 }));
  } else if (type === 'camadas') {
    for (let n = 0; n < 4; n++) structure.append(svg('rect', { x: 36, y: 28 + n * 86, width: 728, height: 76, rx: 14 }));
  } else if (type === 'mapa') {
    for (let x = 100; x < 800; x += 150) structure.append(svg('path', { d: `M${x} 30 V370`, 'stroke-dasharray': '3 9' }));
    structure.append(svg('path', { d: 'M48 200 H752 M48 110 H752 M48 290 H752', 'stroke-dasharray': '3 9' }));
  } else if (type === 'linha_do_tempo' || type === 'fluxo') structure.append(svg('path', { d: 'M36 352 H764 M752 344 L764 352 L752 360' }));
  background.append(context, structure);
  return background;
}

export function renderScene(stage, experience, index) {
  const scene = experience.cenas[index];
  const type = experience.tipoVisual;
  let elements = scene.elementos;
  if (!elements.length) elements = experience.cenas.map((s, i, all) => ({
    id: `etapa-${i}`, tipo: 'circulo', rotulo: `${i + 1}. ${s.titulo.slice(0, 24)}`,
    x: 15 + (all.length === 1 ? 0.5 : i / (all.length - 1)) * 70, y: 44,
    largura: 14, altura: 22, cor: i === index ? 'azul' : 'claro',
  }));
  const layout = layoutScene({ ...scene, elementos: elements });
  const { labels, bottom } = layoutLabels(layout.elements);
  const root = svg('svg', { viewBox: `-40 -38 880 ${bottom + 60}`, class: 'engine-scene', role: 'img', 'aria-label': `${scene.titulo}. ${scene.explicacao}` });
  root.append(svg('title', {}, scene.titulo), svg('desc', {}, scene.explicacao));
  root.append(createBackdrop(type, scene.cenario || 'neutro'));
  const targets = new Map();
  for (const e of layout.elements) {
    const node = createVisualElement(e, { label: false });
    root.append(node.position);
    targets.set(e.id, { ...node, element: e });
  }
  const labelLayer = svg('g', { class: 'engine-labels' });
  const mobileMarkers = svg('g', { class: 'engine-mobile-markers', 'aria-hidden': 'true' });
  const legend = document.createElement('ol');
  legend.className = 'engine-mobile-legend';
  legend.setAttribute('aria-label', 'Elementos da cena');
  for (const box of labels) {
    const e = layout.elements.find(element => element.id === box.id);
    const number = legend.children.length + 1;
    const item = document.createElement('li');
    const badge = document.createElement('span');
    badge.className = 'engine-legend-number';
    badge.textContent = number;
    const caption = document.createElement('span');
    caption.textContent = e.rotulo;
    item.append(badge, caption);
    legend.append(item);
    const marker = svg('g', { transform: `translate(${e.x * 8 + e.largura * 3} ${e.y * 4 - e.altura * 2})` });
    marker.append(svg('circle', { r: 22 }), svg('text', { 'text-anchor': 'middle', y: 11 }, number));
    mobileMarkers.append(marker);
    const label = svg('g', { class: 'engine-callout', 'data-label-for': box.id });
    label.append(svg('path', { d: `M${box.anchorX} ${box.anchorY} L${box.x + box.width / 2} ${box.y + box.height / 2}`, class: 'engine-leader', fill: 'none' }));
    label.append(svg('rect', { x: box.x, y: box.y, width: box.width, height: box.height, rx: 10, class: 'engine-label-surface' }));
    const text = svg('text', { x: box.x + box.width / 2, y: box.y + 27, 'text-anchor': 'middle', class: 'engine-label' });
    box.lines.forEach((line, i) => text.append(svg('tspan', { x: box.x + box.width / 2, dy: i ? 24 : 0 }, line)));
    label.append(text);
    if (e.tipo === 'texto') {
      // Textos que são parte da animação acompanham a ação; legendas de formas ficam fixas.
      label.setAttribute('transform', `translate(${-e.x * 8} ${-e.y * 4})`);
      targets.get(e.id).motion.append(label);
    } else labelLayer.append(label);
  }
  root.append(labelLayer, mobileMarkers);
  stage.replaceChildren(root, legend);
  return { root, targets, actions: layout.actions };
}

export function actionFrames(action, element) {
  switch (action.tipo) {
    case 'aparecer': return [{ opacity: 0 }, { opacity: 1 }];
    case 'desaparecer': return [{ opacity: 1 }, { opacity: 0 }];
    case 'mover': return [{ transform: 'translate(0px, 0px)' }, { transform: `translate(${(action.paraX - element.x) * 8}px, ${(action.paraY - element.y) * 4}px)` }];
    case 'girar': return [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }];
    case 'crescer': return [{ transform: 'scale(0.4)' }, { transform: 'scale(1)' }];
    case 'pulsar': return [{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }];
    case 'vibrar': return [0, -5, 5, -5, 5, 0].map(x => ({ transform: `translateX(${x}px)` }));
    case 'destacar': return [{ opacity: 1 }, { opacity: 0.4 }, { opacity: 1 }];
    case 'fluir': return [0, 1, 0].map(n => ({ transform: `translateX(${n * 24}px)`, opacity: n ? 0.5 : 1 }));
    default: return [];
  }
}
