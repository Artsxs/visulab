import { isSemanticallyCompatible, normalizeText } from './semantic-matcher.mjs';

// Reconhecimento semântico dos tópicos locais. Perguntas específicas, comparações
// e temas de outros assuntos seguem para o serviço de IA ou fallback seguro.
export function findPremiumTopic(question) {
  const text = normalizeText(question);
  if (!text) return null;

  if (/\b(compare|diferenca|quantos|quantas|quando|onde|richter|magnitude|c3|c4|cam|calvin|inconfidencia|impacto)\b/.test(text) && !/\brevolucao industrial\b/.test(text)) return null;

  // 1. Terremotos e Placas Tectônicas
  if (/\b(terremotos?|sismos?)\b|\bplacas? tectonicas?\b|\b(abalos?|ondas?) sismic[oa]s?\b/.test(text)) {
    if (isSemanticallyCompatible(text, 'terremoto')) return 'terremoto';
  }

  // 2. Fotossíntese
  const plant = /\b(plantas?|vegetais?|folhas?)\b/.test(text);
  if (/\bfotossintese\b|\bclorofila\b/.test(text)
    || (plant && /produz|producao|fabric|\bfaz|\bfaze/.test(text) && /aliment|glicose|acucar/.test(text))
    || (plant && /\b(luz|sol|solar)\b/.test(text) && /gas carbonico|dioxido de carbono|\bco2\b/.test(text))) {
    if (isSemanticallyCompatible(text, 'fotossintese')) return 'fotossintese';
  }

  // 3. Brasil Colonial
  if (/\bbrasil colonial\b|\bperiodo colonial\b|\bcolonizacao do brasil\b|\bcapitanias? hereditarias?\b|\bbrasil colonia\b/.test(text)) {
    if (isSemanticallyCompatible(text, 'brasil_colonial')) return 'brasil_colonial';
  }

  // 4. Vulcão
  if (/\b(vulcao|vulcoes|erupcao|erupcoes|camara magmatica|chamine vulcanica)\b/.test(text) || (/\bmagma\b/.test(text) && /\b(lava|subindo|pressao|cratera)\b/.test(text))) {
    if (isSemanticallyCompatible(text, 'vulcao')) return 'vulcao';
  }

  // 5. Célula (Biologia Celular)
  // Termos subatômicos (átomo, prótons, elétrons) NUNCA podem ativar célula
  if (/\b(celula|celulas|organela|organelas|citoplasma|membrana celular|mitocondria|nucleo celular)\b/.test(text)) {
    if (isSemanticallyCompatible(text, 'celula')) return 'celula';
  }

  // 6. Translação da Terra
  if (/\b(translacao|movimento de translacao|translacao da terra|orbita da terra|terra orbita o sol)\b/.test(text)) {
    if (isSemanticallyCompatible(text, 'translacao_terra')) return 'translacao_terra';
  }

  // 7. Revolução Industrial
  if (/\b(revolucao industrial|primeira revolucao industrial|maquinas? a vapor)\b/.test(text)) {
    if (isSemanticallyCompatible(text, 'revolucao_industrial')) return 'revolucao_industrial';
  }

  // 8. Urbanização
  if (/\b(urbanizacao|processo de urbanizacao|crescimento urbano|exodo rural)\b/.test(text)) {
    if (isSemanticallyCompatible(text, 'urbanizacao')) return 'urbanizacao';
  }

  // 9. Rotação da Terra
  if (/\b(rotacao da terra|movimento de rotacao|terra gira em torno de si)\b/.test(text)) {
    if (isSemanticallyCompatible(text, 'rotacao_terra')) return 'rotacao_terra';
  }

  // 10. Sistema Respiratório
  if (/\b(sistema respiratorio|respiracao humana|hematose|alveolos pulmonares)\b/.test(text)) {
    if (isSemanticallyCompatible(text, 'sistema_respiratorio')) return 'sistema_respiratorio';
  }

  // 11. Usina Hidrelétrica
  if (/\b(usina hidreletrica|hidreletrica|energia hidreletrica|represa e turbina|geracao hidreletrica)\b/.test(text)) {
    if (isSemanticallyCompatible(text, 'hidreletrica')) return 'hidreletrica';
  }

  // 12. Eclipse Lunar
  if (/\b(eclipse lunar|terra entre o? sol e a? lua|terra faz sombra (na|sobre a) lua|terra projeta sombra (na|sobre a) lua|lua de sangue|lua fica escura n[ou] eclipse|lua na sombra da terra)\b/.test(text)) {
    if (isSemanticallyCompatible(text, 'eclipse_lunar')) return 'eclipse_lunar';
  }

  return null;
}
