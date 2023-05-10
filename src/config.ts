import type { Options } from 'roughjs/bin/core';

export const color = {
  error: '#CC543A',
  blueprint: '#35637C'
};

const defaultConfig: Options = {
  roughness: 0.8,
  fill: color.blueprint,
  fillStyle: 'sunburst',
  fillWeight: 1,
  stroke: color.blueprint,
  strokeWidth: 3
};

export default defaultConfig;
