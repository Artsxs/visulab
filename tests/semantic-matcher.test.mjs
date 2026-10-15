import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractTopic,
  isSemanticallyCompatible,
  matchSemanticAnimation,
  ANIMATION_METADATA,
  normalizeText,
} from '../js/semantic-matcher.mjs';
import { findPremiumTopic } from '../js/local-fallback.mjs';

test('extração do tema principal: átomo vs célula', () => {
  const atomoQuestion = 'Como funciona um átomo?';
  const topicAtomo = extractTopic(atomoQuestion);

  assert.equal(topicAtomo.tema, 'atomo');
  assert.equal(topicAtomo.area, 'ciencias');
  assert.equal(topicAtomo.subtema, 'estrutura_atomica');
  assert.ok(topicAtomo.confianca >= 0.90, 'Confiança deve ser alta para átomo');
  assert.ok(topicAtomo.conceitos.includes('protons') || topicAtomo.conceitos.includes('atomo'));

  const celulaQuestion = 'Estrutura e funcionamento da célula';
  const topicCelula = extractTopic(celulaQuestion);
  assert.equal(topicCelula.tema, 'celula');
  assert.equal(topicCelula.area, 'ciencias');
  assert.equal(topicCelula.subtema, 'biologia_celular');
  assert.ok(topicCelula.confianca >= 0.90, 'Confiança deve ser alta para célula');
});

test('diferenciação semântica de núcleo: núcleo do átomo não é núcleo celular', () => {
  const atomoNucleo = 'O que há no núcleo do átomo?';
  const celulaNucleo = 'Como funciona o núcleo celular e o DNA?';

  const t1 = extractTopic(atomoNucleo);
  const t2 = extractTopic(celulaNucleo);

  assert.equal(t1.tema, 'atomo', 'Núcleo do átomo deve ser classificado como átomo');
  assert.equal(t2.tema, 'celula', 'Núcleo celular deve ser classificado como célula');

  assert.equal(isSemanticallyCompatible(atomoNucleo, 'celula'), false, 'Núcleo do átomo JAMAIS é compatível com célula');
  assert.equal(isSemanticallyCompatible(celulaNucleo, 'celula'), true, 'Núcleo celular é compatível com célula');
});

test('termos conflitantes / proibidos impedem seleção incorreta de célula para temas atômicos', () => {
  const perguntasAtomicas = [
    'Como funciona um átomo?',
    'estrutura do átomo',
    'O que são prótons, nêutrons e elétrons?',
    'Como os elétrons orbitam na eletrosfera?',
    'Física quântica e partículas subatômicas',
    'O modelo atômico de Bohr',
  ];

  for (const q of perguntasAtomicas) {
    assert.equal(isSemanticallyCompatible(q, 'celula'), false, `Pergunta "${q}" não pode ser compatível com célula`);
    assert.notEqual(findPremiumTopic(q), 'celula', `findPremiumTopic("${q}") nunca pode retornar 'celula'`);
    assert.notEqual(matchSemanticAnimation(q), 'celula', `matchSemanticAnimation("${q}") nunca pode retornar 'celula'`);
  }
});

test('compatibilidade semântica com animações existentes', () => {
  // Casos positivos
  assert.equal(isSemanticallyCompatible('Como funciona a fotossíntese?', 'fotossintese'), true);
  assert.equal(isSemanticallyCompatible('O que causa um terremoto?', 'terremoto'), true);
  assert.equal(isSemanticallyCompatible('Como as placas tectônicas se movem?', 'terremoto'), true);
  assert.equal(isSemanticallyCompatible('Como funciona o ciclo da água?', 'agua'), true);
  assert.equal(isSemanticallyCompatible('Como ocorre um eclipse solar?', 'eclipse'), true);
  assert.equal(isSemanticallyCompatible('Como funciona uma usina hidrelétrica?', 'hidreletrica'), true);
  assert.equal(isSemanticallyCompatible('Primeira Revolução Industrial e vapor', 'revolucao_industrial'), true);
  assert.equal(isSemanticallyCompatible('O processo de urbanização e cidades', 'urbanizacao'), true);

  // Casos negativos / cruzados
  assert.equal(isSemanticallyCompatible('Como funciona a fotossíntese?', 'celula'), false);
  assert.equal(isSemanticallyCompatible('O que causa um terremoto?', 'celula'), false);
  assert.equal(isSemanticallyCompatible('placas de trânsito', 'terremoto'), false);
  assert.equal(isSemanticallyCompatible('abalo emocional', 'terremoto'), false);
  assert.equal(isSemanticallyCompatible('plantas carnívoras', 'fotossintese'), false);
});

