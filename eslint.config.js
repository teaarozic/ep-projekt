import frontendConfig from './frontend/eslint.config.js';

export default [
  {
    ignores: [
      '**/node_modules',
      '**/.next',
      '**/dist',
      '**/next-env.d.ts',
      '**/test-results',
    ],
  },
  ...frontendConfig,
];
