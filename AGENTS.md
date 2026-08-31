# Trabalhando no VisuLab

O VisuLab é uma página educacional estática, construída com HTML, CSS e
JavaScript puro. Não há etapa de build, gerenciador de pacotes, framework,
banco de dados ou integração com APIs.

## Estrutura do projeto

- `index.html`: conteúdo, semântica e estrutura completa da página.
- `styles.css`: identidade visual, responsividade, temas e animações.
- `script.js`: tema, busca, filtros, revelação dos blocos e prévias interativas.
- `assets/visulab-logo.svg`: símbolo visual usado no cabeçalho e no rodapé.
- `favicon.svg`: ícone da aba do navegador.
- `README.md`: documentação para pessoas que usam ou mantêm o projeto.

## Regras técnicas

- Mantenha `index.html`, `styles.css` e `script.js` na raiz.
- Não adicione `package.json`, lockfile, bundler, framework ou etapa de build.
- Não crie diretórios `dist`, `build` ou `node_modules`.
- Não faça requisições externas em tempo de execução. Fontes, imagens e scripts
  devem funcionar offline.
- Mantenha o projeto confortavelmente abaixo de 1 MB.
- Prefira recursos nativos do navegador e melhorias progressivas.

## Conteúdo e experiência

- Escreva toda a interface em português do Brasil.
- Preserve a proposta: tornar conteúdos difíceis compreensíveis por meio de
  recursos visuais, pequenas animações e interações.
- Use exemplos concretos e linguagem acolhedora, sem infantilizar o estudante.
- Novos temas devem pertencer a uma área, participar da busca e ter uma prévia
  interativa equivalente às existentes.
- Evite interações decorativas que atrapalhem a leitura ou o foco no conteúdo.

## Acessibilidade

- Use HTML semântico antes de adicionar ARIA.
- Mantenha um único `h1` e uma hierarquia coerente de títulos.
- Todo controle deve funcionar com teclado e exibir foco visível.
- Atualizações de busca devem ser anunciadas por região `aria-live`.
- Elementos puramente decorativos devem permanecer fora da árvore de
  acessibilidade.
- Qualquer animação nova deve respeitar `prefers-reduced-motion`.
- O conteúdo principal deve continuar legível quando o JavaScript estiver
  desativado.

## Verificação

Antes de entregar uma alteração:

1. Abra a página por um servidor local e confirme que não há erros no console.
2. Teste busca, filtros, tema e as três prévias interativas.
3. Navegue somente com o teclado e confira a ordem e o destaque do foco.
4. Verifique larguras de celular e computador sem rolagem horizontal.
5. Confira os temas claro e escuro e o modo de movimento reduzido.
6. Valide que os arquivos HTML, CSS, JavaScript e SVG continuam legíveis e
   livres de referências quebradas.
