import { execSync } from 'child_process';
import semver from 'semver';
import { ensureFile } from 'tkit-utils';

import { modulePath } from './consts';

const requiredNpmVersion = (
  require(ensureFile('package.json', modulePath)).engines || require('../package.json').engines
).npm;

export default function checkNpmVersion() {
  const currNpmVersion = execSync('npm -v', { encoding: 'utf-8' }).trim();
  if (!semver.satisfies(currNpmVersion, requiredNpmVersion)) {
    console.log(
      'You are using npm ' +
        currNpmVersion +
        ', but this project requires npm ' +
        requiredNpmVersion +
        '.\nPlease update your npm version.'
    );
    process.exit(1);
  }
}
