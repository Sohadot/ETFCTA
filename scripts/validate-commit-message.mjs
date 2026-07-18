import process from 'node:process';
const message=process.argv.slice(2).join(' ').trim();
const valid=/^(feat|fix|validator|governance|protocol|spec|data|docs|test|refactor|chore)(\([a-z0-9-]+\))?: [a-z0-9].{9,}$/i.test(message);
if(!valid){console.error('Commit message must follow: type(scope): meaningful description');process.exit(1)}
console.log('PASS semantic commit message');

