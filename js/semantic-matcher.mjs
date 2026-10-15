// Sistema de classificação semântica e correspondência de temas do VisuLab.
// Garante que o sistema nunca exiba uma animação incorreta ou desconexa por mera coincidência de termos (ex: núcleo do átomo vs núcleo celular).

export const ANIMATION_METADATA = {
  terremoto: {
    id: 'terremoto',
    titulo: 'Terremotos e placas tectônicas',
    area: 'geografia',
    tema: 'terremoto',
    subtemas: ['sismologia', 'placas tectonicas', 'ondas sismicas', 'epicentro', 'hipocentro', 'falhas geologicas'],
    conceitosChave: [
      'terremoto', 'terremotos', 'sismo', 'sismos', 'sismico', 'sismica',
      'placa tectonica', 'placas tectonicas', 'tectonica de placas',
      'abalo sismico', 'abalos sismicos', 'ondas sismicas', 'onda sismica',
      'falha geologica', 'epicentro', 'hipocentro', 'litosfera'
    ],
    termosConflitantes: [
      'transito', 'carro', 'automovel', 'sinalizacao', 'emocional', 'psicologico',
      'placas de transito', 'placa de carro', 'placa mae'
    ],
  },
  fotossintese: {
    id: 'fotossintese',
    titulo: 'Fotossíntese nas plantas',
    area: 'ciencias',
    tema: 'fotossintese',
    subtemas: ['bioquimica vegetal', 'clorofila', 'luz solar', 'glicose', 'oxigenio', 'plantas'],
    conceitosChave: [
      'fotossintese', 'clorofila', 'cloroplasto', 'produz alimento planta',
      'como a planta produz alimento', 'plantas produzem glicose', 'producao de glicose',
      'seiva bruta', 'luz solar planta co2', 'fase clara e escura',
      'planta luz gas carbonico', 'luz gas carbonico', 'gas carbonico planta'
    ],
    termosConflitantes: [
      'carnivora', 'carnivoras', 'plantas carnivoras', 'c3 e c4', 'cam', 'calvin',
      'celula animal', 'respiracao celular animal', 'mitocondria humana'
    ],
  },
  brasil_colonial: {
    id: 'brasil_colonial',
    titulo: 'Brasil Colonial',
    area: 'historia',
    tema: 'brasil_colonial',
    subtemas: ['colonizacao do brasil', 'capitanias hereditarias', 'ciclo do acucar', 'ouro e mineracao', 'resistencia'],
    conceitosChave: [
      'brasil colonial', 'periodo colonial', 'colonizacao do brasil',
      'capitanias hereditarias', 'brasil colonia', 'pacto colonial',
      'governador geral', 'engenho de acucar', 'quilombo dos palmares'
    ],
    termosConflitantes: [
      'brasil imperial', 'imperio do brasil', 'brasil republica', 'independencia',
      'revolucao francesa', 'ditadura militar', 'inconfidencia'
    ],
  },
  vulcao: {
    id: 'vulcao',
    titulo: 'Erupção vulcânica',
    area: 'geografia',
    tema: 'vulcao',
    subtemas: ['vulcanologia', 'camara magmatica', 'lava e cinzas', 'pressao magmatica'],
    conceitosChave: [
      'vulcao', 'vulcoes', 'erupcao', 'erupcoes', 'erupcao vulcanica',
      'camara magmatica', 'chamine vulcanica', 'magma subindo', 'lava vulcanica',
      'magma e lava'
    ],
    termosConflitantes: [],
  },
  agua: {
    id: 'agua',
    titulo: 'Ciclo da água',
    area: 'ciencias',
    tema: 'ciclo_da_agua',
    subtemas: ['ciclo hidrologico', 'evaporacao', 'condensacao', 'precipitacao', 'infiltracao'],
    conceitosChave: [
      'ciclo da agua', 'ciclo hidrologico', 'como a agua circula',
      'como a agua retorna', 'evaporacao e precipitacao', 'gotas de chuva'
    ],
    termosConflitantes: ['mudancas climaticas', 'poluicao hidrica', 'ferve', 'fervendo', 'ebulicao', 'fervura', 'ponto de ebulicao', 'panela'],
  },
  eclipse: {
    id: 'eclipse',
    titulo: 'Eclipse solar',
    area: 'ciencias',
    tema: 'eclipse_solar',
    subtemas: ['astronomia', 'alinhamento sol lua terra', 'umbra e penumbra', 'sombra lunar'],
    conceitosChave: [
      'eclipse solar', 'lua entre o sol e a terra', 'lua passa entre o sol e a terra',
      'sombra da lua na terra', 'geometria do eclipse solar'
    ],
    termosConflitantes: [
      'eclipse lunar', 'terra entre sol e lua', 'terra faz sombra na lua', 'lua de sangue',
      'lua fica escura', 'anular', 'hibrido', 'proximo eclipse', 'data',
      'diferenca entre eclipse', 'compare eclipse', 'diferenca entre eclipse solar e lunar'
    ],
  },
  eclipse_lunar: {
    id: 'eclipse_lunar',
    titulo: 'Eclipse lunar',
    area: 'ciencias',
    tema: 'eclipse_lunar',
    subtemas: ['astronomia', 'alinhamento sol terra lua', 'sombra da terra na lua', 'lua de sangue', 'umbra e penumbra'],
    conceitosChave: [
      'eclipse lunar', 'terra entre sol e lua', 'terra entre o sol e a lua',
      'terra faz sombra na lua', 'terra projeta sombra na lua', 'lua fica escura',
      'lua na sombra da terra', 'lua de sangue', 'umbra da terra sobre a lua',
      'sombra da terra na lua'
    ],
    termosConflitantes: [
      'eclipse solar', 'lua entre o sol e a terra', 'lua entre sol e terra',
      'sombra da lua na terra', 'lua passa entre o sol',
      'diferenca entre eclipse', 'compare eclipse', 'diferenca entre eclipse solar e lunar'
    ],
  },
  celula: {
    id: 'celula',
    titulo: 'Estrutura e funcionamento da célula',
    area: 'ciencias',
    tema: 'celula',
    subtemas: ['biologia celular', 'citologia', 'membrana plasmatica', 'citoplasma', 'nucleo celular', 'mitocondrias'],
    conceitosChave: [
      'celula', 'celulas', 'celula eucarionte', 'celular', 'organela', 'organelas',
      'citoplasma', 'citosol', 'membrana celular', 'membrana plasmatica',
      'mitocondria', 'mitocondrias', 'nucleo celular', 'carioteca', 'ribossomo',
      'complexo de golgi', 'reticulo endoplasmatico'
    ],
    // PALAVRAS PROIBIDAS: qualquer pergunta sobre átomos, elétrons, física ou química subatômica
    // JAMAIS deve ser associada ou redirecionada para a animação da célula.
    termosConflitantes: [
      'atomo', 'atomos', 'atomico', 'atomica', 'proton', 'protons', 'neutron', 'neutrons',
      'eletron', 'eletrons', 'eletrosfera', 'subatomico', 'subatomica', 'fissao', 'fusao',
      'quimica', 'tabela periodica', 'camada k', 'orbital', 'orbitais', 'quark', 'quarks',
      'foton', 'fotons', 'molecula', 'moleculas', 'ligacao covalente', 'bateria', 'computador',
      'bacteri', 'colonia de bacterias'
    ],
  },
  translacao_terra: {
    id: 'translacao_terra',
    titulo: 'Movimento de Translação da Terra e Estações do Ano',
    area: 'ciencias',
    tema: 'translacao_terra',
    subtemas: ['astronomia', 'orbita da terra', 'inclinacao do eixo', 'estacoes do ano', 'solsticio e equinocio'],
    conceitosChave: [
      'translacao', 'translacao da terra', 'movimento de translacao',
      'orbita da terra', 'terra orbita o sol', 'estacoes do ano', 'solsticio', 'equinocio'
    ],
    termosConflitantes: ['rotacao', 'dia e noite', 'fuso horario'],
  },
  revolucao_industrial: {
    id: 'revolucao_industrial',
    titulo: 'A Revolução Industrial e a Força a Vapor',
    area: 'historia',
    tema: 'revolucao_industrial',
    subtemas: ['maquina a vapor', 'industrializacao', 'carvao mineral', 'teares mecanicos', 'seculo xviii'],
    conceitosChave: [
      'revolucao industrial', 'primeira revolucao industrial', 'maquina a vapor',
      'maquinas a vapor', 'james watt', 'teares mecanicos'
    ],
    termosConflitantes: ['revolucao francesa', 'revolucao russa', 'independencia'],
  },
  urbanizacao: {
    id: 'urbanizacao',
    titulo: 'O Processo de Urbanização e Dinâmica Espacial',
    area: 'geografia',
    tema: 'urbanizacao',
    subtemas: ['geografia urbana', 'exodo rural', 'crescimento urbano', 'metropoles', 'conurbacao'],
    conceitosChave: [
      'urbanizacao', 'processo de urbanizacao', 'crescimento urbano',
      'exodo rural', 'conurbacao', 'metropolizacao'
    ],
    termosConflitantes: [],
  },
  rotacao_terra: {
    id: 'rotacao_terra',
    titulo: 'Movimento de Rotação da Terra e o Ciclo Dia e Noite',
    area: 'ciencias',
    tema: 'rotacao_terra',
    subtemas: ['astronomia', 'giro da terra', 'ciclo dia e noite', 'proprio eixo'],
    conceitosChave: [
      'rotacao da terra', 'movimento de rotacao', 'terra gira em torno de si',
      'ciclo dia e noite', 'terra gira em torno do proprio eixo'
    ],
    termosConflitantes: ['translacao', 'estacoes do ano', '365 dias'],
  },
  sistema_respiratorio: {
    id: 'sistema_respiratorio',
    titulo: 'O Sistema Respiratório e a Hematose Pulmonar',
    area: 'ciencias',
    tema: 'sistema_respiratorio',
    subtemas: ['anatomia e fisiologia', 'pulmoes', 'alveolos', 'hematose', 'diafragma'],
    conceitosChave: [
      'sistema respiratorio', 'respiracao humana', 'hematose',
      'alveolos pulmonares', 'trocas gasosas pulmao', 'mecanica do diafragma'
    ],
    termosConflitantes: ['respiracao celular', 'digestivo', 'circulatorio', 'coracao'],
  },
  hidreletrica: {
    id: 'hidreletrica',
    titulo: 'Como funciona uma usina hidrelétrica',
    area: 'ciencias',
    tema: 'hidreletrica',
    subtemas: ['energia hidreletrica', 'represa e barragem', 'turbina e gerador', 'conduto forcado'],
    conceitosChave: [
      'usina hidreletrica', 'hidreletrica', 'energia hidreletrica',
      'represa e turbina', 'geracao hidreletrica', 'barragem e gerador'
    ],
    termosConflitantes: ['termeletrica', 'nuclear', 'solar', 'eolica'],
  },
  // Tópico conhecido da estrutura atômica (tem experiência visual dedicada / fallback seguro)
  atomo: {
    id: 'atomo',
    titulo: 'Estrutura Atômica e Eletrosfera',
    area: 'ciencias',
    tema: 'atomo',
    subtemas: ['fisica e quimica subatomica', 'nucleo atomico', 'protons e neutrons', 'eletrosfera', 'eletrons'],
    conceitosChave: [
      'atomo', 'atomos', 'atomico', 'atomica', 'estrutura do atomo', 'estrutura atomica',
      'como funciona um atomo', 'proton', 'protons', 'neutron', 'neutrons',
      'eletron', 'eletrons', 'eletrosfera', 'subatomico', 'nucleo atomico', 'nucleo do atomo'
    ],
    termosConflitantes: ['celula', 'citoplasma', 'organela', 'mitocondria'],
  },
};

