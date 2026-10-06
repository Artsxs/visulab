// Configuração e lógica visual do Ciclo da Água (Ciclo Hidrológico Completo)
import { ThemeTemplate } from '../visual-components.mjs';

export const waterCycleTheme = new ThemeTemplate({
  id: 'agua',
  title: 'Ciclo Hidrológico da Água',
  discipline: 'ciencias',
  summary: 'O percurso ininterrupto da água na Terra: evaporação nos oceanos, condensação em nuvens, chuva, infiltração nos solos e escoamento de volta ao mar.',
  simplifications: 'Corte transversal paisagístico idealizado. Escala de altitude, tempos de residência da água nos aquíferos e variações de umidade simplificados para ensino.',
  conclusion: 'O ciclo da água não tem ponto inicial nem final: é um sistema fechado contínuo que purifica e redistribui água doce por todo o planeta.',
  curiosity: 'Uma gota d’água pode passar cerca de 9 dias na atmosfera em forma de vapor, mas centenas de anos nas profundezas de um aquífero subterrâneo.',
  steps: [
    {
      title: 'Evaporação no Oceano',
      description: 'O calor da radiação solar aquece as águas superficiais dos oceanos e rios, provocando a mudança de estado líquido para vapor de água invisível ascendente.',
    },
    {
      title: 'Condensação em Nuvens',
      description: 'Ao subir e encontrar ar mais frio em grandes altitudes, o vapor condensa-se ao redor de partículas microscópicas, agrupando-se em densas nuvens brancas.',
    },
    {
      title: 'Precipitação em Chuva',
      description: 'As incontáveis gotículas de água no interior das nuvens colidem e aumentam de volume até caírem sob a ação da gravidade em forma de chuva.',
    },
    {
      title: 'Infiltração e Aquíferos',
      description: 'A chuva atinge a terra e infiltra-se no solo poroso e nas fissuras rochosas, alimentando o lençol freático e os reservatórios de água subterrânea.',
    },
    {
      title: 'Escoamento Superficial e Retorno',
      description: 'A água não infiltrada corre pelas encostas, formando córregos e rios que desaguam de volta no oceano, completando perfeitamente o ciclo.',
    },
  ],
  legend: [
    ['#3c8ce7', 'água líquida'],
    ['#f4c542', 'calor solar'],
    ['#9cbcdb', 'vapor e nuvens'],
    ['#2eaa72', 'infiltração no solo'],
  ],
  svgTemplateId: 'visual-template-agua',
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
      // Sol e vapor subindo
      add('.water-sun-pulse', [
        { transform: 'scale(0.96)', opacity: 0.9 },
        { transform: 'scale(1.06)', opacity: 1 },
        { transform: 'scale(0.96)', opacity: 0.9 },
      ], 2600);
      add('.water-vapor-particle', [
        { transform: 'translate(0, 0)', opacity: 0 },
        { transform: 'translate(10px, -25px)', opacity: 0.8 },
        { transform: 'translate(22px, -60px)', opacity: 0 },
      ], 2400);
      add('.water-evap-arrow', [
        { strokeDashoffset: 0 },
        { strokeDashoffset: -40 },
      ], 2000);
    } else if (index === 1) {
      // Nuvem condensando
      add('.water-cloud-body', [
        { opacity: 0.65, transform: 'scale(0.95)' },
        { opacity: 1, transform: 'scale(1.03)' },
        { opacity: 0.65, transform: 'scale(0.95)' },
      ], 3000);
      add('.water-cloud-droplet', [
        { opacity: 0.2, transform: 'scale(0.8)' },
        { opacity: 1, transform: 'scale(1.15)' },
        { opacity: 0.2, transform: 'scale(0.8)' },
      ], 1800);
    } else if (index === 2) {
      // Chuva caindo
      add('.water-raindrop', [
        { transform: 'translateY(0px)', opacity: 0 },
        { transform: 'translateY(20px)', opacity: 0.9 },
        { transform: 'translateY(80px)', opacity: 0.1 },
      ], 1400);
    } else if (index === 3) {
      // Infiltração profunda
      add('.water-infiltrate-stream', [
        { strokeDashoffset: 0 },
        { strokeDashoffset: -32 },
      ], 2200);
      add('.water-aquifer-glow', [
        { opacity: 0.6 },
        { opacity: 1 },
        { opacity: 0.6 },
      ], 2500);
    } else if (index === 4) {
      // Rio escoando ao oceano
      add('.water-river-flow', [
        { strokeDashoffset: 0 },
        { strokeDashoffset: -70 },
      ], 2000);
      add('.water-ocean-waves', [
        { transform: 'translateX(0px)' },
        { transform: 'translateX(-12px)' },
        { transform: 'translateX(0px)' },
      ], 2800);
    }
    return animations;
  },
});
