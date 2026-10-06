// Configuração e lógica visual da Rotação da Terra (Dia, Noite e Eixo Terrestre)
import { ThemeTemplate } from '../visual-components.mjs';

export const earthRotationTheme = new ThemeTemplate({
  id: 'rotacao_terra',
  title: 'Movimento de Rotação da Terra e o Ciclo Dia e Noite',
  discipline: 'ciencias',
  summary: 'Visualize o giro contínuo da Terra de oeste para leste em torno do seu eixo inclinado a cada 24 horas, definindo a alternância diária entre iluminação e escuridão.',
  simplifications: 'Dimensões dos feixes solares paralelos idealizados e velocidade de rotação ampliada para permitir observação didática em poucos segundos.',
  curiosity: 'Na linha do Equador, a superfície da Terra gira a uma velocidade de aproximadamente 1.670 km/h, sem que possamos sentir devido à inércia constante.',
  conclusion: 'O movimento de rotação em 24 horas fundamenta a contagem dos dias e dos fusos horários no planeta Terra.',
  svgTemplateId: 'visual-template-rotacao',
  legend: [
    ['#fbc02d', 'luz solar (dia)'],
    ['#101826', 'sombra (noite)'],
    ['#0288d1', 'eixo de rotação (24h)'],
  ],
  steps: [
    {
      title: 'Incidência solar e a linha do terminador',
      description: 'Como a Terra é esférica e opaca, os raios solares iluminam simultaneamente apenas metade do globo (dia), enquanto a outra metade permanece em sombra (noite).',
    },
    {
      title: 'O sentido de rotação de oeste para leste',
      description: 'A Terra gira no sentido anti-horário (oeste para leste), fazendo com que o Sol pareça nascer a leste e se pôr a oeste ao longo do dia.',
    },
    {
      title: 'A duração de 24 horas e os fusos',
      description: 'Uma volta completa de 360° em torno do eixo dura cerca de 23 horas, 56 minutos e 4 segundos (dia sideral), arredondado para 24 horas no dia solar médio.',
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
      add('.rotation-sun-beam', [{ opacity: 0.5 }, { opacity: 0.95 }, { opacity: 0.5 }], 2000);
      add('.rotation-day-half', [{ opacity: 0.8 }, { opacity: 1 }, { opacity: 0.8 }], 2400);
    } else if (index === 1) {
      add('.rotation-arrow-spin', [{ transform: 'translateX(-10px)' }, { transform: 'translateX(10px)' }, { transform: 'translateX(-10px)' }], 1800);
      add('.rotation-globe-spin', [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], 4500);
    } else if (index >= 2) {
      add('.rotation-badge-24h', [{ transform: 'scale(0.96)' }, { transform: 'scale(1.05)' }, { transform: 'scale(0.96)' }], 2000);
      add('.visual-arrow--rotation', [{ strokeDashoffset: 0 }, { strokeDashoffset: -60 }], 1800);
    }
    return anims;
  },
});
