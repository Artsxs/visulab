document.documentElement.classList.add('has-js');

const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('.theme-toggle__icon');
const themeColor = document.querySelector('meta[name="theme-color"]');
const themePreference = window.matchMedia('(prefers-color-scheme: dark)');
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

// Pesquisa e filtros das áreas.
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
  const query = normalizeText(searchInput.value);
  let visibleCount = 0;

  topicCards.forEach((card) => {
    const matchesCategory =
      activeCategory === 'todos' || card.dataset.category === activeCategory;
    const matchesSearch = !query || normalizeText(card.dataset.search).includes(query);
    const isVisible = matchesCategory && matchesSearch;

    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  const label =
    visibleCount === 1
      ? '1 experiência encontrada'
      : `${visibleCount} experiências encontradas`;

  resultsStatus.textContent = query || activeCategory !== 'todos'
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

searchInput.addEventListener('input', applyFilters);

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  updateActiveFilter('todos');
  applyFilters();
  document.getElementById('explorar').scrollIntoView({ behavior: 'smooth' });
});

clearSearchButton.addEventListener('click', () => {
  searchInput.value = '';
  updateActiveFilter('todos');
  applyFilters();
  searchInput.focus();
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
  const experience = experiences[topic];
  if (!experience) return;

  currentExperience = topic;
  currentStep = 0;
  dialogArea.textContent = experience.area;
  dialogTitle.textContent = experience.title;
  dialogSummary.textContent = experience.summary;
  renderExperienceStep();

  if (typeof experienceDialog.showModal === 'function') {
    experienceDialog.showModal();
  } else {
    experienceDialog.setAttribute('open', '');
  }
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
