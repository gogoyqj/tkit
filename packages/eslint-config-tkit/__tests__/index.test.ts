import fs from 'fs';
import path from 'path';

describe('eslint-config-tkit/react', () => {
  it('should main file exists', () => {
    const pkg = require('../package.json');
    expect(fs.existsSync(path.join(__dirname, '..', pkg.main))).toBeTruthy();
  })
});