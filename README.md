# VisuLab

**Veja o conhecimento acontecer.**

O VisuLab é um projeto educacional que transforma perguntas sobre Ciências,
História e Geografia em explicações visuais organizadas por etapas. A primeira
versão gera animações para qualquer tema escolar com o Gemini e, opcionalmente,
com a NVIDIA NIM, acessados somente por uma Netlify Function. Animações locais
mantêm o laboratório funcionando quando os provedores estão indisponíveis.

O frontend usa HTML semântico, CSS responsivo, JavaScript e SVG local. Não há
framework, gerenciador de pacotes ou etapa de build.

## O que esta versão oferece

- formulário de pergunta com limite e contador de 250 caracteres;
- sugestões prontas para terremotos, fotossíntese e Brasil Colonial;
- carregamento e mensagens amigáveis em uma região acessível;
- título, resumo, etapas, curiosidade e alternativa textual da animação;
- controles separados para reproduzir, pausar, voltar, avançar e reiniciar;
- velocidades de 0,5×, 1×, 1,5× e 2×;
- seleção direta dos quatro períodos do Brasil Colonial;
- filtros para Ciências, História e Geografia;
- tema claro/escuro, foco visível e navegação por teclado;
- suporte a telas pequenas e a `prefers-reduced-motion`;
- modo local de segurança para continuar útil sem a API.

## Como o laboratório funciona

1. O estudante escreve uma pergunta ou seleciona uma sugestão.
2. O navegador envia somente `{ "pergunta": "..." }` por `POST` para
   `/.netlify/functions/visualizar`.
3. A função tenta o modelo `gemini-3.5-flash-lite` com a chave mantida apenas
   no servidor. O prompt inclui o esquema e pede um único objeto JSON sem
   Markdown; a chamada Gemini não usa campos de formato em `generationConfig`.
4. Se o Gemini falhar e `NVIDIA_API_KEY` estiver configurada, a função tenta a
   NVIDIA NIM com o modelo configurado em `NVIDIA_MODEL` (ou
   `meta/llama-3.1-8b-instruct` como fallback) e saída JSON.
5. A resposta passa por validação no servidor e novamente no navegador.
6. O motor constrói SVG responsivo com formas e ícones locais, anima as cenas
   pela Web Animations API e insere todos os textos
   com `textContent`; a IA nunca fornece HTML, SVG ou JavaScript.
7. Se os provedores falharem, o navegador cria um roteiro visual local a partir
   do tema digitado, com formas, setas, movimento e controles.

O contrato de roteiro versão `1.0` contém disciplina, título, resumo,
`tipoDeCena`, `cenas`, conclusão e curiosidade. No frontend, `tipoDeCena` é
normalizado como `tipoVisual`. Os tipos são `fluxo`, `ciclo`,
`linha_do_tempo`, `mapa`, `comparacao`, `sistema_biologico`, `microscopico`,
`camadas`, `movimento` e `especial` (com `experienciaEspecial` selecionando uma
das três experiências locais).

Cada cena contém título, explicação equivalente ao visual, `duracaoMs`,
`elementos` e `acoes`. Consulte `js/visual-schema.mjs` para o JSON Schema completo
 e `tests/fixtures.mjs` para exemplos executáveis, explicitamente simulados.

O validador compartilhado permite até seis cenas de 1 a 8 segundos, dez elementos
 e doze ações por cena. Normaliza coordenadas para 0–100, limita textos, cores,
IDs e destinos, descarta tipos proibidos e copia somente propriedades permitidas.
Quando não há elementos válidos, o renderizador cria um diagrama local a partir
 das etapas textuais. HTML nunca é inserido a partir da resposta.

Os módulos são:

- `js/visual-validator.mjs`: contrato e normalização no servidor e navegador;
- `js/visual-schema.mjs`: JSON Schema enviado ao Gemini;
- `js/visual-elements.mjs`: nove formas permitidas e quinze ícones locais;
- `js/scene-renderer.mjs`: composição SVG e quadros das nove ações;
- `js/animation-engine.mjs`: relógio, transições, pausa, navegação e velocidade.

O envio acontece apenas por clique ou Enter. Uma nova pergunta cancela a anterior
com `AbortController`, limpa o palco e invalida respostas atrasadas. A mesma
pergunta não pode gerar envios simultâneos. Em movimento reduzido, as cenas são
estáticas e o avanço é manual.

## Experiências locais

### Terremotos e placas tectônicas

Mostra o deslocamento das placas e suas setas de direção, o acúmulo de pressão,
a ruptura, a liberação de energia, as ondas sísmicas e a chegada do tremor à
superfície.

### Fotossíntese

Mostra a luz chegando à folha, a água subindo pelas raízes, a entrada de
dióxido de carbono, a produção de glicose nos cloroplastos e a liberação de
oxigênio.

### Brasil Colonial

Apresenta uma linha do tempo com períodos selecionáveis entre 1500 e 1822.
Cada período relaciona atividades econômicas, formas de trabalho, resistências,
ocupação do território e mudanças políticas.

## Modo local de segurança

As três experiências acima servem como fallback e não dependem da chave. Outros
temas recebem um diagrama animado local baseado no texto digitado. O
reconhecimento das experiências especiais inclui, entre outras, estas palavras:

