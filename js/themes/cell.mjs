// Configuração e lógica visual da Célula (Biologia Celular e Organelas)
import { ThemeTemplate } from '../visual-components.mjs';

export const cellTheme = new ThemeTemplate({
  id: 'celula',
  title: 'Estrutura e Funcionamento da Célula',
  discipline: 'ciencias',
  summary: 'Explore o interior de uma célula viva: a membrana seletiva, o citoplasma, o núcleo de comando genético e a produção de energia nas mitocôndrias.',
  simplifications: 'Corte microscópico tridimensional de uma célula eucarionte animal. Dimensões, quantitativo de organelas e velocidades metabólicas ampliados para fins didáticos.',
  conclusion: 'As células são as menores unidades funcionais e estruturais vivas dos seres orgânicos, cooperando em tecidos e sistemas complexos.',
  curiosity: 'O corpo de um ser humano adulto é formado por mais de 30 trilhões de células trabalhando sincronizadas dia e noite.',
  steps: [
    {
      title: 'Membrana Plasmática Seletiva',
      description: 'A bicamada lipídica com proteínas receptoras delimita a célula, mantendo a integridade interna e controlando a entrada de nutrientes essenciais e água.',
    },
    {
      title: 'Citoplasma e Fluxo Celular',
      description: 'O meio coloidal rico em citosol preenche a célula, oferecendo suporte mecânico e permitindo a circulação de substâncias e organelas vitais.',
    },
    {
      title: 'Núcleo e Centro Genético',
      description: 'Protegido pela carioteca com poros seletivos, o núcleo abriga o DNA celular e coordena todas as sínteses proteicas e a divisão celular.',
    },
    {
      title: 'Mitocôndrias e Produção de ATP',
      description: 'Com membranas dobradas em cristas mitocondriais, essas usinas de energia utilizam glicose e oxigênio para fabricar moléculas de ATP.',
    },
    {
      title: 'Metabolismo e Secreção Integrada',
      description: 'O retículo endoplasmático e o complexo golgiense processam, empacotam e exportam compostos químicos úteis, expelindo resíduos metabólicos.',
    },
  ],
  legend: [
    ['#2eaa72', 'membrana celular'],
    ['#7b61d1', 'núcleo e DNA'],
    ['#f59e0b', 'mitocôndria (ATP)'],
    ['#3c8ce7', 'citoplasma e nutrientes'],
  ],
  svgTemplateId: 'visual-template-celula',
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
      // Membrana e canais de transporte
      add('.cell-membrane-glow', [
        { opacity: 0.7, strokeWidth: '4px' },
        { opacity: 1, strokeWidth: '6px' },
        { opacity: 0.7, strokeWidth: '4px' },
      ], 2400);
      add('.cell-nutrient-flow', [
        { transform: 'translate(0, 0)', opacity: 0.4 },
        { transform: 'translate(18px, 12px)', opacity: 1 },
      ], 2000);
    } else if (index === 1) {
      // Citoplasma e citoesqueleto
      add('.cell-cytoplasm-pulse', [
        { opacity: 0.8 },
        { opacity: 1 },
        { opacity: 0.8 },
      ], 3000);
      add('.cell-organelle-float', [
        { transform: 'translate(0, 0)' },
        { transform: 'translate(-4px, -6px)' },
        { transform: 'translate(0, 0)' },
      ], 2800);
    } else if (index === 2) {
      // Núcleo e DNA pulsando
      add('.cell-nucleus-glow', [
        { transform: 'scale(0.97)', opacity: 0.85 },
        { transform: 'scale(1.04)', opacity: 1 },
        { transform: 'scale(0.97)', opacity: 0.85 },
      ], 2200);
      add('.cell-dna-wave', [
        { strokeDashoffset: 0 },
        { strokeDashoffset: -32 },
      ], 2400);
    } else if (index === 3) {
      // Mitocôndria e geração de ATP
      add('.cell-mitochondria-active', [
        { opacity: 0.8, filter: 'drop-shadow(0 0 2px #f59e0b)' },
        { opacity: 1, filter: 'drop-shadow(0 0 8px #f59e0b)' },
        { opacity: 0.8, filter: 'drop-shadow(0 0 2px #f59e0b)' },
      ], 1800);
      add('.cell-atp-spark', [
        { transform: 'scale(0.6) translate(0, 0)', opacity: 0 },
        { transform: 'scale(1.2) translate(8px, -12px)', opacity: 1 },
        { transform: 'scale(1.4) translate(16px, -24px)', opacity: 0 },
      ], 1600);
    } else if (index === 4) {
      // Golgi e vesículas de secreção
      add('.cell-vesicle-move', [
        { transform: 'translate(0, 0)', opacity: 0.3 },
        { transform: 'translate(24px, 14px)', opacity: 1 },
        { transform: 'translate(48px, 28px)', opacity: 0 },
      ], 2600);
    }
    return animations;
  },
});
