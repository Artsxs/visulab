import { svg, createVisualElement } from './visual-elements.mjs';
export function renderScene(stage, experience, index) {
  const scene = experience.cenas[index];
  const root = svg('svg', { viewBox: '-90 -65 980 560', class: 'engine-scene', role: 'img', 'aria-label': `${scene.titulo}. ${scene.explicacao}` });
  root.append(svg('title', {}, scene.titulo), svg('desc', {}, scene.explicacao));
  // Estrutura espacial local comunica o tipo mesmo quando o roteiro só contém texto.
  const type = experience.tipoVisual;
  const backdrop = svg('g', { fill: 'none', stroke: '#9aaac7', 'stroke-width': 3, 'aria-hidden': 'true' });
  if (type === 'ciclo' || type === 'movimento' || type === 'microscopico') backdrop.append(svg('ellipse', { cx: 400, cy: 190, rx: type === 'microscopico' ? 210 : 290, ry: 145, 'stroke-dasharray': type === 'movimento' ? '8 10' : 'none' }));
  else if (type === 'comparacao') backdrop.append(svg('line', { x1: 400, x2: 400, y1: 10, y2: 360 }));
  else if (type === 'camadas') for (let n = 0; n < 4; n++) backdrop.append(svg('rect', { x: 60, y: 30 + n * 85, width: 680, height: 75, rx: 12 }));
  else if (type === 'mapa') backdrop.append(svg('path', { d: 'M100 55 L260 25 L385 90 L520 45 L700 100 L650 320 L480 285 L350 345 L205 290 L80 330 Z' }));
  else if (type === 'sistema_biologico') backdrop.append(svg('path', { d: 'M400 25 C310 25 285 110 315 170 C250 225 300 345 400 350 C500 345 550 225 485 170 C515 110 490 25 400 25 Z' }));
  else backdrop.append(svg('path', { d: 'M50 200 H750 M735 190 L750 200 L735 210' }));
  root.append(backdrop);
  let elements = scene.elementos;
  if (!elements.length) elements = experience.cenas.map((s, i, all) => {
    const fraction = all.length === 1 ? 0.5 : i / (all.length - 1);
    let x = 10 + fraction * 80, y = 50;
    if (type === 'ciclo' || type === 'movimento' || type === 'microscopico') { x = 50 + 34 * Math.cos(i / all.length * Math.PI * 2); y = 48 + 32 * Math.sin(i / all.length * Math.PI * 2); }
    if (type === 'comparacao') { x = i % 2 ? 73 : 27; y = 15 + Math.floor(i / 2) * 30; }
    if (type === 'camadas') { x = 50; y = 12 + fraction * 70; }
    return { id: `etapa-${i}`, tipo: 'circulo', rotulo: `${i + 1}. ${s.titulo.slice(0, 24)}`, x, y, largura: 7, altura: 7, cor: i === index ? 'azul' : 'claro' };
  });
  const targets = new Map();
  for (const e of elements) {
    const node = createVisualElement(e);
    root.append(node.position);
    targets.set(e.id, { ...node, element: e });
  }
  stage.replaceChildren(root);
  return { root, targets };
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
