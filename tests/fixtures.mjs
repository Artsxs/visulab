// Roteiros determinísticos para testes; não são respostas do Gemini.
export function fixtureFor(question) {
  const q = question.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let type = 'fluxo', names = ['Coração', 'Pulmões', 'Corpo'], icons = ['coracao', 'oxigenio', 'coracao'];
  let explanations = ['O coração impulsiona o sangue para os pulmões.', 'Nos pulmões, o sangue recebe oxigênio e libera gás carbônico.', 'O coração envia sangue ao corpo; depois ele retorna ao coração.'];
  if (q.includes('agua')) { type = 'ciclo'; names = ['Evaporação', 'Condensação', 'Precipitação']; icons = ['sol', 'nuvem', 'agua']; explanations = ['O calor favorece a evaporação da água.', 'O vapor esfria e se condensa em pequenas gotas.', 'Gotas crescem e a água retorna à superfície.']; }
  if (q.includes('mitose')) { type = 'comparacao'; names = ['Mitose', 'Meiose']; icons = ['celula', 'celula']; explanations = ['Uma divisão celular geralmente produz duas células com o mesmo número de cromossomos.', 'Duas divisões reduzem à metade o número de cromossomos das células resultantes.']; }
  if (q.includes('atmosfera')) { type = 'camadas'; names = ['Troposfera', 'Estratosfera', 'Mesosfera', 'Termosfera', 'Exosfera']; icons = names.map(() => 'planeta'); explanations = ['A camada mais baixa concentra os fenômenos do tempo.', 'A estratosfera contém a maior parte do ozônio atmosférico.', 'Na mesosfera, muitos meteoroides se desintegram.', 'Na termosfera, gases absorvem radiação solar de alta energia.', 'A exosfera é a região externa, de transição para o espaço.']; }
  if (q.includes('orbita')) { type = 'movimento'; names = ['Gravidade', 'Órbita']; icons = ['planeta', 'planeta']; explanations = ['A gravidade atrai o planeta para a estrela.', 'A velocidade tangencial e a gravidade determinam a trajetória orbital.']; }
  if (q.includes('revolucao')) { type = 'linha_do_tempo'; names = ['1789', '1792', '1799']; icons = ['livro', 'cidade', 'relogio']; explanations = ['A crise política leva à formação da Assembleia Nacional.', 'A monarquia é abolida e a república é proclamada.', 'O golpe de Napoleão encerra o Diretório.']; }
  return { versao: '1.0', disciplina: 'ciencias', titulo: question, resumo: 'Roteiro de teste: acompanhe cada etapa.', tipoVisual: type,
    cenas: names.map((titulo, i) => ({
      titulo, explicacao: explanations[i], duracaoMs: 5000,
      cenario: type === 'ciclo' ? 'natureza' : type === 'movimento' ? 'espaco' : type === 'linha_do_tempo' ? 'historico' : 'laboratorio',
      elementos: [
        ...names.slice(0, 3).map((name, n) => ({ id: n === i % 3 ? 'principal' : `apoio-${n}`, tipo: 'icone', icone: icons[n], rotulo: name, x: 20 + n * 30, y: n % 2 ? 53 : 28, largura: 18, altura: 28, cor: ({ sol: 'amarelo', agua: 'azul', nuvem: 'claro', coracao: 'vermelho', celula: 'verde', planeta: 'azul' })[icons[n]] || 'roxo' })),
        { id: 'relacao', tipo: 'seta', rotulo: '', x: 36, y: 44, largura: 11, altura: 4, cor: 'roxo' },
        { id: 'relacao-2', tipo: 'seta', rotulo: '', x: 66, y: 44, largura: 11, altura: 4, cor: 'roxo' },
        { id: 'particula', tipo: 'particula', rotulo: '', x: 20, y: 72, largura: 3, altura: 5, cor: 'amarelo' },
      ],
      acoes: [
        { alvo: 'particula', tipo: 'mover', paraX: 80, paraY: 72, duracaoMs: 4000, atrasoMs: 300 },
        { alvo: 'principal', tipo: 'crescer', duracaoMs: 1500, atrasoMs: 0 },
        { alvo: 'relacao', tipo: 'fluir', duracaoMs: 2000, atrasoMs: 1000 },
      ],
    })), conclusao: 'Releia as etapas para relacionar as partes do processo.', curiosidade: '' };
}
