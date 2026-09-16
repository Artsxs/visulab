import { validateVisualExperience } from './js/visual-validator.mjs';
import { AnimationEngine } from './js/animation-engine.mjs';

document.documentElement.classList.add('has-js');

const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('.theme-toggle__icon');
const themeColor = document.querySelector('meta[name="theme-color"]');
const themePreference = window.matchMedia('(prefers-color-scheme: dark)');
const reducedMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const THEME_STORAGE_KEY = 'visulab-theme';

const resolvedTheme = () =>
  root.dataset.theme || (themePreference.matches ? 'dark' : 'light');

const updateThemeControl = () => {
  const isDark = resolvedTheme() === 'dark';
  themeToggle.setAttribute(
    'aria-label',
    isDark ? 'Ativar tema claro' : 'Ativar tema escuro',
  );
  themeIcon.textContent = isDark ? '☀' : '☾';
  themeColor.setAttribute('content', isDark ? '#101629' : '#1e4ed8');
};

try {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    root.dataset.theme = savedTheme;
  }
} catch {
  // O site continua seguindo o tema do sistema quando o armazenamento é bloqueado.
}

themeToggle.addEventListener('click', () => {
  root.dataset.theme = resolvedTheme() === 'dark' ? 'light' : 'dark';
  updateThemeControl();

  try {
    localStorage.setItem(THEME_STORAGE_KEY, root.dataset.theme);
  } catch {
    // A preferência fica ativa nesta visita mesmo sem acesso ao armazenamento.
  }
});

themePreference.addEventListener('change', () => {
  if (!root.dataset.theme) {
    updateThemeControl();
  }
});

updateThemeControl();

// Revela os blocos conforme entram na tela. Sem JavaScript, todos permanecem visíveis.
const revealElements = document.querySelectorAll('[data-reveal]');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

// A pergunta do destaque leva ao mesmo laboratório usado no restante da página.
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const topicCards = [...document.querySelectorAll('[data-topic]')];
const resultsStatus = document.getElementById('results-status');
const emptyState = document.getElementById('empty-state');
const clearSearchButton = document.getElementById('clear-search');
let activeCategory = 'todos';

const normalizeText = (text) =>
  text
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const updateActiveFilter = (category) => {
  activeCategory = category;

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === category;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
};

const applyFilters = () => {
  let visibleCount = 0;

  topicCards.forEach((card) => {
    const matchesCategory =
      activeCategory === 'todos' || card.dataset.category === activeCategory;
    const isVisible = matchesCategory;

    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  const label =
    visibleCount === 1
      ? '1 experiência encontrada'
      : `${visibleCount} experiências encontradas`;

  resultsStatus.textContent = activeCategory !== 'todos'
    ? label
    : '3 experiências disponíveis';
  emptyState.hidden = visibleCount !== 0;
};

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    updateActiveFilter(button.dataset.filter);
    applyFilters();
  });
});

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const question = searchInput.value.trim();
  if (!question) return;

  visualizerQuestion.value = question;
  visualizerQuestion.dispatchEvent(new Event('input'));
  document.getElementById('ver-acontecer').scrollIntoView({
    behavior: reducedMotionPreference.matches ? 'auto' : 'smooth',
  });
  visualizerForm.requestSubmit();
});

searchInput.addEventListener('input', () => {
  if (!visualizerLoading.hidden) searchForm.querySelector('[type="submit"]').disabled = searchInput.value.trim() === pendingQuestion;
});

clearSearchButton.addEventListener('click', () => {
  updateActiveFilter('todos');
  applyFilters();
});

