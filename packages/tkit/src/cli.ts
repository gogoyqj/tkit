#! /usr/bin/env node
import commander from 'commander'; // @fix 'default' https://github.com/microsoft/tslib/issues/58
import { OPTIONS } from './consts';
import { action } from './index';

Object.keys(OPTIONS)
  .reduce((commander, key) => {
    return commander.option.apply(commander, OPTIONS[key]);
  }, commander.version(require('../package.json').version).command('add <type> <feature[/name]>'))
  .action(action);

commander.parse(process.argv);
