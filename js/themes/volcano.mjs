// Configuração e lógica visual da Erupção Vulcânica (Vulcão em corte lateral)
import { ThemeTemplate } from '../visual-components.mjs';

export const volcanoTheme = new ThemeTemplate({
  id: 'vulcao',
  title: 'Erupção Vulcânica',
  discipline: 'geografia',
  summary: 'Acompanhe o caminho do magma desde a câmara profunda até a ascensão pelo conduto, explosão da cratera e derrame de lava.',
  simplifications: 'Corte lateral esquemático de um estratovulcão. Proporções de profundidade, escala de tempo e viscosidade da lava simplificadas para fins didáticos.',
  conclusion: 'As erupções vulcânicas reciclam materiais do manto para a superfície e desempenham papel vital na formação de solos e relevos terrestres.',
  curiosity: 'A rocha derretida sob a crosta terrestre é chamada de magma; assim que atinge a superfície e entra em contato com o ar, passa a ser chamada de lava.',
  steps: [
    {
      title: 'Acúmulo de Magma na Câmara',
      description: 'Nas profundezas da crosta terrestre, rochas em fusão originadas no manto se concentram em uma câmara magmática de altíssima temperatura e pressão.',
    },
    {
      title: 'Pressão e Expansão de Gases',
      description: 'Gases voláteis (vapor d’água, CO₂ e enxofre) se desprendem do magma e se expandem, elevando intensamente a pressão interna contra as paredes rochosas.',
    },
    {
      title: 'Ascensão pelo Conduto Central',
      description: 'A enorme pressão acumulada empurra o magma em ascensão contínua através da chaminé vulcânica central em direção ao cume.',
    },
    {
      title: 'Ruptura da Cratera e Detonação',
      description: 'A pressão supera a resistência do tampão de rocha sólida da cratera, rompendo a estrutura com fragmentação de piroclastos e estrondo vulcânico.',
    },
    {
      title: 'Derrame de Lava e Pluma de Cinzas',
      description: 'Rios de lava incandescente escorrem pelas encostas do vulcão, enquanto uma coluna convectiva de cinzas e gases quentes se eleva na atmosfera.',
    },
  ],
  legend: [
    ['#ff3819', 'magma e lava'],
    ['#ffaa00', 'pressão e calor'],
    ['#6c5b65', 'cinzas e gases'],
    ['#543d32', 'camadas rochosas'],
  ],
  svgTemplateId: 'visual-template-vulcao',
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
      // Câmara magmática pulsando calor
      add('.volcano-magma-glow', [
        { transform: 'scale(0.96)', opacity: 0.8 },
        { transform: 'scale(1.05)', opacity: 1 },
        { transform: 'scale(0.96)', opacity: 0.8 },
      ], 2400);
      add('.volcano-magma-stream', [
        { strokeDashoffset: 0 },
        { strokeDashoffset: -40 },
      ], 2000, 0);
    } else if (index === 1) {
      // Bolhas de gases e expansão
      add('.volcano-gas-bubble', [
        { transform: 'translate(0px, 0px) scale(0.8)', opacity: 0.5 },
        { transform: 'translate(0px, -15px) scale(1.1)', opacity: 1 },
        { transform: 'translate(0px, -30px) scale(0.9)', opacity: 0.3 },
      ], 2200);
      add('.volcano-stress-line', [
        { opacity: 0.3, transform: 'scale(0.98)' },
        { opacity: 1, transform: 'scale(1.03)' },
        { opacity: 0.3, transform: 'scale(0.98)' },
      ], 1600);
    } else if (index === 2) {
      // Magma subindo pela chaminé
      add('.volcano-conduit-flow', [
        { strokeDashoffset: 0 },
        { strokeDashoffset: -80 },
      ], 1800, 0);
      add('.volcano-rising-arrows', [
        { transform: 'translateY(12px)', opacity: 0.4 },
        { transform: 'translateY(-12px)', opacity: 1 },
      ], 2000);
    } else if (index === 3) {
      // Detonação e quebra da cratera
      add('.volcano-crater-flash', [
        { opacity: 0.3, transform: 'scale(0.9)' },
        { opacity: 1, transform: 'scale(1.15)' },
        { opacity: 0.3, transform: 'scale(0.9)' },
      ], 1000);
      add('.volcano-bomb', [
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: 'translate(-25px, -35px) rotate(-45deg)', opacity: 0.8 },
        { transform: 'translate(-40px, 15px) rotate(-90deg)', opacity: 0 },
      ], 2200);
    } else if (index === 4) {
      // Lava escorrendo e fumaça subindo
      add('.volcano-lava-flow-left', [
        { strokeDashoffset: 0 },
        { strokeDashoffset: -60 },
      ], 2400);
      add('.volcano-lava-flow-right', [
        { strokeDashoffset: 0 },
        { strokeDashoffset: -60 },
      ], 2400);
      add('.volcano-ash-puff', [
        { transform: 'translate(0, 0) scale(0.8)', opacity: 0.4 },
        { transform: 'translate(10px, -35px) scale(1.15)', opacity: 0.9 },
        { transform: 'translate(20px, -70px) scale(1.4)', opacity: 0 },
      ], 2800);
    }
    return animations;
  },
});
