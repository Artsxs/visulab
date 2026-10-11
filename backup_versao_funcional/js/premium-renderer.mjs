// Preserva os desenhos e modelos de alta fidelidade visual do VisuLab.
// Controla animações WAAPI sincronizadas rigorosamente com o relógio do roteiro.
export function renderPremium(stage, experience, index) {
  const root = stage.querySelector('svg');
  const animations = [];
  const legend = document.createElement('ol');
  legend.className = 'engine-mobile-legend premium-mobile-legend';
  const timeline = experience.tipoVisual === 'brasil_colonial';

  const entries = timeline
    ? [...root.querySelectorAll('.timeline-milestone')].map(node => ({
        node,
        caption: [...node.querySelectorAll('text:not(.premium-marker-text)')].map(t => t.textContent).join(' — '),
        x: 0,
        y: 0,
      }))
    : [...root.querySelectorAll('text:not(.premium-marker-text)')]
        .filter(node => node.closest('[data-visual-step]')?.dataset.visualStep === String(index))
        .map(node => ({
          node,
          caption: node.textContent,
          x: Number(node.getAttribute('x')) || 0,
          y: (Number(node.getAttribute('y')) || 0) - 7,
        }));

  for (const [i, { node, caption, x, y }] of entries.entries()) {
    const item = document.createElement('li');
    const number = document.createElement('span');
    number.className = 'engine-legend-number';
    number.textContent = i + 1;
    item.append(number, document.createTextNode(caption));
    legend.append(item);

    if (!node.dataset.marker) {
      node.dataset.marker = 'true';
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      marker.setAttribute('class', 'premium-marker');
      marker.setAttribute('transform', `translate(${x} ${y})`);
      const circle = document.createElementNS(marker.namespaceURI, 'circle');
      circle.setAttribute('r', '20');
      const text = document.createElementNS(marker.namespaceURI, 'text');
      text.setAttribute('class', 'premium-marker-text');
      text.setAttribute('y', '8');
      text.setAttribute('text-anchor', 'middle');
      text.textContent = i + 1;
      marker.append(circle, text);
      (timeline ? node : node.parentNode).append(marker);
    }
  }
  stage.replaceChildren(root, legend);

  const add = (selector, frames, duration = 3000, delay = 0) => {
    for (const node of root.querySelectorAll(selector)) {
      if (typeof node.animate === 'function') {
        animations.push(node.animate(frames, { duration, delay, fill: 'both', easing: 'linear' }));
      }
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
    add(`[data-visual-step="${index}"] .visual-arrow`, [{ strokeDashoffset: 0 }, { strokeDashoffset: -72 }]);
  } else if (experience.tipoVisual === 'fotossintese') {
    const selectors = ['.photo-rays', '.water-drops', '.carbon-bubbles', '.glucose-badge', '.oxygen-bubbles-svg'];
    if (index === 0) {
      add('.photo-sun-core', [{ transform: 'scale(0.95)' }, { transform: 'scale(1.05)' }, { transform: 'scale(0.95)' }], 2200);
      add(selectors[0], reveal, 1700);
    } else if (index === 1) {
      add(selectors[1], [{ transform: 'translateY(16px)' }, { transform: 'translateY(-12px)' }]);
    } else if (index === 2) {
      add(selectors[2], [{ transform: 'translate(0px, 0px)' }, { transform: 'translate(-32px, 16px)' }]);
    } else if (index === 3) {
      add('.chloroplast-glow', [{ transform: 'scale(0.97)' }, { transform: 'scale(1.04)' }, { transform: 'scale(0.97)' }], 2000);
      add(selectors[3], reveal, 1700);
    } else if (index === 4) {
      add(selectors[4], [{ transform: 'translateY(8px)' }, { transform: 'translateY(-16px)' }]);
    }
    add(`[data-visual-step="${index}"] .visual-arrow`, [{ strokeDashoffset: 0 }, { strokeDashoffset: -72 }]);
  } else if (experience.tipoVisual === 'vulcao') {
    if (index === 0) {
      add('.volcano-magma-pulse', [{ transform: 'scale(0.96)' }, { transform: 'scale(1.06)' }, { transform: 'scale(0.96)' }], 2400);
      add('.volcano-magma-stream', [{ strokeDashoffset: 0 }, { strokeDashoffset: -36 }], 2000);
    } else if (index === 1) {
      add('.volcano-gas-bubble', [{ transform: 'translateY(0px)' }, { transform: 'translateY(-14px)' }, { transform: 'translateY(0px)' }], 2000);
      add('.volcano-stress-line', reveal, 1600);
    } else if (index === 2) {
      add('.volcano-conduit-flow', [{ strokeDashoffset: 0 }, { strokeDashoffset: -56 }], 1800);
      add('.volcano-rising-arrows', [{ transform: 'translateY(10px)' }, { transform: 'translateY(-10px)' }], 1800);
    } else if (index === 3) {
      add('.volcano-crater-flash', [{ opacity: 0.3, transform: 'scale(0.9)' }, { opacity: 1, transform: 'scale(1.15)' }, { opacity: 0.3, transform: 'scale(0.9)' }], 1000);
      add('.volcano-bomb', [{ transform: 'translate(0, 0)' }, { transform: 'translate(-20px, -30px)' }, { transform: 'translate(-35px, 10px)' }], 2200);
    } else if (index === 4) {
      add('.volcano-lava-flow-left, .volcano-lava-flow-right', [{ strokeDashoffset: 0 }, { strokeDashoffset: -60 }], 2400);
      add('.volcano-ash-puff', [{ transform: 'scale(0.85) translateY(0)' }, { transform: 'scale(1.1) translateY(-15px)' }, { transform: 'scale(0.85) translateY(0)' }], 3000);
    }
    add(`[data-visual-step="${index}"] .visual-arrow`, [{ strokeDashoffset: 0 }, { strokeDashoffset: -72 }]);
  } else if (experience.tipoVisual === 'agua') {
    if (index === 0) {
      add('.water-sun-pulse', [{ transform: 'scale(0.95)' }, { transform: 'scale(1.05)' }, { transform: 'scale(0.95)' }], 2400);
      add('.water-vapor-particle', [{ transform: 'translate(0, 0)', opacity: 0 }, { transform: 'translate(10px, -20px)', opacity: 0.8 }, { transform: 'translate(20px, -45px)', opacity: 0 }], 2200);
      add('.water-evap-arrow', [{ strokeDashoffset: 0 }, { strokeDashoffset: -36 }], 2000);
    } else if (index === 1) {
      add('.water-cloud-body', [{ opacity: 0.7, transform: 'scale(0.97)' }, { opacity: 1, transform: 'scale(1.03)' }, { opacity: 0.7, transform: 'scale(0.97)' }], 2800);
      add('.water-cloud-droplet', [{ opacity: 0.3 }, { opacity: 1 }, { opacity: 0.3 }], 1800);
    } else if (index === 2) {
      add('.water-raindrop', [{ transform: 'translateY(0px)', opacity: 0 }, { transform: 'translateY(25px)', opacity: 1 }, { transform: 'translateY(60px)', opacity: 0.1 }], 1500);
    } else if (index === 3) {
      add('.water-infiltrate-stream', [{ strokeDashoffset: 0 }, { strokeDashoffset: -28 }], 2000);
      add('.water-aquifer-glow', [{ opacity: 0.6 }, { opacity: 1 }, { opacity: 0.6 }], 2400);
    } else if (index === 4) {
      add('.water-river-flow', [{ strokeDashoffset: 0 }, { strokeDashoffset: -60 }], 2000);
      add('.water-ocean-waves', [{ transform: 'translateX(0)' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(0)' }], 2600);
    }
    add(`[data-visual-step="${index}"] .visual-arrow`, [{ strokeDashoffset: 0 }, { strokeDashoffset: -72 }]);
  } else if (experience.tipoVisual === 'eclipse') {
    if (index === 0) {
      add('.eclipse-moon-sphere', [{ transform: 'translateY(-50px)' }, { transform: 'translateY(0px)' }], 2400);
      add('.eclipse-sun-glow', [{ transform: 'scale(0.96)', opacity: 0.9 }, { transform: 'scale(1.04)', opacity: 1 }, { transform: 'scale(0.96)', opacity: 0.9 }], 2200);
    } else if (index === 1) {
      add('.eclipse-penumbra-cone, .eclipse-umbra-cone', reveal, 1800);
      add('.eclipse-light-rays line', [{ opacity: 0.4 }, { opacity: 1 }, { opacity: 0.4 }], 2000);
    } else if (index >= 2) {
      add('.eclipse-umbra-spot', [{ transform: 'scale(0.7)' }, { transform: 'scale(1.2)' }, { transform: 'scale(0.7)' }], 1600);
      add('.eclipse-penumbra-spot', [{ opacity: 0.3 }, { opacity: 0.6 }, { opacity: 0.3 }], 2000);
    }
    add(`[data-visual-step="${index}"] .visual-arrow`, [{ strokeDashoffset: 0 }, { strokeDashoffset: -72 }]);
  } else if (experience.tipoVisual === 'celula') {
    if (index === 0) {
      add('.cell-membrane-glow', [{ opacity: 0.7 }, { opacity: 1 }, { opacity: 0.7 }], 2200);
      add('.cell-nutrient-flow', [{ transform: 'translateX(0)' }, { transform: 'translateX(24px)' }], 2000);
    } else if (index === 1) {
      add('.cell-cytoplasm-pulse', [{ opacity: 0.85 }, { opacity: 1 }, { opacity: 0.85 }], 2600);
    } else if (index === 2) {
      add('.cell-nucleus-glow', [{ transform: 'scale(0.97)' }, { transform: 'scale(1.04)' }, { transform: 'scale(0.97)' }], 2400);
      add('.cell-dna-wave', [{ strokeDashoffset: 0 }, { strokeDashoffset: -32 }], 2200);
    } else if (index === 3) {
      add('.cell-mitochondria-active', [{ opacity: 0.8 }, { opacity: 1 }, { opacity: 0.8 }], 1800);
      add('.cell-atp-spark', [{ transform: 'scale(0.7)' }, { transform: 'scale(1.2)' }, { transform: 'scale(0.7)' }], 1500);
    } else if (index === 4) {
      add('.cell-vesicle-move', [{ transform: 'translate(0, 0)' }, { transform: 'translate(20px, 10px)' }], 2400);
    }
    add(`[data-visual-step="${index}"] .visual-arrow`, [{ strokeDashoffset: 0 }, { strokeDashoffset: -72 }]);
  } else if (experience.tipoVisual === 'translacao_terra' || experience.tipoVisual === 'earth-translation') {
    if (index === 0) {
      add('.translacao-sun-glow', [{ transform: 'scale(0.96)', opacity: 0.85 }, { transform: 'scale(1.06)', opacity: 1 }, { transform: 'scale(0.96)', opacity: 0.85 }], 2400);
      add('.translation-orbit-path', [{ strokeDashoffset: 0 }, { strokeDashoffset: -32 }], 2200);
    } else if (index === 1) {
      add('.translacao-axis-line', [{ opacity: 0.4 }, { opacity: 1 }, { opacity: 0.4 }], 2000);
      add('.translacao-earth-sphere', [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], 4000);
    } else if (index === 2) {
      add('.translacao-season-marker', [{ opacity: 0.4, transform: 'scale(0.95)' }, { opacity: 1, transform: 'scale(1.08)' }, { opacity: 0.4, transform: 'scale(0.95)' }], 2600);
      add('.translacao-sun-ray', [{ opacity: 0.3 }, { opacity: 0.9 }, { opacity: 0.3 }], 2000);
    } else if (index >= 3) {
      add('.translacao-period-badge', [{ transform: 'scale(0.98)' }, { transform: 'scale(1.04)' }, { transform: 'scale(0.98)' }], 2000);
      add('.visual-arrow--orbit', [{ strokeDashoffset: 0 }, { strokeDashoffset: -64 }], 2000);
    }
    add(`[data-visual-step="${index}"] .visual-arrow`, [{ strokeDashoffset: 0 }, { strokeDashoffset: -72 }]);
  } else if (experience.tipoVisual === 'revolucao_industrial' || experience.tipoVisual === 'industrial-revolution') {
    if (index === 0) {
      add('.industrial-boiler-fire', [{ opacity: 0.7, transform: 'scale(0.95)' }, { opacity: 1, transform: 'scale(1.08)' }, { opacity: 0.7, transform: 'scale(0.95)' }], 1600);
      add('.industrial-steam-pipe', [{ strokeDashoffset: 0 }, { strokeDashoffset: -40 }], 2000);
    } else if (index === 1) {
      add('.industrial-piston-rod', [{ transform: 'translateX(-12px)' }, { transform: 'translateX(12px)' }, { transform: 'translateX(-12px)' }], 1400);
      add('.industrial-flywheel', [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], 2400);
    } else if (index === 2) {
      add('.industrial-smoke-puff', [{ transform: 'translateY(0) scale(0.9)', opacity: 0.8 }, { transform: 'translateY(-24px) scale(1.15)', opacity: 0.3 }], 2200);
    } else if (index >= 3) {
      add('.industrial-train-group', [{ transform: 'translateX(-15px)' }, { transform: 'translateX(15px)' }, { transform: 'translateX(-15px)' }], 2800);
      add('.visual-arrow--industrial', [{ strokeDashoffset: 0 }, { strokeDashoffset: -60 }], 2000);
    }
    add(`[data-visual-step="${index}"] .visual-arrow`, [{ strokeDashoffset: 0 }, { strokeDashoffset: -72 }]);
  } else if (experience.tipoVisual === 'urbanizacao' || experience.tipoVisual === 'urbanization') {
    if (index === 0) {
      add('.urban-tractor', [{ transform: 'translateX(0)' }, { transform: 'translateX(25px)' }, { transform: 'translateX(0)' }], 3000);
      add('.urban-crop-waves', [{ opacity: 0.6 }, { opacity: 1 }, { opacity: 0.6 }], 2000);
    } else if (index === 1) {
      add('.urban-bus-move', [{ transform: 'translateX(0)' }, { transform: 'translateX(35px)' }, { transform: 'translateX(0)' }], 2600);
      add('.urban-migration-stream', [{ strokeDashoffset: 0 }, { strokeDashoffset: -56 }], 1800);
    } else if (index === 2) {
      add('.urban-city-growth', [{ opacity: 0.7, transform: 'scale(0.98)' }, { opacity: 1, transform: 'scale(1.02)' }, { opacity: 0.7, transform: 'scale(0.98)' }], 2400);
      add('.urban-traffic-flow', [{ strokeDashoffset: 0 }, { strokeDashoffset: -40 }], 1600);
    } else if (index >= 3) {
      add('.visual-arrow--urban', [{ strokeDashoffset: 0 }, { strokeDashoffset: -64 }], 2000);
    }
    add(`[data-visual-step="${index}"] .visual-arrow`, [{ strokeDashoffset: 0 }, { strokeDashoffset: -72 }]);
  } else if (experience.tipoVisual === 'rotacao_terra' || experience.tipoVisual === 'earth-rotation') {
    if (index === 0) {
      add('.rotation-sun-beam', [{ opacity: 0.5 }, { opacity: 0.95 }, { opacity: 0.5 }], 2000);
    } else if (index === 1) {
      add('.rotation-arrow-spin', [{ transform: 'translateX(-10px)' }, { transform: 'translateX(10px)' }, { transform: 'translateX(-10px)' }], 1800);
      add('.rotation-globe-spin', [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], 4500);
    } else if (index >= 2) {
      add('.rotation-badge-24h', [{ transform: 'scale(0.96)' }, { transform: 'scale(1.05)' }, { transform: 'scale(0.96)' }], 2000);
      add('.visual-arrow--rotation', [{ strokeDashoffset: 0 }, { strokeDashoffset: -60 }], 1800);
    }
    add(`[data-visual-step="${index}"] .visual-arrow`, [{ strokeDashoffset: 0 }, { strokeDashoffset: -72 }]);
  } else if (experience.tipoVisual === 'sistema_respiratorio' || experience.tipoVisual === 'respiratory-system') {
    if (index === 0) {
      add('.resp-diaphragm', [{ transform: 'translateY(0)' }, { transform: 'translateY(16px)' }, { transform: 'translateY(0)' }], 2200);
    } else if (index === 1) {
      add('.resp-lung-lobes', [{ transform: 'scale(0.96)' }, { transform: 'scale(1.05)' }, { transform: 'scale(0.96)' }], 2400);
      add('.resp-bronchi-tree', [{ opacity: 0.6 }, { opacity: 1 }, { opacity: 0.6 }], 2000);
    } else if (index === 2) {
      add('.resp-alveolus-zoom', [{ transform: 'scale(0.95)' }, { transform: 'scale(1.06)' }, { transform: 'scale(0.95)' }], 2000);
      add('.resp-gas-diffusion', [{ opacity: 0.2 }, { opacity: 1 }, { opacity: 0.2 }], 1600);
    } else if (index >= 3) {
      add('.resp-diaphragm', [{ transform: 'translateY(16px)' }, { transform: 'translateY(0)' }], 2000);
    }
    add(`[data-visual-step="${index}"] .visual-arrow`, [{ strokeDashoffset: 0 }, { strokeDashoffset: -72 }]);
  } else if (experience.tipoVisual === 'hidreletrica' || experience.tipoVisual === 'hydroelectric-plant' || experience.tipoVisual === 'hydroelectric') {
    if (index === 0) {
      add('.hydro-waves', [{ opacity: 0.5, transform: 'translateX(-10px)' }, { opacity: 0.9, transform: 'translateX(10px)' }, { opacity: 0.5, transform: 'translateX(-10px)' }], 2400);
    } else if (index === 1) {
      add('.hydro-flow-arrow', [{ strokeDashoffset: 0 }, { strokeDashoffset: -32 }], 1400);
      add('.hydro-penstock-flow', [{ opacity: 0.7 }, { opacity: 1 }, { opacity: 0.7 }], 1600);
    } else if (index === 2) {
      add('.hydro-turbine-blades', [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], 1600);
      add('.hydro-generator', [{ transform: 'scale(0.96)' }, { transform: 'scale(1.05)' }, { transform: 'scale(0.96)' }], 2000);
    } else if (index >= 3) {
      add('.hydro-spark', [{ transform: 'scale(0.8)', opacity: 0.6 }, { transform: 'scale(1.25)', opacity: 1 }, { transform: 'scale(0.8)', opacity: 0.6 }], 1400);
      add('.hydro-power-line', [{ opacity: 0.6 }, { opacity: 1 }, { opacity: 0.6 }], 1500);
      add('.hydro-tailrace-flow', [{ strokeDashoffset: 0 }, { strokeDashoffset: -52 }], 1800);
    }
    add(`[data-visual-step="${index}"] .visual-arrow`, [{ strokeDashoffset: 0 }, { strokeDashoffset: -72 }]);
  }
  return { root, animations };
}