/**
 * Normaliza uma string para comparação semântica simples (minúsculas, sem acentos, sem pontuação espúria).
 */
export function normalizeText(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Classificação por faixas de confiança:
 * - 0.90 a 1.00: Alta confiança (tema e conceito diretamente identificados)
 * - 0.75 a 0.89: Confiança aceitável (tema reconhecido, permite animação temática se compatível)
 * - 0.50 a 0.74: Confiança baixa (não usar visual temático específico; usar modo geométrico)
 * - abaixo de 0.50: Muito baixa / desconhecida (não usar visual temático específico)
 */
export function getConfidenceLevel(score) {
  if (score >= 0.90) return { nivel: 'alta', rotulo: 'Alta confiança', podeUsarTematico: true };
  if (score >= 0.75) return { nivel: 'aceitavel', rotulo: 'Confiança aceitável', podeUsarTematico: true };
  if (score >= 0.50) return { nivel: 'baixa', rotulo: 'Confiança baixa', podeUsarTematico: false };
  return { nivel: 'muito_baixa', rotulo: 'Confiança insuficiente', podeUsarTematico: false };
}

/**
 * Extrai o conceito dominante, área e subtema de uma pergunta ou título.
 */
export function extractTopic(input) {
  const norm = normalizeText(input);

  // 1. Átomo e Física/Química Subatômica
  if (/\b(atomo|atomos|atomico|atomica|eletron|eletrons|proton|protons|neutron|neutrons|eletrosfera|subatomico|subatomica)\b/.test(norm)) {
    return {
      area: 'ciencias',
      tema: 'atomo',
      subtema: 'estrutura_atomica',
      conceitos: ['atomo', 'nucleo_atomico', 'protons', 'neutrons', 'eletrons', 'eletrosfera'],
      confianca: 0.96,
      id: 'atomo',
    };
  }

  // 2. Célula e Biologia Celular
  if (/\b(celula|celulas|celular|citoplasma|citosol|organela|organelas|mitocondria|mitocondrias|membrana plasmatica|membrana celular|carioteca)\b/.test(norm)
      && !/\b(bacteri|atomo|atomos|proton|eletron)\b/.test(norm)) {
    return {
      area: 'ciencias',
      tema: 'celula',
      subtema: 'biologia_celular',
      conceitos: ['celula', 'membrana', 'citoplasma', 'nucleo_celular', 'mitocondria'],
      confianca: 0.95,
      id: 'celula',
    };
  }

  // 3. Terremotos e Placas Tectônicas (NUNCA placas de trânsito)
  if (/\b(terremoto|terremotos|sismo|sismos|sismico|sismica|placas? tectonicas?|abalos? sismicos?|ondas? sismicas?)\b/.test(norm)
      && !/\b(transito|carro|veiculo|sinalizacao|rua|avenida|rodovia|emocional)\b/.test(norm)) {
    return {
      area: 'geografia',
      tema: 'terremoto',
      subtema: 'sismologia',
      conceitos: ['placas_tectonicas', 'ondas_sismicas', 'epicentro', 'hipocentro'],
      confianca: 0.95,
      id: 'terremoto',
    };
  }

  // 4. Fotossíntese
  const hasPlant = /\b(planta|plantas|vegetais|folhas?)\b/.test(norm);
  if (/\b(fotossintese|clorofila|cloroplasto)\b/.test(norm)
      || (hasPlant && /aliment|glicose|acucar/.test(norm) && /produz|producao|fabric|\bfaz|\bfaze/.test(norm))
      || (hasPlant && /\b(luz|sol|solar)\b/.test(norm) && /gas carbonico|dioxido de carbono|\bco2\b/.test(norm))) {
    return {
      area: 'ciencias',
      tema: 'fotossintese',
      subtema: 'bioquimica_vegetal',
      conceitos: ['luz_solar', 'clorofila', 'co2', 'oxigenio', 'glicose'],
      confianca: 0.94,
      id: 'fotossintese',
    };
  }

  // 5. Brasil Colonial
  if (/\b(brasil colonial|periodo colonial|colonizacao do brasil|capitanias? hereditarias?|brasil colonia)\b/.test(norm)) {
    return {
      area: 'historia',
      tema: 'brasil_colonial',
      subtema: 'colonizacao',
      conceitos: ['brasil_colonial', 'capitanias', 'engenho', 'trabalho_colonial'],
      confianca: 0.95,
      id: 'brasil_colonial',
    };
  }

  // 6. Vulcão
  if (/\b(vulcao|vulcoes|erupcao|erupcoes|erupcao vulcanica|camara magmatica|chamine vulcanica)\b/.test(norm)
      || (/\bmagma\b/.test(norm) && /\b(lava|subindo|pressao|cratera)\b/.test(norm))) {
    return {
      area: 'geografia',
      tema: 'vulcao',
      subtema: 'vulcanologia',
      conceitos: ['magma', 'lava', 'erupcao', 'camara_magmatica'],
      confianca: 0.95,
      id: 'vulcao',
    };
  }

  // 7. Ciclo da água (NUNCA ebulição da água ou água fervendo)
  if (/\b(ciclo da agua|ciclo hidrologico|como a agua circula|como a agua retorna)\b/.test(norm)
      && !/\b(ferve|fervendo|ebulicao|fervura|ponto de ebulicao)\b/.test(norm)) {
    return {
      area: 'ciencias',
      tema: 'agua',
      subtema: 'ciclo_hidrologico',
      conceitos: ['evaporacao', 'condensacao', 'precipitacao', 'infiltracao'],
      confianca: 0.95,
      id: 'agua',
    };
  }

  // 8. Comparação entre Eclipses (Solar vs. Lunar)
  // Pergunta comparativa: JAMAIS escolher arbitrariamente apenas uma das animações!
  const isEclipseComparison = (/\b(diferenca|diferencas|compare|comparar|comparacao|distincao|versus|\bvs\b)\b/.test(norm)
    && /\beclipse/.test(norm)
    && (/\b(solar|sol)\b/.test(norm) || /\b(lunar|lua)\b/.test(norm)))
    || (/\beclipse.*solar\b/.test(norm) && /\beclipse.*lunar\b/.test(norm))
    || (/\b(solar e lunar|lunar e solar)\b/.test(norm) && /\beclipse\b/.test(norm));

  if (isEclipseComparison) {
    return {
      area: 'ciencias',
      tema: 'comparacao_eclipses',
      subtema: 'comparacao_astronomica',
      conceitos: ['sol', 'terra', 'lua', 'alinhamento_orbital', 'sombra_da_terra', 'sombra_da_lua'],
      confianca: 0.96,
      id: 'comparacao_eclipses',
    };
  }

  // 9. Eclipse Lunar (DISTINÇÃO TOTAL DO SOLAR)
  // Alinhamento: Sol -> Terra -> Lua (Terra projeta sombra sobre a Lua, Lua de Sangue)
  const isLunarEclipse = !isEclipseComparison && (
    /\b(eclipse lunar|lua de sangue|lua na sombra da terra)\b/.test(norm)
    || (/\blua\b/.test(norm) && /\b(escura|escuras?|vermelha|vermelhas?|avermelhada|avermelhadas?|rubra|rubras?|sangue)\b/.test(norm) && /\beclipse\b/.test(norm))
    || (/\bterra\b/.test(norm) && /\b(faz sombra|projeta sombra)\b/.test(norm) && /\blua\b/.test(norm))
    || (/\bterra\b/.test(norm) && /\b(entre o? sol e a? lua|fica entre o? sol e a? lua|passa entre o? sol e a? lua)\b/.test(norm))
  );

  if (isLunarEclipse) {
    return {
      area: 'ciencias',
      tema: 'eclipse_lunar',
      subtema: 'fenomenos_astronomicos',
      conceitos: ['sol', 'terra', 'lua', 'sombra_da_terra', 'lua_de_sangue'],
      confianca: 0.96,
      id: 'eclipse_lunar',
    };
  }

  // 10. Eclipse Solar (DISTINÇÃO TOTAL DO LUNAR)
  // Alinhamento: Sol -> Lua -> Terra (Lua projeta sombra sobre a Terra)
  const isSolarEclipse = !isEclipseComparison && !isLunarEclipse && (
    /\b(eclipse solar)\b/.test(norm)
    || (/\blua\b/.test(norm) && /\b(passa entre|fica entre|entre o? sol e a? terra)\b/.test(norm))
    || (/\bsombra da lua\b/.test(norm) && /\bterra\b/.test(norm))
  );

  if (isSolarEclipse) {
    return {
      area: 'ciencias',
      tema: 'eclipse',
      subtema: 'eclipse_solar',
      conceitos: ['sol', 'lua', 'terra', 'sombra_lunar'],
      confianca: 0.95,
      id: 'eclipse',
    };
  }

  // 10. Translação da Terra
  if (/\b(translacao|translacao da terra|movimento de translacao|orbita da terra|terra orbita o sol)\b/.test(norm)) {
    return {
      area: 'ciencias',
      tema: 'translacao_terra',
      subtema: 'mecanica_celeste',
      conceitos: ['orbita_eliptica', 'inclinacao_eixo', 'estacoes_ano'],
      confianca: 0.95,
      id: 'translacao_terra',
    };
  }

  // 11. Revolução Industrial (NUNCA Revolução Francesa ou Russa)
  if (/\b(revolucao industrial|primeira revolucao industrial|maquinas? a vapor)\b/.test(norm)
      && !/\b(francesa|franca|bastilha|russa)\b/.test(norm)) {
    return {
      area: 'historia',
      tema: 'revolucao_industrial',
      subtema: 'maquina_a_vapor',
      conceitos: ['maquina_a_vapor', 'carvao', 'industria', 'teares'],
      confianca: 0.95,
      id: 'revolucao_industrial',
    };
  }

  // 12. Urbanização
  if (/\b(urbanizacao|processo de urbanizacao|crescimento urbano|exodo rural)\b/.test(norm)) {
    return {
      area: 'geografia',
      tema: 'urbanizacao',
      subtema: 'espaco_urbano',
      conceitos: ['exodo_rural', 'cidades', 'metropole'],
      confianca: 0.95,
      id: 'urbanizacao',
    };
  }

  // 13. Rotação da Terra
  if (/\b(rotacao da terra|movimento de rotacao|terra gira em torno de si)\b/.test(norm)) {
    return {
      area: 'ciencias',
      tema: 'rotacao_terra',
      subtema: 'dia_e_noite',
      conceitos: ['proprio_eixo', 'dia_e_noite', '24_horas'],
      confianca: 0.95,
      id: 'rotacao_terra',
    };
  }

  // 14. Sistema Respiratório
  if (/\b(sistema respiratorio|respiracao humana|hematose|alveolos pulmonares)\b/.test(norm)) {
    return {
      area: 'ciencias',
      tema: 'sistema_respiratorio',
      subtema: 'hematose',
      conceitos: ['pulmoes', 'alveolos', 'hematose', 'oxigenio_co2'],
      confianca: 0.95,
      id: 'sistema_respiratorio',
    };
  }

  // 15. Usina Hidrelétrica
  if (/\b(usina hidreletrica|hidreletrica|energia hidreletrica|represa e turbina|geracao hidreletrica)\b/.test(norm)) {
    return {
      area: 'ciencias',
      tema: 'hidreletrica',
      subtema: 'geracao_energia',
      conceitos: ['represa', 'conduto_forcado', 'turbina', 'gerador'],
      confianca: 0.95,
      id: 'hidreletrica',
    };
  }

  // Reconhecimento de temas conceituais/abstratos sem template prévio (confiança moderada / baixa para uso genérico seguro)
  if (/\b(justica|lei|direito|tribunal|julgamento)\b/.test(norm)) {
    return {
      area: 'outro',
      tema: 'justica',
      subtema: 'filosofia_do_direito',
      conceitos: ['equidade', 'leis', 'sociedade', 'direitos'],
      confianca: 0.65,
      id: null,
    };
  }
  if (/\b(democracia|eleicao|voto|cidadania)\b/.test(norm)) {
    return {
      area: 'outro',
      tema: 'democracia',
      subtema: 'ciencia_politica',
      conceitos: ['participacao', 'voto', 'representacao', 'direitos'],
      confianca: 0.70,
      id: null,
    };
  }
  if (/\b(empatia|emocao|psicologia|sentimento)\b/.test(norm)) {
    return {
      area: 'outro',
      tema: 'empatia',
      subtema: 'psicologia',
      conceitos: ['compreensao', 'alteridade', 'conexoes_humanas'],
      confianca: 0.65,
      id: null,
    };
  }
  if (/\b(ferve|ebulicao|mudanca de estado)\b/.test(norm)) {
    return {
      area: 'ciencias',
      tema: 'ebulicao',
      subtema: 'termologia',
      conceitos: ['calor', 'energia_cinetica', 'vaporizacao', 'ponto_de_ebulicao'],
      confianca: 0.72,
      id: null,
    };
  }

  if (/\b(placas? de transito|sinalizacao viaria|sinal de transito|placa de pare|faixa de pedestre|radar de velocidade)\b/.test(norm)) {
    return {
      area: 'geografia',
      tema: 'placas_transito',
      subtema: 'mobilidade_urbana',
      conceitos: ['sinalizacao', 'transito', 'normas_viarias', 'seguranca'],
      confianca: 0.85,
      id: 'placas_transito',
    };
  }
  if (/\b(revolucao francesa|queda da bastilha|bastilha|luis xvi|jacobinos|girondinos|guilhotina|franca 1789)\b/.test(norm)) {
    return {
      area: 'historia',
      tema: 'revolucao_francesa',
      subtema: 'revolucao_francesa_1789',
      conceitos: ['queda_da_bastilha', 'fim_do_absolutismo', 'direitos_humanos', 'soberania_popular'],
      confianca: 0.90,
      id: 'revolucao_francesa',
    };
  }

  // Caso genérico / abstrato / não identificado especificamente
  return {
    area: 'outro',
    tema: 'generico',
    subtema: 'nao_identificado',
    conceitos: [],
    confianca: 0.35,
    id: null,
  };
}

/**
 * Avalia se o tema solicitado e o tema de uma animação são compatíveis.
 * NUNCA retorna true se houver conflito semântico (ex: átomo vs célula, eclipse lunar vs solar).
 */
export function isSemanticallyCompatible(userQueryOrTopic, targetAnimationId) {
  if (!targetAnimationId || typeof targetAnimationId !== 'string') return false;

  const targetId = targetAnimationId.trim().toLowerCase();
  const meta = ANIMATION_METADATA[targetId];
  if (!meta) return false;

  const userNorm = typeof userQueryOrTopic === 'object' && userQueryOrTopic !== null
    ? normalizeText(userQueryOrTopic.tema || userQueryOrTopic.titulo || '')
    : normalizeText(userQueryOrTopic);

  // 1. Verificação estrita de termos proibidos/conflitantes
  if (meta.termosConflitantes && meta.termosConflitantes.length > 0) {
    for (const forbidden of meta.termosConflitantes) {
      const regex = new RegExp(`\\b${forbidden.replace(/ /g, '\\s+')}\\b`, 'i');
      if (regex.test(userNorm)) {
        return false; // Incompatibilidade imediata
      }
    }
  }

  // 2. Extrai o tópico do usuário
  const userTopic = typeof userQueryOrTopic === 'object' && userQueryOrTopic !== null && userQueryOrTopic.tema
    ? userQueryOrTopic
    : extractTopic(userQueryOrTopic);

  // Eclipse Lunar JAMAIS é compatível com animação de eclipse solar
  if (userTopic.tema === 'eclipse_lunar' && (targetId === 'eclipse' || meta.tema === 'eclipse_solar')) {
    return false;
  }

  // Eclipse Solar JAMAIS é compatível com animação de eclipse lunar
  if ((userTopic.tema === 'eclipse' || userTopic.tema === 'eclipse_solar') && (targetId === 'eclipse_lunar' || meta.tema === 'eclipse_lunar')) {
    return false;
  }

  // Pergunta comparativa de eclipses JAMAIS pode selecionar arbitrariamente solar ou lunar isolado
  if (userTopic.tema === 'comparacao_eclipses') {
    if (targetId === 'eclipse' || targetId === 'eclipse_lunar' || meta.tema === 'eclipse_solar' || meta.tema === 'eclipse_lunar') {
      return false;
    }
  }

  // Ebulição da água JAMAIS é compatível com ciclo da água
  if (userTopic.tema === 'ebulicao' && (targetId === 'agua' || meta.tema === 'ciclo_da_agua')) {
    return false;
  }

  // Placas de trânsito JAMAIS são compatíveis com terremoto / placas tectônicas
  if (userTopic.tema === 'placas_transito' && (targetId === 'terremoto' || meta.tema === 'terremoto')) {
    return false;
  }

  // Revolução Francesa JAMAIS é compatível com Revolução Industrial
  if (userTopic.tema === 'revolucao_francesa' && (targetId === 'revolucao_industrial' || meta.tema === 'revolucao_industrial')) {
    return false;
  }

  // Átomo JAMAIS é compatível com biologia celular
  if (userTopic.tema === 'atomo' && (targetId === 'celula' || meta.tema === 'celula')) {
    return false;
  }

  // Se a confiança for menor que 0.75, NUNCA autoriza animação temática específica
  if (userTopic.confianca < 0.75) {
    return false;
  }

  // Se o tópico extraído for o mesmo da animação, com confiança mínima aceitável (>= 0.75)
  if (userTopic.id === targetId || userTopic.tema === meta.tema) {
    return true;
  }

  // 3. Verificação por conceitos-chave da animação
  let matchCount = 0;
  for (const concept of meta.conceitosChave) {
    const conceptNorm = normalizeText(concept);
    if (userNorm.includes(conceptNorm)) {
      matchCount += 1;
    }
  }

  return matchCount > 0 && userTopic.confianca >= 0.75;
}

/**
 * Encontra a melhor animação pré-existente para a pergunta, com cálculo de confiança.
 * Retorna null se nenhuma atingir o limiar de confiança (0.75) ou se houver termos conflitantes.
 */
export function matchSemanticAnimation(question) {
  const norm = normalizeText(question);
  if (!norm) return null;

  // Perguntas comparativas ou específicas não devem usar introduções locais
  if (/\b(compare|diferenca|quantos|quantas|quando|onde|richter|magnitude|c3|c4|cam|calvin|inconfidencia|impacto)\b/.test(norm)
      && !/\brevolucao industrial\b/.test(norm)) {
    return null;
  }

  const topic = extractTopic(question);
  if (!topic.id || topic.confianca < 0.75) {
    return null;
  }

  const candidateMeta = ANIMATION_METADATA[topic.id];
  if (!candidateMeta) return null;

  // Validação semântica final
  if (!isSemanticallyCompatible(question, candidateMeta.id)) {
    return null;
  }

  // Se for o átomo, sabemos que não existe template estático pré-compilado em localVisualExperiences,
  // mas sim roteiro didático dinâmico. Retorna null para matching de template estático.
  if (candidateMeta.id === 'atomo') {
    return null;
  }

  return candidateMeta.id;
}
