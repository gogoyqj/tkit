import { concatDirectory, ensureFile } from 'tkit-utils';

export const modulePath = concatDirectory(__dirname, '..');
export const THEME = 'THEME';
export const ensureScriptsFile = (p: string) => ensureFile(p, modulePath);
export const getTHEME = () =>
  process.env.THEME !== undefined ? process.env.THEME : process.env.WEBPACK_THEME;
export const isProd = () => process.env.BABEL_ENV === 'production';
