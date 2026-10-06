import { renderReviewed } from './js/reviewed-renderer.mjs';
import { renderScene } from './js/scene-renderer.mjs';
import { renderPremium } from './js/premium-renderer.mjs';
import { findReviewedTopic, reviewedExperiences, SOURCES, premiumReferences, clarificationFor } from './js/reviewed-experiences.mjs';
import { validateVisualExperience } from './js/visual-validator.mjs';
import { AnimationEngine } from './js/animation-engine.mjs';
import { findPremiumTopic } from './js/local-fallback.mjs';

document.documentElement.classList.add('has-js');

const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle ? themeToggle.querySelector('.theme-toggle__icon') : null;
const themeColor = document.querySelector('meta[name="theme-color"]');
const themePreference = window.matchMedia('(prefers-color-scheme: dark)');
const reducedMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const THEME_STORAGE_KEY = 'visulab-theme';

const resolvedTheme = () =>
  root.dataset.theme || (themePreference.matches ? 'dark' : 'light');

const updateThemeControl = () => {
  const isDark = resolvedTheme() === 'dark';
  if (themeToggle) {
    if (themeToggle.type === 'checkbox') {
      themeToggle.checked = isDark;
    }
    themeToggle.setAttribute(
      'aria-label',
      isDark ? 'Mudar para o dia (tema claro)' : 'Mudar para a noite (tema escuro)',
    );
    if (themeIcon) {
      themeIcon.textContent = isDark ? '☀' : '☾';
    }
  }
  if (themeColor) {
    themeColor.setAttribute('content', isDark ? '#101629' : '#1e4ed8');
  }
};

try {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    root.dataset.theme = savedTheme;
  }
} catch {
  // O site continua seguindo o tema do sistema quando o armazenamento é bloqueado.
}

const toggleTheme = (nextTheme) => {
  root.dataset.theme = nextTheme || (resolvedTheme() === 'dark' ? 'light' : 'dark');
  updateThemeControl();

  try {
    localStorage.setItem(THEME_STORAGE_KEY, root.dataset.theme);
  } catch {
    // A preferência fica ativa nesta visita mesmo sem acesso ao armazenamento.
  }
};

if (themeToggle) {
  themeToggle.addEventListener('change', () => {
    toggleTheme(themeToggle.checked ? 'dark' : 'light');
  });

  themeToggle.addEventListener('click', (event) => {
    if (themeToggle.type !== 'checkbox') {
      toggleTheme();
    }
  });
}

themePreference.addEventListener('change', () => {
  if (!root.dataset.theme) {
    updateThemeControl();
  }
});

updateThemeControl();

// Revela os blocos conforme entram na tela. Sem JavaScript, todos permanecem visíveis.
const generalRevealElements = document.querySelectorAll('[data-reveal]:not(#apresentacao [data-reveal])');

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

  generalRevealElements.forEach((element) => revealObserver.observe(element));
} else {
  generalRevealElements.forEach((element) => element.classList.add('is-visible'));
}

// Animação de fade-in sequencial para os blocos de conteúdo da seção #apresentacao usando Intersection Observer
const presentationSection = document.getElementById('apresentacao');
if (presentationSection) {
  const presentationBlocks = presentationSection.querySelectorAll('.presentation__heading, .presentation-card');
  presentationBlocks.forEach((block, index) => {
    block.style.setProperty('--stagger-index', String(index));
  });

  if ('IntersectionObserver' in window) {
    const presentationObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          presentationSection.classList.add('is-in-view');
          presentationBlocks.forEach((block, index) => {
            setTimeout(() => {
              block.classList.add('is-visible');
            }, index * 160);
          });
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.06 },
    );
    presentationObserver.observe(presentationSection);
  } else {
    presentationSection.classList.add('is-in-view');
    presentationBlocks.forEach((block) => block.classList.add('is-visible'));
  }
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

// Efeito de aproximação até o solo na rolagem (Zoom-in & pan down em direção ao solo)
const heroStage = document.getElementById('inicio');
const heroScenery = document.getElementById('hero-stage-scenery');
const heroArtFrame = document.getElementById('hero-art-frame');
const heroSearchOverlay = document.getElementById('hero-stage-content') || document.getElementById('hero-search-overlay');
const heroScrollHint = document.getElementById('hero-scroll-hint');
const heroSoilReveal = document.getElementById('hero-soil-reveal');
const siteHeader = document.getElementById('site-header');

const updateHeroZoom = () => {
  if (!heroStage) return;

  const scrollY = window.scrollY || window.pageYOffset;
  if (siteHeader) {
    siteHeader.classList.toggle('is-scrolled', scrollY > 35);
  }

  if (reducedMotionPreference.matches) {
    if (heroScenery) heroScenery.style.transform = '';
    if (heroArtFrame) heroArtFrame.style.transform = '';
    if (heroSearchOverlay) {
      heroSearchOverlay.style.opacity = '';
      heroSearchOverlay.style.transform = '';
      heroSearchOverlay.style.pointerEvents = '';
    }
    if (heroScrollHint) heroScrollHint.style.opacity = '';
    if (heroSoilReveal) heroSoilReveal.style.opacity = '0';
    return;
  }

  const rect = heroStage.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  const totalScroll = rect.height - windowHeight;

  if (totalScroll <= 0) return;

  // Progresso relativo de 0.0 (início) a 1.0 (final da seção hero)
  const currentScroll = -rect.top;
  const progress = Math.min(Math.max(currentScroll / totalScroll, 0), 1);

  // Aproximação até o solo:
  // A escala aumenta de 1.0 para 1.62, aproximando a câmera e descendo até a camada de solo
  const scale = 1 + progress * 0.65;
  const translateY = -progress * 24;

  if (heroScenery) {
    heroScenery.style.transform = `scale(${scale}) translateY(${translateY}%)`;
    heroScenery.style.transformOrigin = 'center 88%';
  }

  // Desvanecimento e elevação suave do formulário de busca
  const isInputFocused = searchInput && (document.activeElement === searchInput || (searchForm && searchForm.contains(document.activeElement)));
  if (heroSearchOverlay) {
    if (isInputFocused) {
      heroSearchOverlay.style.opacity = '1';
      heroSearchOverlay.style.transform = 'none';
      heroSearchOverlay.style.pointerEvents = 'auto';
    } else {
      const overlayOpacity = Math.max(1 - progress * 2.3, 0);
      heroSearchOverlay.style.opacity = String(overlayOpacity);
      heroSearchOverlay.style.transform = `translateY(${-progress * 50}px)`;
      heroSearchOverlay.style.pointerEvents = overlayOpacity < 0.1 ? 'none' : 'auto';
    }
  }

  if (heroScrollHint) {
    heroScrollHint.style.opacity = String(Math.max(1 - progress * 4, 0));
  }

  // Revelação de Sobre o projeto ao chegar no solo
  if (heroSoilReveal) {
    const revealOpacity = Math.min(Math.max((progress - 0.35) * 2.5, 0), 1);
    const revealTranslate = Math.max(24 - (progress - 0.35) * 50, 0);
    heroSoilReveal.style.opacity = String(revealOpacity);
    heroSoilReveal.style.transform = `translateX(-50%) translateY(${revealTranslate}px)`;
  }
};

let zoomScrollScheduled = false;
window.addEventListener('scroll', () => {
  if (!zoomScrollScheduled) {
    requestAnimationFrame(() => {
      updateHeroZoom();
      updateActiveNav();
      zoomScrollScheduled = false;
    });
    zoomScrollScheduled = true;
  }
}, { passive: true });

window.addEventListener('resize', () => {
  updateHeroZoom();
  updateActiveNav();
}, { passive: true });
reducedMotionPreference.addEventListener('change', updateHeroZoom);
updateHeroZoom();

// Sincronização da barra de navegação com as seções da página (Scroll Spy)
const navItems = [
  { id: 'inicio', link: document.getElementById('nav-inicio') },
  { id: 'apresentacao', link: document.getElementById('nav-sobre') },
  { id: 'como-funciona', link: document.getElementById('nav-como-funciona') },
  { id: 'ver-acontecer', link: document.getElementById('nav-laboratorio') },
  { id: 'explorar', link: document.getElementById('nav-explorar') },
].map(item => ({
  section: document.getElementById(item.id),
  link: item.link,
})).filter(item => item.section && item.link);

const updateActiveNav = () => {
  const scrollPos = (window.scrollY || window.pageYOffset) + 140;
  let activeItem = null;

  for (let i = navItems.length - 1; i >= 0; i--) {
    const item = navItems[i];
    if (item.section.offsetTop <= scrollPos) {
      activeItem = item.link;
      break;
    }
  }

  if (!activeItem && navItems.length) {
    activeItem = navItems[0].link;
  }

  navItems.forEach(item => {
    const isActive = item.link === activeItem;
    item.link.classList.toggle('is-active', isActive);
    if (isActive) {
      item.link.setAttribute('aria-current', 'page');
    } else {
      item.link.removeAttribute('aria-current');
    }
  });
};

navItems.forEach(item => {
  item.link.addEventListener('click', () => {
    navItems.forEach(n => {
      const isCurrent = n.link === item.link;
      n.link.classList.toggle('is-active', isCurrent);
      if (isCurrent) n.link.setAttribute('aria-current', 'page');
      else n.link.removeAttribute('aria-current');
    });
  });
});

updateActiveNav();

// Sugestões rápidas de temas da primeira tela
document.querySelectorAll('[data-quick-topic]').forEach((button) => {
  button.addEventListener('click', () => {
    const topic = button.dataset.quickTopic;
    let question = '';
    if (topic === 'terremotos') question = 'Como acontecem os terremotos?';
    else if (topic === 'fotossintese') question = 'Como acontece o processo da fotossíntese?';
    else if (topic === 'brasil-colonial') question = 'Quais foram os principais momentos do Brasil Colonial?';

    if (!question) return;

    if (searchInput) searchInput.value = question;
    if (visualizerQuestion) {
      visualizerQuestion.value = question;
      visualizerQuestion.dispatchEvent(new Event('input'));
    }
    const target = document.getElementById('ver-acontecer');
    if (target) {
      target.scrollIntoView({
        behavior: reducedMotionPreference.matches ? 'auto' : 'smooth',
      });
    }
    if (visualizerForm) visualizerForm.requestSubmit();
  });
});

