/**
 * @file: 解析命令行参数
 * @author: yangqianjun
 * @Date: 2019-07-20 15:12:00
 * @LastEditors: yangqianjun
 * @LastEditTime: 2019-12-09 16:53:01
 */
import { THEME } from './consts';

export default function argvParser(argv: string[], options: {} = {}) {
  let lastKey = THEME;
  return argv.reduce((opts, arg) => {
    const name = arg.replace(/^[-]+/g, '');
    if (name === arg) {
      // value or name
      if (lastKey) {
        opts[lastKey] = name;
        lastKey = ''; // single value only
      }
    } else {
      lastKey = name.replace(/-/g, '_').toUpperCase();
      opts[lastKey] = '';
    }
    return options;
  }, options);
}
