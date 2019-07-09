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
