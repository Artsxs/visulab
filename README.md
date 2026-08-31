# VisuLab

**Uma viagem interativa pelo conhecimento.**

O VisuLab é uma plataforma educativa experimental que ajuda estudantes a
compreender conteúdos difíceis por meio de explicações visuais, animações e
pequenas experiências interativas. Esta primeira versão apresenta a proposta do
projeto e três rotas de descoberta em Ciências, História e Geografia.

## O que existe nesta versão

- página inicial responsiva para celular e computador;
- identidade visual, logotipo e apresentação do VisuLab;
- barra de pesquisa com resultados instantâneos;
- filtros para Ciências, História e Geografia;
- cartões de Terremotos, Brasil Colonial e Fotossíntese;
- prévia interativa em três etapas para cada conteúdo;
- seção sobre o objetivo e a abordagem pedagógica do projeto;
- temas claro e escuro com preferência salva no navegador;
- animações sutis com suporte a `prefers-reduced-motion`;
- navegação por teclado, foco visível e avisos acessíveis da busca;
- rodapé do Grande Desafio 2026.

Não há cadastro, banco de dados, APIs, analytics ou requisições externas nesta
fase. Todo o conteúdo funciona localmente e offline.

## Tecnologias

- HTML5 semântico;
- CSS3 responsivo, com propriedades personalizadas e animações;
- JavaScript puro, sem bibliotecas ou frameworks;
- SVG local para a identidade visual.

O projeto não possui etapa de build nem dependências para instalar.

## Como executar

Você pode abrir `index.html` diretamente no navegador. Para reproduzir um
ambiente web local e evitar diferenças de segurança do protocolo `file://`,
execute na raiz do projeto:

```bash
python3 -m http.server 8080
```

Depois, acesse `http://localhost:8080`.

## Estrutura

```text
.
├── AGENTS.md
├── README.md
├── assets/
│   └── visulab-logo.svg
├── favicon.svg
├── index.html
├── script.js
└── styles.css
```

### `index.html`

Reúne a estrutura da página, os textos, os cartões, a seção institucional, o
rodapé e o diálogo acessível das experiências.

### `styles.css`

Define a identidade visual, os temas claro e escuro, os desenhos educativos
feitos com CSS, as animações e todos os ajustes responsivos.

### `script.js`

Controla:

- alternância e persistência do tema;
- entrada progressiva dos blocos na tela;
- pesquisa sem diferenciação de maiúsculas ou acentos;
- filtros por área do conhecimento;
- estado vazio da pesquisa;
- navegação pelas etapas das três prévias interativas.

### `assets/`

Contém o símbolo visual do VisuLab. O favicon correspondente fica na raiz para
ser encontrado diretamente pelo navegador.

## Como testar

1. Confirme que todos os blocos aparecem e que não há erros no console.
2. Pesquise por “terremotos”, “colonial” e “fotossíntese”.
3. Combine a busca com cada filtro de área e depois limpe a pesquisa.
4. Abra os três cartões, avance e volte pelas etapas e conclua a experiência.
5. Alterne os temas e recarregue a página para verificar a persistência.
6. Navegue usando somente `Tab`, `Shift + Tab`, `Enter` e `Esc`.
7. Teste em uma largura de celular e em uma largura de computador.
8. Ative a preferência de movimento reduzido do sistema e confirme que o
   conteúdo permanece estável.
9. Desative o JavaScript e verifique se o conteúdo principal continua legível.

## Grande Desafio 2026

O VisuLab foi concebido para o **Grande Desafio 2026**, com a missão de tornar o
conhecimento mais próximo, visual e significativo para cada estudante.