// Botão de chamada final "Começar a explorar"
const btnStartExploring = document.getElementById('btn-start-exploring');
if (btnStartExploring) {
  btnStartExploring.addEventListener('click', (event) => {
    event.preventDefault();
    const heroEl = document.getElementById('inicio');
    if (heroEl) {
      heroEl.scrollIntoView({
        behavior: reducedMotionPreference.matches ? 'auto' : 'smooth',
      });
      setTimeout(() => {
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }, reducedMotionPreference.matches ? 50 : 500);
    }
  });
}

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
          'A litosfera (crosta e parte superior rígida do manto) é dividida em placas que se movem lentamente. Nas bordas, a tensão pode se acumular por muitos anos.',
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
    simplificacoes: 'Corte esquemático da litosfera, sem escala de distância ou tempo. Deformação e tremor ampliados. Os círculos representam frentes de ondas; não são rachaduras.',
    resumo:
      'Acompanhe o movimento das placas, o acúmulo de pressão e a energia que se espalha em ondas sísmicas.',
    etapas: [
      {
        titulo: 'As placas se movimentam',
        explicacao:
          'A litosfera (crosta e parte superior rígida do manto) é dividida em placas que se deslocam lentamente. As setas mostram duas placas avançando em direções opostas na região de contato.',
      },
      {
        titulo: 'A tensão se acumula',
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
    simplificacoes: 'Moléculas e cloroplasto ampliados; movimentos e tempos esquemáticos. Etapas destacadas separadamente, mas as reações e trocas ocorrem de forma integrada.',
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
          'Nos cloroplastos, produtos das reações com luz permitem fixar carbono do CO₂ em açúcares. A glicose representa aqui esses açúcares, que armazenam energia química.',
      },
      {
        titulo: 'O oxigênio é liberado',
        explicacao:
          'O oxigênio vem da quebra de moléculas de água nas reações dependentes de luz. Ele pode sair pelos estômatos. Esta etapa acontece junto às anteriores, não só depois da produção de açúcar.',
      },
    ],
    curiosidade:
      'O oxigênio liberado vem da água; o carbono incorporado aos açúcares vem do dióxido de carbono.',
    origem: 'local',
  },
  brasil_colonial: {
    titulo: 'Brasil Colonial em uma linha do tempo',
    disciplina: 'historia',
    tipoVisual: 'brasil_colonial',
    simplificacoes: 'Marcos selecionados da colonização e da transição à Independência. Intervalos e distâncias na linha não estão em escala; atividades econômicas e resistências coexistiram.',
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
  agua: {
    titulo: 'Como funciona o ciclo da água',
    disciplina: 'ciencias',
    tipoVisual: 'agua',
    simplificacoes: 'Sem escala de distância ou tempo. Pontos representam vapor invisível; nuvens contêm gotículas ou cristais de gelo.',
    resumo:
      'Acompanhe as etapas de evaporação, condensação em nuvens, precipitação em chuva, infiltração no solo e retorno aos oceanos.',
    etapas: [
      {
        titulo: 'Evaporação da água superficial',
        explicacao:
          'A energia térmica do Sol aquece as águas superficiais do oceano e de rios, transformando a água líquida em vapor invisível que sobe na atmosfera.',
      },
      {
        titulo: 'Condensação e formação de nuvens',
        explicacao:
          'O vapor de água resfria em camadas mais altas e frias da atmosfera, condensando-se em microscópicas gotículas líquidas que formam as nuvens.',
      },
      {
        titulo: 'Precipitação em forma de chuva',
        explicacao:
          'As gotículas no interior das nuvens colidem e se aglutinam, ganhando massa até precipitarem por gravidade na forma de chuva sobre montanhas e vales.',
      },
      {
        titulo: 'Infiltração e lençol freático',
        explicacao:
          'Parte da água da chuva infiltra nos solos permeáveis e fraturas de rochas, recarregando aquíferos subterrâneos e o lençol freático.',
      },
      {
        titulo: 'Escoamento superficial e retorno ao mar',
        explicacao:
          'Outra porção escoa por córregos e rios de volta aos mares e oceanos, mantendo o ciclo hidrológico em perpétua renovação na Terra.',
      },
    ],
    curiosidade:
      'A quantidade total de água na Terra permanece praticamente constante há bilhões de anos, reciclando-se continuamente entre a superfície e a atmosfera.',
    origem: 'local',
  },
  eclipse: {
    titulo: 'Como se forma um eclipse solar',
    disciplina: 'ciencias',
    tipoVisual: 'eclipse',
    simplificacoes: 'Vista espacial lateral esquemática com diâmetros e distâncias astronômicas sem escala métrica para clareza da umbra e penumbra.',
    resumo:
      'Observe o alinhamento orbital do Sol, da Lua e da Terra, a projeção dos cones de umbra e penumbra no espaço e a visão do observador.',
    etapas: [
      {
        titulo: 'Alinhamento Sol, Lua e Terra',
        explicacao:
          'Durante a fase de Lua Nova, a Lua posiciona-se no alinhamento direto entre o Sol e o planeta Terra ao cruzar a linha dos nodos da órbita.',
      },
      {
        titulo: 'Projeção dos cones de umbra e penumbra',
        explicacao:
          'A Lua intercepta a luz solar e projeta dois cones de sombra no espaço: a umbra interna totalmente escura e a penumbra externa parcialmente iluminada.',
      },
      {
        titulo: 'Observação total e parcial na Terra',
        explicacao:
          'Observadores situados na estreita faixa de umbra contemplam o eclipse solar total; quem está na vasta área de penumbra observa um eclipse parcial.',
      },
    ],
    curiosidade:
      'O eclipse solar total só é possível pela coincidência de o Sol ser 400 vezes maior que a Lua e estar exatamente cerca de 400 vezes mais distante da Terra.',
    origem: 'local',
  },
  vulcao: {
    titulo: 'Como acontece uma erupção vulcânica',
    disciplina: 'geografia',
    tipoVisual: 'vulcao',
    simplificacoes: 'Corte lateral esquemático de um estratovulcão. Proporções de profundidade, escala de tempo e viscosidade da lava simplificadas para fins didáticos.',
    resumo:
      'Acompanhe o caminho do magma desde a câmara profunda até a ascensão pelo conduto, explosão da cratera e derrame de lava.',
    etapas: [
      {
        titulo: 'Acúmulo de magma na câmara profunda',
        explicacao:
          'Nas profundezas da crosta terrestre, rochas em fusão originadas no manto se concentram em uma câmara magmática de altíssima temperatura e pressão.',
      },
      {
        titulo: 'Pressão e expansão de gases voláteis',
        explicacao:
          'Gases como vapor de água e dióxido de carbono se desprendem do magma e se expandem, elevando intensamente a pressão interna contra as paredes rochosas.',
      },
      {
        titulo: 'Ascensão do magma pelo conduto central',
        explicacao:
          'A enorme pressão acumulada empurra o magma em ascensão contínua através da chaminé vulcânica central em direção à superfície.',
      },
      {
        titulo: 'Ruptura da cratera e detonação',
        explicacao:
          'A pressão supera a resistência do tampão de rocha sólida da cratera, rompendo a estrutura com fragmentação de piroclastos e estrondo vulcânico.',
      },
      {
        titulo: 'Derrame de lava e pluma de cinzas',
        explicacao:
          'Rios de lava incandescente escorrem pelas encostas do vulcão, enquanto uma coluna convectiva de cinzas e gases quentes se eleva na atmosfera.',
      },
    ],
    curiosidade:
      'A rocha derretida sob a crosta terrestre é chamada de magma; assim que atinge a superfície e entra em contato com o ar, passa a ser chamada de lava.',
    origem: 'local',
  },
  celula: {
    titulo: 'Estrutura e funcionamento da célula',
    disciplina: 'ciencias',
    tipoVisual: 'celula',
    simplificacoes: 'Corte microscópico tridimensional de uma célula eucarionte animal. Dimensões, quantitativo de organelas e velocidades metabólicas ampliados para fins didáticos.',
    resumo:
      'Explore o interior de uma célula viva: a membrana seletiva, o citoplasma, o núcleo de comando genético e a produção de energia nas mitocôndrias.',
    etapas: [
      {
        titulo: 'Membrana plasmática seletiva',
        explicacao:
          'A bicamada lipídica com proteínas receptoras delimita a célula, mantendo a integridade interna e controlando a entrada de nutrientes essenciais e água.',
      },
      {
        titulo: 'Citoplasma e fluxo celular',
        explicacao:
          'O meio coloidal rico em citosol preenche a célula, oferecendo suporte mecânico e permitindo a circulação de substâncias e organelas vitais.',
      },
      {
        titulo: 'Núcleo e centro genético',
        explicacao:
          'Protegido pela carioteca com poros seletivos, o núcleo abriga o DNA celular e coordena todas as sínteses proteicas e a divisão celular.',
      },
      {
        titulo: 'Mitocôndrias e produção de ATP',
        explicacao:
          'Com membranas dobradas em cristas mitocondriais, essas usinas de energia utilizam glicose e oxigênio para fabricar moléculas de ATP.',
      },
      {
        titulo: 'Metabolismo e secreção integrada',
        explicacao:
          'O retículo endoplasmático e o complexo golgiense processam, empacotam e exportam compostos químicos úteis, expelindo resíduos metabólicos.',
      },
    ],
    curiosidade:
      'O corpo de um ser humano adulto é formado por mais de 30 trilhões de células trabalhando sincronizadas dia e noite.',
    origem: 'local',
  },
  translacao_terra: {
    titulo: 'Movimento de Translação da Terra e Estações do Ano',
    disciplina: 'ciencias',
    tipoVisual: 'translacao_terra',
    simplificacoes: 'Órbita elíptica com excentricidade levemente ampliada para facilitar a percepção das distâncias; proporções astronômicas de diâmetro e distância sem escala métrica real.',
    resumo:
      'Acompanhe o percurso elíptico da Terra ao redor do Sol durante 365 dias, a inclinação de 23,5° do eixo e a alternância dos solstícios, equinócios e estações.',
    etapas: [
      {
        titulo: 'O Sol central e a órbita elíptica',
        explicacao:
          'No centro do sistema, a atração gravitacional do Sol mantém a Terra em uma trajetória elíptica fechada e contínua em sentido anti-horário.',
      },
      {
        titulo: 'A inclinação fixa do eixo em 23,5°',
        explicacao:
          'O eixo imaginário de rotação da Terra mantém uma inclinação constante de aproximadamente 23,5° em relação ao plano da eclíptica durante toda a translação.',
      },
      {
        titulo: 'Solstícios, equinócios e as quatro estações',
        explicacao:
          'A inclinação do eixo altera o ângulo de incidência dos raios solares nos hemisférios norte e sul, definindo os solstícios de verão/inverno e os equinócios de primavera/outono.',
      },
      {
        titulo: 'Ciclo completo de 365 dias e o ano bissexto',
        explicacao:
          'A Terra completa uma volta em 365 dias, 5 horas e 48 minutos. A cada quatro anos, o acúmulo dessas horas adicionais forma o dia 29 de fevereiro no ano bissexto.',
      },
    ],
    curiosidade:
      'A distância da Terra ao Sol varia pouco durante o ano (cerca de 3%); não é a distância que causa as estações, mas sim a inclinação do eixo de 23,5°.',
    origem: 'local',
  },
  revolucao_industrial: {
    titulo: 'A Revolução Industrial e a Força a Vapor',
    disciplina: 'historia',
    tipoVisual: 'revolucao_industrial',
    simplificacoes: 'Corte mecânico da máquina de James Watt e agrupamento de fábrica, ferrovia e minas de carvão simplificados para síntese didática.',
    resumo:
      'Descubra como a máquina a vapor de James Watt, o carvão mineral e os teares mecânicos revolucionaram a produção manufatureira, o transporte e as cidades.',
    etapas: [
      {
        titulo: 'O carvão mineral e a caldeira a vapor',
        explicacao:
          'A queima contínua de carvão mineral na fornalha aquece a água na caldeira blindada, produzindo vapor em expansão sob intensa pressão física.',
      },
      {
        titulo: 'O cilindro, pistão e volante de Watt',
        explicacao:
          'O vapor em alta pressão empurra o pistão móvel em vaivém mecânico; bielas convertem essa força linear em movimento rotativo contínuo no grande volante de inércia.',
      },
      {
        titulo: 'A mecanização das fábricas têxteis',
        explicacao:
          'Correias e eixos de transmissão transmitem a força rotativa para fileiras de teares mecânicos, substituindo a fiação manual e multiplicando a produção de tecidos.',
      },
      {
        titulo: 'Ferrovias e a integração mundial',
        explicacao:
          'Locomotivas a vapor sobre trilhos conectam minas de carvão, fábricas e portos em alta velocidade, acelerando a circulação de mercadorias e a urbanização fabril.',
      },
    ],
    curiosidade:
      'A unidade de medida de potência "cavalo-vapor" (horsepower / cv) foi criada por James Watt para convencer fazendeiros e donos de minas a trocarem cavalos por suas máquinas.',
    origem: 'local',
  },
  urbanizacao: {
    titulo: 'O Processo de Urbanização e Dinâmica Espacial',
    disciplina: 'geografia',
    tipoVisual: 'urbanizacao',
    simplificacoes: 'Panorama territorial esquemático contrapondo campo modernizado, eixos de transporte e malha metropolitana; dinâmica histórica de décadas sintetizada.',
    resumo:
      'Compreenda a transição do espaço rural para o espaço urbano: a mecanização das lavouras, o êxodo rural, a atração por empregos industriais e a conurbação.',
    etapas: [
      {
        titulo: 'Mecanização do campo e êxodo rural',
        explicacao:
          'A introdução de tratores e colheitadeiras mecanizadas substitui postos de trabalho rurais, impulsionando a migração maciça de famílias do interior.',
      },
      {
        titulo: 'Fluxo migratório e eixos viários',
        explicacao:
          'Rodovias e redes de ônibus conduzem contínuos fluxos populacionais em busca de novas oportunidades nos centros urbanos e industriais.',
      },
      {
        titulo: 'Crescimento urbano e infraestrutura',
        explicacao:
          'O adensamento populacional acelerado exige bairros residenciais, avenidas expressas, transporte coletivo, redes de água tratada e saneamento.',
      },
      {
        titulo: 'Conurbação e formação de metrópoles',
        explicacao:
          'A expansão das bordas urbanas une fisicamente cidades vizinhas em conurbação, consolidando regiões metropolitanas interconectadas.',
      },
    ],
    curiosidade:
      'No Brasil, a população urbana superou a rural pela primeira vez na década de 1970; hoje, mais de 84% dos brasileiros vivem em cidades.',
    origem: 'local',
  },
  rotacao_terra: {
    titulo: 'Movimento de Rotação da Terra e o Ciclo Dia e Noite',
    disciplina: 'ciencias',
    tipoVisual: 'rotacao_terra',
    simplificacoes: 'Raios solares paralelos idealizados e velocidade de giro ampliada para observação em segundos.',
    resumo:
      'Observe como o giro da Terra em torno do próprio eixo inclinado em 24 horas produz a alternância contínua entre dia e noite.',
    etapas: [
      {
        titulo: 'Incidência solar e a linha do terminador',
        explicacao:
          'A forma esférica da Terra faz com que o Sol ilumine metade do planeta (dia), enquanto a face oposta permanece na penumbra (noite).',
      },
      {
        titulo: 'O sentido de rotação de oeste para leste',
        explicacao:
          'A rotação de oeste para leste gera o movimento aparente do Sol no céu, nascendo no horizonte leste e se pondo no oeste.',
      },
      {
        titulo: 'O ciclo de 24 horas e os fusos horários',
        explicacao:
          'Uma volta completa de 360° dura 24 horas solares, dividindo o globo em 24 fusos horários de 15° de longitude cada.',
      },
    ],
    curiosidade:
      'Devido à velocidade de rotação, a Terra não é uma esfera perfeita, mas sim um esferoide oblato, ligeiramente achatado nos polos e abaulado no Equador.',
    origem: 'local',
  },
  sistema_respiratorio: {
    titulo: 'O Sistema Respiratório e a Hematose Pulmonar',
    disciplina: 'ciencias',
    tipoVisual: 'sistema_respiratorio',
    simplificacoes: 'Tronco anatômico e zoom alveolar com capilares esquematizados para clareza da difusão gasosa.',
    resumo:
      'Siga o trajeto do oxigênio e do dióxido de carbono: a mecânica do diafragma, a árvore brônquica e as trocas gasosas microscópicas nos alvéolos.',
    etapas: [
      {
        titulo: 'Inspiração e contração do diafragma',
        explicacao:
          'O músculo diafragma contrai e desce, a caixa torácica se expande e a diferença de pressão aspira o ar rico em oxigênio (O₂).',
      },
      {
        titulo: 'Condução pela traqueia e brônquios',
        explicacao:
          'O ar flui pela laringe, traqueia anelada e se ramifica pelos brônquios direito e esquerdo até os bronquíolos pulmonares.',
      },
      {
        titulo: 'Hematose nos alvéolos pulmonares',
        explicacao:
          'Nos milhões de alvéolos com membranas úmidas, o oxigênio passa para o sangue dos capilares e o gás carbônico (CO₂) é recolhido para ser expelido.',
      },
      {
        titulo: 'Expiração e relaxamento torácico',
        explicacao:
          'O diafragma relaxa e sobe, diminuindo o volume torácico e empurrando o ar rico em gás carbônico para fora do organismo.',
      },
    ],
    curiosidade:
      'Uma pessoa adulta em repouso respira em média cerca de 12 a 16 vezes por minuto, movimentando aproximadamente 6 litros de ar a cada 60 segundos.',
    origem: 'local',
  },
  hidreletrica: {
    titulo: 'Como funciona uma usina hidrelétrica',
    disciplina: 'ciencias',
    tipoVisual: 'hidreletrica',
    simplificacoes: 'Corte transversal esquemático da barragem, conduto forçado, turbina, gerador e subestação elétrica; velocidades e vazões sintetizadas para fins didáticos.',
    resumo:
      'Acompanhe a transformação da energia potencial da água represada em energia cinética no conduto, energia mecânica na turbina e eletricidade transmitida nas linhas de alta tensão.',
    etapas: [
      {
        titulo: 'Acúmulo de água no reservatório da represa',
        explicacao:
          'A barragem de concreto bloqueia o curso do rio e forma um grande reservatório de água, acumulando enorme energia potencial gravitacional.',
      },
      {
        titulo: 'Abertura das comportas e duto forçado',
        explicacao:
          'Ao abrir as comportas de controle, a água escoa sob altíssima pressão pelo conduto forçado em declive, convertendo energia potencial em intensa energia cinética.',
      },
      {
        titulo: 'Rotação da turbina e acionamento do gerador',
        explicacao:
          'O fluxo violento de água atinge as pás da turbina hidráulica, fazendo-a girar velozmente; o eixo mecânico conectado transmite essa rotação ao rotor do gerador.',
      },
      {
        titulo: 'Geração eletromagnética e transmissão em alta tensão',
        explicacao:
          'No interior do gerador, o movimento rotativo entre ímãs e bobinas de cobre produz corrente elétrica por indução, que é elevada por transformadores e enviada às cidades pelas linhas de transmissão.',
      },
    ],
    curiosidade:
      'A energia hidrelétrica é uma das principais matrizes elétricas limpas e renováveis do Brasil, sendo a Usina de Itaipu uma das maiores geradoras de energia limpa do planeta.',
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

const visualizerTabsContainer = document.getElementById('visualizer-tabs');
const visualizerTabButtons = [...document.querySelectorAll('.visualizer-tab')];
const visualizerPanels = {
  etapas: document.getElementById('visualizer-panel-etapas'),
  controles: document.getElementById('visualizer-panel-controles'),
  complementos: document.getElementById('visualizer-panel-complementos'),
};
const visualizerTabsIndicator = document.getElementById('visualizer-tabs-indicator');
const visualizerStepper = document.getElementById('visualizer-stepper');
const visualizerStepPrev = document.getElementById('visualizer-step-prev');
const visualizerStepNext = document.getElementById('visualizer-step-next');
const visualizerStatusDot = document.getElementById('visualizer-status-dot');
const visualizerStatusText = document.getElementById('visualizer-status-text');
const visualizerStatusStep = document.getElementById('visualizer-status-step');
const visualizerSpeedPills = document.getElementById('visualizer-speed-pills');

const updateVisualizerTabIndicator = () => {
  const activeBtn = document.querySelector('.visualizer-tab.is-active');
  if (!activeBtn || !visualizerTabsIndicator) return;
  const parent = activeBtn.parentElement;
  if (!parent) return;
  const parentRect = parent.getBoundingClientRect();
  const btnRect = activeBtn.getBoundingClientRect();
  if (btnRect.width === 0) return;
  const left = btnRect.left - parentRect.left;
  visualizerTabsIndicator.style.left = `${left}px`;
  visualizerTabsIndicator.style.width = `${btnRect.width}px`;
};

const setActiveVisualizerTab = (tabName) => {
  if (!visualizerPanels[tabName]) return;
  visualizerTabButtons.forEach((btn) => {
    const isTarget = btn.getAttribute('aria-controls') === `visualizer-panel-${tabName}`;
    btn.classList.toggle('is-active', isTarget);
    btn.setAttribute('aria-selected', String(isTarget));
    btn.tabIndex = isTarget ? 0 : -1;
  });

  Object.entries(visualizerPanels).forEach(([name, panel]) => {
    if (!panel) return;
    const isTarget = name === tabName;
    panel.hidden = !isTarget;
    panel.classList.toggle('is-active', isTarget);
  });

  updateVisualizerTabIndicator();
};

visualizerTabButtons.forEach((tabBtn, index) => {
  tabBtn.addEventListener('click', () => {
    const targetPanel = tabBtn.getAttribute('aria-controls').replace('visualizer-panel-', '');
    setActiveVisualizerTab(targetPanel);
  });

  tabBtn.addEventListener('keydown', (e) => {
    let targetIndex = -1;
    if (e.key === 'ArrowRight') {
      targetIndex = (index + 1) % visualizerTabButtons.length;
    } else if (e.key === 'ArrowLeft') {
      targetIndex = (index - 1 + visualizerTabButtons.length) % visualizerTabButtons.length;
    } else if (e.key === 'Home') {
      targetIndex = 0;
    } else if (e.key === 'End') {
      targetIndex = visualizerTabButtons.length - 1;
    }
    if (targetIndex >= 0) {
      e.preventDefault();
      visualizerTabButtons[targetIndex].focus();
      const targetPanel = visualizerTabButtons[targetIndex]
        .getAttribute('aria-controls')
        .replace('visualizer-panel-', '');
      setActiveVisualizerTab(targetPanel);
    }
  });
});

window.addEventListener('resize', updateVisualizerTabIndicator);

// Modo Tela Cheia Integrado com Sistema de Abas
const visualizerFullscreenBtn = document.getElementById('visualizer-fullscreen-btn');
const visualizerStageFullscreenBtn = document.getElementById('visualizer-stage-fullscreen-btn');
const visualizerControlFullscreen = document.getElementById('visualizer-control-fullscreen');
const visualizerMinimizeBtn = document.getElementById('visualizer-minimize-btn');
const fullscreenTitle = document.getElementById('fullscreen-title');
const fullscreenAreaBadge = document.getElementById('fullscreen-area-badge');

const enterVisualizerFullscreen = () => {
  if (!visualizerExperience) return;
  visualizerExperience.classList.add('is-fullscreen');
  document.body.classList.add('has-visualizer-fullscreen');

  if (fullscreenTitle && visualizerExperienceTitle) {
    fullscreenTitle.textContent = visualizerExperienceTitle.textContent || 'Animação em Tela Cheia';
  }
  if (fullscreenAreaBadge && visualizerArea) {
    fullscreenAreaBadge.textContent = visualizerArea.textContent || 'VisuLab';
  }

  // Tenta solicitar tela cheia nativa do navegador
  if (!document.fullscreenElement && visualizerExperience.requestFullscreen) {
    visualizerExperience.requestFullscreen().catch(() => {});
  }

  setTimeout(() => {
    updateVisualizerTabIndicator();
  }, 100);
};

const exitVisualizerFullscreen = () => {
  if (!visualizerExperience) return;
  visualizerExperience.classList.remove('is-fullscreen');
  document.body.classList.remove('has-visualizer-fullscreen');

  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }

  setTimeout(() => {
    updateVisualizerTabIndicator();
  }, 100);
};

if (visualizerFullscreenBtn) {
  visualizerFullscreenBtn.addEventListener('click', enterVisualizerFullscreen);
}

if (visualizerStageFullscreenBtn) {
  visualizerStageFullscreenBtn.addEventListener('click', () => {
    if (visualizerExperience?.classList.contains('is-fullscreen')) {
      exitVisualizerFullscreen();
    } else {
      enterVisualizerFullscreen();
    }
  });
}

if (visualizerControlFullscreen) {
  visualizerControlFullscreen.addEventListener('click', enterVisualizerFullscreen);
}

if (visualizerMinimizeBtn) {
  visualizerMinimizeBtn.addEventListener('click', exitVisualizerFullscreen);
}

// Atalho da tecla Esc para minimizar
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && visualizerExperience?.classList.contains('is-fullscreen')) {
    exitVisualizerFullscreen();
  }
});

// Sincronização ao sair da tela cheia nativa pelo browser
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && visualizerExperience?.classList.contains('is-fullscreen')) {
    exitVisualizerFullscreen();
  }
});

const renderVisualizerStepper = () => {
  if (!visualizerStepper || !activeVisualExperience) return;
  visualizerStepper.replaceChildren();
  const steps = activeVisualExperience.etapas;
  if (!steps || steps.length <= 1) {
    visualizerStepper.hidden = true;
    return;
  }
  visualizerStepper.hidden = false;
  steps.forEach((step, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'visualizer-stepper__item';
    btn.dataset.stepperIndex = String(idx);
    btn.setAttribute('aria-label', `Ir para a etapa ${idx + 1}: ${step.titulo}`);

    const badge = document.createElement('span');
    badge.className = 'visualizer-stepper__badge';
    badge.textContent = String(idx + 1);

    const title = document.createElement('span');
    title.className = 'visualizer-stepper__title';
    title.textContent = step.titulo;

    btn.append(badge, title);
    btn.addEventListener('click', () => {
      stopVisualizerPlayback();
      engine.seek(idx);
    });
    visualizerStepper.append(btn);
  });
};

