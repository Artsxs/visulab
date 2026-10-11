// Registro central unificado de temas visuais do VisuLab.
import { volcanoTheme } from './volcano.mjs';
import { earthquakeTheme } from './earthquake.mjs';
import { waterCycleTheme } from './water-cycle.mjs';
import { eclipseTheme } from './eclipse.mjs';
import { cellTheme } from './cell.mjs';
import { photosynthesisTheme } from './photosynthesis.mjs';
import { earthTranslationTheme } from './earth-translation.mjs';
import { industrialRevolutionTheme } from './industrial-revolution.mjs';
import { urbanizationTheme } from './urbanization.mjs';
import { earthRotationTheme } from './earth-rotation.mjs';
import { respiratorySystemTheme } from './respiratory-system.mjs';

export const allThemes = [
  volcanoTheme,
  earthquakeTheme,
  waterCycleTheme,
  eclipseTheme,
  cellTheme,
  photosynthesisTheme,
  earthTranslationTheme,
  industrialRevolutionTheme,
  urbanizationTheme,
  earthRotationTheme,
  respiratorySystemTheme,
];

export const themesById = {
  vulcao: volcanoTheme,
  'volcanic-eruption': volcanoTheme,
  terremoto: earthquakeTheme,
  'tectonic-plates': earthquakeTheme,
  agua: waterCycleTheme,
  'water-cycle': waterCycleTheme,
  eclipse: eclipseTheme,
  'solar-eclipse': eclipseTheme,
  celula: cellTheme,
  'cell-structure': cellTheme,
  fotossintese: photosynthesisTheme,
  photosynthesis: photosynthesisTheme,
  translacao_terra: earthTranslationTheme,
  'earth-translation': earthTranslationTheme,
  revolucao_industrial: industrialRevolutionTheme,
  'industrial-revolution': industrialRevolutionTheme,
  urbanizacao: urbanizationTheme,
  urbanization: urbanizationTheme,
  rotacao_terra: earthRotationTheme,
  'earth-rotation': earthRotationTheme,
  sistema_respiratorio: respiratorySystemTheme,
  'respiratory-system': respiratorySystemTheme,
};

export function getThemeById(id) {
  return themesById[id] || null;
}