// Pequenas jornadas guiadas abertas a partir dos cartões.
const experiences = {
  terremotos: {
    area: 'Geografia',
    title: 'Terremotos',
    summary:
      'Acompanhe a energia desde o encontro das placas até o tremor percebido na superfície.',
    steps: [
      {
        title: 'Placas em movimento',
        description:
          'A crosta terrestre é dividida em placas que se movem lentamente. Nas bordas, a tensão pode se acumular por muitos anos.',
      },
      {
        title: 'Energia liberada',
        description:
          'Quando as rochas não suportam mais a pressão, elas se rompem. A energia acumulada é liberada no hipocentro.',
      },
      {
        title: 'Ondas pela Terra',
        description:
          'A energia viaja em ondas sísmicas. O epicentro é o ponto da superfície diretamente acima da origem do tremor.',
      },
    ],
  },
  'brasil-colonial': {
    area: 'História',
    title: 'Brasil Colonial',
    summary:
      'Percorra três conexões essenciais para compreender a formação do Brasil entre os séculos XVI e XIX.',
    steps: [
      {
        title: 'Territórios e encontros',
        description:
          'A colonização portuguesa ocorreu em territórios já habitados por diversos povos indígenas, com línguas e culturas próprias.',
      },
      {
        title: 'Economia e trabalho',
        description:
          'A exploração do pau-brasil, a produção de açúcar e a mineração dependeram de trabalho compulsório indígena e africano.',
      },
      {
        title: 'Culturas e resistências',
        description:
          'Quilombos, revoltas, alianças e práticas culturais mostram que a sociedade colonial foi marcada por conflitos e resistência.',
      },
    ],
  },
  fotossintese: {
    area: 'Ciências',
    title: 'Fotossíntese',
    summary:
      'Siga os ingredientes usados pela planta para transformar energia luminosa em energia química.',
    steps: [
      {
        title: 'Luz capturada',
        description:
          'A clorofila presente nos cloroplastos absorve principalmente luz azul e vermelha e inicia o processo.',
      },
      {
        title: 'Água e gás carbônico',
        description:
          'A água chega pelas raízes e o gás carbônico entra pelas folhas. Seus átomos serão reorganizados pela planta.',
      },
      {
        title: 'Glicose e oxigênio',
        description:
          'A energia da luz ajuda a formar glicose. O oxigênio produzido no processo é liberado para a atmosfera.',
      },
    ],
  },
};

const experienceDialog = document.getElementById('experience-dialog');
const dialogArea = document.getElementById('dialog-area');
const dialogTitle = document.getElementById('dialog-title');
const dialogSummary = document.getElementById('dialog-summary');
const experienceStage = document.getElementById('experience-stage');
const stageNumber = document.getElementById('stage-number');
const stageTitle = document.getElementById('stage-title');
const stageDescription = document.getElementById('stage-description');
const progressBar = document.getElementById('experience-progress-bar');
const experienceCounter = document.getElementById('experience-counter');
const previousStepButton = document.getElementById('previous-step');
const nextStepButton = document.getElementById('next-step');
const dialogCloseButton = document.getElementById('dialog-close');
let currentExperience;
let currentStep = 0;

const renderExperienceStep = () => {
  const experience = experiences[currentExperience];
  const step = experience.steps[currentStep];
  const isLastStep = currentStep === experience.steps.length - 1;

  stageNumber.textContent = String(currentStep + 1).padStart(2, '0');
  stageTitle.textContent = step.title;
  stageDescription.textContent = step.description;
  progressBar.style.width = `${((currentStep + 1) / experience.steps.length) * 100}%`;
  experienceCounter.textContent =
    `Etapa ${currentStep + 1} de ${experience.steps.length}`;
  previousStepButton.disabled = currentStep === 0;
  nextStepButton.textContent = isLastStep ? 'Concluir viagem ✓' : 'Próxima etapa →';

  experienceStage.classList.remove('is-changing');
  void experienceStage.offsetWidth;
  experienceStage.classList.add('is-changing');
};

const openExperience = (topic) => {
  const topicQuestions = {
    terremotos: 'Como as placas tectônicas causam terremotos?',
    'brasil-colonial': 'Quais foram os principais momentos do Brasil Colonial?',
    fotossintese: 'Como acontece o processo da fotossíntese?',
  };
  const question = topicQuestions[topic];
  if (!question) return;

  visualizerQuestion.value = question;
  visualizerQuestion.dispatchEvent(new Event('input'));
  document.getElementById('ver-acontecer').scrollIntoView({
    behavior: reducedMotionPreference.matches ? 'auto' : 'smooth',
  });
  visualizerForm.requestSubmit();
};

const closeExperience = () => {
  if (typeof experienceDialog.close === 'function') {
    experienceDialog.close();
  } else {
    experienceDialog.removeAttribute('open');
  }
};

document.querySelectorAll('[data-open-topic]').forEach((button) => {
  button.addEventListener('click', () => openExperience(button.dataset.openTopic));
});

previousStepButton.addEventListener('click', () => {
  if (currentStep === 0) return;
  currentStep -= 1;
  renderExperienceStep();
});