test('temas não pré-definidos não ativam animações aleatórias nem forçam templates existentes', () => {
  const temasSemAnimacaoPrevia = [
    'Como funciona a gravidade?',
    'O que é um buraco negro?',
    'Teoria da relatividade geral',
    'Como funciona um motor elétrico?',
    'A queda do Império Romano',
  ];

  for (const q of temasSemAnimacaoPrevia) {
    assert.equal(matchSemanticAnimation(q), null, `"${q}" não deve selecionar animação prévia aleatória`);
    assert.equal(isSemanticallyCompatible(q, 'celula'), false, `"${q}" não pode ser compatível com célula`);
    assert.equal(isSemanticallyCompatible(q, 'terremoto'), false, `"${q}" não pode ser compatível com terremoto`);
    assert.equal(isSemanticallyCompatible(q, 'fotossintese'), false, `"${q}" não pode ser compatível com fotossíntese`);
  }
});

test('metadados semânticos completos para todas as animações catalogadas', () => {
  for (const [id, meta] of Object.entries(ANIMATION_METADATA)) {
    assert.equal(meta.id, id);
    assert.ok(meta.titulo && meta.titulo.length > 3, `Título válido para ${id}`);
    assert.ok(['ciencias', 'geografia', 'historia'].includes(meta.area), `Área válida para ${id}`);
    assert.ok(meta.tema && meta.tema.length > 2, `Tema válido para ${id}`);
    assert.ok(Array.isArray(meta.subtemas) && meta.subtemas.length >= 2, `Subtemas em ${id}`);
    assert.ok(Array.isArray(meta.conceitosChave) && meta.conceitosChave.length >= 4, `Conceitos-chave em ${id}`);
    assert.ok(Array.isArray(meta.termosConflitantes), `Termos conflitantes array em ${id}`);
  }
});

test('distinção rigorosa e isolamento mútuo entre eclipse lunar e eclipse solar', () => {
  const perguntasEclipseLunar = [
    'Como acontece um eclipse lunar?',
    'O que é eclipse lunar?',
    'Como a Lua fica escura num eclipse?',
    'Quando a Terra faz sombra na Lua?',
    'Explique eclipse lunar',
    'Lua de sangue e sombra da Terra',
    'A Terra fica entre o Sol e a Lua',
  ];

  for (const q of perguntasEclipseLunar) {
    const topic = extractTopic(q);
    assert.equal(topic.tema, 'eclipse_lunar', `Tema extraído para "${q}" deve ser eclipse_lunar`);
    assert.equal(isSemanticallyCompatible(q, 'eclipse'), false, `Pergunta lunar "${q}" NUNCA pode ser compatível com eclipse solar ('eclipse')`);
    assert.equal(matchSemanticAnimation(q) === 'eclipse', false, `Pergunta lunar "${q}" NUNCA pode acionar animação de eclipse solar`);
  }

  const perguntasEclipseSolar = [
    'Como acontece um eclipse solar?',
    'O que é eclipse solar?',
    'A Lua passa entre o Sol e a Terra',
    'Sombra da Lua projetada na Terra',
    'Explique eclipse solar',
  ];

  for (const q of perguntasEclipseSolar) {
    const topic = extractTopic(q);
    assert.equal(topic.tema, 'eclipse', `Tema extraído para "${q}" deve ser eclipse (solar)`);
    assert.equal(isSemanticallyCompatible(q, 'eclipse_lunar'), false, `Pergunta solar "${q}" NUNCA pode ser compatível com eclipse lunar`);
    assert.equal(isSemanticallyCompatible(q, 'eclipse'), true, `Pergunta solar "${q}" deve ser compatível com eclipse solar`);
  }
});

test('desambiguação semântica crítica: ebulição, trânsito e revoluções', () => {
  // Água fervendo vs Ciclo da água
  const ebulicaoTopic = extractTopic('O que acontece quando a água ferve?');
  assert.notEqual(ebulicaoTopic.tema, 'agua', 'Água fervendo não pode ser classificada como ciclo da água');
  assert.equal(isSemanticallyCompatible('O que acontece quando a água ferve?', 'agua'), false);

  // Placas de trânsito vs Placas tectônicas
  const transitoTopic = extractTopic('O que são placas de trânsito?');
  assert.notEqual(transitoTopic.tema, 'terremoto', 'Placas de trânsito não podem ser classificadas como placas tectônicas');
  assert.equal(isSemanticallyCompatible('O que são placas de trânsito?', 'terremoto'), false);

  // Revolução Francesa vs Revolução Industrial
  const revolucaoTopic = extractTopic('Explique a Revolução Francesa');
  assert.notEqual(revolucaoTopic.tema, 'revolucao_industrial', 'Revolução Francesa não pode ser classificada como Revolução Industrial');
  assert.equal(isSemanticallyCompatible('Explique a Revolução Francesa', 'revolucao_industrial'), false);
});

