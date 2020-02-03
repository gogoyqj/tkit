import { InitialOptions } from '@jest/types/build/Config';
import { ensureFile, ensureFiles, concatDirectory, TkitAppDirectory } from 'tkit-utils';

const modulePath = concatDirectory(__dirname, '..');

const setupFiles = ensureFiles(
  [
    'config/polyfills.js',
    './setup.ts',
    '__tests__/setup.ts',
    './setup.js',
    '__tests__/setup.js'
  ].map(file => ensureFile(file, modulePath))
);
export const config: Partial<InitialOptions> = (module.exports = {
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  setupFiles,
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(j|t)s?(x)',
    '<rootDir>/tests/**/?(*.)(spec|test).(j|t)s?(x)',
    '<rootDir>/__tests__/**/?(*.)(spec|test).(j|t)s?(x)'
  ],
  testEnvironment: 'node',
  testURL: 'http://localhost:4444',
  transform: {
    '^.+\\.(js|jsx|mjs)$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.css$': ensureFile('config/jest/cssTransform.js', modulePath),
    '^(?!.*\\.(js|jsx|mjs|css|json)$)': ensureFile('config/jest/fileTransform.js', modulePath)
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|ts|tsx)$'],
  moduleNameMapper: {
    '^src(.*)$': '<rootDir>/src/$1',
    '@ajax': '<rootDir>/node_modules/tkit-ajax',
    'src/utils/utils': '<rootDir>/src/utils/utils.d.ts',
    'src(.*)$': '<rootDir>/src/$1',
    '@features(.*)$': '<rootDir>/src/features/$1',
    '@AuthContext': '<rootDir>/src/features/home/components/AuthContext',
    '^react-native$': 'react-native-web'
  },
  moduleFileExtensions: [
    'h5.ts',
    'web.ts',
    'ts',
    'h5.tsx',
    'web.tsx',
    'tsx',
    'web.js',
    'js',
    'web.jsx',
    'jsx',
    'json',
    'node',
    'mjs'
  ],
  globals: {
    'ts-jest': {
      tsConfig: concatDirectory(TkitAppDirectory, 'tsconfig.test.json')
    }
  }
});