nextStepButton.addEventListener('click', () => {
  const lastStep = experiences[currentExperience].steps.length - 1;
  if (currentStep === lastStep) {
    closeExperience();
    return;
  }

  currentStep += 1;
  renderExperienceStep();
});

dialogCloseButton.addEventListener('click', closeExperience);

experienceDialog.addEventListener('click', (event) => {
  const bounds = experienceDialog.getBoundingClientRect();
  const clickedBackdrop =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;

  if (clickedBackdrop) closeExperience();
});

// Laboratório "Ver acontecer". A IA fornece apenas textos e escolhe um tipo
// permitido. Todo o SVG abaixo é selecionado entre modelos locais do VisuLab.
const localVisualExperiences = {
  terremoto: {
    titulo: 'Terremotos e placas tectônicas',
    disciplina: 'geografia',
    tipoVisual: 'terremoto',
    resumo:
      'Acompanhe o movimento das placas, o acúmulo de pressão e a energia que se espalha em ondas sísmicas.',
    etapas: [
      {
        titulo: 'As placas se movimentam',
        explicacao:
          'A crosta terrestre é dividida em placas que se deslocam lentamente. As setas mostram duas placas avançando em direções opostas na região de contato.',
      },
      {
        titulo: 'A pressão aumenta',
        explicacao:
          'O atrito pode prender as bordas das placas. Como o movimento continua, as rochas se deformam e armazenam energia.',
      },
      {
        titulo: 'A energia é liberada',
        explicacao:
          'Quando a tensão supera a resistência das rochas, ocorre uma ruptura. A energia acumulada é liberada a partir do hipocentro.',
      },
      {
        titulo: 'As ondas sísmicas se propagam',
        explicacao:
          'A energia viaja pelo interior da Terra em ondas sísmicas, que se afastam do ponto onde a ruptura começou.',
      },
      {
        titulo: 'O tremor chega à superfície',
        explicacao:
          'O epicentro fica na superfície, diretamente acima do hipocentro. A intensidade percebida varia com distância, profundidade e condições do solo.',
      },
    ],
    curiosidade:
      'As placas tectônicas costumam se mover apenas alguns centímetros por ano — uma velocidade parecida com o crescimento das unhas.',
    origem: 'local',
  },
  fotossintese: {
    titulo: 'Como acontece a fotossíntese',
    disciplina: 'ciencias',
    tipoVisual: 'fotossintese',
    resumo:
      'Siga a luz, a água e o dióxido de carbono até a produção de glicose e a liberação de oxigênio.',
    etapas: [
      {
        titulo: 'A luz chega à folha',
        explicacao:
          'A clorofila nos cloroplastos absorve parte da energia da luz do Sol e inicia as transformações químicas.',
      },
      {
        titulo: 'A água entra pelas raízes',
        explicacao:
          'As raízes absorvem água do solo. Ela sobe pelo caule até chegar às células das folhas.',
      },
      {
        titulo: 'O dióxido de carbono entra na folha',
        explicacao:
          'O dióxido de carbono, ou CO₂, entra por pequenas aberturas chamadas estômatos e participa da formação do alimento.',
      },
      {
        titulo: 'A planta produz glicose',
        explicacao:
          'Nos cloroplastos, a energia luminosa ajuda a reorganizar água e dióxido de carbono, formando glicose que armazena energia química.',
      },
      {
        titulo: 'O oxigênio é liberado',
        explicacao:
          'O oxigênio formado durante o processo sai principalmente pelos estômatos e passa para a atmosfera.',
      },
    ],
    curiosidade:
      'Grande parte do oxigênio produzido no planeta vem de organismos microscópicos fotossintetizantes que vivem nos oceanos.',
    origem: 'local',
  },
  brasil_colonial: {
    titulo: 'Brasil Colonial em uma linha do tempo',
    disciplina: 'historia',
    tipoVisual: 'brasil_colonial',
    resumo:
      'Selecione períodos para relacionar ocupação, atividades econômicas, trabalho, resistências e mudanças políticas entre 1500 e 1822.',
    etapas: [
      {
        titulo: '1500: encontros, disputas e pau-brasil',
        explicacao:
          'A chegada portuguesa ocorreu em territórios de muitos povos indígenas. As primeiras décadas envolveram escambo, extração do pau-brasil, alianças e conflitos.',
      },
      {
        titulo: '1530–1650: ocupação, engenhos e açúcar',
        explicacao:
          'Capitanias, vilas e engenhos ampliaram a ocupação. A economia açucareira usou trabalho compulsório indígena e, sobretudo, trabalho africano escravizado.',
      },
      {
        titulo: '1690–1760: mineração e interiorização',
        explicacao:
          'A extração de ouro e diamantes deslocou o eixo econômico, abriu caminhos para o interior e impulsionou núcleos urbanos, impostos e novos conflitos.',
      },
      {
        titulo: '1808–1822: crise e transição política',
        explicacao:
          'A vinda da corte portuguesa, a abertura dos portos e as disputas por autonomia aceleraram mudanças que culminaram na Independência.',
      },
    ],
    curiosidade:
      'Quilombos, revoltas e outras formas de resistência fizeram parte de todo o período colonial e mostram que a sociedade nunca foi passiva.',
    origem: 'local',
  },
};

