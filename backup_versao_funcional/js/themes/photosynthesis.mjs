// Configuração e lógica visual da Fotossíntese (Padrão de Qualidade de Referência)
import { ThemeTemplate } from '../visual-components.mjs';

export const photosynthesisTheme = new ThemeTemplate({
  id: 'fotossintese',
  title: 'Como Acontece a Fotossíntese',
  discipline: 'ciencias',
  summary: 'Siga o fluxo integrado da luz solar, água das raízes e gás carbônico até a síntese de glicose nos cloroplastos e a liberação de oxigênio vital para a atmosfera.',
  simplifications: 'Moléculas e organelas ampliadas para visualização microscópica clara. Etapas apresentadas sequencialmente, embora ocorram em sincronia na fisiologia vegetal.',
  conclusion: 'A fotossíntese sustenta as cadeias alimentares terrestres e produz praticamente todo o oxigênio consumido pelos seres vivos aeróbios.',
  curiosity: 'O oxigênio liberado pela planta tem como origem a quebra da molécula de água (fotólise), enquanto os carbonos da glicose vêm exclusivamente do dióxido de carbono capturado do ar.',
  steps: [
    {
      title: 'A Luz Chega à Folha',
      description: 'A energia radiante emitida pelo Sol é captada pela clorofila, pigmento verde contido no interior dos cloroplastos das células vegetais.',
    },
    {
      title: 'A Água Sobe pelas Raízes',
      description: 'As raízes absorvem a água e sais minerais do solo, transportando-os pelos vasos condutores do caule até as nervuras das folhas.',
    },
    {
      title: 'O Dióxido de Carbono Entra',
      description: 'Gás carbônico (CO₂) presente na atmosfera penetra no interior da folha através de pequenos poros microscópicos reguláveis chamados estômatos.',
    },
    {
      title: 'Produção de Glicose no Cloroplasto',
      description: 'Em reações bioquímicas energizadas pela luz (Ciclo de Calvin), átomos de carbono, hidrogênio e oxigênio recombinam-se para formar moléculas de glicose.',
    },
    {
      title: 'Liberação de Oxigênio na Atmosfera',
      description: 'A fotólise da água libera gás oxigênio (O₂), que difunde-se através dos estômatos para a atmosfera, renovando o ar planetário.',
    },
  ],
  legend: [
    ['#f4c542', 'radiação solar'],
    ['#3c8ce7', 'água das raízes'],
    ['#7b61d1', 'dióxido de carbono (CO₂)'],
    ['#2eaa72', 'cloroplasto e glicose'],
  ],
  svgTemplateId: 'visual-template-fotossintese',
  animateStep: (root, index) => {
    const animations = [];
    const add = (selector, frames, duration = 3000, delay = 0, iterations = Infinity) => {
      for (const node of root.querySelectorAll(selector)) {
        if (typeof node.animate === 'function') {
          animations.push(node.animate(frames, { duration, delay, fill: 'both', easing: 'ease-in-out', iterations }));
        }
      }
    };

    const selectors = ['.photo-rays', '.water-drops', '.carbon-bubbles', '.glucose-badge', '.oxygen-bubbles-svg'];
    if (index === 0) {
      add('.photo-sun-core', [{ transform: 'scale(0.95)' }, { transform: 'scale(1.05)' }, { transform: 'scale(0.95)' }], 2200);
      add(selectors[0], [{ opacity: 0.5 }, { opacity: 1 }, { opacity: 0.5 }], 1800);
    } else if (index === 1) {
      add(selectors[1], [{ transform: 'translateY(16px)' }, { transform: 'translateY(-12px)' }], 2000);
    } else if (index === 2) {
      add(selectors[2], [{ transform: 'translate(0px, 0px)' }, { transform: 'translate(-32px, 16px)' }], 2200);
    } else if (index === 3) {
      add('.chloroplast-glow', [{ transform: 'scale(0.97)' }, { transform: 'scale(1.04)' }, { transform: 'scale(0.97)' }], 2000);
      add(selectors[3], [{ transform: 'translate(95px, 254px) scale(0.95)' }, { transform: 'translate(95px, 254px) scale(1.08)' }, { transform: 'translate(95px, 254px) scale(0.95)' }], 2400);
    } else if (index === 4) {
      add(selectors[4], [{ transform: 'translateY(8px)' }, { transform: 'translateY(-16px)' }], 2000);
    }
    add(`[data-visual-step="${index}"] .visual-arrow`, [{ strokeDashoffset: 0 }, { strokeDashoffset: -72 }], 2000);
    return animations;
  },
});
