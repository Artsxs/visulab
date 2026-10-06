const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Reconhecimento dos três roteiros iniciais. Perguntas específicas e comparações
// precisam de um roteiro próprio e seguem para o serviço de IA.
export function findPremiumTopic(question) {
  const text = normalize(String(question)).replace(/[^a-z0-9]+/g, ' ').trim();
  if (/\b(compare|diferenca|quantos|quantas|quando|onde|richter|magnitude|c3|c4|cam|calvin|inconfidencia|impacto)\b/.test(text) && !/\brevolucao industrial\b/.test(text)) return null;
  if (/\b(terremotos?|sismos?)\b|\bplacas? tectonicas?\b|\b(abalos?|ondas?) sismic[oa]s?\b/.test(text)) return 'terremoto';
  const plant = /\b(plantas?|vegetais?|folhas?)\b/.test(text);
  if (/\bfotossintese\b|\bclorofila\b/.test(text)
    || (plant && /produz|producao|fabric|\bfaz|\bfaze/.test(text) && /aliment|glicose|acucar/.test(text))
    || (plant && /\b(luz|sol|solar)\b/.test(text) && /gas carbonico|dioxido de carbono|\bco2\b/.test(text))) return 'fotossintese';
  if (/\bbrasil colonial\b|\bperiodo colonial\b|\bcolonizacao do brasil\b|\bcapitanias? hereditarias?\b|\bbrasil colonia\b/.test(text)) return 'brasil_colonial';
  if (/\b(vulcao|vulcoes|erupcao|erupcoes|camara magmatica|chamine vulcanica)\b/.test(text) || (/\bmagma\b/.test(text) && /\b(lava|subindo|pressao|cratera)\b/.test(text))) return 'vulcao';
  if (/\b(celula|celulas|organela|organelas|citoplasma|membrana celular|mitocondria)\b/.test(text) && !/\bbacteri/.test(text)) return 'celula';
  if (/\b(translacao|movimento de translacao|translacao da terra|orbita da terra|terra orbita o sol)\b/.test(text)) return 'translacao_terra';
  if (/\b(revolucao industrial|primeira revolucao industrial|maquinas? a vapor)\b/.test(text)) return 'revolucao_industrial';
  if (/\b(urbanizacao|processo de urbanizacao|crescimento urbano|exodo rural)\b/.test(text)) return 'urbanizacao';
  if (/\b(rotacao da terra|movimento de rotacao|terra gira em torno de si)\b/.test(text)) return 'rotacao_terra';
  if (/\b(sistema respiratorio|respiracao humana|hematose|alveolos pulmonares)\b/.test(text)) return 'sistema_respiratorio';
  if (/\b(usina hidreletrica|hidreletrica|energia hidreletrica|represa e turbina|geracao hidreletrica)\b/.test(text)) return 'hidreletrica';
  return null;
}