const visualizerForm = document.getElementById('visualizer-form');
const visualizerQuestion = document.getElementById('visualizer-question');
const visualizerCounter = document.getElementById('visualizer-counter');
const visualizerLoading = document.getElementById('visualizer-loading');
const visualizerFeedback = document.getElementById('visualizer-feedback');
const visualizerEmpty = document.getElementById('visualizer-empty');
const visualizerExperience = document.getElementById('visualizer-experience');
const visualizerArea = document.getElementById('visualizer-area');
const visualizerExperienceTitle = document.getElementById('visualizer-experience-title');
const visualizerSummary = document.getElementById('visualizer-summary');
const visualizerSource = document.getElementById('visualizer-source');
const visualizerCanvas = document.getElementById('visualizer-canvas');
const visualizerLegend = document.getElementById('visualizer-legend');
const visualizerStep = document.getElementById('visualizer-step');
const visualizerStepNumber = document.getElementById('visualizer-step-number');
const visualizerStepLabel = document.getElementById('visualizer-step-label');
const visualizerStepTitle = document.getElementById('visualizer-step-title');
const visualizerStepDescription = document.getElementById('visualizer-step-description');
const visualizerProgress = document.getElementById('visualizer-progress');
const visualizerProgressBar = document.getElementById('visualizer-progress-bar');
const visualizerProgressLabel = document.getElementById('visualizer-progress-label');
const visualizerPrevious = document.getElementById('visualizer-previous');
const visualizerPlay = document.getElementById('visualizer-play');
const visualizerPause = document.getElementById('visualizer-pause');
const visualizerNext = document.getElementById('visualizer-next');
const visualizerRestart = document.getElementById('visualizer-restart');
const visualizerSpeed = document.getElementById('visualizer-speed');
const visualizerPeriods = document.getElementById('visualizer-periods');
const visualizerCuriosity = document.getElementById('visualizer-curiosity');
const visualizerAlternative = document.getElementById('visualizer-alternative');
const visualizerAiNotice = document.getElementById('visualizer-ai-notice');
const visualizerSubmit = visualizerForm.querySelector('[type="submit"]');
const visualizerSuggestionButtons = [
  ...document.querySelectorAll('[data-visualizer-suggestion]'),
];

const visualizerTemplates = {
  terremoto: 'visual-template-placas',
  fotossintese: 'visual-template-fotossintese',
  brasil_colonial: 'visual-template-linhaTempo',
  processo_generico: 'visual-template-processo',
  linha_do_tempo: 'visual-template-linha-do-tempo',
};

const visualizerDisciplines = {
  ciencias: 'Ciências',
  historia: 'História',
  geografia: 'Geografia',
  outro: 'Outro tema',
};

const visualizerLegends = {
  terremoto: [
    ['#f6cc62', 'placa tectônica'],
    ['#ff6b4a', 'tensão e ruptura'],
    ['#1e4ed8', 'ondas sísmicas'],
  ],
  fotossintese: [
    ['#f4c542', 'luz'],
    ['#3c8ce7', 'água'],
    ['#7b61d1', 'gás carbônico'],
    ['#2eaa72', 'transformação na folha'],
  ],
  brasil_colonial: [
    ['#1e4ed8', 'primeiros contatos'],
    ['#2eaa72', 'açúcar'],
    ['#f4c542', 'mineração'],
    ['#ff6b4a', 'transição política'],
  ],
  processo_generico: [
    ['#1e4ed8', 'etapa atual'],
    ['#cad5ed', 'demais etapas'],
  ],
  linha_do_tempo: [
    ['#1e4ed8', 'marco atual'],
    ['#cad5ed', 'outros marcos'],
  ],
};

