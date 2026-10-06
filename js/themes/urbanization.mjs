// Configuração e lógica visual do Processo de Urbanização (Campo, Êxodo Rural e Metrópole)
import { ThemeTemplate } from '../visual-components.mjs';

export const urbanizationTheme = new ThemeTemplate({
  id: 'urbanizacao',
  title: 'O Processo de Urbanização e Dinâmica Espacial',
  discipline: 'geografia',
  summary: 'Compreenda a transformação espacial da transição rural-urbana: a mecanização das lavouras, o êxodo rural, a atração de indústrias e a formação de conurbações metropolitanas.',
  simplifications: 'Contraste territorial esquemático entre o campo modernizado e a aglomeração urbana; escala temporal de décadas acelerada para fins pedagógicos.',
  curiosity: 'No Brasil, a taxa de urbanização passou de cerca de 31% em 1940 para mais de 84% no início do século XXI, impulsionada pela rápida industrialização.',
  conclusion: 'A urbanização reconfigura o espaço geográfico, demandando redes estruturadas de transporte coletivo, saneamento e planejamento habitacional.',
  svgTemplateId: 'visual-template-urbanizacao',
  legend: [
    ['#43a047', 'zona rural mecanizada'],
    ['#f57c00', 'êxodo rural e transporte'],
    ['#1976d2', 'indústrias e serviços'],
    ['#5c6bc0', 'expansão metropolitana'],
  ],
  steps: [
    {
      title: 'Mecanização do campo e êxodo rural',
      description: 'A introdução de tratores e colheitadeiras mecanizadas substitui a mão de obra manual, forçando trabalhadores a buscarem sobrevivência nos centros urbanos.',
    },
    {
      title: 'Fluxo migratório e eixos viários',
      description: 'Estradas e linhas de ônibus transportam contingentes contínuos de migrantes do interior em direção às cidades que concentram fábricas e comércio.',
    },
    {
      title: 'Crescimento urbano e infraestrutura',
      description: 'A expansão rápida exige loteamentos, transporte público, avenidas, eletrificação e saneamento básico para atender ao adensamento populacional.',
    },
    {
      title: 'Conurbação e formação de metrópoles',
      description: 'O crescimento contínuo funde a malha urbana de cidades vizinhas em conurbação, originando regiões metropolitanas interconectadas.',
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
      add('.urban-tractor', [{ transform: 'translateX(0)' }, { transform: 'translateX(25px)' }, { transform: 'translateX(0)' }], 3000);
      add('.urban-crop-waves', [{ opacity: 0.6 }, { opacity: 1 }, { opacity: 0.6 }], 2000);
    } else if (index === 1) {
      add('.urban-bus-move', [{ transform: 'translateX(0)' }, { transform: 'translateX(35px)' }, { transform: 'translateX(0)' }], 2600);
      add('.urban-migration-stream', [{ strokeDashoffset: 0 }, { strokeDashoffset: -56 }], 1800);
    } else if (index === 2) {
      add('.urban-city-growth', [{ opacity: 0.7, transform: 'scale(0.98)' }, { opacity: 1, transform: 'scale(1.02)' }, { opacity: 0.7, transform: 'scale(0.98)' }], 2400);
      add('.urban-traffic-flow', [{ strokeDashoffset: 0 }, { strokeDashoffset: -40 }], 1600);
    } else if (index >= 3) {
      add('.urban-conurbation-halo', [{ opacity: 0.4 }, { opacity: 0.9 }, { opacity: 0.4 }], 2200);
      add('.visual-arrow--urban', [{ strokeDashoffset: 0 }, { strokeDashoffset: -64 }], 2000);
    }
    return anims;
  },
});
