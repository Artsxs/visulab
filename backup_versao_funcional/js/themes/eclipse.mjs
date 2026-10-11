// Configuração e lógica visual do Eclipse Solar (Geometria Orbital, Umbra e Penumbra)
import { ThemeTemplate } from '../visual-components.mjs';

export const eclipseTheme = new ThemeTemplate({
  id: 'eclipse',
  title: 'Como Ocorre um Eclipse Solar',
  discipline: 'ciencias',
  summary: 'A Lua posiciona-se em alinhamento exato entre o Sol e a Terra, projetando cones de umbra (escuridão total) e penumbra (escuridão parcial) sobre a superfície.',
  simplifications: 'Vista astronômica coplanar simplificada. Diâmetros dos astros e distâncias orbitais ajustados fora de escala real para fins didáticos.',
  conclusion: 'O eclipse solar é um fenômeno de alinhamento óptico celeste que demonstra as leis da propagação retilínea da luz e a geometria das sombras no espaço.',
  curiosity: 'O eclipse solar total só é possível porque, por pura coincidência geométrica, o Sol é cerca de 400 vezes maior que a Lua, mas está aproximadamente 400 vezes mais distante da Terra.',
  steps: [
    {
      title: 'Alinhamento Orbital dos Astros',
      description: 'Em sua trajetória ao redor da Terra durante a fase de Lua Nova, a Lua cruza o plano da órbita terrestre (linha dos nodos), posicionando-se diretamente entre o Sol e o nosso planeta.',
    },
    {
      title: 'Projeção dos Cones de Sombra',
      description: 'O corpo lunar opaco bloqueia a radiação luminosa proveniente do Sol, gerando dois cones de sombra bem definidos no espaço: o cone interno escuro (umbra) e o cone externo divergente (penumbra).',
    },
    {
      title: 'Diferença entre Umbra e Penumbra',
      description: 'Na umbra central afunilada, o disco solar é 100% ocultado pelo relevo lunar. Na penumbra circundante mais ampla, a Lua encobre apenas uma fração do disco solar.',
    },
    {
      title: 'Observação na Terra (Total vs Parcial)',
      description: 'Quem estiver posicionado na estreita faixa onde a ponta da umbra atinge o solo terrestre presencia o impressionante eclipse total com a coroa solar visível; quem estiver na penumbra vê um eclipse parcial.',
    },
  ],
  legend: [
    ['#fbc02d', 'radiação solar'],
    ['#101826', 'umbra (eclipse total)'],
    ['#455a64', 'penumbra (parcial)'],
    ['#29b6f6', 'superfície da Terra'],
  ],
  svgTemplateId: 'visual-template-eclipse',
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
      add('.eclipse-moon-sphere', [
        { transform: 'translateY(-60px)' },
        { transform: 'translateY(0px)' },
      ], 2600);
      add('.eclipse-sun-glow', [
        { transform: 'scale(0.96)', opacity: 0.9 },
        { transform: 'scale(1.04)', opacity: 1 },
        { transform: 'scale(0.96)', opacity: 0.9 },
      ], 2200);
    } else if (index === 1) {
      add('.eclipse-penumbra-cone, .eclipse-umbra-cone', [
        { opacity: 0.2 },
        { opacity: 1 },
      ], 2000);
      add('.eclipse-light-rays line', [
        { opacity: 0.3 },
        { opacity: 1 },
        { opacity: 0.3 },
      ], 2200);
    } else if (index === 2) {
      add('.eclipse-umbra-spot', [
        { transform: 'scale(0.7)', opacity: 0.7 },
        { transform: 'scale(1.3)', opacity: 1 },
        { transform: 'scale(0.7)', opacity: 0.7 },
      ], 1800);
      add('.eclipse-penumbra-spot', [
        { opacity: 0.3 },
        { opacity: 0.7 },
        { opacity: 0.3 },
      ], 2200);
    } else if (index === 3) {
      add('.eclipse-earth-group', [
        { transform: 'translate(685px, 210px) rotate(0deg)' },
        { transform: 'translate(685px, 210px) rotate(6deg)' },
        { transform: 'translate(685px, 210px) rotate(0deg)' },
      ], 4000);
    }
    return animations;
  },
});