test('as 5 perguntas obrigatórias de eclipses e comparação semântica sem escolha arbitrária', () => {
  const p1 = 'Como acontece um eclipse lunar?';
  const p2 = 'O que é um eclipse lunar?';
  const p3 = 'Por que a Lua fica avermelhada durante um eclipse lunar?';
  const p4 = 'Como acontece um eclipse solar?';
  const p5 = 'Qual a diferença entre eclipse solar e lunar?';

  // 1. Como acontece um eclipse lunar?
  const t1 = extractTopic(p1);
  assert.equal(t1.tema, 'eclipse_lunar', 'Pergunta 1 deve ser classificada como eclipse_lunar');
  assert.equal(isSemanticallyCompatible(p1, 'eclipse_lunar'), true, 'Pergunta 1 deve ser compatível com eclipse_lunar');
  assert.equal(isSemanticallyCompatible(p1, 'eclipse'), false, 'Pergunta 1 NUNCA pode ser compatível com eclipse solar');

  // 2. O que é um eclipse lunar?
  const t2 = extractTopic(p2);
  assert.equal(t2.tema, 'eclipse_lunar', 'Pergunta 2 deve ser classificada como eclipse_lunar');
  assert.equal(isSemanticallyCompatible(p2, 'eclipse_lunar'), true, 'Pergunta 2 deve ser compatível com eclipse_lunar');
  assert.equal(isSemanticallyCompatible(p2, 'eclipse'), false, 'Pergunta 2 NUNCA pode ser compatível com eclipse solar');

  // 3. Por que a Lua fica avermelhada durante um eclipse lunar?
  const t3 = extractTopic(p3);
  assert.equal(t3.tema, 'eclipse_lunar', 'Pergunta 3 deve ser classificada como eclipse_lunar');
  assert.equal(isSemanticallyCompatible(p3, 'eclipse_lunar'), true, 'Pergunta 3 deve ser compatível com eclipse_lunar');
  assert.equal(isSemanticallyCompatible(p3, 'eclipse'), false, 'Pergunta 3 NUNCA pode ser compatível com eclipse solar');

  // 4. Como acontece um eclipse solar?
  const t4 = extractTopic(p4);
  assert.equal(t4.tema, 'eclipse', 'Pergunta 4 deve ser classificada como eclipse (solar)');
  assert.equal(isSemanticallyCompatible(p4, 'eclipse'), true, 'Pergunta 4 deve ser compatível com eclipse solar');
  assert.equal(isSemanticallyCompatible(p4, 'eclipse_lunar'), false, 'Pergunta 4 NUNCA pode ser compatível com eclipse lunar');

  // 5. Qual a diferença entre eclipse solar e lunar? (PERGUNTA COMPARATIVA)
  const t5 = extractTopic(p5);
  assert.equal(t5.tema, 'comparacao_eclipses', 'Pergunta 5 deve ser classificada como comparacao_eclipses');
  // REGRA PEDAGÓGICA CRÍTICA: Não escolher arbitrariamente uma das animações!
  assert.equal(isSemanticallyCompatible(p5, 'eclipse'), false, 'Pergunta comparativa JAMAIS pode escolher arbitrariamente animação solar isolada');
  assert.equal(isSemanticallyCompatible(p5, 'eclipse_lunar'), false, 'Pergunta comparativa JAMAIS pode escolher arbitrariamente animação lunar isolada');
  assert.equal(isSemanticallyCompatible('Qual a diferença entre eclipse lunar e solar?', 'eclipse'), false);
  assert.equal(isSemanticallyCompatible('Qual a diferença entre eclipse lunar e solar?', 'eclipse_lunar'), false);
});

test('assuntos abstratos e desconhecidos ativam modo geométrico ou esclarecimento, nunca animações aleatórias', () => {
  // Assuntos abstratos
  const qJustica = 'O que é justiça na filosofia?';
  const tJustica = extractTopic(qJustica);
  assert.ok(tJustica.confianca < 0.75, 'Conceito abstrato deve ter confiança restrita (< 0.75)');
  assert.equal(isSemanticallyCompatible(qJustica, 'celula'), false);
  assert.equal(isSemanticallyCompatible(qJustica, 'terremoto'), false);
  assert.equal(isSemanticallyCompatible(qJustica, 'agua'), false);
  assert.equal(isSemanticallyCompatible(qJustica, 'eclipse'), false);

  const qEmpatia = 'Como funciona a empatia humana?';
  const tEmpatia = extractTopic(qEmpatia);
  assert.ok(tEmpatia.confianca < 0.75);
  assert.equal(isSemanticallyCompatible(qEmpatia, 'celula'), false);
  assert.equal(isSemanticallyCompatible(qEmpatia, 'fotossintese'), false);

  // Assunto completamente desconhecido / ruído
  const qDesconhecido = 'xyzqwk98234 lkjsdf';
  const tDesconhecido = extractTopic(qDesconhecido);
  assert.equal(tDesconhecido.tema, 'generico');
  assert.ok(tDesconhecido.confianca < 0.50);
  assert.equal(isSemanticallyCompatible(qDesconhecido, 'celula'), false);
  assert.equal(isSemanticallyCompatible(qDesconhecido, 'terremoto'), false);
});

