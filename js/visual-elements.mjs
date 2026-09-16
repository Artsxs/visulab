import { PALETTE } from './visual-validator.mjs';
export function svg(tag, attrs = {}, text) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  if (text) node.textContent = text;
  return node;
}
// Todos os traços são locais; nenhum caminho ou atributo vem do roteiro.
const paths = {
  agua: 'M0 -9 Q-12 4 -5 8 Q7 14 8 3 Z', folha: 'M-8 8 Q-12 -10 9 -9 Q12 10 -8 8 M-8 8 L6 -6',
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
  vulcao: 'M-16 12 L-6 -5 L5 -5 L16 12 Z M-6 -5 L0 0 L5 -5 M-2 -10 L-5 -16 M2 -10 L6 -16'
};
function icon(name) {
  const g = svg('g', { 'stroke-width': 1.3 });
  if (paths[name]) g.append(svg('path', { d: paths[name] }));
  else if (name === 'oxigenio' || name === 'gas_carbonico') g.append(svg('text', { x: 0, y: 3, 'text-anchor': 'middle', 'font-size': 8, stroke: 'none' }, name === 'oxigenio' ? 'O₂' : 'CO₂'));
  else {
    g.append(svg('circle', { r: name === 'atomo' ? 2 : 8 }));
    if (name === 'sol') for (let i = 0; i < 8; i++) g.append(svg('line', { x1: 10, x2: 14, transform: `rotate(${i * 45})` }));
    if (name === 'atomo') for (const angle of [0, 60, 120]) g.append(svg('ellipse', { rx: 14, ry: 4, fill: 'none', transform: `rotate(${angle})` }));
    if (name === 'planeta') g.append(svg('path', { d: 'M-3 -7 L2 -5 L1 -1 L5 1 L2 6 L-1 5 L-2 1 L-6 -2 Z', fill: '#77b19c', stroke: 'none' }));
    if (name === 'celula') g.append(svg('circle', { cx: 2, cy: -1, r: 3, fill: '#fff' }));
    if (name === 'relogio') g.append(svg('path', { d: 'M0 -6 V0 L4 3', fill: 'none', stroke: '#fff' }));
  }
  return g;
}
export function createVisualElement(e, { label = true } = {}) {
  const position = svg('g', { transform: `translate(${e.x * 8} ${e.y * 4})`, 'data-element-id': e.id });
  const motion = svg('g');
  const shape = svg('g', { fill: PALETTE[e.cor], stroke: ['branco', 'claro'].includes(e.cor) ? '#607f9e' : PALETTE[e.cor], 'stroke-width': 2 });
  const w = e.largura * 4, h = e.altura * 2;
  if (e.tipo === 'icone') { const symbol = icon(e.icone); symbol.setAttribute('transform', `scale(${Math.max(0.8, Math.min(w / 16, h / 14))})`); shape.append(symbol); }
  else if (e.tipo === 'circulo' || e.tipo === 'particula') shape.append(svg('circle', { r: e.tipo === 'particula' ? 7 : Math.min(w, h) }));
  else if (e.tipo === 'elipse') shape.append(svg('ellipse', { rx: w, ry: h }));
  else if (e.tipo === 'retangulo' || e.tipo === 'texto') shape.append(svg('rect', { x: -w, y: -h, width: w * 2, height: h * 2, rx: 8 }));
  else if (e.tipo === 'linha' || e.tipo === 'seta') {
    const directed = Number.isFinite(e.destinoX) && Number.isFinite(e.destinoY);
    const dx = directed ? (e.destinoX - e.x) * 8 : w;
    const dy = directed ? (e.destinoY - e.y) * 4 : 0;
    shape.append(svg('line', { x1: directed ? 0 : -w, y1: 0, x2: dx, y2: dy }));
    if (e.tipo === 'seta') shape.append(svg('path', { d: 'M-10 -6 L0 0 L-10 6', transform: `translate(${dx} ${dy}) rotate(${Math.atan2(dy, directed ? dx : w * 2) * 180 / Math.PI})`, fill: 'none' }));
  } else if (e.tipo === 'onda') shape.append(svg('path', { d: 'M-40 0 Q-30 -20 -20 0 T0 0 T20 0 T40 0', fill: 'none' }));
  motion.append(shape);
  if (label && e.rotulo) motion.append(svg('text', { y: e.tipo === 'texto' ? 0 : Math.max(h, 30) + 20, 'text-anchor': 'middle', class: 'engine-label' }, e.rotulo));
  position.append(motion);
  return { position, motion };
}