const visualizerSceneDescriptions = {
  terremoto: [
    'Duas placas tectônicas se aproximam, enquanto setas indicam as direções do movimento.',
    'Linhas comprimidas destacam a tensão acumulada na borda entre as placas.',
    'Um clarão marca a ruptura da rocha e a liberação de energia no hipocentro.',
    'Anéis se expandem a partir do hipocentro para representar as ondas sísmicas.',
    'Uma linha liga o hipocentro ao epicentro na superfície, próximo a uma construção.',
  ],
  fotossintese: [
    'Raios de luz saem do Sol em direção às folhas da planta.',
    'Gotas de água sobem do solo pelas raízes e pelo caule.',
    'Moléculas de dióxido de carbono entram na folha pelo ar.',
    'O cloroplasto é destacado e uma seta aponta para a glicose produzida.',
    'Bolhas de oxigênio saem da folha e seguem para a atmosfera.',
  ],
  brasil_colonial: [
    'A linha do tempo destaca o marco de 1500 e os primeiros encontros e disputas.',
    'A linha do tempo destaca a ocupação colonial e a economia açucareira entre 1530 e 1650.',
    'A linha do tempo destaca a mineração e a interiorização entre 1690 e 1760.',
    'A linha do tempo destaca a crise colonial e a transição política entre 1808 e 1822.',
  ],
  processo_generico: [
    'Um diagrama em sequência destaca o passo atual entre até seis etapas conectadas.',
  ],
  linha_do_tempo: [
    'Uma linha horizontal ordena até seis marcos; o ponto correspondente à etapa atual recebe destaque.',
  ],
};

let engineActive = false;
const engine = new AnimationEngine(visualizerCanvas, {
  reducedMotion: reducedMotionPreference.matches,
  onChange: state => {
    if (!engineActive || !activeVisualExperience) return;
    activeVisualStep = state.index;
    visualizerIsPlaying = state.playing;
    renderVisualizerStep();
  },
  onProgress: fraction => {
    if (engineActive) {
      visualizerProgressBar.style.width = `${fraction * 100}%`;
      visualizerProgress.setAttribute('aria-valuemax', '100');
      visualizerProgress.setAttribute('aria-valuenow', String(Math.round(fraction * 100)));
    }
  },
});
let activeVisualExperience = null;
let activeVisualStep = 0;
let visualizerIsPlaying = false;
let visualizerTimer = 0;
let activeNetworkController = null;
let visualizerRequestId = 0;
let pendingQuestion = '';

const wait = (milliseconds) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const hasMarkup = (value) => /[<>]/.test(value);
const characterCount = (value) => [...value].length;

const findLocalVisualExperience = (question) => {
  const normalizedQuestion = normalizeText(question);

  if (/terremot|placa(?:s)? tectonic|onda(?:s)? sismic|\babalo(?:s)?\b/.test(normalizedQuestion)) {
    return localVisualExperiences.terremoto;
  }
  if (/fotossint|clorofila/.test(normalizedQuestion)) {
    return localVisualExperiences.fotossintese;
  }
  if (/brasil colonial|colonizacao do brasil|periodo colonial|linha do tempo.*brasil|\bcolonial\b|\bcolonia\b|capitania/.test(normalizedQuestion)) {
    return localVisualExperiences.brasil_colonial;
  }

  return null;
};

const requestVisualExperience = async (question) => {
  const controller = new AbortController();
  activeNetworkController = controller;
  const timeout = window.setTimeout(() => controller.abort(), 16000);

  try {
    const response = await fetch('/.netlify/functions/visualizar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pergunta: question }),
      signal: controller.signal,
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      // Uma resposta que não é JSON nunca é encaminhada para a interface.
    }

    if (!response.ok) {
      const error = new Error(payload?.mensagem || 'O serviço visual está indisponível.');
      error.code = payload?.codigo || 'SERVICE_UNAVAILABLE';
      throw error;
    }

    return validateVisualExperience(payload?.experiencia);
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error('A criação demorou mais que o esperado. Tente novamente.');
      timeoutError.code = 'TIMEOUT';
      throw timeoutError;
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
    if (activeNetworkController === controller) {
      activeNetworkController = null;
    }
  }
};

