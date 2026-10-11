// Configuração e lógica visual do Terremoto (Placas Tectônicas, Ruptura e Ondas Sísmicas)
import { ThemeTemplate } from '../visual-components.mjs';

export const earthquakeTheme = new ThemeTemplate({
  id: 'terremoto',
  title: 'Terremotos e Placas Tectônicas',
  discipline: 'geografia',
  summary: 'Acompanhe a dinâmica das placas tectônicas: movimento convergente, acúmulo de tensão na falha geológica, ruptura no hipocentro e propagação de ondas sísmicas.',
  simplifications: 'Corte esquemático da litosfera terrestre. Escalas temporais, proporções de profundidade e deformação elástica ampliadas para fins didáticos.',
  conclusion: 'Terremotos resultam da liberação súbita de energia acumulada pelo atrito entre placas rochosas da litosfera.',
  curiosity: 'As placas tectônicas movem-se a uma velocidade média de 2 a 10 cm por ano — equivalente ao ritmo de crescimento das unhas humanas.',
  steps: [
    {
      title: 'Convergência das Placas Tectônicas',
      description: 'A litosfera terrestre divide-se em gigantescos blocos rochosos em movimento contínuo sobre o manto. Duas placas aproximam-se lentamente na zona de contato.',
    },
    {
      title: 'Atrito e Acúmulo de Tensão',
      description: 'As rugosidades das bordas prendem-se mutuamente. Como o movimento tectônico não cessa, as rochas deformam-se elasticamente acumulando enorme pressão mecânica.',
    },
    {
      title: 'Ruptura na Falha e Hipocentro',
      description: 'Quando o estresse acumulado ultrapassa a resistência de cisalhamento das rochas, ocorre a fratura súbita. O ponto de origem subterrâneo é o hipocentro.',
    },
    {
      title: 'Propagação de Ondas Sísmicas',
      description: 'A energia mecânica viaja em frentes de ondas concêntricas (primárias P e secundárias S) que cruzam o interior da crosta e do manto em alta velocidade.',
    },
    {
      title: 'Epicentro e Vibração da Superfície',
      description: 'Diretamente acima do foco subterrâneo, o epicentro na superfície recebe o impacto inicial, transmitindo intensas oscilações e vibrações às estruturas.',
    },
  ],
  legend: [
    ['#f6cc62', 'placa tectônica A'],
    ['#dc8f4d', 'placa tectônica B'],
    ['#ff6b4a', 'tensão e hipocentro'],
    ['#1e4ed8', 'ondas sísmicas'],
  ],
  svgTemplateId: 'visual-template-placas',
  animateStep: (root, index) => {
    const animations = [];
    const add = (selector, frames, duration = 3000, delay = 0, iterations = Infinity) => {
      for (const node of root.querySelectorAll(selector)) {
        if (typeof node.animate === 'function') {
          animations.push(node.animate(frames, { duration, delay, fill: 'both', easing: 'ease-in-out', iterations }));
        }
      }
    };

    if (index === 0) {
      add('.tectonic-plate--left', [{ transform: 'translateX(-8px)' }, { transform: 'translateX(0px)' }], 2400);
      add('.tectonic-plate--right', [{ transform: 'translateX(8px)' }, { transform: 'translateX(0px)' }], 2400);
    } else if (index === 1) {
      add('.pressure-line', [{ opacity: 0.3, transform: 'scale(0.95)' }, { opacity: 1, transform: 'scale(1.05)' }, { opacity: 0.3, transform: 'scale(0.95)' }], 1600);
    } else if (index === 2) {
      add('.fault-flash, .hypocenter', [{ opacity: 0.2, transform: 'scale(0.8)' }, { opacity: 1, transform: 'scale(1.2)' }, { opacity: 0.2, transform: 'scale(0.8)' }], 800);
    } else if (index === 3) {
      ['one', 'two', 'three'].forEach((name, i) => {
        add(`.seismic-wave--${name}`, [
          { transform: 'scale(0.2)', opacity: 0.9 },
          { transform: 'scale(2.2)', opacity: 0.05 },
        ], 2800, i * 350);
      });
    } else if (index === 4) {
      add('.surface-house', [0, -3, 3, -3, 3, 0].map(x => ({ transform: `translate(${575 + x}px, 213px)` })), 1400);
    }
    return animations;
  },
});
