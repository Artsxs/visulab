const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Reconhecimento dos três roteiros iniciais. Perguntas específicas e comparações
// precisam de um roteiro próprio e seguem para o serviço de IA.
export function findPremiumTopic(question) {
  const text = normalize(String(question)).replace(/[^a-z0-9]+/g, ' ').trim();
  if (/\b(compare|diferenca|quantos|quantas|quando|onde|richter|magnitude|c3|c4|cam|calvin|revolucao|inconfidencia|impacto)\b/.test(text)) return null;
  if (/\b(terremotos?|sismos?)\b|\bplacas? tectonicas?\b|\b(abalos?|ondas?) sismic[oa]s?\b/.test(text)) return 'terremoto';
  const plant = /\b(plantas?|vegetais?|folhas?)\b/.test(text);
  if (/\bfotossintese\b|\bclorofila\b/.test(text)
    || (plant && /produz|producao|fabric|\bfaz|\bfaze/.test(text) && /aliment|glicose|acucar/.test(text))
    || (plant && /\b(luz|sol|solar)\b/.test(text) && /gas carbonico|dioxido de carbono|\bco2\b/.test(text))) return 'fotossintese';
  if (/\bbrasil colonial\b|\bperiodo colonial\b|\bcolonizacao do brasil\b|\bcapitanias? hereditarias?\b|\bbrasil colonia\b/.test(text)) return 'brasil_colonial';
  return null;
}
