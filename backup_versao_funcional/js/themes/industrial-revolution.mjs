// Configuração e lógica visual da Revolução Industrial (Carvão, Vapor, Fábrica e Ferrovias)
import { ThemeTemplate } from '../visual-components.mjs';

export const industrialRevolutionTheme = new ThemeTemplate({
  id: 'revolucao_industrial',
  title: 'A Revolução Industrial e a Força a Vapor',
  discipline: 'historia',
  summary: 'Explore a transição da manufatura manual para a indústria mecanizada no século XVIII: a máquina a vapor de Watt, os teares fabris, as ferrovias e a transformação do trabalho.',
  simplifications: 'Corte mecânico esquemático dos componentes da máquina de Watt e proporções espaciais das fábricas agrupadas para síntese didática.',
  curiosity: 'A máquina de James Watt de 1769 utilizava um condensador separado que economizava até 75% do carvão em comparação ao motor anterior de Newcomen.',
  conclusion: 'A introdução do vapor mecanizou a produção de bens de consumo, transformou cidades em polos industriais e redefiniu as relações mundiais de trabalho.',
  svgTemplateId: 'visual-template-revolucao-industrial',
  legend: [
    ['#ff5722', 'carvão e caldeira a vapor'],
    ['#78909c', 'máquina e volante de Watt'],
    ['#b0bec5', 'teares fabris mecanizados'],
    ['#d32f2f', 'ferrovia e locomotiva'],
  ],
  steps: [
    {
      title: 'O carvão mineral e a caldeira a vapor',
      description: 'A queima contínua de carvão na fornalha aquece a água na caldeira blindada, produzindo vapor em expansão sob alta pressão energética.',
    },
    {
      title: 'O cilindro, pistão e volante de Watt',
      description: 'O vapor empurra o pistão alternado em vaivém mecânico; bielas transformam esse movimento linear em rotação contínua na grande roda de inércia.',
    },
    {
      title: 'A mecanização das fábricas têxteis',
      description: 'Eixos e correias de transmissão conduzem o movimento rotativo para dezenas de teares mecânicos, multiplicando exponencialmente a produção de tecidos de algodão.',
    },
    {
      title: 'Ferrovias e a integração do mercado',
      description: 'Locomotivas a vapor sobre trilhos conectam minas, fábricas e portos marítimos, revolucionando a velocidade do transporte de cargas e de trabalhadores.',
    },
  ],
  animateStep: (root, index) => {
    const anims = [];
    const add = (selector, frames, duration = 3000, delay = 0) => {
      for (const node of root.querySelectorAll(selector)) {
        if (typeof node.animate === 'function') {
          anims.push(node.animate(frames, { duration, delay, fill: 'both', easing: 'linear' }));
        }
      }
    };

    if (index === 0) {
      add('.industrial-boiler-fire', [{ opacity: 0.7, transform: 'scale(0.95)' }, { opacity: 1, transform: 'scale(1.08)' }, { opacity: 0.7, transform: 'scale(0.95)' }], 1600);
      add('.industrial-steam-pipe', [{ strokeDashoffset: 0 }, { strokeDashoffset: -40 }], 2000);
    } else if (index === 1) {
      add('.industrial-piston-rod', [{ transform: 'translateX(-12px)' }, { transform: 'translateX(12px)' }, { transform: 'translateX(-12px)' }], 1400);
      add('.industrial-flywheel', [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], 2400);
    } else if (index === 2) {
      add('.industrial-smoke-puff', [{ transform: 'translateY(0) scale(0.9)', opacity: 0.8 }, { transform: 'translateY(-24px) scale(1.15)', opacity: 0.3 }], 2200);
      add('.industrial-belt-drive', [{ strokeDashoffset: 0 }, { strokeDashoffset: -48 }], 1800);
    } else if (index >= 3) {
      add('.industrial-train-group', [{ transform: 'translateX(-15px)' }, { transform: 'translateX(15px)' }, { transform: 'translateX(-15px)' }], 2800);
      add('.visual-arrow--industrial', [{ strokeDashoffset: 0 }, { strokeDashoffset: -60 }], 2000);
    }
    return anims;
  },
});
