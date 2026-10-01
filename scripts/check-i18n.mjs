import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
const languages = ['en', 'fr', 'ar'];
const flatten = (object, prefix = '') => Object.entries(object).flatMap(([key, value]) =>
  typeof value === 'string' ? [[prefix + key, value]] : flatten(value, prefix + key + '.'));
const resources = Object.fromEntries(languages.map(lang => [lang, new Map(flatten(JSON.parse(fs.readFileSync(`src/i18n/locales/${lang}.json`, 'utf8'))))]));
const failures = [];
const forms = { en: ['one','other'], fr: ['one','other'], ar: ['zero','one','two','few','many','other'] };
function check(key, location) {
  for (const lang of languages) {
    if (resources[lang].has(key)) continue;
    if (forms[lang].every(form => resources[lang].has(`${key}_${form}`))) continue;
    failures.push(`${location}: missing ${lang}:${key}`);
  }
}
// Catalog parity includes every runtime family and interpolation placeholder.
for (const [key, value] of resources.en) {
  const base = key.replace(/_(zero|one|two|few|many|other)$/, '');
  check(base, 'catalog');
  const placeholders = text => [...text.matchAll(/{{\s*([^}, ]+)/g)].map(m=>m[1]).filter(name=>name !== 'count').sort().join(',');
  for (const lang of languages.slice(1)) {
    const translated = resources[lang].get(key);
    if (translated && placeholders(value) !== placeholders(translated)) failures.push(`placeholder mismatch: ${lang}:${key}`);
  }
}
const configFile = ts.readConfigFile('tsconfig.app.json', ts.sys.readFile);
const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, process.cwd());
const program = ts.createProgram(config.fileNames, config.options);
const checker = program.getTypeChecker();
let literalCount = 0, dynamicCount = 0;
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
for (const source of program.getSourceFiles()) {
  if (!source.fileName.startsWith(path.join(process.cwd(), 'src'))) continue;
  function visit(node) {
    if (ts.isCallExpression(node) && ['t','i18n.t','dynamicT'].includes(node.expression.getText(source))) {
      const arg = node.arguments[0];
      const location = `${path.relative(process.cwd(),source.fileName)}:${source.getLineAndCharacterOfPosition(node.pos).line+1}`;
      // These two adapters guard / map backend-controlled values; the complete catalog is checked above.
      const adapter = /(?:i18n\/dynamic|lib\/apiMessages)\.ts$/.test(source.fileName);
      if (arg && (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg))) {
        check(arg.text,location); literalCount++;
      } else if (arg && ts.isTemplateExpression(arg)) {
        if (node.expression.getText(source) !== 'dynamicT') failures.push(`${location}: unguarded runtime translation`);
        const regex = new RegExp('^'+escape(arg.head.text)+arg.templateSpans.map(span=>'.+'+escape(span.literal.text)).join('')+'$');
        const matches = [...resources.en.keys()].filter(key=>regex.test(key));
        if (!matches.length) failures.push(`${location}: unknown dynamic family`);
        matches.forEach(key=>check(key.replace(/_(zero|one|two|few|many|other)$/, ''),location));
        dynamicCount++;
      } else if (arg && !adapter) {
        const type = checker.getTypeAtLocation(arg);
        const types = type.isUnion() ? type.types : [type];
        if (types.every(t => t.isStringLiteral())) types.forEach(t=>check(t.value,location));
        else failures.push(`${location}: unchecked dynamic key; use a literal union or guarded dynamicT family`);
      }
    }
    ts.forEachChild(node,visit);
  }
  visit(source);
}
if (failures.length) { console.error([...new Set(failures)].join('\n')); process.exit(1); }
console.log(`Translation checks passed: ${literalCount} literal calls, ${dynamicCount} guarded runtime families, en/fr/ar catalog and placeholder parity.`);
