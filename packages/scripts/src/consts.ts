/**
 * @file: tkit/scripts 常量
 * @author: yangqianjun
 * @Date: 2019-07-29 13:21:05
 * @LastEditors: yangqianjun
 * @LastEditTime: 2019-12-09 16:53:56
 */

import { concatDirectory, ensureFile } from 'tkit-utils';

/** tkit/scripts根目录 */
export const modulePath = concatDirectory(__dirname, '..');
export const THEME = 'THEME';
/** 支持覆盖tkit/scripts内配置文件 */
export const ensureScriptsFile = (p: string) => ensureFile(p, modulePath);
export const getTHEME = () =>
  process.env.THEME !== undefined ? process.env.THEME : process.env.WEBPACK_THEME;
export const isProd = () => process.env.BABEL_ENV === 'production';
