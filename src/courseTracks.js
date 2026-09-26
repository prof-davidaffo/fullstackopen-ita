const navigation = require('./content/partnavigation/partnavigation');

const DEFAULT_COURSE = 'sqlite';
const coursePath = (url, course = DEFAULT_COURSE) => {
  if (!url || !url.startsWith('/') || url.startsWith('//')) return url;
  const bare = url.replace(/^\/mongodb(?=\/|$|[?#])/, '') || '/';
  if (/^\/(exampleapp|static|page-data)(\/|$)/.test(bare)) return bare;
  return course === 'mongodb' ? `/mongodb${bare}` : bare;
};

const getCourseNavigation = (lang, part, course = DEFAULT_COURSE) => ({
  ...navigation[lang]?.[part],
  ...(course === 'sqlite' && Number(part) === 5
    ? {
        f:
          lang === 'it'
            ? 'Pubblicare l’applicazione'
            : 'Deploying the application',
      }
    : {}),
});

const getCourseTitle = (lang, part, letter, course = DEFAULT_COURSE) => {
  if (course === 'sqlite' && Number(part) === 3) {
    if (letter === 'b')
      return lang === 'it'
        ? 'Frontend e backend in locale'
        : 'Local frontend and backend';
    if (letter === 'c')
      return lang === 'it'
        ? 'Salvare i dati in SQLite'
        : 'Storing data in SQLite';
  }
  return getCourseNavigation(lang, part, course)[letter];
};

module.exports = {
  DEFAULT_COURSE,
  coursePath,
  getCourseNavigation,
  getCourseTitle,
};
