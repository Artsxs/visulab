/** Normaliza uma pergunta para comparação de termos em português. */
export function normalizar(texto) {
  if (typeof texto !== 'string') return '';
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/** Retorna true apenas se a frase/termo inteiro estiver presente. */
export function contemExpressao(textoNormalizado, expressao) {
  const termo = normalizar(expressao);
  if (!textoNormalizado || !termo) return false;
  return ` ${textoNormalizado} `.includes(` ${termo} `);
}
