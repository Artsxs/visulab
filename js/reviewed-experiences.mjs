// Referências efetivamente consultadas na revisão editorial de 16/09/2026.
// A IA não pode acrescentar URLs a este catálogo nem declarar revisão editorial.
export const SOURCES = {
  agua: { title: 'USGS — Hydrologic Cycle', url: 'https://www.usgs.gov/centers/new-york-water-science-center/science/hydrologic-cycle' },
  eclipse: { title: 'NASA — Why Do Eclipses Happen?', url: 'https://science.nasa.gov/eclipses/geometry/' },
  ia: { title: 'Google — Regressão logística e função sigmoide', url: 'https://developers.google.com/machine-learning/crash-course/logistic-regression/sigmoid-function' },
  sismos: { title: 'USGS — The Science of Earthquakes', url: 'https://www.usgs.gov/programs/earthquake-hazards/science-earthquakes' },
  plantas: { title: 'OpenStax / Rice University — Reações da fotossíntese', url: 'https://openstax.org/books/biology-2e/pages/8-2-the-light-dependent-reactions-of-photosynthesis' },
  plantas2: { title: 'OpenStax / Rice University — Visão geral da fotossíntese', url: 'https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis' },
  brasil: { title: 'IBGE — Brasil: 500 anos de povoamento', url: 'https://brasil500anos.ibge.gov.br/territorio-brasileiro-e-povoamento/portugueses/imigracao-restrita-1500-1700' },
  corte: { title: 'Arquivo Nacional — Acervo colonial e corte no Brasil', url: 'https://www.gov.br/arquivonacional/pt-br/acesso-a-informacao/institucional/acervo' },
  resistencia: { title: 'Fundação Cultural Palmares — Quilombo', url: 'https://www.gov.br/palmares/pt-br/departamentos/protecao-preservacao-e-articulacao/serra-da-barriga-1/quilombo' },
};
export const premiumReferences = { terremoto: ['sismos'], fotossintese: ['plantas', 'plantas2'], brasil_colonial: ['brasil', 'corte', 'resistencia'] };
const normalize = q => String(q).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export function clarificationFor(question) {
  const q = normalize(question);
  if (/\beclipse\b/.test(q) && !/\b(solar|lunar|sol|lua)\b/.test(q)) return 'Você quer entender um eclipse solar (a Lua entre o Sol e a Terra) ou lunar (a Terra entre o Sol e a Lua)?';
  if (/^(como funciona |explique |o que e )?(uma? )?(rede|ciclo|revolucao|sistema|modelo)( funciona)?$/.test(q)) return 'Qual assunto você quer estudar? Por exemplo: ciclo da água, rede de computadores ou Revolução Francesa.';
  return '';
}
export function findReviewedTopic(question) {
  const q = normalize(question);
  // Casos específicos e comparações vão à IA; o exemplo introdutório não deve
  // se passar por uma resposta sobre datas, aplicações ou outro fenômeno.
  if (/\b(compare|diferenca|quando|onde|proximo|data|202\d|lunar|anular|hibrido|chatgpt|generativa|transformer|neural|impacto|mudancas|climaticas)\b/.test(q)) return null;
  if (/\bciclo (da |de )?agua\b|\bciclo hidrologico\b|\bcomo (a )?agua (circula|volta|retorna)\b/.test(q)) return 'agua';
  if (/\beclipse solar\b|\blua (passa|fica) entre (o )?sol e (a )?terra\b/.test(q)) return 'eclipse';
  if (/^(como (funciona|funcionam|e o funcionamento) (uma? |a |as )?(ia|ias|inteligencia artificial)|funcionamento (de |da )?(uma? )?(ia|inteligencia artificial)|explique (como funciona )?(uma? |a )?(ia|inteligencia artificial))$/.test(q)
    || /\b(classificador de spam|ia classifica (um )?email)\b/.test(q)) return 'ia';
  return null;
}
const scene = (titulo, explicacao) => ({ titulo, explicacao, duracaoMs: 6000, elementos: [], acoes: [], cenario: 'neutro' });
const experience = (id, titulo, tipoVisual, resumo, simplificacoes, cenas) => ({
  versao: '1.0', disciplina: 'ciencias', origem: 'local', revisao: id, fontes: [id], titulo, tipoVisual, resumo, simplificacoes, cenas,
  conclusao: '', curiosidade: '',
});
export const reviewedExperiences = {
  agua: experience('agua', 'O caminho da água', 'ciclo', 'Um percurso possível entre superfície e atmosfera: evaporação, condensação, chuva e retorno.',
    'Sem escala de distância ou tempo. Pontos representam vapor invisível; nuvens contêm gotículas ou cristais. Mostramos um percurso, sem neve, transpiração ou todos os reservatórios.', [
      scene('A água evapora', 'A energia do Sol favorece a passagem da água líquida para vapor. O ar transporta esse vapor, invisível, para a atmosfera. Os pontos azuis são símbolos, não gotas líquidas subindo.'),
      scene('O vapor condensa', 'Quando o ar úmido esfria suficientemente, parte do vapor se condensa em gotículas. Elas contribuem para formar nuvens. A nuvem desenhada representa muitas gotículas.'),
      scene('A água precipita', 'Gotículas podem crescer e cair como chuva. A água volta ao solo e também cai diretamente sobre rios, lagos e oceanos.'),
      scene('A água retorna e se infiltra', 'Parte da água escoa pela superfície até rios e oceanos; outra parte infiltra no solo. A água subterrânea também pode alimentar rios. O ciclo não tem começo ou fim único.'),
    ]),
  eclipse: experience('eclipse', 'Como se forma um eclipse solar', 'movimento', 'A Lua passa entre o Sol e a Terra. Sua sombra explica por que o eclipse é visto apenas em algumas regiões.',
    'Vista lateral de um eclipse total idealizado. Tamanhos, distâncias e duração fora de escala; órbitas omitidas. A inclinação da órbita lunar impede eclipses em toda Lua nova.', [
      scene('A Lua entra no alinhamento', 'A Lua passa entre o Sol e a Terra. Quando o alinhamento permite que sua sombra alcance a superfície terrestre, pode ocorrer um eclipse solar.'),
      scene('A Lua bloqueia parte da luz', 'A região central escura é a umbra: ali o Sol fica totalmente encoberto neste exemplo. Ao redor está a penumbra, onde a Lua encobre apenas parte do Sol.'),
      scene('A posição do observador muda a visão', 'Quem está na umbra vê um eclipse total; na penumbra, parcial. Fora da sombra, não há eclipse. Este esquema mostra um instante; o movimento da Lua e da Terra desloca a sombra.'),
    ]),
  ia: experience('ia', 'Uma IA classificando uma mensagem', 'fluxo', 'Exemplo concreto de IA: um classificador simplificado decide se uma mensagem parece spam. Não representa toda forma de inteligência artificial.',
    'Exemplo inventado para ensino. Pesos, entradas e resultado são ilustrativos, não medidos. Modelo de regressão logística com duas características; não representa um chatbot ou uma rede neural completa.', [
      scene('A mensagem vira números', 'Entrada: “Prêmio grátis, clique aqui”. Neste exemplo, extraímos duas características: contém “prêmio” = 1 e contém “grátis” = 1. Sistemas reais podem usar muitas outras características.'),
      scene('O modelo combina as características', 'Usamos pesos didáticos 2 e 1, com termo constante −1. O cálculo é z = 2 × 1 + 1 × 1 − 1 = 2. Em um modelo real, parâmetros são ajustados durante o treinamento com exemplos.'),
      scene('O cálculo vira uma estimativa', 'A função sigmoide transforma z = 2 em aproximadamente 0,88. Com limiar de 0,5, o classificador marca “spam”. Esse número é uma estimativa do modelo, não certeza de que a mensagem é spam.'),
      scene('A decisão pode estar errada', 'Uma mensagem legítima também pode falar em prêmio grátis. Avaliamos o modelo com exemplos separados dos usados no treinamento. O resultado deste exemplo não comprova a qualidade de uma IA real.'),
    ]),
};