- terremotos: `terremoto`, `placas tectônicas`, `abalo` e `ondas sísmicas`;
- fotossíntese: `fotossíntese` e `clorofila`;
- Brasil Colonial: `colonial`, `colônia`, `colonização` e `capitanias`.

Se a chave não estiver configurada, for inválida, a cota terminar ou o serviço
ficar indisponível, o site informa a indisponibilidade e exibe uma animação
local para qualquer assunto, sem expor detalhes internos.

## Estrutura do projeto

```text
.
├── .env.example
├── .gitignore
├── AGENTS.md
├── README.md
├── assets/
│   ├── og.png
│   └── visulab-logo.svg
├── favicon.svg
├── index.html
├── netlify/
│   └── functions/
│       └── visualizar.mjs
├── netlify.toml
├── script.js
├── styles.css
└── tests/
    └── visualizar.test.mjs
```

## Executar somente a parte estática

Na pasta que contém `index.html`, execute:

```bash
python3 -m http.server 8080
```

Abra `http://localhost:8080`. Nesse modo, as três experiências locais funcionam
normalmente. Perguntas fora desses temas exibem o modo de segurança porque a
função não está em execução.

## Testar com Netlify Dev

Com o Netlify CLI instalado, execute na raiz do projeto:

```bash
netlify dev
```

Abra o endereço informado pelo CLI, normalmente `http://localhost:8888`. A
função ficará disponível em:

```text
http://localhost:8888/.netlify/functions/visualizar
```

Exemplo sem incluir chave no comando:

```bash
curl -i http://localhost:8888/.netlify/functions/visualizar \
  -H 'Content-Type: application/json' \
  -d '{"pergunta":"Como funciona o ciclo da água?"}'
```

Quando o projeto estiver vinculado ao site do Netlify, o Netlify Dev pode usar
as variáveis cadastradas no ambiente remoto. Nunca imprima a variável em logs.

## Cadastrar as chaves no Netlify

O Gemini usa `VISULAB_API_KEY`. A alternativa NVIDIA NIM usa
`NVIDIA_API_KEY`. A função tenta Gemini, NVIDIA e, por último, o fallback local.

1. Abra o projeto no painel do Netlify.
2. Entre em **Site configuration → Environment variables**.
3. Crie `VISULAB_API_KEY` e informe o valor como secreto.
4. Opcionalmente, crie `NVIDIA_API_KEY` para habilitar o segundo provedor.
5. Opcionalmente, defina `NVIDIA_MODEL` com o identificador do modelo desejado.
   Sem essa variável, a função usa `meta/llama-3.1-8b-instruct`.
6. Inclua o escopo de Functions quando essa opção estiver disponível.
7. Faça um novo deploy para a função receber as variáveis.

O arquivo `.env.example` contém os nomes das duas chaves e de `NVIDIA_MODEL`, com valores
vazios. Não coloque uma chave real nele, no README, no HTML, em `script.js`, em commits ou em comandos
que possam ficar no histórico do terminal. A chave nunca deve ir para o
frontend.

## Executar as verificações automatizadas

Não é necessário instalar dependências:

```bash
node --check script.js
node --check netlify/functions/visualizar.mjs
node tests/visualizar.test.mjs
node tests/visual-validator.test.mjs
node tests/animation-engine.test.mjs
```

Os testes simulam Gemini e NVIDIA; nenhuma chamada externa e nenhuma chave real são
necessárias. Eles cobrem método e tipo de conteúdo, JSON inválido, limites do
corpo e da pergunta, contrato estruturado, validação de campos, headers,
indisponibilidade, cota, timeout e sigilo das mensagens.

## Publicar no Netlify

1. Envie o projeto para um repositório Git sem arquivos `.env`.
2. No Netlify, escolha **Add new site → Import an existing project** e conecte o
   repositório.
3. Se `visulab-projeto` for uma subpasta do repositório, selecione-a como base;
   caso ela seja a raiz, não defina uma base adicional.
4. O `netlify.toml` já publica `.` e usa `netlify/functions` para as funções.
5. Cadastre `VISULAB_API_KEY` como descrito acima.
6. Inicie o deploy e, depois, teste as três experiências locais e uma pergunta
   que dependa da IA.

Não há comando de build. Alterações futuras em variáveis de ambiente exigem um
novo deploy.

## Segurança e limites

A função aceita somente `POST` com `Content-Type: application/json`, limita o
corpo a 2 KiB e a pergunta a 250 caracteres, usa timeout, envia autenticação no
header `x-goog-api-key`, não habilita CORS aberto e retorna
`Cache-Control: no-store`. Ela não registra a pergunta completa e nunca devolve
ao navegador respostas brutas do provedor.

Respostas produzidas por IA podem conter simplificações ou imprecisões. O site
exibe o aviso para consultar também o material didático e não substitui
professores, livros ou fontes confiáveis.

## Verificações no navegador

Execute `node tests/serve.mjs --fixtures` e abra
`http://localhost:8765/tests/browser.html`. Essa página verifica o motor real,
controles, movimento reduzido, concorrência e erros com respostas simuladas.
Abra também `http://localhost:8765` para revisar os cinco exemplos solicitados,
temas claro/escuro, teclado e larguras de celular e computador.

Sem `--fixtures`, o servidor encaminha as perguntas à função real. A configuração
real do Gemini precisa ser validada separadamente com a variável de ambiente;
os testes simulados não comprovam disponibilidade ou qualidade do provedor.
