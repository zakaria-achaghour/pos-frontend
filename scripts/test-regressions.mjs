import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const temp = await mkdtemp(path.join(tmpdir(), 'pos-session-tests-'));
const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key,value) => storage.set(key,String(value)), removeItem: key => storage.delete(key) };
globalThis.document = { documentElement: { lang: 'en', dir: 'ltr' } };
globalThis.window = { location: { pathname: '/login', href: 'http://localhost/login', assign() {} } };
try {
  const outfile = path.join(temp, 'checks.cjs');
  await build({ entryPoints: ['tests/session-regression.ts'], tsconfig: 'tsconfig.app.json', outfile, bundle: true, platform: 'node', format: 'cjs', define: { 'import.meta.env': '{}' }, logLevel: 'silent' });
  const module = await import(pathToFileURL(outfile));
  await module.runChecks();
} finally {
  await rm(temp, { recursive: true, force: true });
}
