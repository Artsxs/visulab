import { svg } from './visual-elements.mjs';

export function renderReviewed(stage, experience, index) {
  const root = svg('svg', { viewBox: '0 0 800 400', class: 'reviewed-scene', role: 'img', 'aria-label': `${experience.cenas[index].titulo}. ${experience.cenas[index].explicacao}` });
  root.append(svg('title', {}, experience.cenas[index].titulo));
  const animations = [], labels = [];
  const add = (tag, attrs, text) => { const node = svg(tag, attrs, text); root.append(node); return node; };
  const animate = (node, frames, duration = 3500, delay = 0) => {
    if (typeof node.animate === 'function') animations.push(node.animate(frames, { duration, delay, fill: 'both', easing: 'linear' }));
  };
  const label = (x, y, text) => {
    labels.push(text);
    const g = add('g', { transform: `translate(${x} ${y})`, class: 'reviewed-marker' });
    g.append(svg('circle', { r: 22, fill: '#243454', stroke: '#fff', 'stroke-width': 2 }), svg('text', { y: 10, 'text-anchor': 'middle', fill: '#fff', 'font-size': 30 }, labels.length));
    return g;
  };
  const path = (d, stroke, width = 3) => add('path', { d, fill: 'none', stroke, 'stroke-width': width, 'stroke-linecap': 'round' });
  const dot = (x, y, fill, r = 6) => add('circle', { cx: x, cy: y, r, fill });
  if (experience.revisao === 'agua') {
    add('path', { d: 'M30 295 H320 L440 255 L770 295 V380 H30Z', fill: '#e6ede2' });
    add('path', { d: 'M30 300 Q170 310 320 300 V375 H30Z', fill: '#a7d6ee' });
    path('M710 300 Q610 340 490 320 T280 337', '#3977d5', 10);
    dot(98, 78, '#e8ac27', 35);
    const cloud = add('path', { d: 'M350 130 Q320 115 342 90 Q348 58 382 74 Q407 35 438 68 Q485 56 493 90 Q530 92 517 128Z', fill: '#d2e3ee', stroke: '#6c90a8', 'stroke-width': 2 });
    label(68, 135, 'Sol: fonte de energia'); label(100, 344, 'Água líquida'); label(430, 120, 'Nuvem: gotículas'); label(655, 354, 'Solo e rios');
    if (index === 0) {
      path('M220 280 Q235 200 330 155 M310 155 L330 155 L323 174', '#3977d5');
      for (let i = 0; i < 5; i++) { const n = dot(200 + i * 10, 280, '#3977d5', 4); animate(n, [{ transform: 'translate(0px, 0px)', opacity: 0 }, { opacity: 1, offset: .15 }, { transform: 'translate(120px, -125px)', opacity: .4 }], 3300, i * 240); }
    }
    if (index === 1) {
      animate(cloud, [{ opacity: .25 }, { opacity: 1 }]);
      for (let i = 0; i < 6; i++) dot(355 + i * 26, 116 - i % 2 * 25, '#3977d5', 4);
    }
    if (index === 2) {
      for (let i = 0; i < 7; i++) { const n = dot(355 + i * 24, 143 + i % 2 * 10, '#3977d5', 5); animate(n, [{ transform: 'translateY(0px)' }, { transform: 'translateY(135px)' }], 3000, i * 170); }
    }
    if (index === 3) {
      const n = dot(660, 316, '#17518d', 8);
      animate(n, [{ transform: 'translate(0px, 0px)' }, { transform: 'translate(-190px, 4px)', offset: .5 }, { transform: 'translate(-380px, 21px)' }]);
      path('M735 302 V355 M728 347 L735 355 L742 347', '#3977d5');
      const infiltrating = dot(735, 304, '#3977d5', 5); animate(infiltrating, [{ transform: 'translateY(0px)' }, { transform: 'translateY(46px)' }]);
    }
  } else if (experience.revisao === 'eclipse') {
    root.setAttribute('viewBox', '0 65 800 310');
    // Cones locais explícitos: a umbra afunila e atinge uma pequena região.
    const penumbra = add('path', { d: 'M360 158 L680 115 L680 245 L360 202Z', fill: '#c1cad6' });
    const umbra = add('path', { d: 'M360 158 L651 174 L651 186 L360 202Z', fill: '#56647b' });
    const rays = path('M100 115 L360 158 L651 174 M100 245 L360 202 L651 186', '#c99920', 2);
    dot(100, 180, '#e8ac27', 65);
    dot(685, 180, '#3977d5', 50);
    add('path', { d: 'M680 143 L706 151 L700 171 L717 183 L701 210 L683 208 L676 189 L654 180 L662 159Z', fill: '#77b19c' });
    const lunar = add('g', {});
    lunar.append(svg('circle', { cx: 360, cy: 180, r: 22, fill: '#68758b' }));
    const shadow = add('ellipse', { cx: 638, cy: 180, rx: 5, ry: 10, fill: '#23334b' });
    label(100, 280, 'Sol'); lunar.append(label(360, 240, 'Lua')); label(710, 280, 'Terra');
    const umbraLabel = label(530, 182, 'Umbra: eclipse total');
    const penumbraLabel = label(564, 125, 'Penumbra: eclipse parcial');
    if (index === 0) {
      animate(lunar, [{ transform: 'translateY(-80px)' }, { transform: 'translateY(0px)' }], 2000);
      for (const n of [penumbra, umbra, shadow, rays, umbraLabel, penumbraLabel]) animate(n, [{ opacity: 0 }, { opacity: 1 }], 1200, 2000);
    } else if (index === 1) {
      for (const n of [penumbra, umbra, shadow]) animate(n, [{ opacity: .15 }, { opacity: 1 }], 2500);
    } else {
      dot(637, 180, '#b84338', 4); dot(652, 145, '#b84338', 4);
      path('M637 180 L602 320 M652 145 L765 320', '#9d655e', 1.5);
      label(602, 340, 'Observador na umbra');
      label(765, 340, 'Observador na penumbra');
    }
  } else {
    const texts = [
      ['“Prêmio grátis,', 'clique aqui”'], ['prêmio = 1', 'grátis = 1'], ['z = 2', 'sigmoide ≈ 0,88'], ['spam', 'limiar: 0,5'],
    ];
    root.setAttribute('viewBox', '0 0 800 540');
    const positions = [[30, 85], [425, 85], [425, 300], [30, 300]];
    texts.forEach((lines, i) => {
      const [x, y] = positions[i];
      add('rect', { x, y, width: 345, height: 140, rx: 8, fill: i === Math.min(index, 3) ? '#dbece7' : '#edf2f6', stroke: '#7a91a9', 'stroke-width': 2 });
      lines.forEach((line, j) => add('text', { x: x + 172, y: y + 57 + j * 39, 'text-anchor': 'middle', fill: '#243454', 'font-size': 34 }, line));
      label(x + 172, y + 172, ['Mensagem de entrada', 'Características numéricas', 'Cálculo com pesos de exemplo', 'Classificação; pode errar'][i]);
    });
    path('M380 155 H420 M412 147 L420 155 L412 163', '#61778e');
    path('M743 230 V294 M735 286 L743 294 L751 286', '#61778e');
    path('M420 370 H380 M388 362 L380 370 L388 378', '#61778e');
    const calculation = index === 0 ? 'Texto → características' : index === 1 ? '2 × 1 + 1 × 1 − 1 = 2' : index === 2 ? '1 / (1 + exp(−2)) ≈ 0,88' : 'Uma previsão pode falhar';
    add('text', { x: 400, y: 43, 'text-anchor': 'middle', fill: '#243454', 'font-size': 30 }, calculation);
    if (index < 3) {
      const starts = [[380, 155], [743, 230], [420, 370]], ends = [[40, 0], [0, 64], [-40, 0]];
      const n = dot(...starts[index], '#25856a', 7);
      animate(n, [{ transform: 'translate(0px, 0px)' }, { transform: `translate(${ends[index][0]}px, ${ends[index][1]}px)` }]);
    }
  }
  const legend = document.createElement('ol'); legend.className = 'engine-mobile-legend reviewed-legend';
  for (const [i, text] of labels.entries()) {
    const item = document.createElement('li'), number = document.createElement('span');
    number.className = 'engine-legend-number'; number.textContent = i + 1;
    item.append(number, document.createTextNode(text)); legend.append(item);
  }
  stage.replaceChildren(root, legend);
  return { root, animations };
}