const renderVisualizerLegend = (visualType) => {
  const items = visualizerLegends[visualType] || visualizerLegends.processo_generico;
  visualizerLegend.replaceChildren();

  items.forEach(([color, label]) => {
    const item = document.createElement('span');
    const dot = document.createElement('span');
    item.className = 'visualizer-legend__item';
    dot.className = 'visualizer-legend__dot';
    dot.style.setProperty('--legend-color', color);
    dot.setAttribute('aria-hidden', 'true');
    item.append(dot, document.createTextNode(label));
    visualizerLegend.append(item);
  });
};

const mountVisualizerScene = (experience) => {
  const templateId = visualizerTemplates[experience.tipoVisual]
    || visualizerTemplates.processo_generico;
  const template = document.getElementById(templateId);
  visualizerCanvas.replaceChildren(template.content.cloneNode(true));
  renderVisualizerLegend(experience.tipoVisual);
};

const renderVisualizerPeriods = () => {
  visualizerPeriods.replaceChildren();
  const isColonialTimeline = activeVisualExperience?.tipoVisual === 'brasil_colonial';
  visualizerPeriods.hidden = !isColonialTimeline;
  if (!isColonialTimeline) return;

  activeVisualExperience.etapas.forEach((step, index) => {
    const button = document.createElement('button');
    const period = step.titulo.split(':')[0].trim();
    button.type = 'button';
    button.className = 'visualizer-period';
    button.dataset.periodIndex = String(index);
    button.textContent = period || `Período ${index + 1}`;
    button.setAttribute('aria-label', `Selecionar ${button.textContent}`);
    button.addEventListener('click', () => {
      stopVisualizerPlayback();
      activeVisualStep = index;
      renderVisualizerStep();
    });
    visualizerPeriods.append(button);
  });
};

const getVisualStepIndex = () => {
  const steps = activeVisualExperience.etapas.length;
  const visualSlotsByType = {
    terremoto: 5,
    fotossintese: 5,
    brasil_colonial: 4,
    processo_generico: 6,
    linha_do_tempo: 6,
  };
  const visualSlots = visualSlotsByType[activeVisualExperience.tipoVisual] || 6;

  if (steps === 1) return 0;
  return Math.round((activeVisualStep / (steps - 1)) * (visualSlots - 1));
};

const stopVisualizerPlayback = () => {
  if (engineActive) engine.pause();
  window.clearTimeout(visualizerTimer);
  visualizerTimer = 0;
  visualizerIsPlaying = false;
  visualizerCanvas.dataset.playing = 'false';
};

const scheduleVisualizerAdvance = () => {
  window.clearTimeout(visualizerTimer);
  if (engineActive || !visualizerIsPlaying || reducedMotionPreference.matches) return;

  const speed = Number(visualizerSpeed.value) || 1;
  visualizerTimer = window.setTimeout(() => {
    if (activeVisualStep >= activeVisualExperience.etapas.length - 1) {
      stopVisualizerPlayback();
      renderVisualizerStep();
      return;
    }

    activeVisualStep += 1;
    renderVisualizerStep();
    scheduleVisualizerAdvance();
  }, 4200 / speed);
};

const renderVisualizerPlayControl = () => {
  if (reducedMotionPreference.matches) {
    visualizerPlay.disabled = true;
    visualizerPause.disabled = true;
    visualizerSpeed.disabled = true;
    visualizerPlay.title = 'Reprodução automática desativada pela preferência de movimento reduzido';
    return;
  }

  visualizerPlay.disabled = visualizerIsPlaying;
  visualizerPause.disabled = !visualizerIsPlaying;
  visualizerSpeed.disabled = false;
  visualizerPlay.removeAttribute('title');
};

