---
mainImage: ../../../images/part-3.svg
part: 3
letter: d
lang: en
course: sqlite
---

<div class="content">

### Validation

Validate input in Express even when the frontend already checks it. The notes router requires content of at least five trimmed characters and a boolean important; a database CHECK constraint also protects stored data.

Apply validation to both INSERT and UPDATE. Do not convert arbitrary input with Boolean: the string "false" is truthy. For the phonebook use a UNIQUE name constraint; a preliminary SELECT alone cannot prevent concurrent duplicate inserts.

### Errors

Return 400 for invalid input, 404 for missing resources, 409 for conflicts and a generic 500 for unexpected failures. Show error.response.data.error in the frontend, handling network errors where response is absent.

### Lint

Install eslint, @eslint/js and globals as development dependencies. Create eslint.config.mjs:

```js
import js from '@eslint/js'
import globals from 'globals'
export default [
  { ignores: ['dist/**'] },
  {
    files: ['**/*.js'],
    ...js.configs.recommended,
    languageOptions: { sourceType: 'commonjs', globals: globals.node, ecmaVersion: 'latest' },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }] }
  }
]
```

Add "lint": "eslint ." to scripts. Preserve all four parameters of Express error handlers; prefix unused parameters with an underscore.

### Schema changes

CREATE TABLE IF NOT EXISTS does not change existing tables. Use migrations and back up important data first. Do not delete a database to hide an error. Deployment is deferred until after Part 5.

</div>
<div class="tasks">

### Exercises 3.19–3.22

#### 3.19: Phonebook database, step 7
Require a name of at least three characters and a nonempty number. Show backend errors in the frontend and test POST and PUT.

#### 3.20*: Phonebook database, step 8
Require at least eight characters in the phone number, two or three digits before a single hyphen and only digits after it. Examples: 09-1234556 and 040-22334455. Validate in JavaScript, not Mongoose.

#### 3.21: Local full stack verification
Check create/update/read operations and persistence across restarts. Inspect the same file in DBeaver. The original publishing task moves to the final deployment chapter.

#### 3.22: Lint configuration
Configure ESLint and fix all reported errors.
</div>