const syncSpeedPills = () => {
  if (!visualizerSpeedPills) return;
  const currentVal = visualizerSpeed.value;
  visualizerSpeedPills.querySelectorAll('.visualizer-speed-pill').forEach((pill) => {
    const isSelected = pill.dataset.speed === currentVal;
    pill.classList.toggle('is-active', isSelected);
    pill.setAttribute('aria-checked', String(isSelected));
  });
};

if (visualizerSpeedPills) {
  visualizerSpeedPills.querySelectorAll('.visualizer-speed-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const speedVal = pill.dataset.speed;
      if (visualizerSpeed.value !== speedVal) {
        visualizerSpeed.value = speedVal;
        visualizerSpeed.dispatchEvent(new Event('change'));
      }
    });
  });
}

const updatePlaybackStatus = () => {
  if (!activeVisualExperience) return;
  const stepCount = activeVisualExperience.etapas.length;
  const isLast = activeVisualStep === stepCount - 1;
  if (visualizerStatusStep) {
    visualizerStatusStep.textContent = `Etapa ${activeVisualStep + 1} de ${stepCount}`;
  }
  if (visualizerStatusDot && visualizerStatusText) {
    visualizerStatusDot.classList.remove('is-playing', 'is-paused', 'is-ended');
    if (visualizerIsPlaying) {
      visualizerStatusDot.classList.add('is-playing');
      const speedVal = visualizerSpeed.value || '1';
      visualizerStatusText.textContent = `Reproduzindo animação a ${speedVal.replace('.', ',')}×...`;
    } else if (isLast) {
      visualizerStatusDot.classList.add('is-ended');
      visualizerStatusText.textContent = 'Experiência concluída';
    } else {
      visualizerStatusDot.classList.add('is-paused');
      visualizerStatusText.textContent = `Pausado na etapa ${activeVisualStep + 1}`;
    }
  }
};

