import { svg, createVisualElement } from './visual-elements.mjs';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const supporting = new Set(['particula', 'linha', 'seta', 'texto', 'onda']);

export function layoutScene(scene, allScenes = [scene]) {
  const elements = scene.elementos.map(e => supporting.has(e.tipo) ? { ...e } : {
    ...e, largura: Math.max(14, e.largura), altura: Math.max(22, e.altura),
  });
  if (!elements.length) return { elements, actions: scene.acoes };
  // O enquadramento é comum ao roteiro inteiro: entidades persistentes não
  // saltam de posição porque uma nuvem ou uma legenda entrou na próxima cena.
  const bounds = allScenes.flatMap(s => s.elementos.flatMap(e => {
    const width = supporting.has(e.tipo) ? e.largura : Math.max(14, e.largura);
    const height = supporting.has(e.tipo) ? e.altura : Math.max(22, e.altura);
    const points = [{ x: e.x, y: e.y }, ...(Number.isFinite(e.destinoX) ? [{ x: e.destinoX, y: e.destinoY }] : []), ...s.acoes.filter(a => a.alvo === e.id && a.tipo === 'mover').map(a => ({ x: a.paraX, y: a.paraY }))];
    return points.map(p => ({ left: p.x - width / 2, right: p.x + width / 2, top: p.y - height / 2, bottom: p.y + height / 2 }));
  }));
  const left = Math.min(...bounds.map(b => b.left)), right = Math.max(...bounds.map(b => b.right));
  const top = Math.min(...bounds.map(b => b.top)), bottom = Math.max(...bounds.map(b => b.bottom));
  const scale = Math.min(1, 88 / Math.max(1, right - left), 72 / Math.max(1, bottom - top));
  const x = value => 50 + (value - (left + right) / 2) * scale;
  const y = value => 44 + (value - (top + bottom) / 2) * scale;
  return {
    elements: elements.map(e => ({ ...e, x: x(e.x), y: y(e.y), largura: e.largura * scale, altura: e.altura * scale, ...(Number.isFinite(e.destinoX) ? { destinoX: x(e.destinoX), destinoY: y(e.destinoY) } : {}) })),
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
  background.append(svg('rect', { x: -32, y: -30, width: 864, height: 456, rx: 8, class: 'engine-surface' }));
  // Órbitas, grades e setas não são decoração: só aparecem quando fazem parte
  // dos elementos explícitos do roteiro.
  return background;
}

export function renderScene(stage, experience, index) {
  const scene = experience.cenas[index];
  const type = experience.tipoVisual;
  let elements = scene.elementos;
  if (!elements.length) throw new Error('Cena sem elementos visuais.');
  const layout = layoutScene({ ...scene, elementos: elements }, experience.cenas.some(s => s.elementos.length) ? experience.cenas : undefined);
  const root = svg('svg', { viewBox: '-40 -38 880 470', class: 'engine-scene', role: 'img', 'aria-label': `${scene.titulo}. ${scene.explicacao}` });
  root.append(svg('title', {}, scene.titulo), svg('desc', {}, scene.explicacao));
  root.append(createBackdrop(type, scene.cenario || 'neutro'));
  const targets = new Map();
  for (const e of layout.elements) {
    const node = createVisualElement(e, { label: false });
    root.append(node.position);
    targets.set(e.id, { ...node, element: e });
  }
  const legend = document.createElement('ol');
  legend.className = 'engine-mobile-legend';
  legend.setAttribute('aria-label', 'Elementos da cena');
  for (const e of layout.elements.filter(element => element.rotulo)) {
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
    marker.setAttribute('transform', `translate(${e.largura * 3} ${-e.altura * 2})`);
    targets.get(e.id).motion.append(marker);
    marker.classList.add('engine-mobile-markers');
  }
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
    case 'fluir': return [{ opacity: 0.35 }, { opacity: 1 }];
    default: return [];
  }
}