function renderVisualizerStep() {
  if (!activeVisualExperience) return;

  const step = activeVisualExperience.etapas[activeVisualStep];
  const stepCount = activeVisualExperience.etapas.length;
  const isLastStep = activeVisualStep === stepCount - 1;

  visualizerStepNumber.textContent = String(activeVisualStep + 1).padStart(2, '0');
  visualizerStepLabel.textContent = `Etapa ${activeVisualStep + 1} de ${stepCount}`;
  visualizerStepTitle.textContent = step.titulo;
  visualizerStepDescription.textContent = step.explicacao;
  visualizerProgressBar.style.width = `${((activeVisualStep + 1) / stepCount) * 100}%`;
  visualizerProgressLabel.textContent =
    `Etapa ${activeVisualStep + 1} de ${stepCount}: ${step.titulo}`;
  visualizerProgress.setAttribute('aria-valuemax', String(stepCount));
  visualizerProgress.setAttribute('aria-valuenow', String(activeVisualStep + 1));
  visualizerProgress.setAttribute(
    'aria-valuetext',
    `Etapa ${activeVisualStep + 1} de ${stepCount}`,
  );
  visualizerPrevious.disabled = activeVisualStep === 0;
  visualizerNext.disabled = isLastStep;
  visualizerRestart.disabled = false;
  visualizerCanvas.dataset.step = String(getVisualStepIndex());
  visualizerCanvas.dataset.playing = String(visualizerIsPlaying);

  const sceneDescriptions =
    visualizerSceneDescriptions[activeVisualExperience.tipoVisual]
    || visualizerSceneDescriptions.processo_generico;
  const visualStepIndex = getVisualStepIndex();
  const sceneDescription = engineActive ? step.titulo : (sceneDescriptions[visualStepIndex] || sceneDescriptions[0]);
  visualizerAlternative.textContent =
    `${sceneDescription} ${step.explicacao}`;
  visualizerCanvas.setAttribute(
    'aria-label',
    `${activeVisualExperience.titulo}. Etapa ${activeVisualStep + 1} de ${stepCount}. ${sceneDescription}`,
  );

  visualizerPeriods.querySelectorAll('[data-period-index]').forEach((button) => {
    const isCurrent = Number(button.dataset.periodIndex) === activeVisualStep;
    button.classList.toggle('is-active', isCurrent);
    button.setAttribute('aria-pressed', String(isCurrent));
  });

  visualizerStep.classList.remove('is-changing');
  void visualizerStep.offsetWidth;
  visualizerStep.classList.add('is-changing');
  renderVisualizerPlayControl();
};

const showVisualExperience = (candidate) => {
  stopVisualizerPlayback();
  engineActive = false;
  engine.destroy();
  const special = candidate.experienciaEspecial || candidate.tipoVisual;
  activeVisualExperience = validateVisualExperience(localVisualExperiences[special] || candidate);
  activeVisualStep = 0;

  visualizerArea.textContent = visualizerDisciplines[activeVisualExperience.disciplina];
  visualizerExperienceTitle.textContent = activeVisualExperience.titulo;
  visualizerSummary.textContent = activeVisualExperience.resumo;
  visualizerSource.textContent = activeVisualExperience.origem === 'local'
    ? 'Experiência pronta'
    : 'Criado com IA';
  visualizerCuriosity.textContent = [activeVisualExperience.conclusao, activeVisualExperience.curiosidade].filter(Boolean).join(' ');
  visualizerAiNotice.hidden = activeVisualExperience.origem !== 'ia';
  engineActive = !['terremoto', 'fotossintese', 'brasil_colonial'].includes(activeVisualExperience.tipoVisual);
  if (!engineActive) mountVisualizerScene(activeVisualExperience);
  else visualizerLegend.replaceChildren();
  renderVisualizerPeriods();
  visualizerEmpty.hidden = true;
  visualizerExperience.hidden = false;

  if (engineActive) {
    engine.setSpeed(Number(visualizerSpeed.value));
    engine.load(activeVisualExperience);
    return;
  }
  visualizerIsPlaying = !reducedMotionPreference.matches;
  renderVisualizerStep();
  scheduleVisualizerAdvance();
};

const setVisualizerLoading = (isLoading) => {
  visualizerLoading.hidden = !isLoading;
  visualizerForm.setAttribute('aria-busy', String(isLoading));
  visualizerSubmit.disabled = isLoading;
  visualizerQuestion.disabled = false;
  searchInput.disabled = false;
  searchForm.querySelector('[type="submit"]').disabled = isLoading;
  visualizerSuggestionButtons.forEach((button) => {
    button.disabled = isLoading;
  });
  visualizerSubmit.querySelector('span').textContent = isLoading ? '···' : '→';
};

visualizerQuestion.addEventListener('input', () => {
  if (!visualizerLoading.hidden) visualizerSubmit.disabled = visualizerQuestion.value.trim() === pendingQuestion;
  visualizerCounter.textContent =
    `${characterCount(visualizerQuestion.value)} de 250 caracteres`;
  visualizerFeedback.textContent = '';
  visualizerQuestion.removeAttribute('aria-invalid');
});

visualizerSuggestionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    visualizerQuestion.value = button.dataset.visualizerSuggestion;
    visualizerQuestion.dispatchEvent(new Event('input'));
    visualizerForm.requestSubmit();
  });
});

visualizerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const question = visualizerQuestion.value.trim();

  if (!question) {
    visualizerFeedback.textContent = 'Escreva uma pergunta para iniciar a experiência.';
    visualizerQuestion.setAttribute('aria-invalid', 'true');
    visualizerQuestion.focus();
    return;
  }

  if (characterCount(question) > 250) {
    visualizerFeedback.textContent = 'A pergunta deve ter no máximo 250 caracteres.';
    visualizerQuestion.setAttribute('aria-invalid', 'true');
    visualizerQuestion.focus();
    return;
  }

  if (pendingQuestion === question && !visualizerLoading.hidden) return;
  pendingQuestion = question;
  activeNetworkController?.abort();
  const requestId = ++visualizerRequestId;
  stopVisualizerPlayback();
  engineActive = false;
  engine.destroy();
  activeVisualExperience = null;
  visualizerCanvas.replaceChildren();
  visualizerExperience.hidden = true;
  visualizerEmpty.hidden = true;
  renderVisualizerPlayControl();
  setVisualizerLoading(true);
  visualizerFeedback.textContent = '';

  try {
    const localExperience = findLocalVisualExperience(question);
    let experience;

    if (localExperience) {
      await wait(320);
      experience = localExperience;
    } else {
      experience = await requestVisualExperience(question);
    }

    if (requestId === visualizerRequestId) {
      showVisualExperience(experience);
    }
  } catch (error) {
    const messages = {
      API_LIMIT: 'Muitas visualizações foram solicitadas agora. Aguarde um pouco e tente novamente.',
      TIMEOUT: 'A criação demorou mais que o esperado. Tente novamente.',
    };
    if (requestId === visualizerRequestId) {
      visualizerFeedback.textContent = messages[error.code]
        || 'Não foi possível criar a animação agora. Tente novamente ou escolha uma das três experiências prontas, disponíveis sem IA.';
    }
  } finally {
    if (requestId === visualizerRequestId) {
      setVisualizerLoading(false);
    }
  }
});

visualizerPrevious.addEventListener('click', () => {
  if (engineActive) { engine.seek(engine.index - 1); return; }
  if (!activeVisualExperience || activeVisualStep === 0) return;
  activeVisualStep -= 1;
  renderVisualizerStep();
  scheduleVisualizerAdvance();
});

visualizerNext.addEventListener('click', () => {
  if (engineActive) { engine.seek(engine.index + 1); return; }
  if (!activeVisualExperience || activeVisualStep >= activeVisualExperience.etapas.length - 1) return;
  activeVisualStep += 1;
  renderVisualizerStep();
  scheduleVisualizerAdvance();
});

visualizerPlay.addEventListener('click', () => {
  if (engineActive) { engine.play(); return; }
  if (!activeVisualExperience || reducedMotionPreference.matches) return;

  if (visualizerIsPlaying) {
    stopVisualizerPlayback();
    renderVisualizerPlayControl();
    return;
  }

  if (activeVisualStep === activeVisualExperience.etapas.length - 1) {
    activeVisualStep = 0;
  }
  visualizerIsPlaying = true;
  renderVisualizerStep();
  scheduleVisualizerAdvance();
});

visualizerPause.addEventListener('click', () => {
  if (engineActive) { engine.pause(); return; }
  if (!activeVisualExperience) return;
  stopVisualizerPlayback();
  renderVisualizerStep();
});

visualizerRestart.addEventListener('click', () => {
  if (engineActive) { engine.restart(); return; }
  if (!activeVisualExperience) return;
  stopVisualizerPlayback();
  activeVisualStep = 0;
  renderVisualizerStep();
});

visualizerSpeed.addEventListener('change', () => { engine.setSpeed(Number(visualizerSpeed.value)); scheduleVisualizerAdvance(); });

reducedMotionPreference.addEventListener('change', () => {
  engine.setReducedMotion(reducedMotionPreference.matches);
  if (reducedMotionPreference.matches) stopVisualizerPlayback();
  renderVisualizerPlayControl();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && visualizerIsPlaying) {
    stopVisualizerPlayback();
    renderVisualizerPlayControl();
  }
});
