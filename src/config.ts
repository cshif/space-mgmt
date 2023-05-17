import { RectData } from './types';

export const color = {
  error: '#CC543A',
  blueprint: '#35637C'
};

export const defaultConfig: RectData['config'] = {
  roughness: 0.8,
  fill: color.blueprint,
  fillStyle: 'sunburst',
  fillWeight: 1,
  stroke: color.blueprint,
  strokeWidth: 3
};

export const defaultInfo: RectData['info'] = {
  name: '',
  description: '',
  color: color.blueprint
};
