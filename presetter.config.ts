import { preset } from 'presetter';
import esm from 'presetter-preset-esm';
import strict from 'presetter-preset-strict';

import { name } from './package.json';

export default preset(name, {
  extends: [esm, strict],
});
