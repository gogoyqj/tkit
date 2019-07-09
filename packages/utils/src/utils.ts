import * as fs from 'fs';
import * as path from 'path';

export const TkitAppDirectory = fs.realpathSync(process.cwd());
export const concatDirectory = (...ps: string[]) => path.join(...ps);

export const ensureFile = function(file: string, moduleDirectory: string) {
  return fs.existsSync(`${TkitAppDirectory}/${file}`) ||
    fs.existsSync(`${TkitAppDirectory}/${file}.js`)
    ? `${TkitAppDirectory}/${file}`
    : `${moduleDirectory}/${file}`;
};

export const ensureFileModern = function(file: string, moduleDirectory: string) {
  return fs.existsSync(`${TkitAppDirectory}/${file}`) ||
    fs.existsSync(`${TkitAppDirectory}/${file}.js`)
    ? `${TkitAppDirectory}/${file}`
    : `${moduleDirectory}/${file.replace(/config\//g, 'lib/')}`;
};

export const ensureFiles = function(files: string[]) {
  return files.filter(file => fs.existsSync(file));
};

export const resolveApp = (relativePath: string) => path.resolve(TkitAppDirectory, relativePath);