const visualizerTemplates = {
  terremoto: 'visual-template-placas',
  fotossintese: 'visual-template-fotossintese',
  brasil_colonial: 'visual-template-linhaTempo',
  vulcao: 'visual-template-vulcao',
  agua: 'visual-template-agua',
  eclipse: 'visual-template-eclipse',
  celula: 'visual-template-celula',
  translacao_terra: 'visual-template-translacao',
  revolucao_industrial: 'visual-template-revolucao-industrial',
  urbanizacao: 'visual-template-urbanizacao',
  rotacao_terra: 'visual-template-rotacao',
  sistema_respiratorio: 'visual-template-respiratorio',
  hidreletrica: 'visual-template-hidreletrica',
  'hydroelectric-plant': 'visual-template-hidreletrica',
  'hydroelectric': 'visual-template-hidreletrica',
  'usina_hidreletrica': 'visual-template-hidreletrica',
  'earth-translation': 'visual-template-translacao',
  'industrial-revolution': 'visual-template-revolucao-industrial',
  'urbanization': 'visual-template-urbanizacao',
  'earth-rotation': 'visual-template-rotacao',
  'respiratory-system': 'visual-template-respiratorio',
  'volcanic-eruption': 'visual-template-vulcao',
  'photosynthesis': 'visual-template-fotossintese',
  'water-cycle': 'visual-template-agua',
  'solar-eclipse': 'visual-template-eclipse',
  'tectonic-plates': 'visual-template-placas',
  'cell-structure': 'visual-template-celula',
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
  vulcao: [
    ['#ff3819', 'magma e lava'],
    ['#ffaa00', 'pressão e calor'],
    ['#6c5b65', 'cinzas e gases'],
    ['#543d32', 'camadas rochosas'],
  ],
  agua: [
    ['#1976d2', 'água líquida'],
    ['#ffa000', 'calor solar'],
    ['#90caf9', 'vapor e nuvens'],
    ['#388e3c', 'infiltração no solo'],
  ],
  eclipse: [
    ['#fbc02d', 'radiação solar'],
    ['#101826', 'umbra (total)'],
    ['#455a64', 'penumbra (parcial)'],
    ['#0277bd', 'superfície da Terra'],
  ],
  celula: [
    ['#10b981', 'membrana plasmática'],
    ['#7c3aed', 'núcleo e DNA'],
    ['#f59e0b', 'mitocôndria (ATP)'],
    ['#ec4899', 'complexo de Golgi'],
  ],
  translacao_terra: [
    ['#ffa000', 'Sol (radiação central)'],
    ['#1e88e5', 'Terra e órbita elíptica'],
    ['#43a047', 'eixo inclinado (23,5°)'],
    ['#38bdf8', 'estações do ano (365 dias)'],
  ],
  revolucao_industrial: [
    ['#ff5722', 'carvão e caldeira a vapor'],
    ['#78909c', 'máquina e volante de Watt'],
    ['#b0bec5', 'teares fabris mecanizados'],
    ['#d32f2f', 'ferrovia e locomotiva'],
  ],
  urbanizacao: [
    ['#43a047', 'zona rural mecanizada'],
    ['#f57c00', 'êxodo rural e transporte'],
    ['#1976d2', 'indústrias e serviços'],
    ['#5c6bc0', 'expansão metropolitana'],
  ],
  rotacao_terra: [
    ['#fbc02d', 'luz solar (dia)'],
    ['#101826', 'sombra (noite)'],
    ['#0288d1', 'eixo de rotação (24h)'],
  ],
  sistema_respiratorio: [
    ['#0288d1', 'oxigênio (O₂ na inspiração)'],
    ['#e53935', 'gás carbônico (CO₂ na expiração)'],
    ['#fb8c00', 'diafragma e mecânica'],
    ['#8e24aa', 'hematose nos alvéolos'],
  ],
  hidreletrica: [
    ['#0288d1', 'água e conduto forçado'],
    ['#78909c', 'barragem e comportas'],
    ['#f59e0b', 'turbina e gerador'],
    ['#fbbf24', 'linhas de alta tensão'],
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
  vulcao: [
    'Magma sob alta temperatura e pressão se acumula na câmara magmática profunda.',
    'Gases voláteis se expandem e geram forte pressão lateral contra as paredes rochosas.',
    'O magma sobe em fluxo contínuo pela chaminé vulcânica central em direção ao topo.',
    'A pressão rompe o tampão rochoso da cratera com detonação e ejeção de piroclastos.',
    'Lava escorre pelas encostas enquanto uma densa pluma de cinzas se eleva na atmosfera.',
  ],
  agua: [
    'O calor solar favorece a evaporação das águas superficiais do oceano em vapor.',
    'O vapor resfria em altitude e condensa em gotículas, formando nuvens espessas.',
    'Gotículas colidem, ganham massa e precipitam em chuva sobre o relevo e florestas.',
    'A água da chuva infiltra no solo poroso, abastecendo aquíferos e o lençol freático.',
    'O escoamento por rios devolve a água ao mar, mantendo o ciclo contínuo.',
  ],
  eclipse: [
    'A Lua posiciona-se em alinhamento entre o Sol e a Terra durante a fase de Lua Nova.',
    'A Lua projeta cones de sombra no espaço: a umbra interna total e a penumbra externa parcial.',
    'Observadores na zona de umbra presenciam o eclipse total; na penumbra, o eclipse parcial.',
  ],
  celula: [
    'A membrana plasmática seletiva controla a entrada de nutrientes e água no citoplasma.',
    'O citoplasma coloidal oferece suporte estrutural e circulação contínua às organelas.',
    'O núcleo celular abriga o DNA e comanda a transcrição genética e as atividades celulares.',
    'Mitocôndrias consomem glicose e oxigênio para sintetizar moléculas de energia ATP.',
    'O complexo de Golgi processa e secreta vesículas com produtos metabólicos úteis.',
  ],
  translacao_terra: [
    'A Terra percorre uma órbita elíptica ao redor do Sol no centro do sistema.',
    'O eixo terrestre permanece inclinado a 23,5° em relação ao plano orbital durante todo o trajeto.',
    'A inclinação do eixo altera o ângulo de incidência da luz solar, gerando os solstícios, equinócios e as quatro estações.',
    'A Terra completa o ciclo de translação em 365 dias e 6 horas, definindo o ano solar.',
  ],
  revolucao_industrial: [
    'A queima de carvão mineral aquece a caldeira de ferro e produz vapor de alta pressão.',
    'O pistão impulsionado pelo vapor aciona o volante mecânico, gerando trabalho contínuo.',
    'A força motriz é transmitida a fileiras de teares mecânicos na fábrica têxtil.',
    'Locomotivas a vapor aceleram o transporte de matérias-primas e a urbanização fabril.',
  ],
  urbanizacao: [
    'A mecanização da agricultura moderniza as colheitas e reduz a demanda por mão de obra no campo.',
    'O fluxo migratório do êxodo rural desloca famílias pelas rodovias em direção às cidades.',
    'A concentração de indústrias, comércio e serviços amplia a oferta de trabalho nos centros urbanos.',
    'O crescimento horizontal e vertical integra cidades vizinhas em conurbações e metrópoles.',
  ],
  rotacao_terra: [
    'O Sol ilumina uma metade da Terra enquanto a face oposta permanece na escuridão da noite.',
    'A Terra gira de oeste para leste em torno de seu eixo inclinado em 23,5°.',
    'A rotação completa em 24 horas regula a alternância contínua entre dia e noite.',
  ],
  sistema_respiratorio: [
    'O diafragma contrai e desce, expandindo a caixa torácica e puxando ar rico em oxigênio.',
    'O ar flui pela traqueia e brônquios até alcançar os alvéolos pulmonares.',
    'Ocorre a hematose: o oxigênio difunde-se para as hemácias e o gás carbônico passa para os alvéolos.',
    'O diafragma relaxa e sobe, expelindo o gás carbônico na expiração.',
  ],
  hidreletrica: [
    'A represa de concreto retém as águas do rio em um grande lago de reservatório.',
    'As comportas abrem e direcionam a água com alta pressão pelo duto forçado inclinado.',
    'A força hidráulica faz a turbina e o rotor do gerador girarem em alta velocidade mecânica.',
    'A indução eletromagnética gera corrente elétrica, enviada à subestação e linhas de alta tensão.',
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
  renderer: (stage, experience, index) => {
    if (experience.revisao) return renderReviewed(stage, experience, index);
    if (!localVisualExperiences[experience.tipoVisual]) return renderScene(stage, experience, index);
    if (!stage.querySelector('svg')) mountVisualizerScene(experience);
    return renderPremium(stage, experience, index);
  },
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

let activeNetworkController = null;
let visualizerRequestId = 0;
let pendingQuestion = '';
const VISUALIZER_FUNCTION_URL = '/api/visualizar';

const hasMarkup = (value) => /[<>]/.test(value);
const characterCount = (value) => [...value].length;

const requestVisualExperience = async (question) => {
  const controller = new AbortController();
  activeNetworkController = controller;
  let didTimeout = false;
  const timeout = window.setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, 28000);

  try {
    const response = await fetch(VISUALIZER_FUNCTION_URL, {
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
      error.code = payload?.codigo
        || (response.status === 404 ? 'FUNCTION_NOT_FOUND' : 'INVALID_FUNCTION_RESPONSE');
      error.status = response.status;
      throw error;
    }

    if (payload?.esclarecimento) {
      const error = new Error(payload.esclarecimento); error.code = 'CLARIFICATION'; throw error;
    }

    if (payload?.codigo) {
      const error = new Error(payload?.mensagem || 'O provedor de IA não conseguiu gerar a animação.');
      error.code = payload.codigo;
      error.status = response.status;
      throw error;
    }

    let rawExperience = payload?.experiencia;
    if (typeof rawExperience === 'string') {
      try {
        rawExperience = JSON.parse(rawExperience);
      } catch {
        // Ignora erro de JSON aninhado
      }
    }
    const exp = rawExperience || (payload && (Array.isArray(payload.cenas) || Array.isArray(payload.etapas)) ? payload : null);

    if (exp && (Array.isArray(exp.cenas) || Array.isArray(exp.etapas))) {
      const result = validateVisualExperience({ ...exp, origem: 'ia', revisao: '', fontes: [] });
      if (!result.fallback || localVisualExperiences[result.tipoVisual]) {
        return result;
      }
    }

    return createLocalFallback(question);
  } catch (error) {
    if (error.name === 'AbortError') {
      if (didTimeout) {
        const timeoutError = new Error('A criação demorou mais que o esperado. Tente novamente.');
        timeoutError.code = 'TIMEOUT';
        throw timeoutError;
      }
      const abortError = new Error('Operação cancelada.');
      abortError.name = 'AbortError';
      abortError.code = 'ABORTED';
      throw abortError;
    }
    if (!error.code && error instanceof TypeError) {
      error.code = 'NETWORK_ERROR';
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
    if (activeNetworkController === controller) {
      activeNetworkController = null;
    }
  }
};

const createLocalFallback = (question) => {
  const norm = String(question || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  if (/\b(terremoto|sismo|placas?\s+tectonica)/.test(norm)) {
    return { ...localVisualExperiences.terremoto, origem: 'local', fallback: true };
  }
  if (/\b(fotossintese|clorofila|planta|alimento.*planta|como.*planta.*produz)/.test(norm)) {
    return { ...localVisualExperiences.fotossintese, origem: 'local', fallback: true };
  }
  if (/\b(brasil colonial|periodo colonial|capitania)/.test(norm)) {
    return { ...localVisualExperiences.brasil_colonial, origem: 'local', fallback: true };
  }
  if (/\b(vulcao|vulcoes|erupcao|magma|lava)/.test(norm)) {
    return { ...localVisualExperiences.vulcao, origem: 'local', fallback: true };
  }
  if (/\b(agua|chuva|evapora|condensa|hidrolog)/.test(norm)) {
    return { ...reviewedExperiences.agua, origem: 'local', fallback: true };
  }
  if (/\b(eclipse|lua|sol.*terra)/.test(norm)) {
    return { ...reviewedExperiences.eclipse, origem: 'local', fallback: true };
  }
  if (/\b(celula|organela|citoplasma|membrana|mitocondria)/.test(norm)) {
    return { ...localVisualExperiences.celula, origem: 'local', fallback: true };
  }
  if (/\b(translacao|movimento de translacao|translacao da terra|orbita da terra|estacoes do ano|terra.*sol)/.test(norm)) {
    return { ...localVisualExperiences.translacao_terra, origem: 'local', fallback: true };
  }
  if (/\b(revolucao industrial|primeira revolucao industrial|maquinas? a vapor|industria|tear mec)/.test(norm)) {
    return { ...localVisualExperiences.revolucao_industrial, origem: 'local', fallback: true };
  }
  if (/\b(urbanizacao|processo de urbanizacao|crescimento urbano|exodo rural|metropole|conurbacao)/.test(norm)) {
    return { ...localVisualExperiences.urbanizacao, origem: 'local', fallback: true };
  }
  if (/\b(rotacao|movimento de rotacao|rotacao da terra|dia e noite|fusos? horari)/.test(norm)) {
    return { ...localVisualExperiences.rotacao_terra, origem: 'local', fallback: true };
  }
  if (/\b(respirat|pulmao|pulmoes|trocas gasosas|hematose|alveolo)/.test(norm)) {
    return { ...localVisualExperiences.sistema_respiratorio, origem: 'local', fallback: true };
  }
  if (/\b(hidreletrica|usina hidreletrica|represa.*turbina|geracao.*energia.*agua|represa.*comporta)/.test(norm)) {
    return { ...localVisualExperiences.hidreletrica, origem: 'local', fallback: true };
  }

  // Coração e circulação sanguínea
  if (/\b(coracao|circulac|sangue|vasos?\s+sanguin|arteria|veia|cardiac)/.test(norm)) {
    return validateVisualExperience({
      versao: "1.0",
      disciplina: "ciencias",
      titulo: "O Sistema Circulatório e o Coração",
      resumo: "O coração bombeia o sangue oxigenado para todo o organismo e conduz o sangue venoso aos pulmões para renovação.",
      tipoDeCena: "ciclo",
      simplificacoes: "Representação didática dos circuitos sistêmico e pulmonar com fluxo contínuo.",
      cenas: [
        {
          titulo: "Batimento Cardíaco e Bombeamento",
          objetivo: "Demonstrar a contração muscular que impulsiona o fluxo sanguíneo.",
          explicacao: "O miocárdio contrai ritmicamente (sístole), ejetando sangue oxigenado através da artéria aorta.",
          duracaoMs: 4500,
          elementos: [
            { id: "coracao_centro", tipo: "icone", icone: "coracao", rotulo: "Coração (Miocárdio)", x: 45, y: 50, largura: 22, altura: 22, cor: "vermelho" },
            { id: "pulmao_apoio", tipo: "icone", icone: "pulmao", rotulo: "Pulmões (Troca Gasosa)", x: 20, y: 35, largura: 18, altura: 18, cor: "claro" },
            { id: "corpo_tecidos", tipo: "retangulo", rotulo: "Células e Tecidos", x: 75, y: 50, largura: 20, altura: 16, cor: "azul" },
            { id: "fluxo_arterial", tipo: "seta", rotulo: "Sangue Arterial (Rico em O₂)", x: 48, y: 44, largura: 18, altura: 6, cor: "vermelho", destinoX: 72, destinoY: 48 },
          ],
          acoes: [
            { alvo: "coracao_centro", tipo: "pulsar", duracaoMs: 1500, atrasoMs: 200 },
            { alvo: "fluxo_arterial", tipo: "fluir", duracaoMs: 2500, atrasoMs: 400 },
            { alvo: "corpo_tecidos", tipo: "destacar", duracaoMs: 1800, atrasoMs: 1000 },
          ],
          cenario: "laboratorio",
        },
        {
          titulo: "Trocas Metabólicas nos Capilares",
          objetivo: "Exibir a entrega de oxigênio e a coleta de gás carbônico.",
          explicacao: "Nos tecidos celulares, o oxigênio e nutrientes são entregues às células, e o CO₂ é recolhido pelo sangue.",
          duracaoMs: 4500,
          elementos: [
            { id: "celula_consumo", tipo: "icone", icone: "celula", rotulo: "Tecido Celular", x: 50, y: 48, largura: 20, altura: 20, cor: "verde" },
            { id: "part_oxigenio", tipo: "icone", icone: "oxigenio", rotulo: "Oxigênio Entregue (O₂)", x: 30, y: 36, largura: 16, altura: 16, cor: "claro" },
            { id: "part_co2", tipo: "icone", icone: "gas_carbonico", rotulo: "Gás Carbônico Retirado", x: 70, y: 62, largura: 16, altura: 16, cor: "roxo" },
            { id: "seta_difusao", tipo: "seta", rotulo: "Troca Capilar", x: 34, y: 44, largura: 18, altura: 6, cor: "azul", destinoX: 66, destinoY: 54 },
          ],
          acoes: [
            { alvo: "part_oxigenio", tipo: "mover", paraX: 48, paraY: 45, duracaoMs: 2200, atrasoMs: 200 },
            { alvo: "celula_consumo", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 800 },
            { alvo: "seta_difusao", tipo: "fluir", duracaoMs: 2000, atrasoMs: 400 },
          ],
          cenario: "laboratorio",
        },
        {
          titulo: "Retorno Venoso e Hematose Pulmonar",
          objetivo: "Mostrar o retorno do sangue ao coração e sua reoxigenação nos pulmões.",
          explicacao: "Pelas veias cavas, o sangue retorna ao lado direito do coração e é impulsionado aos pulmões para reiniciar o ciclo.",
          duracaoMs: 4500,
          elementos: [
            { id: "coracao_centro", tipo: "icone", icone: "coracao", rotulo: "Coração", x: 50, y: 55, largura: 20, altura: 20, cor: "vermelho" },
            { id: "pulmao_topo", tipo: "icone", icone: "pulmao", rotulo: "Pulmões (Hematose)", x: 50, y: 22, largura: 18, altura: 18, cor: "claro" },
            { id: "fluxo_venoso", tipo: "seta", rotulo: "Sangue Venoso", x: 26, y: 55, largura: 16, altura: 6, cor: "azul", destinoX: 46, destinoY: 55 },
            { id: "seta_pulmonar", tipo: "seta", rotulo: "Circulação Pulmonar", x: 50, y: 48, largura: 12, altura: 6, cor: "vermelho", destinoX: 50, destinoY: 28 },
          ],
          acoes: [
            { alvo: "fluxo_venoso", tipo: "fluir", duracaoMs: 2200, atrasoMs: 200 },
            { alvo: "coracao_centro", tipo: "pulsar", duracaoMs: 1600, atrasoMs: 500 },
            { alvo: "seta_pulmonar", tipo: "fluir", duracaoMs: 2200, atrasoMs: 800 },
            { alvo: "pulmao_topo", tipo: "destacar", duracaoMs: 1800, atrasoMs: 1200 },
          ],
          cenario: "laboratorio",
        }
      ],
      conclusao: "O sistema cardiovascular garante o fornecimento ininterrupto de energia e oxigênio para todas as funções vitais.",
      curiosidade: "Em repouso, o coração humano bate cerca de 100 mil vezes por dia e bombeia cerca de 5 litros de sangue por minuto.",
      origem: "local",
      fallback: true,
    });
  }

  // Foguetes e propulsão espacial
  if (/\b(foguete|propulsao|lancamento|nave.*espacial|astronauta|estacao.*espacial)/.test(norm)) {
    return validateVisualExperience({
      versao: "1.0",
      disciplina: "ciencias",
      titulo: "Propulsão de Foguetes e Ação e Reação",
      resumo: "Pela 3ª Lei de Newton, a ejeção de gases em alta velocidade para baixo gera um empuxo ascendente que vence a gravidade.",
      tipoDeCena: "movimento",
      simplificacoes: "Fases de ascensão atmosférica simplificadas em três etapas fundamentais.",
      cenas: [
        {
          titulo: "Combustão e Ignição",
          objetivo: "Demonstrar a queima de combustível nos motores principais.",
          explicacao: "A mistura de propelente e comburente na câmara de combustão atinge alta temperatura e pressão.",
          duracaoMs: 4500,
          elementos: [
            { id: "foguete_corpo", tipo: "retangulo", rotulo: "Estrutura do Foguete", x: 50, y: 40, largura: 14, altura: 28, cor: "branco" },
            { id: "chama_propulsao", tipo: "icone", icone: "vulcao", rotulo: "Combustão e Empuxo", x: 50, y: 70, largura: 16, altura: 16, cor: "amarelo" },
            { id: "base_terra", tipo: "icone", icone: "cidade", rotulo: "Plataforma de Lançamento", x: 22, y: 75, largura: 16, altura: 16, cor: "escuro" },
          ],
          acoes: [
            { alvo: "chama_propulsao", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 200 },
            { alvo: "foguete_corpo", tipo: "vibrar", duracaoMs: 1400, atrasoMs: 400 },
          ],
          cenario: "natureza",
        },
        {
          titulo: "Ação, Reação e Ascensão",
          objetivo: "Exibir o empuxo resultante que supera a força do peso gravitacional.",
          explicacao: "Os gases ejetados para baixo com enorme velocidade impulsionam o veículo para cima em aceleração contínua.",
          duracaoMs: 4500,
          elementos: [
            { id: "foguete_corpo", tipo: "retangulo", rotulo: "Foguete em Ascensão", x: 50, y: 35, largura: 14, altura: 28, cor: "branco" },
            { id: "seta_subida", tipo: "seta", rotulo: "Empuxo Ascendente", x: 50, y: 55, largura: 14, altura: 6, cor: "amarelo", destinoX: 50, destinoY: 15 },
            { id: "nuvem_gases", tipo: "icone", icone: "nuvem", rotulo: "Gases Expelidos", x: 50, y: 75, largura: 20, altura: 16, cor: "claro" },
          ],
          acoes: [
            { alvo: "foguete_corpo", tipo: "mover", paraX: 50, paraY: 20, duracaoMs: 3200, atrasoMs: 300 },
            { alvo: "seta_subida", tipo: "fluir", duracaoMs: 2500, atrasoMs: 200 },
            { alvo: "nuvem_gases", tipo: "crescer", duracaoMs: 2000, atrasoMs: 500 },
          ],
          cenario: "natureza",
        },
        {
          titulo: "Inserção Orbital no Espaço",
          objetivo: "Demonstrar a entrada em órbita fora da resistência atmosférica.",
          explicacao: "Ao atingir a velocidade orbital necessária, o foguete desliga os estágios e entra em queda livre estável ao redor da Terra.",
          duracaoMs: 4500,
          elementos: [
            { id: "planeta_terra", tipo: "icone", icone: "planeta", rotulo: "Terra (Gravidade)", x: 25, y: 50, largura: 22, altura: 22, cor: "azul" },
            { id: "satelite_orbita", tipo: "retangulo", rotulo: "Carga Útil em Órbita", x: 75, y: 35, largura: 16, altura: 12, cor: "branco" },
            { id: "trajetoria_orbita", tipo: "seta", rotulo: "Trajetória Orbital", x: 42, y: 35, largura: 22, altura: 6, cor: "claro", destinoX: 72, destinoY: 35 },
          ],
          acoes: [
            { alvo: "satelite_orbita", tipo: "mover", paraX: 75, paraY: 65, duracaoMs: 3000, atrasoMs: 400 },
            { alvo: "trajetoria_orbita", tipo: "fluir", duracaoMs: 2600, atrasoMs: 200 },
            { alvo: "planeta_terra", tipo: "pulsar", duracaoMs: 2000, atrasoMs: 600 },
          ],
          cenario: "espaco",
        }
      ],
      conclusao: "A exploração espacial é possibilitada pela física clássica combinada à engenharia de materiais de alta precisão.",
      curiosidade: "Para escapar da atração direta da superfície terrestre e entrar em órbita baixa, é necessária uma velocidade de cerca de 28.000 km/h.",
      origem: "local",
      fallback: true,
    });
  }

  // Átomo e Estrutura da Matéria
  if (/\b(atomo|atomos|eletron|proton|neutron|estrutura.*atomica|tabela.*periodica)/.test(norm)) {
    return validateVisualExperience({
      versao: "1.0",
      disciplina: "ciencias",
      titulo: "Estrutura Atômica e Eletrosfera",
      resumo: "O átomo é formado por um núcleo denso com prótons e nêutrons, cercado por elétrons em constante movimento na eletrosfera.",
      tipoDeCena: "microscopico",
      simplificacoes: "Modelo atômico com níveis energéticos ilustrados para visualização pedagógica.",
      cenas: [
        {
          titulo: "O Núcleo Atômico Central",
          objetivo: "Identificar a massa nuclear concentrada de prótons e nêutrons.",
          explicacao: "O núcleo ocupa um volume minúsculo no centro do átomo, concentrando praticamente toda a sua massa.",
          duracaoMs: 4500,
          elementos: [
            { id: "nucleo_denso", tipo: "icone", icone: "atomo", rotulo: "Núcleo (Prótons e Nêutrons)", x: 50, y: 50, largura: 24, altura: 24, cor: "vermelho" },
            { id: "forca_forte", tipo: "particula", rotulo: "Força Nuclear Forte", x: 42, y: 44, largura: 14, altura: 14, cor: "amarelo" },
            { id: "raio_nuclear", tipo: "circulo", rotulo: "Zona de Densidade", x: 50, y: 50, largura: 20, altura: 20, cor: "roxo" },
          ],
          acoes: [
            { alvo: "nucleo_denso", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 200 },
            { alvo: "forca_forte", tipo: "girar", duracaoMs: 2200, atrasoMs: 400 },
          ],
          cenario: "laboratorio",
        },
        {
          titulo: "A Eletrosfera e Níveis de Energia",
          objetivo: "Demonstrar a órbita e distribuição dos elétrons ao redor do núcleo.",
          explicacao: "Os elétrons de carga negativa orbitam o núcleo em diferentes camadas e níveis quânticos de energia.",
          duracaoMs: 4500,
          elementos: [
            { id: "nucleo_centro", tipo: "icone", icone: "atomo", rotulo: "Núcleo Central (+)", x: 50, y: 50, largura: 20, altura: 20, cor: "vermelho" },
            { id: "eletron_1", tipo: "particula", rotulo: "Elétron Camada K (-)", x: 28, y: 35, largura: 14, altura: 14, cor: "azul" },
            { id: "eletron_2", tipo: "particula", rotulo: "Elétron Camada L (-)", x: 72, y: 65, largura: 14, altura: 14, cor: "azul" },
            { id: "orbita_seta", tipo: "seta", rotulo: "Movimento Quântico", x: 32, y: 35, largura: 16, altura: 6, cor: "claro", destinoX: 68, destinoY: 35 },
          ],
          acoes: [
            { alvo: "eletron_1", tipo: "mover", paraX: 45, paraY: 25, duracaoMs: 2400, atrasoMs: 200 },
            { alvo: "eletron_2", tipo: "mover", paraX: 55, paraY: 75, duracaoMs: 2400, atrasoMs: 200 },
            { alvo: "orbita_seta", tipo: "fluir", duracaoMs: 2200, atrasoMs: 400 },
            { alvo: "nucleo_centro", tipo: "destacar", duracaoMs: 1600, atrasoMs: 600 },
          ],
          cenario: "laboratorio",
        },
        {
          titulo: "Estabilidade e Ligações Químicas",
          objetivo: "Exibir o compartilhamento de elétrons na formação de moléculas.",
          explicacao: "A interação entre as eletrosferas permite a troca e compartilhamento de elétrons, formando moléculas estáveis.",
          duracaoMs: 4500,
          elementos: [
            { id: "atomo_a", tipo: "icone", icone: "atomo", rotulo: "Átomo A", x: 35, y: 50, largura: 20, altura: 20, cor: "azul" },
            { id: "atomo_b", tipo: "icone", icone: "atomo", rotulo: "Átomo B", x: 65, y: 50, largura: 20, altura: 20, cor: "verde" },
            { id: "ligacao_covalente", tipo: "seta", rotulo: "Ligação Química (Pares Eletrônicos)", x: 38, y: 50, largura: 18, altura: 6, cor: "amarelo", destinoX: 62, destinoY: 50 },
          ],
          acoes: [
            { alvo: "atomo_a", tipo: "mover", paraX: 40, paraY: 50, duracaoMs: 2000, atrasoMs: 200 },
            { alvo: "atomo_b", tipo: "mover", paraX: 60, paraY: 50, duracaoMs: 2000, atrasoMs: 200 },
            { alvo: "ligacao_covalente", tipo: "fluir", duracaoMs: 2200, atrasoMs: 600 },
          ],
          cenario: "laboratorio",
        }
      ],
      conclusao: "Toda a matéria do universo, desde os oceanos até as estrelas, é estruturada pela combinação de partículas atômicas.",
      curiosidade: "Se um átomo tivesse o tamanho de um estádio de futebol, seu núcleo seria do tamanho de uma pequena bola de gude no centro.",
      origem: "local",
      fallback: true,
    });
  }

  // Cérebro, neurônios e sistema nervoso
  if (/\b(cerebro|neuronio|neuronios|sinapse|sistema.*nervoso|impulso.*nervoso)/.test(norm)) {
    return validateVisualExperience({
      versao: "1.0",
      disciplina: "ciencias",
      titulo: "Comunicação Neural e Sinapses",
      resumo: "Os neurônios transmitem informações no sistema nervoso através de impulsos elétricos e mediadores químicos nas sinapses.",
      tipoDeCena: "sistema_biologico",
      simplificacoes: "Mecanismo da sinapse química esquematizado em três etapas dinâmicas.",
      cenas: [
        {
          titulo: "Estímulo e Potencial de Ação",
          objetivo: "Demonstrar a geração do impulso elétrico no axônio.",
          explicacao: "A despolarização da membrana do neurônio propaga um sinal bioelétrico veloz ao longo do axônio.",
          duracaoMs: 4500,
          elementos: [
            { id: "neuronio_corpo", tipo: "icone", icone: "cerebro", rotulo: "Corpo do Neurônio", x: 25, y: 50, largura: 22, altura: 22, cor: "roxo" },
            { id: "potencial_acao", tipo: "particula", rotulo: "Impulso Elétrico", x: 45, y: 50, largura: 16, altura: 16, cor: "amarelo" },
            { id: "terminal_axonio", tipo: "retangulo", rotulo: "Terminal Axônico", x: 75, y: 50, largura: 20, altura: 18, cor: "azul" },
            { id: "seta_impulso", tipo: "seta", rotulo: "Sentido do Estímulo", x: 32, y: 50, largura: 18, altura: 6, cor: "amarelo", destinoX: 68, destinoY: 50 },
          ],
          acoes: [
            { alvo: "potencial_acao", tipo: "mover", paraX: 70, paraY: 50, duracaoMs: 2500, atrasoMs: 200 },
            { alvo: "seta_impulso", tipo: "fluir", duracaoMs: 2200, atrasoMs: 400 },
            { alvo: "neuronio_corpo", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 100 },
          ],
          cenario: "laboratorio",
        },
        {
          titulo: "Liberação de Neurotransmissores",
          objetivo: "Exibir as vesículas sinápticas liberando sinais químicos na fenda.",
          explicacao: "O impulso elétrico estimula as vesículas a fundirem-se na membrana, liberando neurotransmissores na fenda sináptica.",
          duracaoMs: 4500,
          elementos: [
            { id: "neuronio_pre", tipo: "retangulo", rotulo: "Membrana Pré-Sináptica", x: 30, y: 50, largura: 18, altura: 30, cor: "azul" },
            { id: "neurotransmissor", tipo: "particula", rotulo: "Vesículas Químicas", x: 50, y: 50, largura: 14, altura: 14, cor: "verde" },
            { id: "neuronio_pos", tipo: "retangulo", rotulo: "Membrana Pós-Sináptica", x: 70, y: 50, largura: 18, altura: 30, cor: "roxo" },
            { id: "seta_fenda", tipo: "seta", rotulo: "Difusão na Fenda", x: 38, y: 50, largura: 16, altura: 6, cor: "verde", destinoX: 62, destinoY: 50 },
          ],
          acoes: [
            { alvo: "neurotransmissor", tipo: "mover", paraX: 65, paraY: 50, duracaoMs: 2400, atrasoMs: 300 },
            { alvo: "seta_fenda", tipo: "fluir", duracaoMs: 2200, atrasoMs: 400 },
            { alvo: "neuronio_pos", tipo: "destacar", duracaoMs: 1800, atrasoMs: 1200 },
          ],
          cenario: "laboratorio",
        },
        {
          titulo: "Receptores e Resposta Celular",
          objetivo: "Demonstrar a recepção do sinal e geração de nova resposta.",
          explicacao: "Receptores específicos captam os neurotransmissores, desencadeando a continuidade do sinal no neurônio receptor.",
          duracaoMs: 4500,
          elementos: [
            { id: "rede_cerebral", tipo: "icone", icone: "cerebro", rotulo: "Rede Neural Integrada", x: 50, y: 45, largura: 22, altura: 22, cor: "roxo" },
            { id: "sinal_continuo", tipo: "particula", rotulo: "Sinal Propagado", x: 72, y: 45, largura: 14, altura: 14, cor: "amarelo" },
            { id: "resposta_motora", tipo: "seta", rotulo: "Resposta / Pensamento", x: 55, y: 45, largura: 16, altura: 6, cor: "claro", destinoX: 82, destinoY: 45 },
          ],
          acoes: [
            { alvo: "rede_cerebral", tipo: "pulsar", duracaoMs: 2000, atrasoMs: 200 },
            { alvo: "resposta_motora", tipo: "fluir", duracaoMs: 2200, atrasoMs: 500 },
            { alvo: "sinal_continuo", tipo: "mover", paraX: 85, paraY: 45, duracaoMs: 2500, atrasoMs: 600 },
          ],
          cenario: "laboratorio",
        }
      ],
      conclusao: "A velocidade e complexidade das conexões neurais formam a base biológica da aprendizagem, emoções e memória.",
      curiosidade: "O cérebro humano possui cerca de 86 bilhões de neurônios, capazes de formar mais de 100 trilhões de conexões sinápticas.",
      origem: "local",
      fallback: true,
    });
  }

  // Gravidade e atração de massas
  if (/\b(gravidade|gravitacional|newton|atracao.*massa|buraco.*negro|relatividade)/.test(norm)) {
    return validateVisualExperience({
      versao: "1.0",
      disciplina: "ciencias",
      titulo: "A Gravidade e o Movimento dos Corpos",
      resumo: "A gravidade é a força atrativa universal gerada pela massa dos corpos celestes que determina as órbitas no universo.",
      tipoDeCena: "movimento",
      simplificacoes: "Deformação espacial e atração gravitacional com escalas facilitadas para estudo.",
      cenas: [
        {
          titulo: "Massa e Campo Gravitacional",
          objetivo: "Demonstrar como a presença de matéria atrai outros corpos no espaço.",
          explicacao: "Um corpo de grande massa curva o espaço ao seu redor e exerce força atrativa em todas as direções.",
          duracaoMs: 4500,
          elementos: [
            { id: "sol_central", tipo: "icone", icone: "sol", rotulo: "Corpo Central de Grande Massa", x: 40, y: 50, largura: 24, altura: 24, cor: "amarelo" },
            { id: "corpo_menor", tipo: "icone", icone: "planeta", rotulo: "Corpo Atraído", x: 75, y: 50, largura: 16, altura: 16, cor: "azul" },
            { id: "seta_atracao", tipo: "seta", rotulo: "Força Gravitacional", x: 70, y: 50, largura: 18, altura: 6, cor: "claro", destinoX: 48, destinoY: 50 },
          ],
          acoes: [
            { alvo: "sol_central", tipo: "pulsar", duracaoMs: 2000, atrasoMs: 200 },
            { alvo: "seta_atracao", tipo: "fluir", duracaoMs: 2400, atrasoMs: 400 },
            { alvo: "corpo_menor", tipo: "mover", paraX: 62, paraY: 50, duracaoMs: 2600, atrasoMs: 500 },
          ],
          cenario: "espaco",
        },
        {
          titulo: "Equilíbrio Orbital e Velocidade",
          objetivo: "Exibir o equilíbrio entre a velocidade de avanço e a atração gravitacional.",
          explicacao: "A combinação da velocidade tangencial com a força gravitacional resulta em uma órbita estável.",
          duracaoMs: 4500,
          elementos: [
            { id: "massa_centro", tipo: "icone", icone: "sol", rotulo: "Astro Central", x: 50, y: 50, largura: 22, altura: 22, cor: "amarelo" },
            { id: "planeta_orbita", tipo: "icone", icone: "planeta", rotulo: "Planeta em Órbita", x: 80, y: 50, largura: 16, altura: 16, cor: "azul" },
            { id: "trajetoria_curva", tipo: "seta", rotulo: "Curvatura Orbital", x: 78, y: 44, largura: 18, altura: 6, cor: "claro", destinoX: 55, destinoY: 25 },
          ],
          acoes: [
            { alvo: "planeta_orbita", tipo: "mover", paraX: 50, paraY: 25, duracaoMs: 3000, atrasoMs: 200 },
            { alvo: "trajetoria_curva", tipo: "fluir", duracaoMs: 2400, atrasoMs: 300 },
            { alvo: "massa_centro", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 500 },
          ],
          cenario: "espaco",
        },
        {
          titulo: "Marés e Interação Mútua",
          objetivo: "Demonstrar a gravidade atuando sobre oceanos e corpos vizinhos.",
          explicacao: "A atração mútua gera efeitos tangíveis como as marés oceânicas e a estabilização de luas e anéis.",
          duracaoMs: 4500,
          elementos: [
            { id: "terra_globo", tipo: "icone", icone: "planeta", rotulo: "Terra e Oceanos", x: 35, y: 50, largura: 22, altura: 22, cor: "azul" },
            { id: "lua_satelite", tipo: "icone", icone: "lua", rotulo: "Lua (Marés)", x: 72, y: 50, largura: 16, altura: 16, cor: "claro" },
            { id: "fluxo_mare", tipo: "seta", rotulo: "Atração Gravitacional das Marés", x: 42, y: 50, largura: 18, altura: 6, cor: "azul", destinoX: 66, destinoY: 50 },
          ],
          acoes: [
            { alvo: "fluxo_mare", tipo: "fluir", duracaoMs: 2200, atrasoMs: 300 },
            { alvo: "lua_satelite", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 500 },
            { alvo: "terra_globo", tipo: "destacar", duracaoMs: 2000, atrasoMs: 800 },
          ],
          cenario: "espaco",
        }
      ],
      conclusao: "A gravidade é o arquiteto do cosmos, regendo o nascimento de estrelas, galáxias e a trajetória de cada planeta.",
      curiosidade: "Na órbita da Estação Espacial Internacional, a gravidade da Terra ainda é de cerca de 90% da superfície; a flutuação ocorre porque os astronautas estão em constante queda livre.",
      origem: "local",
      fallback: true,
    });
  }

  // Vacina e Sistema Imunológico
  if (/\b(vacina|vacinac|anticorpo|imunizac|imunidade|sistema.*imun|patogeno)/.test(norm)) {
    return validateVisualExperience({
      versao: "1.0",
      disciplina: "ciencias",
      titulo: "Como a Vacina Ensina o Sistema Imunológico",
      resumo: "A vacina apresenta ao corpo uma versão atenuada ou fragmentada do patógeno, estimulando a criação de anticorpos e memória imune sem causar a doença.",
      tipoDeCena: "sistema_biologico",
      simplificacoes: "Mecanismo de reconhecimento de antígenos e produção de anticorpos ilustrado didaticamente.",
      cenas: [
        {
          titulo: "Apresentação do Antígeno",
          objetivo: "Demonstrar a entrada do antígeno inativado no organismo.",
          explicacao: "A vacina introduz antígenos seguros que servem de modelo para o sistema de defesa identificar o invasor.",
          duracaoMs: 4500,
          elementos: [
            { id: "seringa_vacina", tipo: "icone", icone: "vacina", rotulo: "Vacina (Dose Segura)", x: 26, y: 50, largura: 22, altura: 22, cor: "azul" },
            { id: "antigenos_dose", tipo: "particula", rotulo: "Antígenos Inativados", x: 48, y: 50, largura: 16, altura: 16, cor: "amarelo" },
            { id: "celula_apresentadora", tipo: "icone", icone: "celula", rotulo: "Célula Sentinela (Macrófago)", x: 74, y: 50, largura: 22, altura: 22, cor: "verde" },
            { id: "seta_entrada", tipo: "seta", rotulo: "Inoculação", x: 34, y: 50, largura: 16, altura: 6, cor: "azul", destinoX: 66, destinoY: 50 },
          ],
          acoes: [
            { alvo: "seringa_vacina", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 200 },
            { alvo: "antigenos_dose", tipo: "mover", paraX: 68, paraY: 50, duracaoMs: 2600, atrasoMs: 400 },
            { alvo: "seta_entrada", tipo: "fluir", duracaoMs: 2200, atrasoMs: 300 },
            { alvo: "celula_apresentadora", tipo: "destacar", duracaoMs: 1600, atrasoMs: 1000 },
          ],
          cenario: "laboratorio",
        },
        {
          titulo: "Produção de Anticorpos Específicos",
          objetivo: "Exibir os linfócitos gerando anticorpos que se encaixam nos antígenos.",
          explicacao: "Linfócitos B ativados multiplicam-se e secretam milhões de anticorpos com encaixe molecular perfeito.",
          duracaoMs: 4500,
          elementos: [
            { id: "linfocito_fabrica", tipo: "icone", icone: "celula", rotulo: "Linfócito B Ativado", x: 30, y: 48, largura: 22, altura: 22, cor: "verde" },
            { id: "anticorpos_fluxo", tipo: "particula", rotulo: "Anticorpos Protetores", x: 52, y: 35, largura: 16, altura: 16, cor: "claro" },
            { id: "alvo_antigeno", tipo: "icone", icone: "virus", rotulo: "Antígeno Bloqueado", x: 74, y: 48, largura: 20, altura: 20, cor: "vermelho" },
            { id: "seta_neutralizacao", tipo: "seta", rotulo: "Encaixe Molecular", x: 38, y: 48, largura: 18, altura: 6, cor: "amarelo", destinoX: 66, destinoY: 48 },
          ],
          acoes: [
            { alvo: "linfocito_fabrica", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 200 },
            { alvo: "anticorpos_fluxo", tipo: "mover", paraX: 70, paraY: 44, duracaoMs: 2400, atrasoMs: 400 },
            { alvo: "seta_neutralizacao", tipo: "fluir", duracaoMs: 2200, atrasoMs: 500 },
            { alvo: "alvo_antigeno", tipo: "destacar", duracaoMs: 1600, atrasoMs: 1100 },
          ],
          cenario: "laboratorio",
        },
        {
          titulo: "Memória Imunológica de Longo Prazo",
          objetivo: "Demonstrar a proteção duradoura contra futuras infecções reais.",
          explicacao: "Células de memória permanecem vigilantes; se o vírus ativo entrar no corpo, será neutralizado antes de causar sintomas.",
          duracaoMs: 4500,
          elementos: [
            { id: "celula_memoria", tipo: "icone", icone: "celula", rotulo: "Célula de Memória Imune", x: 35, y: 50, largura: 22, altura: 22, cor: "verde" },
            { id: "escudo_protecao", tipo: "circulo", rotulo: "Escudo Imunológico", x: 50, y: 50, largura: 24, altura: 24, cor: "azul" },
            { id: "virus_bloqueado", tipo: "icone", icone: "virus", rotulo: "Patógeno Neutralizado", x: 72, y: 50, largura: 18, altura: 18, cor: "vermelho" },
            { id: "seta_defesa", tipo: "seta", rotulo: "Resposta Rápida", x: 42, y: 50, largura: 16, altura: 6, cor: "verde", destinoX: 64, destinoY: 50 },
          ],
          acoes: [
            { alvo: "escudo_protecao", tipo: "crescer", duracaoMs: 2000, atrasoMs: 200 },
            { alvo: "celula_memoria", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 500 },
            { alvo: "seta_defesa", tipo: "fluir", duracaoMs: 2200, atrasoMs: 300 },
            { alvo: "virus_bloqueado", tipo: "desaparecer", duracaoMs: 2000, atrasoMs: 1200 },
          ],
          cenario: "laboratorio",
        }
      ],
      conclusao: "As vacinas são uma das maiores conquistas da saúde pública, erradicando doenças graves e protegendo populações inteiras.",
      curiosidade: "A primeira vacina foi criada por Edward Jenner em 1796 para combater a varíola, usando o vírus da varíola bovina (vacca em latim, daí o nome vacina).",
      origem: "local",
      fallback: true,
    });
  }

  // Por que o pão cresce? Fermentação biológica
  if (/\b(pao|pao.*cresce|fermentac|levedura|fermento|farinha.*levedura)/.test(norm)) {
    return validateVisualExperience({
      versao: "1.0",
      disciplina: "ciencias",
      titulo: "Por que o Pão Cresce: A Fermentação Biológica",
      resumo: "Leveduras microscópicas consomem os açúcares da massa e liberam gás carbônico, que infla a rede de glúten e deixa o pão fofo.",
      tipoDeCena: "ciclo",
      simplificacoes: "Liberação de bolhas de CO₂ e expansão do glúten ampliadas para estudo.",
      cenas: [
        {
          titulo: "Nutrição e Ativação da Levedura",
          objetivo: "Exibir o fungo unicelular consumindo glicose na massa.",
          explicacao: "Ao misturar farinha, água e fermento, as leveduras (Saccharomyces cerevisiae) absorvem nutrientes e iniciam o metabolismo.",
          duracaoMs: 4500,
          elementos: [
            { id: "levedura_fungo", tipo: "icone", icone: "bacteria", rotulo: "Levedura (Fungo)", x: 30, y: 50, largura: 22, altura: 22, cor: "amarelo" },
            { id: "nutriente_glicose", tipo: "particula", rotulo: "Açúcares / Glicose", x: 50, y: 40, largura: 16, altura: 16, cor: "claro" },
            { id: "rede_gluten", tipo: "retangulo", rotulo: "Massa e Glúten", x: 72, y: 50, largura: 20, altura: 22, cor: "verde" },
            { id: "seta_nutricao", tipo: "seta", rotulo: "Consumo Metabólico", x: 38, y: 50, largura: 16, altura: 6, cor: "amarelo", destinoX: 66, destinoY: 50 },
          ],
          acoes: [
            { alvo: "levedura_fungo", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 200 },
            { alvo: "nutriente_glicose", tipo: "mover", paraX: 36, paraY: 48, duracaoMs: 2200, atrasoMs: 300 },
            { alvo: "seta_nutricao", tipo: "fluir", duracaoMs: 2200, atrasoMs: 400 },
            { alvo: "rede_gluten", tipo: "destacar", duracaoMs: 1600, atrasoMs: 900 },
          ],
          cenario: "natureza",
        },
        {
          titulo: "Liberação de Gás Carbônico (CO₂)",
          objetivo: "Demonstrar a geração de bolhas gasosas presas no glúten elástico.",
          explicacao: "Na fermentação anaeróbica, a levedura produz gás carbônico e etanol. O gás tenta subir, mas fica retido na massa elástica.",
          duracaoMs: 4500,
          elementos: [
            { id: "bolha_co2_1", tipo: "icone", icone: "gas_carbonico", rotulo: "Bolha de CO₂", x: 36, y: 56, largura: 18, altura: 18, cor: "azul" },
            { id: "bolha_co2_2", tipo: "icone", icone: "gas_carbonico", rotulo: "Gás em Expansão", x: 62, y: 44, largura: 20, altura: 20, cor: "azul" },
            { id: "massa_elastica", tipo: "retangulo", rotulo: "Rede Elástica de Glúten", x: 50, y: 50, largura: 24, altura: 24, cor: "amarelo" },
            { id: "seta_expansao", tipo: "seta", rotulo: "Pressão Interna do Gás", x: 42, y: 50, largura: 14, altura: 6, cor: "claro", destinoX: 58, destinoY: 44 },
          ],
          acoes: [
            { alvo: "bolha_co2_1", tipo: "crescer", duracaoMs: 2200, atrasoMs: 200 },
            { alvo: "bolha_co2_2", tipo: "mover", paraX: 66, paraY: 34, duracaoMs: 2600, atrasoMs: 400 },
            { alvo: "seta_expansao", tipo: "fluir", duracaoMs: 2200, atrasoMs: 300 },
            { alvo: "massa_elastica", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 700 },
          ],
          cenario: "natureza",
        },
        {
          titulo: "Cozimento e Textura Aerada",
          objetivo: "Exibir a fixação da estrutura fofa pelo calor do forno.",
          explicacao: "O calor do forno dilata ainda mais as bolsas de gás, evapora o álcool e coagula o glúten, consolidando o miolo macio.",
          duracaoMs: 4500,
          elementos: [
            { id: "pao_assado", tipo: "retangulo", rotulo: "Pão Aerado e Macio", x: 50, y: 48, largura: 26, altura: 20, cor: "amarelo" },
            { id: "calor_forno", tipo: "icone", icone: "fogo", rotulo: "Calor do Forno", x: 22, y: 65, largura: 18, altura: 18, cor: "vermelho" },
            { id: "vapor_saindo", tipo: "particula", rotulo: "Vapor e Aroma", x: 74, y: 32, largura: 16, altura: 16, cor: "claro" },
            { id: "seta_calor", tipo: "seta", rotulo: "Fixação Estrutural", x: 30, y: 56, largura: 16, altura: 6, cor: "vermelho", destinoX: 44, destinoY: 50 },
          ],
          acoes: [
            { alvo: "pao_assado", tipo: "crescer", duracaoMs: 2400, atrasoMs: 200 },
            { alvo: "calor_forno", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 300 },
            { alvo: "vapor_saindo", tipo: "mover", paraX: 80, paraY: 18, duracaoMs: 2500, atrasoMs: 400 },
            { alvo: "seta_calor", tipo: "fluir", duracaoMs: 2000, atrasoMs: 500 },
          ],
          cenario: "natureza",
        }
      ],
      conclusao: "A panificação é uma ciência biológica e química milenar praticada pela humanidade há mais de 10.000 anos.",
      curiosidade: "Um único grama de fermento biológico fresco pode conter até 10 bilhões de células de levedura vivas.",
      origem: "local",
      fallback: true,
    });
  }

  // Como a internet transmite uma mensagem?
  if (/\b(internet|mensagem.*internet|pacotes.*dados|fibra.*otica|como.*internet.*funciona|roteador)/.test(norm)) {
    return validateVisualExperience({
      versao: "1.0",
      disciplina: "ciencias",
      titulo: "Como a Internet Transmite uma Mensagem",
      resumo: "Sua mensagem é fragmentada em pacotes numéricos com endereços IP, viaja por pulsos de luz na fibra ótica e é remontada no destino.",
      tipoDeCena: "fluxo",
      simplificacoes: "Protocolo TCP/IP esquematizado em três etapas dinâmicas.",
      cenas: [
        {
          titulo: "Fragmentação em Pacotes de Dados",
          objetivo: "Demonstrar a mensagem sendo dividida em pequenos blocos numerados.",
          explicacao: "O computador emissor divide o texto ou imagem em pacotes IP com cabeçalho contendo origem, destino e ordem de remontagem.",
          duracaoMs: 4500,
          elementos: [
            { id: "pc_emissor", tipo: "icone", icone: "computador", rotulo: "Dispositivo Emissor", x: 26, y: 50, largura: 22, altura: 22, cor: "azul" },
            { id: "pacote_1", tipo: "particula", rotulo: "Pacote 01 (IP Origem)", x: 46, y: 44, largura: 14, altura: 14, cor: "amarelo" },
            { id: "pacote_2", tipo: "particula", rotulo: "Pacote 02 (IP Destino)", x: 56, y: 54, largura: 14, altura: 14, cor: "claro" },
            { id: "roteador_local", tipo: "icone", icone: "engrenagem", rotulo: "Roteador Local (Gateway)", x: 74, y: 50, largura: 20, altura: 20, cor: "verde" },
            { id: "seta_envio", tipo: "seta", rotulo: "Divisão Digital", x: 34, y: 50, largura: 18, altura: 6, cor: "azul", destinoX: 66, destinoY: 50 },
          ],
          acoes: [
            { alvo: "pc_emissor", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 200 },
            { alvo: "pacote_1", tipo: "mover", paraX: 68, paraY: 46, duracaoMs: 2200, atrasoMs: 300 },
            { alvo: "pacote_2", tipo: "mover", paraX: 70, paraY: 52, duracaoMs: 2400, atrasoMs: 500 },
            { alvo: "seta_envio", tipo: "fluir", duracaoMs: 2200, atrasoMs: 200 },
            { alvo: "roteador_local", tipo: "destacar", duracaoMs: 1600, atrasoMs: 900 },
          ],
          cenario: "laboratorio",
        },
        {
          titulo: "Viagem por Pulsos de Luz na Fibra Ótica",
          objetivo: "Exibir o tráfego veloz por cabos submarinos e redes globais.",
          explicacao: "Os pacotes viajam quase à velocidade da luz através de reflexão total interna em cabos de fibra ótica de vidro.",
          duracaoMs: 4500,
          elementos: [
            { id: "fibra_cabo", tipo: "linha", rotulo: "Cabo de Fibra Ótica Submarino", x: 50, y: 50, largura: 24, altura: 8, cor: "azul", destinoX: 80, destinoY: 50 },
            { id: "pulso_luz", tipo: "icone", icone: "raio", rotulo: "Pulso Fotônico (Laser)", x: 45, y: 50, largura: 16, altura: 16, cor: "amarelo" },
            { id: "globo_rede", tipo: "icone", icone: "globo", rotulo: "Infraestrutura Global", x: 50, y: 22, largura: 20, altura: 20, cor: "claro" },
            { id: "seta_luz", tipo: "seta", rotulo: "Reflexão Total Interna", x: 25, y: 50, largura: 20, altura: 6, cor: "amarelo", destinoX: 75, destinoY: 50 },
          ],
          acoes: [
            { alvo: "pulso_luz", tipo: "mover", paraX: 72, paraY: 50, duracaoMs: 2400, atrasoMs: 200 },
            { alvo: "seta_luz", tipo: "fluir", duracaoMs: 2000, atrasoMs: 300 },
            { alvo: "globo_rede", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 600 },
          ],
          cenario: "laboratorio",
        },
        {
          titulo: "Reconstrução e Apresentação no Destino",
          objetivo: "Demonstrar a recomposição precisa da mensagem na tela receptora.",
          explicacao: "O receptor confere a soma de verificação (checksum) dos pacotes, ordena a sequência e exibe a mensagem idêntica ao usuário.",
          duracaoMs: 4500,
          elementos: [
            { id: "servidor_destino", tipo: "retangulo", rotulo: "Servidor Receptor", x: 28, y: 50, largura: 20, altura: 24, cor: "azul" },
            { id: "pc_receptor", tipo: "icone", icone: "computador", rotulo: "Destinatário (Mensagem Entregue)", x: 72, y: 50, largura: 22, altura: 22, cor: "verde" },
            { id: "pacote_integrado", tipo: "particula", rotulo: "Verificação Concluída (ACK)", x: 50, y: 50, largura: 16, altura: 16, cor: "amarelo" },
            { id: "seta_entrega", tipo: "seta", rotulo: "Entrega Instantânea", x: 36, y: 50, largura: 18, altura: 6, cor: "verde", destinoX: 64, destinoY: 50 },
          ],
          acoes: [
            { alvo: "pacote_integrado", tipo: "mover", paraX: 66, paraY: 50, duracaoMs: 2000, atrasoMs: 200 },
            { alvo: "seta_entrega", tipo: "fluir", duracaoMs: 2200, atrasoMs: 400 },
            { alvo: "pc_receptor", tipo: "destacar", duracaoMs: 1800, atrasoMs: 800 },
            { alvo: "servidor_destino", tipo: "pulsar", duracaoMs: 1600, atrasoMs: 300 },
          ],
          cenario: "laboratorio",
        }
      ],
      conclusao: "A interoperabilidade dos protocolos da internet permite conectar bilhões de dispositivos em frações de segundo pelo mundo.",
      curiosidade: "Mais de 99% do tráfego internacional de dados passa por cerca de 500 cabos de fibra ótica repousados no fundo dos oceanos.",
      origem: "local",
      fallback: true,
    });
  }

  // Erosão de um rio e relevo
  if (/\b(erosao|erosao.*rio|sedimento|curso.*rio|meandro|desgaste.*rocha)/.test(norm)) {
    return validateVisualExperience({
      versao: "1.0",
      disciplina: "geografia",
      titulo: "A Erosão Fluvial e a Modelagem do Relevo",
      resumo: "A força mecânica da água desgasta o leito rochoso, transporta partículas e deposita sedimentos, esculpindo vales e planícies.",
      tipoDeCena: "movimento",
      simplificacoes: "Escala temporal geológica representada em três etapas fundamentais.",
      cenas: [
        {
          titulo: "Desgaste Mecânico na Cabeceira",
          objetivo: "Demonstrar a água da nascente desprendendo fragmentos de rocha.",
          explicacao: "Em terrenos inclinados, a alta velocidade da correnteza causa atrito com o leito, fragmentando rochas e solo.",
          duracaoMs: 4500,
          elementos: [
            { id: "nascente_chuva", tipo: "icone", icone: "nuvem", rotulo: "Chuva e Cabeceira", x: 25, y: 30, largura: 20, altura: 18, cor: "azul" },
            { id: "leito_rocha", tipo: "icone", icone: "montanha", rotulo: "Leito Rochoso Inclinado", x: 45, y: 55, largura: 22, altura: 20, cor: "escuro" },
            { id: "corrente_forte", tipo: "seta", rotulo: "Ação Hidráulica", x: 28, y: 44, largura: 20, altura: 6, cor: "claro", destinoX: 62, destinoY: 58 },
          ],
          acoes: [
            { alvo: "nascente_chuva", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 200 },
            { alvo: "corrente_forte", tipo: "fluir", duracaoMs: 2200, atrasoMs: 300 },
            { alvo: "leito_rocha", tipo: "vibrar", duracaoMs: 1400, atrasoMs: 600 },
          ],
          cenario: "natureza",
        },
        {
          titulo: "Transporte Contínuo de Sedimentos",
          objetivo: "Exibir o carreamento de areia, cascalho e silte pela correnteza.",
          explicacao: "A água carrega partículas por suspensão, saltação e rolamento, alargando as margens do rio.",
          duracaoMs: 4500,
          elementos: [
            { id: "rio_curso", tipo: "icone", icone: "agua", rotulo: "Corso Fluvial", x: 30, y: 50, largura: 22, altura: 22, cor: "azul" },
            { id: "sedimento_areia", tipo: "particula", rotulo: "Sedimentos em Trânsito", x: 50, y: 50, largura: 16, altura: 16, cor: "amarelo" },
            { id: "margem_desgaste", tipo: "retangulo", rotulo: "Margem Desgastada", x: 74, y: 50, largura: 20, altura: 18, cor: "verde" },
            { id: "seta_transporte", tipo: "seta", rotulo: "Transporte de Carga", x: 38, y: 50, largura: 18, altura: 6, cor: "azul", destinoX: 68, destinoY: 50 },
          ],
          acoes: [
            { alvo: "sedimento_areia", tipo: "mover", paraX: 66, paraY: 50, duracaoMs: 2600, atrasoMs: 200 },
            { alvo: "seta_transporte", tipo: "fluir", duracaoMs: 2200, atrasoMs: 300 },
            { alvo: "rio_curso", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 500 },
          ],
          cenario: "natureza",
        },
        {
          titulo: "Sedimentação e Formação de Vales e Deltas",
          objetivo: "Demonstrar a deposição de material nas áreas baixas e foz.",
          explicacao: "Ao atingir áreas planas, a velocidade diminui e os sedimentos se assentam, criando solos férteis e meandros.",
          duracaoMs: 4500,
          elementos: [
            { id: "planicie_aluvial", tipo: "retangulo", rotulo: "Planície Aluvial / Delta", x: 50, y: 62, largura: 26, altura: 16, cor: "verde" },
            { id: "rio_foz", tipo: "icone", icone: "agua", rotulo: "Foz / Meandros", x: 30, y: 44, largura: 20, altura: 20, cor: "azul" },
            { id: "vegetacao_ciliar", tipo: "icone", icone: "arvore", rotulo: "Mata Ciliar e Proteção", x: 72, y: 40, largura: 20, altura: 20, cor: "verde" },
            { id: "seta_deposicao", tipo: "seta", rotulo: "Assentamento de Sedimentos", x: 38, y: 48, largura: 18, altura: 6, cor: "amarelo", destinoX: 62, destinoY: 56 },
          ],
          acoes: [
            { alvo: "planicie_aluvial", tipo: "crescer", duracaoMs: 2200, atrasoMs: 200 },
            { alvo: "seta_deposicao", tipo: "fluir", duracaoMs: 2200, atrasoMs: 400 },
            { alvo: "vegetacao_ciliar", tipo: "destacar", duracaoMs: 1800, atrasoMs: 800 },
          ],
          cenario: "natureza",
        }
      ],
      conclusao: "A erosão fluvial é um dos principais agentes externos que esculpem vales, desfiladeiros e cânions ao longo de milhões de anos.",
      curiosidade: "O Grand Canyon, nos Estados Unidos, foi esculpido pacientemente pelo Rio Colorado durante mais de 5 a 6 milhões de anos.",
      origem: "local",
      fallback: true,
    });
  }

  // Invenção da Imprensa por Gutenberg
  if (/\b(imprensa|gutenberg|tipos.*moveis|invencao.*livro|prensa)/.test(norm)) {
    return validateVisualExperience({
      versao: "1.0",
      disciplina: "historia",
      titulo: "A Invenção da Imprensa por Gutenberg",
      resumo: "A criação dos tipos móveis metálicos e da prensa mecânica permitiu reproduzir livros com velocidade, democratizando o conhecimento.",
      tipoDeCena: "linha_do_tempo",
      simplificacoes: "Fases da prensa de tipos móveis do século XV esquematizadas didaticamente.",
      cenas: [
        {
          titulo: "Fundição e Montagem dos Tipos Móveis",
          objetivo: "Demonstrar as letras individuais de chumbo organizadas na forma.",
          explicacao: "Gutenberg criou moldes de liga de metal durável para cada letra e símbolo, permitindo recombiná-los infinitamente.",
          duracaoMs: 4500,
          elementos: [
            { id: "tipos_metal", tipo: "retangulo", rotulo: "Tipos Móveis de Chumbo", x: 32, y: 50, largura: 20, altura: 20, cor: "escuro" },
            { id: "tinta_oleosa", tipo: "particula", rotulo: "Tinta Oleosa Especial", x: 52, y: 40, largura: 16, altura: 16, cor: "escuro" },
            { id: "livro_origem", tipo: "icone", icone: "livro", rotulo: "Página em Composição", x: 74, y: 50, largura: 22, altura: 22, cor: "amarelo" },
            { id: "seta_composicao", tipo: "seta", rotulo: "Alinhamento Linha a Linha", x: 40, y: 50, largura: 16, altura: 6, cor: "amarelo", destinoX: 66, destinoY: 50 },
          ],
          acoes: [
            { alvo: "tipos_metal", tipo: "destacar", duracaoMs: 1800, atrasoMs: 200 },
            { alvo: "tinta_oleosa", tipo: "mover", paraX: 68, paraY: 46, duracaoMs: 2200, atrasoMs: 400 },
            { alvo: "seta_composicao", tipo: "fluir", duracaoMs: 2200, atrasoMs: 300 },
          ],
          cenario: "historico",
        },
        {
          titulo: "Prensagem Mecânica Uniforme",
          objetivo: "Exibir o parafuso de rosca aplicando pressão uniforme sobre a folha.",
          explicacao: "Adaptando prensas de uva da época, uma alavanca giratória pressionava a folha de papel umedecida contra a forma entintada.",
          duracaoMs: 4500,
          elementos: [
            { id: "prensa_madeira", tipo: "icone", icone: "engrenagem", rotulo: "Prensa de Rosca Manual", x: 45, y: 44, largura: 24, altura: 24, cor: "amarelo" },
            { id: "folha_papel", tipo: "retangulo", rotulo: "Papel de Trapos", x: 50, y: 68, largura: 22, altura: 12, cor: "branco" },
            { id: "pressao_seta", tipo: "seta", rotulo: "Pressão Vertical Constante", x: 45, y: 35, largura: 12, altura: 6, cor: "vermelho", destinoX: 45, destinoY: 60 },
          ],
          acoes: [
            { alvo: "prensa_madeira", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 200 },
            { alvo: "pressao_seta", tipo: "fluir", duracaoMs: 2200, atrasoMs: 300 },
            { alvo: "folha_papel", tipo: "destacar", duracaoMs: 1600, atrasoMs: 800 },
          ],
          cenario: "historico",
        },
        {
          titulo: "Multiplicação e Difusão Cultural",
          objetivo: "Demonstrar a circulação de milhares de livros pelas cidades europeias.",
          explicacao: "O que antes levava um ano de trabalho de um monge copista agora podia ser impresso em milhares de exemplares idênticos.",
          duracaoMs: 4500,
          elementos: [
            { id: "livro_impresso", tipo: "icone", icone: "livro", rotulo: "Bíblia de Gutenberg", x: 30, y: 50, largura: 22, altura: 22, cor: "amarelo" },
            { id: "cidade_cultural", tipo: "icone", icone: "cidade", rotulo: "Universidades e Cidades", x: 74, y: 50, largura: 22, altura: 22, cor: "azul" },
            { id: "difusao_seta", tipo: "seta", rotulo: "Difusão Científica e Literária", x: 40, y: 50, largura: 18, altura: 6, cor: "verde", destinoX: 66, destinoY: 50 },
          ],
          acoes: [
            { alvo: "livro_impresso", tipo: "crescer", duracaoMs: 2000, atrasoMs: 200 },
            { alvo: "difusao_seta", tipo: "fluir", duracaoMs: 2200, atrasoMs: 300 },
            { alvo: "cidade_cultural", tipo: "destacar", duracaoMs: 1800, atrasoMs: 800 },
          ],
          cenario: "historico",
        }
      ],
      conclusao: "A imprensa de tipos móveis impulsionou o Renascimento, a Reforma e o nascimento da ciência moderna no Ocidente.",
      curiosidade: "A Bíblia impressa por Gutenberg por volta de 1455 levou cerca de três anos para ter 180 cópias produzidas; na época, monges levariam séculos para copiar igual quantia à mão.",
      origem: "local",
      fallback: true,
    });
  }

  // Função Quadrática e Parábola
  if (/\b(funcao.*quadratica|parabola|segundo.*grau|equacao.*quadratica|vertice.*parabola)/.test(norm)) {
    return validateVisualExperience({
      versao: "1.0",
      disciplina: "ciencias",
      titulo: "A Função Quadrática e a Curva da Parábola",
      resumo: "Expressa por f(x) = ax² + bx + c, a função gera uma parábola cujo vértice determina pontos máximos ou mínimos na natureza e na física.",
      tipoDeCena: "movimento",
      simplificacoes: "Plano cartesiano e coordenadas esquematizados para visualização intuitiva.",
      cenas: [
        {
          titulo: "A Lei de Formação e Concavidade",
          objetivo: "Demonstrar o coeficiente 'a' definindo a abertura e concavidade da curva.",
          explicacao: "Se a > 0, os ramos apontam para cima e há um ponto de mínimo; se a < 0, a concavidade é para baixo com ponto de máximo.",
          duracaoMs: 4500,
          elementos: [
            { id: "eixo_cartesiano", tipo: "retangulo", rotulo: "Eixos Cartesianos (X e Y)", x: 50, y: 50, largura: 26, altura: 24, cor: "escuro" },
            { id: "curva_parabola", tipo: "onda", rotulo: "Parábola f(x) = ax² + bx + c", x: 50, y: 50, largura: 22, altura: 18, cor: "azul" },
            { id: "coeficiente_a", tipo: "particula", rotulo: "Coeficiente a > 0", x: 50, y: 28, largura: 16, altura: 16, cor: "amarelo" },
          ],
          acoes: [
            { alvo: "curva_parabola", tipo: "crescer", duracaoMs: 2200, atrasoMs: 200 },
            { alvo: "coeficiente_a", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 500 },
          ],
          cenario: "laboratorio",
        },
        {
          titulo: "O Vértice: Ponto Extremo de Otimização",
          objetivo: "Exibir o vértice V = (-b/2a, -Δ/4a) onde o valor atinge seu pico ou vale.",
          explicacao: "O vértice representa a altura máxima de um projétil ou o lucro máximo de uma empresa, sendo o eixo de simetria da parábola.",
          duracaoMs: 4500,
          elementos: [
            { id: "curva_base", tipo: "onda", rotulo: "Trajetória da Curva", x: 50, y: 50, largura: 22, altura: 18, cor: "azul" },
            { id: "vertice_ponto", tipo: "circulo", rotulo: "Vértice V(-b/2a, -Δ/4a)", x: 50, y: 64, largura: 16, altura: 16, cor: "vermelho" },
            { id: "seta_simetria", tipo: "seta", rotulo: "Eixo de Simetria x = -b/2a", x: 50, y: 25, largura: 6, altura: 22, cor: "amarelo", destinoX: 50, destinoY: 62 },
          ],
          acoes: [
            { alvo: "vertice_ponto", tipo: "destacar", duracaoMs: 2000, atrasoMs: 200 },
            { alvo: "seta_simetria", tipo: "fluir", duracaoMs: 2200, atrasoMs: 400 },
          ],
          cenario: "laboratorio",
        },
        {
          titulo: "Raízes Reais e Aplicações Práticas",
          objetivo: "Demonstrar os zeros da função onde a parábola intercepta o eixo X.",
          explicacao: "Pela fórmula de Bhaskara, os zeros (raízes) indicam os instantes de lançamento e queda de um projétil em física.",
          duracaoMs: 4500,
          elementos: [
            { id: "curva_completa", tipo: "onda", rotulo: "Parábola e Trajetória", x: 50, y: 50, largura: 22, altura: 18, cor: "azul" },
            { id: "raiz_x1", tipo: "circulo", rotulo: "Raiz x₁", x: 34, y: 52, largura: 14, altura: 14, cor: "verde" },
            { id: "raiz_x2", tipo: "circulo", rotulo: "Raiz x₂", x: 66, y: 52, largura: 14, altura: 14, cor: "verde" },
            { id: "seta_alcance", tipo: "seta", rotulo: "Alcance Horizontal (Física)", x: 36, y: 52, largura: 16, altura: 6, cor: "verde", destinoX: 64, destinoY: 52 },
          ],
          acoes: [
            { alvo: "raiz_x1", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 200 },
            { alvo: "raiz_x2", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 400 },
            { alvo: "seta_alcance", tipo: "fluir", duracaoMs: 2200, atrasoMs: 600 },
          ],
          cenario: "laboratorio",
        }
      ],
      conclusao: "As funções quadráticas modelam órbitas gravitacionais, faróis refletores e a trajetória exata de objetos lançados no espaço.",
      curiosidade: "A antena parabólica usa a propriedade óptica da parábola: todos os sinais paralelos que chegam são refletidos exatamente no ponto focal.",
      origem: "local",
      fallback: true,
    });
  }

  // Tempo e Clima
  if (/\b(tempo.*clima|diferenca.*tempo.*clima|clima.*tempo|meteorolog)/.test(norm)) {
    return validateVisualExperience({
      versao: "1.0",
      disciplina: "geografia",
      titulo: "Diferença Entre Tempo e Clima",
      resumo: "O tempo é o estado atmosférico momentâneo (chuva hoje, frio amanhã); o clima é o padrão médio estável observado ao longo de décadas.",
      tipoDeCena: "comparacao",
      simplificacoes: "Escala temporal diária comparada com série histórica de 30 anos.",
      cenas: [
        {
          titulo: "Tempo: O Estado da Atmosfera Agora",
          objetivo: "Demonstrar a volatilidade e variações diárias do tempo.",
          explicacao: "O tempo pode mudar em poucas horas: uma manhã ensolarada pode transformar-se em tempestade com ventos à tarde.",
          duracaoMs: 4500,
          elementos: [
            { id: "sol_manha", tipo: "icone", icone: "sol", rotulo: "Manhã Ensolarada", x: 28, y: 46, largura: 22, altura: 22, cor: "amarelo" },
            { id: "nuvem_chuva", tipo: "icone", icone: "nuvem", rotulo: "Tarde com Chuva", x: 72, y: 46, largura: 22, altura: 22, cor: "azul" },
            { id: "relogio_horas", tipo: "icone", icone: "relogio", rotulo: "Variação em Horas / Dias", x: 50, y: 50, largura: 18, altura: 18, cor: "claro" },
            { id: "seta_mudanca", tipo: "seta", rotulo: "Mudança Rápida", x: 36, y: 46, largura: 16, altura: 6, cor: "claro", destinoX: 64, destinoY: 46 },
          ],
          acoes: [
            { alvo: "sol_manha", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 200 },
            { alvo: "seta_mudanca", tipo: "fluir", duracaoMs: 2200, atrasoMs: 300 },
            { alvo: "nuvem_chuva", tipo: "destacar", duracaoMs: 1800, atrasoMs: 800 },
          ],
          cenario: "natureza",
        },
        {
          titulo: "Coleta e Registro Histórico de Dados",
          objetivo: "Exibir estações meteorológicas acumulando 30 anos de medições.",
          explicacao: "Cientistas registram temperatura, umidade e ventos diariamente por mais de 30 anos para identificar tendências reais.",
          duracaoMs: 4500,
          elementos: [
            { id: "estacao_dados", tipo: "icone", icone: "computador", rotulo: "Estação Meteorológica", x: 30, y: 50, largura: 22, altura: 22, cor: "azul" },
            { id: "globo_terrestre", tipo: "icone", icone: "globo", rotulo: "Monitoramento por Satélite", x: 72, y: 50, largura: 22, altura: 22, cor: "verde" },
            { id: "serie_temporal", tipo: "particula", rotulo: "Média de 30+ Anos", x: 51, y: 35, largura: 16, altura: 16, cor: "amarelo" },
            { id: "seta_registro", tipo: "seta", rotulo: "Acúmulo Estatístico", x: 38, y: 50, largura: 16, altura: 6, cor: "amarelo", destinoX: 64, destinoY: 50 },
          ],
          acoes: [
            { alvo: "estacao_dados", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 200 },
            { alvo: "seta_registro", tipo: "fluir", duracaoMs: 2200, atrasoMs: 300 },
            { alvo: "globo_terrestre", tipo: "destacar", duracaoMs: 1800, atrasoMs: 800 },
          ],
          cenario: "natureza",
        },
        {
          titulo: "Clima: O Padrão Médio Consolidado",
          objetivo: "Demonstrar a estabilidade do clima regional e sua classificação.",
          explicacao: "O clima equatorial, temperado ou semiárido define a vegetação e o ciclo de estações, sem se alterar por um único dia chuvoso.",
          duracaoMs: 4500,
          elementos: [
            { id: "bioma_regiao", tipo: "icone", icone: "arvore", rotulo: "Bioma e Clima Regional", x: 35, y: 50, largura: 22, altura: 22, cor: "verde" },
            { id: "padrao_estavel", tipo: "retangulo", rotulo: "Padrão Climático Consolidado", x: 70, y: 50, largura: 22, altura: 20, cor: "azul" },
            { id: "seta_sintese", tipo: "seta", rotulo: "Classificação Climática", x: 44, y: 50, largura: 16, altura: 6, cor: "verde", destinoX: 62, destinoY: 50 },
          ],
          acoes: [
            { alvo: "bioma_regiao", tipo: "destacar", duracaoMs: 1800, atrasoMs: 200 },
            { alvo: "seta_sintese", tipo: "fluir", duracaoMs: 2200, atrasoMs: 400 },
            { alvo: "padrao_estavel", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 800 },
          ],
          cenario: "natureza",
        }
      ],
      conclusao: "Como diz a síntese popular: 'O clima é o guarda-roupa que você tem; o tempo é a roupa que você veste hoje.'",
      curiosidade: "Pela Organização Meteorológica Mundial (OMM), são necessários no mínimo 30 anos ininterruptos de medições para caracterizar oficialmente o clima de uma região.",
      origem: "local",
      fallback: true,
    });
  }

  // Eleições e Democracia
  if (/\b(eleicao|eleicoes|democracia|como.*funciona.*eleicao|urna|voto|cidadania)/.test(norm)) {
    return validateVisualExperience({
      versao: "1.0",
      disciplina: "ciencias",
      titulo: "Como Funcionam as Eleições e a Democracia",
      resumo: "Os cidadãos exercem a soberania popular escolhendo seus representantes por meio do voto direto, secreto e auditável nas urnas.",
      tipoDeCena: "fluxo",
      simplificacoes: "Fases do ciclo eleitoral democrático organizadas em três momentos essenciais.",
      cenas: [
        {
          titulo: "Campanha, Debates e Propostas",
          objetivo: "Demonstrar a apresentação de ideias políticas aos cidadãos.",
          explicacao: "Candidatos e partidos apresentam planos de governo e debatem soluções para a saúde, educação e economia perante a sociedade.",
          duracaoMs: 4500,
          elementos: [
            { id: "sociedade_eleitores", tipo: "icone", icone: "cidade", rotulo: "Cidadãos Eleitores", x: 28, y: 50, largura: 22, altura: 22, cor: "azul" },
            { id: "livro_propostas", tipo: "icone", icone: "livro", rotulo: "Propostas e Debate", x: 74, y: 50, largura: 22, altura: 22, cor: "amarelo" },
            { id: "seta_debate", tipo: "seta", rotulo: "Discussão Pública", x: 36, y: 50, largura: 18, altura: 6, cor: "amarelo", destinoX: 66, destinoY: 50 },
          ],
          acoes: [
            { alvo: "sociedade_eleitores", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 200 },
            { alvo: "seta_debate", tipo: "fluir", duracaoMs: 2200, atrasoMs: 300 },
            { alvo: "livro_propostas", tipo: "destacar", duracaoMs: 1600, atrasoMs: 800 },
          ],
          cenario: "historico",
        },
        {
          titulo: "O Voto Secreto na Urna Eletrônica",
          objetivo: "Exibir o eleitor exercendo seu direito democrático com sigilo.",
          explicacao: "Na cabine indevassável, cada cidadão digita sua escolha na urna eletrônica, garantindo o sigilo absoluto e a igualdade de cada voto.",
          duracaoMs: 4500,
          elementos: [
            { id: "urna_eletronica", tipo: "icone", icone: "urna", rotulo: "Urna Eletrônica Auditável", x: 50, y: 48, largura: 24, altura: 24, cor: "verde" },
            { id: "particula_voto", tipo: "particula", rotulo: "Voto Secreto Criptografado", x: 30, y: 48, largura: 16, altura: 16, cor: "claro" },
            { id: "seta_voto", tipo: "seta", rotulo: "Registro do Voto", x: 33, y: 48, largura: 14, altura: 6, cor: "verde", destinoX: 47, destinoY: 48 },
          ],
          acoes: [
            { alvo: "particula_voto", tipo: "mover", paraX: 47, paraY: 48, duracaoMs: 2200, atrasoMs: 200 },
            { alvo: "seta_voto", tipo: "fluir", duracaoMs: 2000, atrasoMs: 300 },
            { alvo: "urna_eletronica", tipo: "destacar", duracaoMs: 1800, atrasoMs: 900 },
          ],
          cenario: "historico",
        },
        {
          titulo: "Totalização Rápida e Mandato Popular",
          objetivo: "Demonstrar a apuração dos votos e a posse dos representantes.",
          explicacao: "Os boletins de urna são somados digitalmente com fiscalização de partidos e da Justiça, diplomando os representantes da vontade popular.",
          duracaoMs: 4500,
          elementos: [
            { id: "urna_totalizacao", tipo: "icone", icone: "urna", rotulo: "Apuração Totalizada", x: 30, y: 50, largura: 22, altura: 22, cor: "verde" },
            { id: "governo_eleito", tipo: "icone", icone: "cidade", rotulo: "Mandato Democrático", x: 74, y: 50, largura: 22, altura: 22, cor: "azul" },
            { id: "seta_legitimidade", tipo: "seta", rotulo: "Soberania do Povo", x: 38, y: 50, largura: 18, altura: 6, cor: "azul", destinoX: 66, destinoY: 50 },
          ],
          acoes: [
            { alvo: "urna_totalizacao", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 200 },
            { alvo: "seta_legitimidade", tipo: "fluir", duracaoMs: 2200, atrasoMs: 300 },
            { alvo: "governo_eleito", tipo: "crescer", duracaoMs: 2000, atrasoMs: 800 },
          ],
          cenario: "historico",
        }
      ],
      conclusao: "A democracia representativa se apoia na garantia de que todo poder emana do povo e em seu nome é exercido.",
      curiosidade: "O Brasil utiliza urnas eletrônicas em 100% das suas seções eleitorais desde o ano 2000, apurando mais de 120 milhões de votos em poucas horas.",
      origem: "local",
      fallback: true,
    });
  }

  // Motor dinâmico universal para qualquer outra pesquisa:
  // Detecta contexto semântico avançado com ícones ricos, partículas ativas e setas fluindo
  const stopWords = new Set(['como', 'acontece', 'funciona', 'porque', 'sobre', 'qual', 'quais', 'estudo', 'fazer', 'para', 'pela', 'pelo', 'com', 'sem', 'uma', 'uns', 'umas', 'que', 'dos', 'das', 'por', 'explica', 'explique', 'entender']);
  const keywords = norm.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
  const cap = w => w ? (w.charAt(0).toUpperCase() + w.slice(1)) : '';
  const term1 = cap(keywords[0]) || 'Agente Ativo';
  const term2 = cap(keywords[1]) || 'Mecanismo';
  const term3 = cap(keywords[2]) || 'Resultado';

  const isAstro = /\b(espaco|planeta|estrela|galaxia|solar|universo|satelite|cometa|orbita|gravidade|buraco.*negro)\b/.test(norm);
  const isBio = /\b(vida|corpo|planta|animal|orgao|celul|dna|virus|bacteria|saude|sangue|respirac|digest)\b/.test(norm);
  const isTech = /\b(internet|computador|rede|dados|energia|bateria|eletricidade|motor|carro|maquina|rob)\b/.test(norm);
  const isHist = /\b(historia|guerra|imperio|governo|politica|sociedade|seculo|revolucao|rei|povo|antig)\b/.test(norm);
  const isGeo = /\b(pais|continente|clima|relevo|mapa|rio|cidade|populacao|terra|ambiente|chuva|vento)\b/.test(norm);

  const disciplina = isHist ? "historia" : (isGeo ? "geografia" : "ciencias");
  const cenario = isAstro ? "espaco" : (isHist ? "historico" : (isBio ? "laboratorio" : (isTech ? "laboratorio" : "natureza")));

  let icon1 = isAstro ? "sol" : (isBio ? "celula" : (isTech ? "bateria" : (isHist ? "livro" : "sol")));
  let icon2 = isAstro ? "planeta" : (isBio ? "coracao" : (isTech ? "engrenagem" : (isHist ? "cidade" : "agua")));

  if (/carro|veiculo|motor|combustao/.test(norm)) { icon1 = 'engrenagem'; icon2 = 'fogo'; }
  else if (/energia|eletric|raio|usina/.test(norm)) { icon1 = 'raio'; icon2 = 'lampada'; }
  else if (/voo|aviao|aero/.test(norm)) { icon1 = 'aviao'; icon2 = 'nuvem'; }
  else if (/visao|olho|luz|otica/.test(norm)) { icon1 = 'olho'; icon2 = 'lampada'; }
  else if (/dna|gene|heredit/.test(norm)) { icon1 = 'dna'; icon2 = 'celula'; }
  else if (/som|audio|ouvido|onda/.test(norm)) { icon1 = 'som'; icon2 = 'cerebro'; }

  const shortQuestion = question.length > 50 ? question.slice(0, 47) + '...' : question;
  return validateVisualExperience({
    versao: "1.0",
    disciplina,
    titulo: "Processo Visual: " + shortQuestion,
    resumo: `Acompanhe como ${term1} atua sobre ${term2} para gerar ${term3} em etapas sequenciais com animação contínua.`,
    tipoDeCena: isHist ? "linha_do_tempo" : (isAstro ? "movimento" : "fluxo"),
    simplificacoes: "Diagrama didático animado com relações causais e componentes essenciais destacados.",
    cenas: [
      {
        titulo: `Origem e Fatores de Partida (${term1})`,
        objetivo: "Apresentar as condições iniciais e o elemento catalisador do fenômeno.",
        explicacao: `O processo tem início quando ${term1} entra em ação, fornecendo energia ou direcionamento inicial ao sistema.`,
        duracaoMs: 4500,
        elementos: [
          { id: "agente_principal", tipo: "icone", icone: icon1, rotulo: term1, x: 28, y: 48, largura: 22, altura: 22, cor: "amarelo" },
          { id: "energia_campo", tipo: "particula", rotulo: "Energia / Estímulo", x: 48, y: 34, largura: 16, altura: 16, cor: "claro" },
          { id: "meio_interacao", tipo: "retangulo", rotulo: "Condições Ambientais", x: 50, y: 68, largura: 22, altura: 14, cor: "verde" },
          { id: "alvo_inicial", tipo: "icone", icone: icon2, rotulo: term2, x: 74, y: 48, largura: 20, altura: 20, cor: "azul" },
          { id: "seta_impulso", tipo: "seta", rotulo: "Ação Inicial", x: 35, y: 48, largura: 18, altura: 6, cor: "amarelo", destinoX: 68, destinoY: 48 },
        ],
        acoes: [
          { alvo: "agente_principal", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 200 },
          { alvo: "energia_campo", tipo: "mover", paraX: 58, paraY: 42, duracaoMs: 2200, atrasoMs: 400 },
          { alvo: "seta_impulso", tipo: "fluir", duracaoMs: 2200, atrasoMs: 600 },
          { alvo: "alvo_inicial", tipo: "destacar", duracaoMs: 1600, atrasoMs: 1000 },
        ],
        cenario,
      },
      {
        titulo: `Desenvolvimento e Interação (${term2})`,
        objetivo: "Exibir a transformação dinâmica gerada entre os componentes.",
        explicacao: `A interação direta entre ${term1} e ${term2} altera o equilíbrio e conduz à transformação central do processo.`,
        duracaoMs: 4500,
        elementos: [
          { id: "agente_transformador", tipo: "icone", icone: icon1, rotulo: term1, x: 28, y: 48, largura: 20, altura: 20, cor: "amarelo" },
          { id: "processo_central", tipo: "circulo", rotulo: term2, x: 52, y: 48, largura: 22, altura: 22, cor: "azul" },
          { id: "substancia_fluxo", tipo: "particula", rotulo: "Transferência Ativa", x: 52, y: 26, largura: 14, altura: 14, cor: "claro" },
          { id: "seta_fluxo", tipo: "seta", rotulo: "Transformação em Curso", x: 34, y: 48, largura: 16, altura: 6, cor: "verde", destinoX: 46, destinoY: 48 },
          { id: "novo_estado", tipo: "retangulo", rotulo: term3, x: 76, y: 48, largura: 20, altura: 16, cor: "verde" },
          { id: "seta_resultado", tipo: "seta", rotulo: "Geração", x: 58, y: 48, largura: 16, altura: 6, cor: "azul", destinoX: 70, destinoY: 48 },
        ],
        acoes: [
          { alvo: "processo_central", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 200 },
          { alvo: "substancia_fluxo", tipo: "mover", paraX: 52, paraY: 42, duracaoMs: 2000, atrasoMs: 400 },
          { alvo: "seta_fluxo", tipo: "fluir", duracaoMs: 2200, atrasoMs: 300 },
          { alvo: "seta_resultado", tipo: "fluir", duracaoMs: 2200, atrasoMs: 700 },
          { alvo: "novo_estado", tipo: "destacar", duracaoMs: 1600, atrasoMs: 1100 },
        ],
        cenario,
      },
      {
        titulo: `Conclusão e Estado Final (${term3})`,
        objetivo: "Demonstrar o produto ou estado resultante consolidado.",
        explicacao: `O ciclo completa-se com o estabelecimento de ${term3}, que estabiliza o sistema e possibilita novas interações.`,
        duracaoMs: 4500,
        elementos: [
          { id: "resultado_final", tipo: "retangulo", rotulo: term3, x: 38, y: 48, largura: 22, altura: 20, cor: "verde" },
          { id: "sistema_equilibrio", tipo: "icone", icone: icon2, rotulo: "Equilíbrio / Estabilidade", x: 68, y: 48, largura: 20, altura: 20, cor: "azul" },
          { id: "particula_retorno", tipo: "particula", rotulo: "Consequência / Continuidade", x: 53, y: 32, largura: 14, altura: 14, cor: "amarelo" },
          { id: "seta_conclusao", tipo: "seta", rotulo: "Fechamento do Ciclo", x: 44, y: 48, largura: 16, altura: 6, cor: "verde", destinoX: 62, destinoY: 48 },
        ],
        acoes: [
          { alvo: "resultado_final", tipo: "crescer", duracaoMs: 2000, atrasoMs: 200 },
          { alvo: "seta_conclusao", tipo: "fluir", duracaoMs: 2200, atrasoMs: 400 },
          { alvo: "sistema_equilibrio", tipo: "pulsar", duracaoMs: 1800, atrasoMs: 700 },
          { alvo: "particula_retorno", tipo: "destacar", duracaoMs: 1600, atrasoMs: 1000 },
        ],
        cenario,
      }
    ],
    conclusao: `A análise visual de ${question} demonstra que as transformações seguem princípios de causa, efeito e conservação.`,
    curiosidade: "Você pode explorar variações da pergunta ou clicar em outros temas para comparar diferentes fenômenos visuais.",
    origem: "local",
    fallback: true,
  });
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
      engine.seek(index);
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
    vulcao: 5,
    agua: 5,
    eclipse: 3,
    celula: 5,
    translacao_terra: 4,
    revolucao_industrial: 4,
    urbanizacao: 4,
    rotacao_terra: 3,
    sistema_respiratorio: 4,
    hidreletrica: 4,
    'hydroelectric-plant': 4,
    'hydroelectric': 4,
    'usina_hidreletrica': 4,
    'earth-translation': 4,
    'industrial-revolution': 4,
    'urbanization': 4,
    'earth-rotation': 3,
    'respiratory-system': 4,
    'volcanic-eruption': 5,
    'photosynthesis': 5,
    'water-cycle': 5,
    'solar-eclipse': 3,
    'tectonic-plates': 5,
    'cell-structure': 5,
    processo_generico: 6,
    linha_do_tempo: 6,
  };
  const visualSlots = visualSlotsByType[activeVisualExperience.tipoVisual] || 6;

  if (steps === 1) return 0;
  return Math.round((activeVisualStep / (steps - 1)) * (visualSlots - 1));
};

const stopVisualizerPlayback = () => {
  if (engineActive) engine.pause();
  visualizerIsPlaying = false;
  visualizerCanvas.dataset.playing = 'false';
};

const renderVisualizerPlayControl = () => {
  if (reducedMotionPreference.matches) {
    visualizerPlay.disabled = true;
    visualizerPause.disabled = true;
    visualizerSpeed.disabled = true;
    visualizerPlay.title = 'Reprodução automática desativada pela preferência de movimento reduzido';
    updatePlaybackStatus();
    return;
  }

  visualizerPlay.disabled = visualizerIsPlaying;
  visualizerPause.disabled = !visualizerIsPlaying;
  visualizerSpeed.disabled = false;
  visualizerPlay.removeAttribute('title');
  updatePlaybackStatus();
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
  if (visualizerStepPrev) visualizerStepPrev.disabled = activeVisualStep === 0;
  if (visualizerStepNext) {
    visualizerStepNext.disabled = isLastStep;
    visualizerStepNext.innerHTML = isLastStep
      ? 'Concluído <span aria-hidden="true">✓</span>'
      : 'Próxima etapa <span aria-hidden="true">→</span>';
  }

  if (visualizerStepper) {
    visualizerStepper.querySelectorAll('.visualizer-stepper__item').forEach((item) => {
      const idx = Number(item.dataset.stepperIndex);
      const isCurrent = idx === activeVisualStep;
      const isPast = idx < activeVisualStep;
      item.classList.toggle('is-active', isCurrent);
      item.classList.toggle('is-completed', isPast);
      item.setAttribute('aria-current', isCurrent ? 'step' : 'false');
    });
  }

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

  renderVisualizerPlayControl();
};

const showVisualExperience = (candidate) => {
  stopVisualizerPlayback();
  engineActive = false;
  engine.destroy();
  const special = candidate.experienciaEspecial || candidate.tipoVisual;
  const specialTemplate = localVisualExperiences[special];
  const experience = specialTemplate
    ? { ...specialTemplate, origem: 'premium' }
    : candidate;
  activeVisualExperience = validateVisualExperience(experience);
  activeVisualStep = 0;

  visualizerArea.textContent = visualizerDisciplines[activeVisualExperience.disciplina];
  visualizerExperienceTitle.textContent = activeVisualExperience.titulo;
  if (fullscreenTitle) fullscreenTitle.textContent = activeVisualExperience.titulo;
  if (fullscreenAreaBadge) fullscreenAreaBadge.textContent = visualizerArea.textContent;
  visualizerSummary.textContent = activeVisualExperience.resumo;
  visualizerSource.textContent = {
    premium: 'Experiência revisada', ia: 'Gerado com IA · não revisado', local: 'Experiência revisada',
  }[activeVisualExperience.origem];
  visualizerCuriosity.textContent = [activeVisualExperience.conclusao, activeVisualExperience.curiosidade].filter(Boolean).join(' ');
  visualizerAiNotice.hidden = activeVisualExperience.origem !== 'ia';
  const referenceIds = premiumReferences[activeVisualExperience.tipoVisual] || activeVisualExperience.fontes;
  const references = document.getElementById('visualizer-references');
  references.replaceChildren();
  const sourceNote = document.createElement('p');
  sourceNote.textContent = referenceIds.length ? 'Referências consultadas na revisão deste roteiro:' : 'Este roteiro foi gerado sem consulta a fontes externas. A validação do formato não comprova a precisão das informações.';
  references.append(sourceNote);
  for (const id of referenceIds) {
    const source = SOURCES[id];
    if (!source) continue;
    const link = document.createElement('a');
    link.href = source.url; link.textContent = source.title; link.target = '_blank'; link.rel = 'noopener noreferrer';
    references.append(link);
  }
  document.getElementById('visualizer-simplifications').textContent = activeVisualExperience.simplificacoes || 'Esquema didático: tamanhos, distâncias e duração não estão em escala. Etapas destacadas separadamente; processos podem ocorrer ao mesmo tempo.';
  engineActive = true;
  visualizerCanvas.dataset.clock = 'elapsed';
  visualizerLegend.replaceChildren();
  renderVisualizerPeriods();
  renderVisualizerStepper();
  syncSpeedPills();
  setActiveVisualizerTab('etapas');
  visualizerEmpty.hidden = true;
  visualizerExperience.hidden = false;
  engine.setSpeed(Number(visualizerSpeed.value));
  engine.load(activeVisualExperience);
  requestAnimationFrame(() => updateVisualizerTabIndicator());
};

const liveActivityPod = document.getElementById('live-activity-pod');
const liveActivityTitle = document.getElementById('live-activity-title');
const liveActivityDetail = document.getElementById('live-activity-detail');
const liveActivityFill = document.getElementById('live-activity-fill');
const liveActivityPercent = document.getElementById('live-activity-percent');
const liveActivitySpinner = document.getElementById('live-activity-spinner');
const liveActivitySuccess = document.getElementById('live-activity-success');
const liveActivityError = document.getElementById('live-activity-error');

let loadingProgressTimer = null;
let currentProgress = 0;

const updateLiveActivity = (progress, title, detail, phase = 'running') => {
  if (liveActivityFill) liveActivityFill.style.width = `${progress}%`;
  if (liveActivityPercent) liveActivityPercent.textContent = `${progress}%`;
  if (title && liveActivityTitle) liveActivityTitle.textContent = title;
  if (detail && liveActivityDetail) liveActivityDetail.textContent = detail;

  if (liveActivitySpinner) liveActivitySpinner.hidden = phase !== 'running';
  if (liveActivitySuccess) liveActivitySuccess.hidden = phase !== 'success';
  if (liveActivityError) liveActivityError.hidden = phase !== 'error';
};

const setVisualizerLoading = (isLoading, phase = 'running', endMessage = null) => {
  if (loadingProgressTimer) {
    clearInterval(loadingProgressTimer);
    loadingProgressTimer = null;
  }

  if (isLoading) {
    visualizerLoading.hidden = false;
    currentProgress = 15;
    updateLiveActivity(
      currentProgress,
      'Preparando a experiência...',
      'Aguardando a IA preparar o roteiro visual · VisuLab',
      'running',
    );

    loadingProgressTimer = setInterval(() => {
      if (currentProgress < 35) {
        currentProgress += 5;
        updateLiveActivity(
          currentProgress,
          'Consultando inteligência artificial...',
          'Iniciando análise do tema e contextualização pedagógica',
          'running',
        );
      } else if (currentProgress < 70) {
        currentProgress += 3;
        updateLiveActivity(
          currentProgress,
          'Estruturando conceitos e cenas...',
          'Organizando narrativa visual, temporalidade e metáforas',
          'running',
        );
      } else if (currentProgress < 92) {
        currentProgress += 1;
        updateLiveActivity(
          currentProgress,
          'Construindo diagramas e animações...',
          'Sintetizando gráficos vetoriais interativos e legendas',
          'running',
        );
      }
    }, 280);
  } else {
    if (phase === 'success') {
      updateLiveActivity(
        100,
        'Visualização pronta!',
        'Iniciando apresentação interativa...',
        'success',
      );
      setTimeout(() => {
        visualizerLoading.hidden = true;
      }, 1200);
    } else if (phase === 'error') {
      updateLiveActivity(
        100,
        'Não foi possível concluir',
        endMessage || 'Ocorreu uma falha na geração do roteiro.',
        'error',
      );
      setTimeout(() => {
        visualizerLoading.hidden = true;
      }, 2200);
    } else {
      visualizerLoading.hidden = true;
    }
  }

  visualizerForm.setAttribute('aria-busy', String(isLoading));
  visualizerSubmit.disabled = isLoading;
  visualizerQuestion.disabled = false;
  searchInput.disabled = false;
  searchForm.querySelector('[type="submit"]').disabled = isLoading;
  visualizerSuggestionButtons.forEach((button) => {
    button.disabled = false;
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
    const clarification = clarificationFor(question);
    if (clarification) { const error = new Error(clarification); error.code = 'CLARIFICATION'; throw error; }
    const premiumTopic = findPremiumTopic(question);
    const reviewedTopic = findReviewedTopic(question);
    const experience = premiumTopic
      ? { ...localVisualExperiences[premiumTopic], origem: 'premium' }
      : reviewedTopic ? reviewedExperiences[reviewedTopic] : await requestVisualExperience(question);

    if (requestId === visualizerRequestId) {
      showVisualExperience(experience);
    }
  } catch (error) {
    if (error?.name === 'AbortError' || error?.code === 'ABORTED' || requestId !== visualizerRequestId) {
      return;
    }
    const messages = {
      API_NOT_CONFIGURED: 'Nenhum provedor de IA está configurado na Vercel; a animação local continua disponível.',
      AI_PROVIDERS_FAILED: 'Gemini e NVIDIA falharam; a animação local foi preparada.',
      API_CONFIGURATION_ERROR: 'O provedor de IA recusou a chave ou as permissões configuradas na Vercel.',
      NVIDIA_MODEL_CONFIGURATION_ERROR: 'Corrija NVIDIA_MODEL na Vercel: informe o nome do modelo; a chave deve ficar somente em NVIDIA_API_KEY.',
      API_REQUEST_REJECTED: 'O provedor de IA recusou o modelo ou o formato do roteiro.',
      API_MODEL_NOT_FOUND: 'O modelo configurado não foi encontrado pelo provedor de IA.',
      API_LIMIT: 'Muitas visualizações foram solicitadas agora. Aguarde um pouco e tente novamente.',
      API_UNAVAILABLE: 'O provedor de IA está temporariamente indisponível.',
      API_TIMEOUT: 'A criação demorou mais que o esperado. Tente novamente.',
      INVALID_API_RESPONSE: 'O provedor respondeu fora do formato visual esperado.',
      INVALID_FUNCTION_RESPONSE: 'A função da Vercel respondeu fora do formato esperado.',
      FUNCTION_NOT_FOUND: 'A função visualizar não está presente neste deploy da Vercel.',
      NETWORK_ERROR: 'Não foi possível alcançar a função da Vercel. Verifique o deploy e tente novamente.',
      TIMEOUT: 'A criação demorou mais que o esperado. Tente novamente.',
    };
    if (requestId === visualizerRequestId) {
      const isAiFailure = Object.hasOwn(messages, error.code);
      if (error.code === 'API_NOT_CONFIGURED') {
        console.error('[VisuLab] Falha ao solicitar animação', {
          codigo: error.code || 'UNEXPECTED_FRONTEND_ERROR',
          status: error.status || null,
          mensagem: messages[error.code] || 'Não foi possível preparar o roteiro.',
        });
      }
      if (error.code === 'CLARIFICATION') {
        visualizerFeedback.textContent = error.message;
        visualizerEmpty.hidden = false;
        visualizerQuestion.focus();
      } else if (isAiFailure) {
        showVisualExperience(createLocalFallback(question));
        visualizerFeedback.textContent = messages[error.code] + " Exibindo uma Animação local de apoio; tente novamente quando quiser gerar com IA.";
        visualizerEmpty.hidden = false;
      } else {
        visualizerFeedback.textContent = 'Ocorreu um erro ao mostrar a animação. Consulte o console e tente novamente.';
        visualizerEmpty.hidden = false;
      }
    }
  } finally {
    if (requestId === visualizerRequestId) {
      setVisualizerLoading(false);
    }
  }
});

visualizerPrevious.addEventListener('click', () => engine.seek(engine.index - 1));
visualizerNext.addEventListener('click', () => engine.seek(engine.index + 1));
if (visualizerStepPrev) visualizerStepPrev.addEventListener('click', () => engine.seek(engine.index - 1));
if (visualizerStepNext) visualizerStepNext.addEventListener('click', () => engine.seek(engine.index + 1));
visualizerPlay.addEventListener('click', () => engine.play());
visualizerPause.addEventListener('click', () => engine.pause());
visualizerRestart.addEventListener('click', () => engine.restart());
visualizerSpeed.addEventListener('change', () => {
  engine.setSpeed(Number(visualizerSpeed.value));
  syncSpeedPills();
  updatePlaybackStatus();
});

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

window.addEventListener('pagehide', () => {
  activeNetworkController?.abort();
  ++visualizerRequestId;
  engine.destroy();
  visualizerIsPlaying = false;
});

// ==========================================================================
// Efeito tátil de profundidade 3D (Press-Depth)
// Adicionado a todos os botões da aplicação, exceto às abas de seleção
// (Etapas, Controles, Complementos), aos filtros e ao seletor de tema.
// ==========================================================================
const setupPressDepthButtons = () => {
  const depthSelector = [
    '.button--primary',
    '.button--secondary',
    '.visualizer-control',
    '.visualizer-quick-btn',
    '.visualizer-speed-pill',
    '.hero-search-bar__submit',
    '.question-suggestions button',
    '.dialog-close',
    '#clear-search',
    '#previous-step',
    '#next-step',
    '[data-press-depth]'
  ].join(', ');

  let activeBtn = null;
  let activePointerId = null;

  const isExcluded = (btn) => {
    return Boolean(
      btn.closest('.visualizer-tab') ||
      btn.closest('.filter') ||
      btn.closest('.theme-switch')
    );
  };

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const btn = e.target.closest(depthSelector);
    if (!btn || btn.disabled || isExcluded(btn)) return;

    activeBtn = btn;
    activePointerId = e.pointerId;

    const r = btn.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    const y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
    const tilt = 7;

    btn.style.setProperty('--lean-x', `${(x * tilt).toFixed(2)}deg`);
    btn.style.setProperty('--lean-y', `${(-y * tilt).toFixed(2)}deg`);
    btn.setAttribute('data-pressed', '');
  };

  const handlePointerMove = (e) => {
    if (!activeBtn || e.pointerId !== activePointerId) return;
    const r = activeBtn.getBoundingClientRect();
    const inside = (
      e.clientX >= r.left &&
      e.clientX <= r.right &&
      e.clientY >= r.top &&
      e.clientY <= r.bottom
    );
    if (inside) {
      const x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      const y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      const tilt = 7;
      activeBtn.style.setProperty('--lean-x', `${(x * tilt).toFixed(2)}deg`);
      activeBtn.style.setProperty('--lean-y', `${(-y * tilt).toFixed(2)}deg`);
      activeBtn.setAttribute('data-pressed', '');
    } else {
      activeBtn.removeAttribute('data-pressed');
    }
  };

  const handlePointerUp = (e) => {
    if (!activeBtn || (e && e.pointerId !== activePointerId)) return;
    activeBtn.removeAttribute('data-pressed');
    activeBtn.style.removeProperty('--lean-x');
    activeBtn.style.removeProperty('--lean-y');
    activeBtn = null;
    activePointerId = null;
  };

  const handleKeyDown = (e) => {
    if (e.repeat || (e.key !== ' ' && e.key !== 'Enter')) return;
    const btn = e.target?.closest?.(depthSelector);
    if (!btn || btn.disabled || isExcluded(btn)) return;
    btn.style.setProperty('--lean-x', '0deg');
    btn.style.setProperty('--lean-y', '0deg');
    btn.setAttribute('data-pressed', '');
  };

  const handleKeyUp = (e) => {
    if (e.key !== ' ' && e.key !== 'Enter' && e.key !== 'Escape') return;
    const btn = e.target?.closest?.(depthSelector);
    if (!btn) return;
    btn.removeAttribute('data-pressed');
    btn.style.removeProperty('--lean-x');
    btn.style.removeProperty('--lean-y');
  };

  window.addEventListener('pointerdown', handlePointerDown, { passive: true });
  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  window.addEventListener('pointerup', handlePointerUp, { passive: true });
  window.addEventListener('pointercancel', handlePointerUp, { passive: true });
  window.addEventListener('keydown', handleKeyDown, { passive: true });
  window.addEventListener('keyup', handleKeyUp, { passive: true });
  window.addEventListener('blur', handlePointerUp);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) handlePointerUp();
  });
};

setupPressDepthButtons();
