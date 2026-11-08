#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const slug = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const webUrl = value => {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password;
  } catch { return false; }
};
const instant = value => text(value) && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
function validIssn(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{3}[\dX]$/.test(value)) return false;
  const digits = value.replace('-', '');
  return [...digits].reduce((sum, digit, i) => sum + (digit === 'X' ? 10 : Number(digit)) * (8 - i), 0) % 11 === 0;
}

export function validateConfig(config, { ready = false } = {}) {
  const errors = [], warnings = [];
  const check = (condition, message) => { if (!condition) errors.push(message); };
  const words = (value, label, allowEmpty = true) => {
    check(Array.isArray(value) && (allowEmpty || value.length > 0) && value.every(text), `${label}: expected ${allowEmpty ? 'an' : 'a non-empty'} array of non-empty strings`);
  };
  const integer = (value, min, max, label) => check(Number.isSafeInteger(value) && value >= min && value <= max, `${label}: integer ${min}..${max} required`);
  if (!object(config)) return { errors: ['config: object required'], warnings };
  check(config.schemaVersion === 1, 'schemaVersion: expected 1');
  const site = object(config.site) ? config.site : {};
  check(text(site.name), 'site.name: required');
  check(slug(site.slug), 'site.slug: lowercase hyphenated identifier required');
  check(text(site.language), 'site.language: required');
  try { new Intl.DateTimeFormat('en', { timeZone: site.timezone }).format(); check(text(site.timezone), 'site.timezone: required'); }
  catch { errors.push('site.timezone: valid IANA timezone required'); }
  check(['public', 'private'].includes(site.access), 'site.access: public or private required');
  check(site.url === null || webUrl(site.url), 'site.url: null or HTTP(S) URL without credentials required');
  if (ready) check(typeof site.url === 'string' && site.url.startsWith('https://') && webUrl(site.url), 'site.url: production HTTPS URL required in ready mode');
  if (site.access === 'private') warnings.push('Private access requires separately implemented and verified authorization for every resource.');

  const scope = object(config.scope) ? config.scope : {};
  words(scope.includeAny, 'scope.includeAny');
  words(scope.excludeAny, 'scope.excludeAny');
  words(scope.ambiguityTerms, 'scope.ambiguityTerms');
  check(Array.isArray(scope.includeAllGroups), 'scope.includeAllGroups: array required');
  if (Array.isArray(scope.includeAllGroups)) scope.includeAllGroups.forEach((group, i) => words(group, `scope.includeAllGroups[${i}]`, false));
  const anyPositive = Array.isArray(scope.includeAny) && scope.includeAny.some(text);
  const allPositive = Array.isArray(scope.includeAllGroups) && scope.includeAllGroups.length > 0 && scope.includeAllGroups.every(g => Array.isArray(g) && g.length > 0 && g.every(text));
  check(anyPositive || allPositive, 'scope: at least one positive inclusion rule required');
  check(Array.isArray(scope.topics), 'scope.topics: array required');
  const topicIds = new Set();
  if (Array.isArray(scope.topics)) scope.topics.forEach((topic, i) => {
    if (!object(topic)) { errors.push(`scope.topics[${i}]: object required`); return; }
    check(slug(topic.id) && !topicIds.has(topic.id), `scope.topics[${i}].id: valid unique id required`);
    topicIds.add(topic.id);
    check(text(topic.name), `scope.topics[${i}].name: required`);
    words(topic.keywords, `scope.topics[${i}].keywords`, false);
  });

  check(Array.isArray(config.journals) && config.journals.length > 0, 'journals: non-empty array required');
  const ids = new Set();
  let enabledCount = 0;
  if (Array.isArray(config.journals)) config.journals.forEach((journal, i) => {
    const label = `journals[${i}]`;
    if (!object(journal)) { errors.push(`${label}: object required`); return; }
    check(slug(journal.id) && !ids.has(journal.id), `${label}.id: valid unique id required`);
    ids.add(journal.id);
    check(text(journal.name), `${label}.name: required`);
    check(['targeted', 'all'].includes(journal.mode), `${label}.mode: targeted or all required`);
    check(typeof journal.enabled === 'boolean', `${label}.enabled: boolean required`);
    if (journal.enabled === true) enabledCount++;
    const source = object(journal.source) ? journal.source : {};
    check(['pending', 'rss', 'atom', 'official-api', 'official-page', 'crossref'].includes(source.type), `${label}.source.type: unsupported`);
    check(['pending', 'verified', 'disabled'].includes(source.status), `${label}.source.status: unsupported`);
    if (journal.enabled && source.status !== 'verified') warnings.push(`${label}: enabled source has not been verified; no coverage claim allowed.`);
    if (ready && journal.enabled) check(source.status === 'verified', `${label}.source: enabled source must be verified in ready mode`);
    if (source.status === 'verified') {
      check(source.type !== 'pending', `${label}.source: pending type cannot be verified`);
      check(webUrl(source.url), `${label}.source.url: verified source requires HTTP(S) endpoint`);
      check(instant(source.verifiedAt), `${label}.source.verifiedAt: ISO timestamp required`);
      check(webUrl(source.evidenceUrl), `${label}.source.evidenceUrl: identity evidence URL required`);
      if (source.type === 'crossref') {
        check(validIssn(source.issn), `${label}.source.issn: valid ISSN including checksum required`);
        if (webUrl(source.url)) {
          const url = new URL(source.url);
          check(url.origin === 'https://api.crossref.org' && url.pathname === `/journals/${source.issn}/works`, `${label}.source.url: must match its Crossref ISSN endpoint`);
        }
      }
      if (['official-api', 'official-page'].includes(source.type)) check(slug(source.adapter), `${label}.source.adapter: implemented adapter id required`);
    }
  });
  check(enabledCount > 0, 'journals: at least one enabled source required');

  const collection = object(config.collection) ? config.collection : {};
  integer(collection.lookbackDays, 1, 3660, 'collection.lookbackDays');
  integer(collection.overlapDays, 0, 3660, 'collection.overlapDays');
  check(collection.overlapDays <= collection.lookbackDays, 'collection.overlapDays: cannot exceed lookbackDays');
  integer(collection.maxPerSource, 1, 100000, 'collection.maxPerSource');
  integer(collection.timeoutMs, 1000, 300000, 'collection.timeoutMs');
  integer(collection.maxRetries, 0, 5, 'collection.maxRetries');
  const review = object(config.review) ? config.review : {};
  check(['manual', 'model-assisted'].includes(review.mode), 'review.mode: manual or model-assisted required');
  check(typeof review.autoPublish === 'boolean', 'review.autoPublish: boolean required');
  check(review.highlightsRequireHuman === true, 'review.highlightsRequireHuman: true required');
  if (review.autoPublish) warnings.push('autoPublish is configuration intent, not authorization or proof of tested deployment.');

  const deploy = object(config.deployment) ? config.deployment : {};
  check(['cloudflare-pages', 'github-pages'].includes(deploy.provider), 'deployment.provider: supported Pages provider required');
  check(deploy.repository === null || (typeof deploy.repository === 'string' && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(deploy.repository)), 'deployment.repository: null or OWNER/REPO required');
  check(slug(deploy.projectName), 'deployment.projectName: lowercase hyphenated identifier required');
  check(text(deploy.productionBranch), 'deployment.productionBranch: required');
  check(typeof deploy.basePath === 'string' && /^\/(?:[A-Za-z0-9._~-]+\/)*$/.test(deploy.basePath) && !deploy.basePath.split('/').some(p => p === '.' || p === '..'), 'deployment.basePath: absolute slash-terminated path required');
  if (ready) check(text(deploy.repository), 'deployment.repository: required in ready mode');
  const schedule = object(config.schedule) ? config.schedule : {};
  check(typeof schedule.enabled === 'boolean', 'schedule.enabled: boolean required');
  check(typeof schedule.cronUtc === 'string' && schedule.cronUtc.trim().split(/\s+/).length === 5, 'schedule.cronUtc: five-field cron required');
  warnings.push('Cron field count only checked; verify provider syntax, timezone conversion, adapter implementation and live source reachability separately.');
  return { errors, warnings };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    if (args.length < 1 || args.length > 2 || args[0].startsWith('--') || (args.length === 2 && args[1] !== '--ready')) throw new Error('Usage: node validate-config.mjs CONFIG.json [--ready]');
    const result = validateConfig(JSON.parse(await readFile(resolve(args[0]), 'utf8')), { ready: args[1] === '--ready' });
    console.log(JSON.stringify({ valid: result.errors.length === 0, mode: args[1] === '--ready' ? 'ready' : 'draft', ...result }, null, 2));
    if (result.errors.length) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
