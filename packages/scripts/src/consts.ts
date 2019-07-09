import { concatDirectory, ensureFile } from 'tkit-utils';

export const modulePath = concatDirectory(__dirname, '..');
export const THEME = 'THEME';
export const ensureScriptsFile = (p: string) => ensureFile(p, modulePath);
