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
  placa_tectonica: 'M-14 -4 L-2 -7 L-5 3 L-14 6 Z M2 -7 L14 -4 V6 L0 3 L4 -1 Z'
};
function icon(name) {
  const g = svg('g', { 'stroke-width': 1.3 });
  if (paths[name]) g.append(svg('path', { d: paths[name] }));
  else if (name === 'oxigenio' || name === 'gas_carbonico') g.append(svg('text', { x: 0, y: 3, 'text-anchor': 'middle', 'font-size': 8, stroke: 'none' }, name === 'oxigenio' ? 'O₂' : 'CO₂'));
  else {
    g.append(svg('circle', { r: name === 'atomo' ? 2 : 8 }));
    if (name === 'sol') for (let i = 0; i < 8; i++) g.append(svg('line', { x1: 10, x2: 14, transform: `rotate(${i * 45})` }));
    if (name === 'planeta' || name === 'atomo') for (const angle of (name === 'atomo' ? [0, 60, 120] : [-25])) g.append(svg('ellipse', { rx: 14, ry: 4, fill: 'none', transform: `rotate(${angle})` }));
    if (name === 'celula') g.append(svg('circle', { cx: 2, cy: -1, r: 3, fill: '#fff' }));
    if (name === 'relogio') g.append(svg('path', { d: 'M0 -6 V0 L4 3', fill: 'none', stroke: '#fff' }));
  }
  return g;
}
export function createVisualElement(e) {
  const position = svg('g', { transform: `translate(${e.x * 8} ${e.y * 4})` });
  const motion = svg('g');
  const shape = svg('g', { fill: PALETTE[e.cor], stroke: PALETTE[e.cor], 'stroke-width': 2 });
  const w = e.largura * 4, h = e.altura * 2;
  if (e.tipo === 'icone') { const symbol = icon(e.icone); symbol.setAttribute('transform', 'scale(2.5)'); shape.append(symbol); }
  else if (e.tipo === 'circulo' || e.tipo === 'particula') shape.append(svg('circle', { r: e.tipo === 'particula' ? 7 : Math.min(w, h) }));
  else if (e.tipo === 'elipse') shape.append(svg('ellipse', { rx: w, ry: h }));
  else if (e.tipo === 'retangulo') shape.append(svg('rect', { x: -w, y: -h, width: w * 2, height: h * 2, rx: 8 }));
  else if (e.tipo === 'linha' || e.tipo === 'seta') {
    shape.append(svg('line', { x1: -w, x2: w }));
    if (e.tipo === 'seta') shape.append(svg('path', { d: `M${w - 9} -7 L${w} 0 L${w - 9} 7`, fill: 'none' }));
  } else if (e.tipo === 'onda') shape.append(svg('path', { d: 'M-40 0 Q-30 -20 -20 0 T0 0 T20 0 T40 0', fill: 'none' }));
  motion.append(shape);
  if (e.rotulo) motion.append(svg('text', { y: e.tipo === 'texto' ? 0 : Math.max(h, 30) + 20, 'text-anchor': 'middle', class: 'engine-label' }, e.rotulo));
  position.append(motion);
  return { position, motion };
}
