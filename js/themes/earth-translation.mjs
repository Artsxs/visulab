// Configuração e lógica visual do Movimento de Translação da Terra e Estações do Ano
import { ThemeTemplate } from '../visual-components.mjs';

export const earthTranslationTheme = new ThemeTemplate({
  id: 'translacao_terra',
  title: 'Movimento de Translação da Terra e as Estações do Ano',
  discipline: 'ciencias',
  summary: 'Acompanhe a órbita elíptica da Terra ao redor do Sol ao longo de 365 dias, a inclinação de 23,5° do eixo e a origem dos solstícios e equinócios.',
  simplifications: 'Órbita com excentricidade elíptica ampliada para visualização didática; proporções de raio solar e distância astronômica sem escala métrica real.',
  curiosity: 'O ciclo de translação dura exatamente 365 dias, 5 horas, 48 minutos e 46 segundos; por isso, a cada quatro anos acrescentamos o dia 29 de fevereiro no ano bissexto.',
  conclusion: 'A combinação do movimento de translação com a inclinação fixa do eixo terrestre determina as estações do ano e os ciclos climáticos anuais.',
  svgTemplateId: 'visual-template-translacao',
  legend: [
    ['#ffa000', 'Sol (radiação central)'],
    ['#1e88e5', 'Terra e órbita elíptica'],
    ['#43a047', 'eixo inclinado (23,5°)'],
    ['#38bdf8', 'estações do ano (365 dias)'],
  ],
  steps: [
    {
      title: 'O Sol central e a órbita elíptica',
      description: 'No centro do sistema, a atração gravitacional do Sol mantém a Terra em uma trajetória elíptica fechada e estável em sentido anti-horário.',
    },
    {
      title: 'A inclinação fixa do eixo em 23,5°',
      description: 'O eixo imaginário de rotação da Terra mantém uma inclinação constante de aproximadamente 23,5° em relação ao plano da eclíptica durante toda a viagem.',
    },
    {
      title: 'Solstícios, equinócios e estações',
      description: 'Conforme a Terra viaja, a luz solar incide com ângulos diferentes nos hemisférios norte e sul, alternando verão, outono, inverno e primavera.',
    },
    {
      title: 'Ciclo completo de 365 dias e 6 horas',
      description: 'A Terra conclui a volta completa após 365 dias e 6 horas. O acúmulo de cerca de 6 horas anuais dá origem ao dia extra do ano bissexto a cada 4 anos.',
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
      add('.translacao-sun-glow', [{ transform: 'scale(0.96)', opacity: 0.85 }, { transform: 'scale(1.05)', opacity: 1 }, { transform: 'scale(0.96)', opacity: 0.85 }], 2400);
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
    return anims;
  },
});
