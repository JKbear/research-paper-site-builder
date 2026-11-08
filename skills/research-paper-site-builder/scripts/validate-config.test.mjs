import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateConfig } from './validate-config.mjs';

const example = JSON.parse(await readFile(new URL('../assets/site-config.example.json', import.meta.url), 'utf8'));
function readyConfig() {
  const config = structuredClone(example);
  config.site.url = 'https://battery-paper-watch.pages.dev';
  config.deployment.repository = 'example-owner/battery-paper-watch';
  config.journals = [{ id: 'nature-communications', name: 'Nature Communications', mode: 'targeted', enabled: true,
    source: { type: 'crossref', status: 'verified', issn: '2041-1723', url: 'https://api.crossref.org/journals/2041-1723/works', verifiedAt: '2026-11-08T00:00:00Z', evidenceUrl: 'https://www.nature.com/ncomms/' } }];
  return config;
}

test('draft accepts unresolved journals but reports the evidence boundary', () => {
  const result = validateConfig(example);
  assert.deepEqual(result.errors, []);
  assert.ok(result.warnings.some(w => w.includes('not been verified')));
});
test('the same draft is not deployment-ready', () => assert.ok(validateConfig(example, { ready: true }).errors.length > 0));
test('structurally complete source passes without claiming live verification', () => assert.deepEqual(validateConfig(readyConfig(), { ready: true }).errors, []));
test('positive rules cannot all be empty or contain empty all-groups', () => {
  const config = readyConfig(); config.scope.includeAny = []; config.scope.includeAllGroups = [[]];
  assert.ok(validateConfig(config).errors.some(e => e.includes('positive inclusion')));
  config.scope.includeAllGroups = [['ion transport']];
  assert.deepEqual(validateConfig(config).errors, []);
});
test('duplicate journals and topics are rejected', () => {
  const config = readyConfig(); config.journals.push(structuredClone(config.journals[0])); config.scope.topics.push(structuredClone(config.scope.topics[0]));
  assert.equal(validateConfig(config).errors.filter(e => e.includes('unique')).length, 2);
});
test('verified flag cannot substitute for real endpoint identity fields', () => {
  const config = readyConfig(); config.journals[0].source = { type: 'pending', status: 'verified' };
  assert.ok(validateConfig(config).errors.length >= 4);
});
test('Crossref ISSN checksum and exact endpoint match are checked', () => {
  const config = readyConfig(); config.journals[0].source.issn = '2041-1724';
  assert.ok(validateConfig(config).errors.some(e => e.includes('checksum')));
  config.journals[0].source.issn = '2041-1723'; config.journals[0].source.url = 'https://api.crossref.org.evil.example/journals/2041-1723/works';
  assert.ok(validateConfig(config).errors.some(e => e.includes('ISSN endpoint')));
});
test('credentials in a source URL and unsupported schemes are rejected', () => {
  for (const url of ['https://secret@example.org/feed', 'file:///tmp/feed.xml', 'javascript:alert(1)']) {
    const config = readyConfig(); config.journals[0].source = { ...config.journals[0].source, type: 'rss', url };
    assert.ok(validateConfig(config).errors.some(e => e.includes('HTTP(S) endpoint')));
  }
});
test('collection boundaries, timezone and disabled-only catalogs fail clearly', () => {
  const config = readyConfig(); config.site.timezone = 'Invalid/Timezone'; config.collection.maxRetries = 6; config.collection.maxPerSource = 0; config.collection.overlapDays = 91; config.journals[0].enabled = false;
  assert.ok(validateConfig(config).errors.length >= 5);
});
test('private site requires an explicit access-control warning', () => {
  const config = readyConfig(); config.site.access = 'private';
  assert.ok(validateConfig(config).warnings.some(w => w.includes('authorization')));
});
test('malformed nested inputs return diagnostics instead of throwing', () => {
  for (const config of [null, [], {}, { ...example, journals: [null], scope: { topics: [null] } }]) assert.ok(validateConfig(config).errors.length > 0);
});
test('GitHub Pages basePath supports project paths and rejects traversal', () => {
  const config = readyConfig(); config.deployment.provider = 'github-pages'; config.deployment.basePath = '/battery-paper-watch/';
  assert.deepEqual(validateConfig(config).errors, []);
  config.deployment.basePath = '/../';
  assert.ok(validateConfig(config).errors.some(e => e.includes('basePath')));
});
