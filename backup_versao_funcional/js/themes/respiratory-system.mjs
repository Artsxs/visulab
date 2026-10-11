// Configuração e lógica visual do Sistema Respiratório (Pulmões, Diafragma e Hematose)
import { ThemeTemplate } from '../visual-components.mjs';

export const respiratorySystemTheme = new ThemeTemplate({
  id: 'sistema_respiratorio',
  title: 'O Sistema Respiratório e a Hematose Pulmonar',
  discipline: 'ciencias',
  summary: 'Acompanhe o caminho do oxigênio e do gás carbônico: a mecânica do diafragma na inspiração/expiração, a condução traqueobrônquica e a hematose alveolar.',
  simplifications: 'Esquema anatômico do tronco humano e zoom alveolar ampliado com rede de capilares microscópicos para evidenciar as trocas gasosas.',
  curiosity: 'Os pulmões humanos contêm cerca de 300 a 500 milhões de alvéolos; se estendidos em superfície plana, cobririam uma área de quase 70 metros quadrados.',
  conclusion: 'O sistema respiratório atua em sincronia contínua com o sistema circulatório para abastecer todas as células do corpo com oxigênio vital.',
  svgTemplateId: 'visual-template-respiratorio',
  legend: [
    ['#0288d1', 'oxigênio (O₂ na inspiração)'],
    ['#e53935', 'gás carbônico (CO₂ na expiração)'],
    ['#fb8c00', 'diafragma e mecânica'],
    ['#8e24aa', 'hematose nos alvéolos'],
  ],
  steps: [
    {
      title: 'Inspiração e contração do diafragma',
      description: 'O músculo diafragma contrai e desce, os músculos intercostais elevam as costelas e a caixa torácica se expande, gerando pressão negativa que aspira o ar rico em O₂.',
    },
    {
      title: 'Condução pela traqueia e brônquios',
      description: 'O ar filtrado e umedecido nas fossas nasais desce pela laringe e traqueia, ramificando-se pelos brônquios e bronquíolos até atingir os alvéolos pulmonares.',
    },
    {
      title: 'Hematose nos alvéolos pulmonares',
      description: 'Por difusão simples através de membranas finíssimas, o oxigênio entra nos capilares e se liga à hemoglobina, enquanto o gás carbônico do sangue passa aos alvéolos.',
    },
    {
      title: 'Expiração e relaxamento torácico',
      description: 'O diafragma relaxa e sobe, a caixa torácica diminui de volume e a pressão interna expulsa o ar rico em CO₂ de volta para o ambiente externo.',
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
      add('.resp-diaphragm', [{ transform: 'translateY(0)' }, { transform: 'translateY(16px)' }, { transform: 'translateY(0)' }], 2200);
      add('.resp-air-inflow', [{ strokeDashoffset: 0 }, { strokeDashoffset: -36 }], 1800);
    } else if (index === 1) {
      add('.resp-lung-lobes', [{ transform: 'scale(0.96)' }, { transform: 'scale(1.05)' }, { transform: 'scale(0.96)' }], 2400);
      add('.resp-bronchi-tree', [{ opacity: 0.6 }, { opacity: 1 }, { opacity: 0.6 }], 2000);
    } else if (index === 2) {
      add('.resp-alveolus-zoom', [{ transform: 'scale(0.95)' }, { transform: 'scale(1.06)' }, { transform: 'scale(0.95)' }], 2000);
      add('.resp-gas-diffusion', [{ opacity: 0.2 }, { opacity: 1 }, { opacity: 0.2 }], 1600);
    } else if (index >= 3) {
      add('.resp-air-outflow', [{ strokeDashoffset: 0 }, { strokeDashoffset: -36 }], 1800);
      add('.resp-diaphragm-relax', [{ transform: 'translateY(16px)' }, { transform: 'translateY(0)' }], 2000);
    }
    return anims;
  },
});
