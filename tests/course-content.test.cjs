const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const navigation = require('../src/content/partnavigation/partnavigation');

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
const lessons = walk(path.join(__dirname, '../src/content')).filter(
  (file) =>
    file.endsWith('.md') &&
    !file.includes('/pages/') &&
    !/\/(part|osa)0a\.md$/.test(file)
);

test('all local course languages and tracks omit upstream hand-in policies and relocation links', () => {
  for (const file of lessons) {
    const prose = fs
      .readFileSync(file, 'utf8')
      .replace(/^```[^\n]*\n[\s\S]*?^```/gm, '');
    assert.doesNotMatch(
      prose,
      /https?:\/\/(?:fullstackopen\.com|(?:study|studies)\.cs\.helsinki\.fi\/(?:stats|discord)|courses\.mooc\.fi\/org\/uh-cs\/courses\/full-stack-open-)/,
      file
    );
    assert.doesNotMatch(
      prose,
      /example-submission-repository|submission repository|consegn(?:are|arne|a la versione)|ask GitHub user \[mluukkai\]|21st September.*submissions/,
      file
    );
  }
});

test('English specializations with local chapters have working chapter navigation', () => {
  for (const part of [8, 9, 10, 11]) {
    assert(Object.keys(navigation.en[part]).length > 0);
    for (const letter of Object.keys(navigation.en[part])) {
      assert(
        fs.existsSync(
          path.join(
            __dirname,
            `../src/content/${part}/en/part${part}${letter}.md`
          )
        )
      );
    }
  }
});
