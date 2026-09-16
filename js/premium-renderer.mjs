// Preserva os três desenhos originais; substitui seus loops CSS por movimentos
// finitos que usam exatamente o mesmo relógio do roteiro.
export function renderPremium(stage, experience, index) {
  const root = stage.querySelector('svg');
  const animations = [];
  const legend = document.createElement('ol'); legend.className = 'engine-mobile-legend premium-mobile-legend';
  const timeline = experience.tipoVisual === 'brasil_colonial';
  const entries = timeline
    ? [...root.querySelectorAll('.timeline-milestone')].map(node => ({ node, caption: [...node.querySelectorAll('text:not(.premium-marker-text)')].map(t => t.textContent).join(' — '), x: 0, y: 0 }))
    : [...root.querySelectorAll('text:not(.premium-marker-text)')].filter(node => node.closest('[data-visual-step]')?.dataset.visualStep === String(index)).map(node => ({ node, caption: node.textContent, x: Number(node.getAttribute('x')) || 0, y: (Number(node.getAttribute('y')) || 0) - 7 }));
  for (const [i, { node, caption, x, y }] of entries.entries()) {
    const item = document.createElement('li'), number = document.createElement('span');
    number.className = 'engine-legend-number'; number.textContent = i + 1;
    item.append(number, document.createTextNode(caption)); legend.append(item);
    if (!node.dataset.marker) {
      node.dataset.marker = 'true';
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      marker.setAttribute('class', 'premium-marker');
      marker.setAttribute('transform', `translate(${x} ${y})`);
      const circle = document.createElementNS(marker.namespaceURI, 'circle'); circle.setAttribute('r', '20');
      const text = document.createElementNS(marker.namespaceURI, 'text');
      text.setAttribute('class', 'premium-marker-text'); text.setAttribute('y', '8'); text.setAttribute('text-anchor', 'middle'); text.textContent = i + 1;
      marker.append(circle, text); (timeline ? node : node.parentNode).append(marker);
    }
  }
  stage.replaceChildren(root, legend);
  const add = (selector, frames, duration = 3000, delay = 0) => {
    for (const node of root.querySelectorAll(selector)) {
      if (typeof node.animate === 'function') animations.push(node.animate(frames, { duration, delay, fill: 'both', easing: 'linear' }));
    }
  };
  const reveal = [{ opacity: 0 }, { opacity: 1 }];
  if (experience.tipoVisual === 'terremoto') {
    if (index === 0) {
      add('.tectonic-plate--left', [{ transform: 'translateX(-8px)' }, { transform: 'translateX(0px)' }]);
      add('.tectonic-plate--right', [{ transform: 'translateX(8px)' }, { transform: 'translateX(0px)' }]);
    }
    if (index === 1) add('.pressure-line', reveal);
    if (index === 2) add('.fault-flash, .hypocenter', reveal, 700);
    if (index === 3) {
      ['one', 'two', 'three'].forEach((name, i) => add(`.seismic-wave--${name}`, [
        { transform: 'scale(0.2)', opacity: 0.8 }, { transform: 'scale(2)', opacity: 0.12 },
      ], 3000, i * 350));
    }
    if (index === 4) add('.surface-house', [0, -2, 2, -2, 2, 0].map(x => ({ transform: `translate(${575 + x}px, 213px)` })), 1500);
  } else if (experience.tipoVisual === 'fotossintese') {
    const selectors = ['.photo-rays', '.water-drops', '.carbon-bubbles', '.glucose-badge', '.oxygen-bubbles-svg'];
    if (index === 1) add(selectors[index], [{ transform: 'translateY(16px)' }, { transform: 'translateY(-12px)' }]);
    else if (index === 2) add(selectors[index], [{ transform: 'translate(0px, 0px)' }, { transform: 'translate(-32px, 16px)' }]);
    else if (index === 4) add(selectors[index], [{ transform: 'translateY(8px)' }, { transform: 'translateY(-16px)' }]);
    else add(selectors[index], reveal, 1700);
    add(`[data-visual-step="${index}"] .visual-arrow`, [{ strokeDashoffset: 0 }, { strokeDashoffset: -72 }]);
  }
  return { root, animations };
}
