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
