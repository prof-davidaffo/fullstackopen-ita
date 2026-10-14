const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const prefix = process.argv[2] || '';
const read = (route) =>
  fs.readFileSync(
    path.join(__dirname, '../public', route, 'index.html'),
    'utf8'
  );

for (const [track, base] of [
  ['sqlite', ''],
  ['mongodb', 'mongodb/'],
]) {
  const home = read(base + 'it');
  const lesson = read(base + 'it/part3/salvare_i_dati_in_mongo_db');
  for (const html of [home, lesson]) {
    assert(html.includes(`value="${track}" selected=""`));
    assert(html.includes(`href="${prefix}/${base}it/part3`));
  }
  const title =
    track === 'sqlite'
      ? 'Salvare i dati in SQLite'
      : 'Salvare i dati in MongoDB';
  assert(lesson.includes(title));
  const intro = read(base + 'it/part5');
  assert.equal(intro.includes('pubblicare_lapplicazione"'), track === 'sqlite');
  assert(
    fs.existsSync(
      path.join(__dirname, '../public', base, 'it/search/index.html')
    )
  );
}
const final = read('it/part5/pubblicare_lapplicazione');
assert(final.includes('Backup e ripristino'));
assert(
  !fs.existsSync(
    path.join(
      __dirname,
      '../public/mongodb/it/part5/pubblicare_lapplicazione/index.html'
    )
  )
);
const last = read('it/part5/react_router_e_librerie_per_linterfaccia');
assert(last.includes(`href="${prefix}/it/part5/pubblicare_lapplicazione"`));
console.log(
  'Built HTML passed: both tracks, correct selected option, prefixed navigation, search and final deployment.'
);

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
let checked = 0;
for (const file of walk(path.join(__dirname, '../public')).filter(
  (file) =>
    /\/(?:part\d+|osa\d+)(?:\/|$)/.test(file) && file.endsWith('/index.html')
)) {
  const html = fs.readFileSync(file, 'utf8');
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    assert.doesNotMatch(
      href,
      /https?:\/\/(?:fullstackopen\.com|(?:study|studies)\.cs\.helsinki\.fi\/(?:stats|discord)|courses\.mooc\.fi\/org\/uh-cs\/courses\/full-stack-open-)/,
      file
    );
    if (file.includes('/it/part') && href.startsWith(prefix + '/')) {
      const target = href.slice(prefix.length).split(/[?#]/)[0];
      if (/\/(?:part|osa)\d+/.test(target)) {
        assert(
          fs.existsSync(
            path.join(__dirname, '../public', target, 'index.html')
          ),
          `${file}: ${href}`
        );
      }
    }
  }
  assert(!html.includes('ask GitHub user'), file);
  checked++;
}
console.log(
  `Checked ${checked} course pages: no upstream portal links; Italian chapter links resolve locally.`
);
