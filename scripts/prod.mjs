import { build } from './build.mjs';

await build();

const proc = Bun.spawn({
  cmd: ['bun', 'server.js', '--root', 'dist'],
  stdout: 'inherit',
  stderr: 'inherit',
  stdin: 'inherit',
  env: { ...process.env, NODE_ENV: 'production', PORT: process.env.PORT || '3000' },
});

const code = await proc.exited;
process.exit(code ?? 0);
