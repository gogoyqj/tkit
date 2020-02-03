/**
 * @file: tkit utils 函数
 * @author: yangqianjun
 * @Date: 2019-07-20 15:12:00
 * @LastEditors: yangqianjun
 * @LastEditTime: 2019-12-19 11:42:23
 */

import * as fs from 'fs';
import * as path from 'path';

/** 项目目录 */
export const TkitAppDirectory = fs.realpathSync(process.cwd());
/** path.join */
export const concatDirectory = (...ps: string[]) => path.join(...ps);

/** projectDir/module tkitDir/module  */
export const ensureFile = function(file: string, moduleDirectory: string) {
  return fs.existsSync(`${TkitAppDirectory}/${file}`) ||
    fs.existsSync(`${TkitAppDirectory}/${file}.js`)
    ? `${TkitAppDirectory}/${file}`
    : `${moduleDirectory}/${file}`;
};

/** projectDir/module tkitDir/module config => lib  */
export const ensureFileModern = function(file: string, moduleDirectory: string) {
  return fs.existsSync(`${TkitAppDirectory}/${file}`) ||
    fs.existsSync(`${TkitAppDirectory}/${file}.js`)
    ? `${TkitAppDirectory}/${file}`
    : `${moduleDirectory}/${file.replace(/config\//g, 'lib/')}`;
};

/** 过滤掉不存在的文件 */
export const ensureFiles = function(files: string[]) {
  return files.filter(file => fs.existsSync(file));
};

/** 转换为相对项目目录的路径 */
export const resolveApp = (relativePath: string) => path.resolve(TkitAppDirectory, relativePath);
