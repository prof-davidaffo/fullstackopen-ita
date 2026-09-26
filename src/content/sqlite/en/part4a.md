---
mainImage: ../../../images/part-4.svg
part: 4
letter: a
lang: en
course: sqlite
---

<div class="content">

### Project structure

The Part 3 SQLite backend already separates startup (index.js), Express configuration (app.js), database setup (db.js), SQL and row mapping (models/note.js), and HTTP handlers (controllers/notes.js). Tests can import app.js without opening port 3001. Keep request and response objects out of the models.

### Configuration

DATABASE_PATH selects the file; PORT and HOST configure the server. A .env file, ignored by Git, can contain DATABASE_PATH=./notes.db, PORT=3001 and HOST=127.0.0.1. Load it with node --env-file=.env index.js. Relative paths are resolved from the working directory, so start from the backend root or use an absolute path.

The database always uses :memory: in test mode, regardless of DATABASE_PATH.

### Testing pure functions

Use Node's built-in test runner. Create utils/for_testing.js:

```js
const average = array => array.length
  ? array.reduce((sum, value) => sum + value, 0) / array.length : 0
module.exports = { average }
```

Create tests/average.test.js:

```js
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { average } = require('../utils/for_testing')
test('empty array', () => assert.equal(average([]), 0))
test('several values', () => assert.equal(average([1, 2, 3]), 2))
```

Run node --test. Cover edge cases as well as ordinary values and commit the tests with the application.

</div>
<div class="tasks">

### Exercises 4.1–4.7

#### 4.1: Blog list, step 1
Create a separate blogs.db backend with a blogs table: id TEXT PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL, url TEXT NOT NULL and likes INTEGER NOT NULL DEFAULT 0 CHECK(likes >= 0). Use string UUIDs. Implement GET and POST /api/blogs with parameterized SQL.

#### 4.2: Blog list, step 2
Separate startup, Express, database and router as in the notes application.

#### 4.3: Helper functions, step 1
Create utils/list_helper.js with dummy(blogs) returning 1 and write a test.

#### 4.4: Helper functions, step 2
Implement totalLikes, returning 0 for an empty array. Test empty, single and multiple-item lists.

#### 4.5*: Helper functions, step 3
Implement favoriteBlog, returning the blog with the most likes or null for an empty array. Any tied maximum is acceptable.

#### 4.6*: Helper functions, step 4
Implement mostBlogs returning { author, blogs } for the author with the most posts. Define empty-list behavior.

#### 4.7*: Helper functions, step 5
Implement mostLikes returning { author, likes } for the largest total. Cover repeated authors and ties.
</div>

