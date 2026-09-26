const IS_DEV = process.env.NODE_ENV === 'development';
const navigation = require('./src/content/partnavigation/partnavigation');
const { getCourseNavigation } = require('./src/courseTracks');
const {
  COURSE_NAME,
  REPOSITORY_URL,
  SITE_URL,
  isContentVisible,
} = require('./src/courseConfig');

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/').pop();
const automaticPagesPrefix =
  process.env.GITHUB_ACTIONS === 'true' &&
  repositoryName &&
  !repositoryName.endsWith('.github.io')
    ? `/${repositoryName}`
    : '/';
const pathPrefix = process.env.PATH_PREFIX || automaticPagesPrefix;

const ignoredContent = [`${__dirname}/src/content/pages/*`];

const isSearchableContent = ({ part, letter, lang, course }) => {
  if (letter && !getCourseNavigation(lang, part, course || 'mongodb')[letter])
    return false;
  return !letter || isContentVisible(part, letter);
};

const createSearchConfig = (indexName, language) => {
  return {
    resolve: 'gatsby-plugin-local-search',
    options: {
      name: indexName,
      engine: 'flexsearch',
      engineOptions: 'speed',
      query: `
        {
          allMarkdownRemark(filter: {frontmatter: {lang: {in: ["${language}", "en"]}}}) {
            nodes {
              frontmatter {
                lang
                course
                letter
                part
              }
              id
              rawMarkdownBody
            }
          }
        }
    `,
      ref: 'id',
      index: ['body'],
      store: ['id', 'part', 'letter', 'lang', 'course'],
      normalizer: ({ data }) => {
        const nodes = data.allMarkdownRemark.nodes.filter((node) =>
          isSearchableContent(node.frontmatter)
        );
        const variants = nodes.filter(
          (node) => node.frontmatter.course === 'sqlite'
        );
        const originals = nodes.filter(
          (node) =>
            !node.frontmatter.course && node.frontmatter.lang === language
        );
        const rows = originals.flatMap((node) =>
          ['sqlite', 'mongodb'].map((course) => {
            const match = (candidate) =>
              candidate.frontmatter.part === node.frontmatter.part &&
              candidate.frontmatter.letter === node.frontmatter.letter;
            const variant =
              variants.find(
                (v) => match(v) && v.frontmatter.lang === language
              ) ||
              variants.find((v) => match(v) && v.frontmatter.lang === 'en');
            const source = course === 'sqlite' && variant ? variant : node;
            return {
              id: `${node.id}-${course}`,
              part: node.frontmatter.part,
              letter: node.frontmatter.letter,
              lang: language,
              course,
              body: source.rawMarkdownBody,
            };
          })
        );
        const final =
          variants.find(
            (v) =>
              v.frontmatter.letter === 'f' &&
              v.frontmatter.part === 5 &&
              v.frontmatter.lang === language
          ) ||
          variants.find(
            (v) =>
              v.frontmatter.letter === 'f' &&
              v.frontmatter.part === 5 &&
              v.frontmatter.lang === 'en'
          );
        if (final)
          rows.push({
            id: final.id,
            part: 5,
            letter: 'f',
            lang: final.frontmatter.lang,
            course: 'sqlite',
            body: final.rawMarkdownBody,
          });
        return rows;
      },
    },
  };
};

const plugins = [
  createSearchConfig('finnish', 'fi'),
  createSearchConfig('english', 'en'),
  createSearchConfig('spanish', 'es'),
  createSearchConfig('chinese', 'zh'),
  createSearchConfig('portuguese', 'ptbr'),
  createSearchConfig('italian', 'it'),
  ...(IS_DEV ? [] : ['gatsby-plugin-react-helmet']),
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `images`,
      path: `${__dirname}/src/images`,
    },
  },
  'gatsby-transformer-sharp',
  'gatsby-plugin-sharp',
  {
    resolve: `gatsby-plugin-manifest`,
    options: {
      name: COURSE_NAME,
      short_name: COURSE_NAME,
      start_url: '/',
      background_color: '#e1e1e1',
      theme_color: '#e1e1e1',
      display: 'minimal-ui',
      icon: 'src/images/favicon.png',
    },
  },
  {
    resolve: 'gatsby-plugin-sass',
    options: {
      sassOptions: {
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      path: `${__dirname}/src/content`,
      name: 'markdown-pages',
      ignore: ignoredContent,
    },
  },
  {
    resolve: 'gatsby-transformer-remark',
    options: {
      plugins: [
        {
          resolve: 'gatsby-remark-images',
          options: {
            maxWidth: 1200,
            linkImagesToOriginal: false,
            showCaptions: false,
          },
        },
        {
          resolve: `gatsby-remark-prismjs`,
          options: {
            classPrefix: 'language-',
            inlineCodeMarker: null,
            aliases: {
              conf: 'bash',
            },
            showLineNumbers: false,
            noInlineHighlight: false,
          },
        },
      ],
    },
  },
];

module.exports = {
  pathPrefix,
  trailingSlash: 'never',
  siteMetadata: {
    title: COURSE_NAME,
    siteUrl: SITE_URL,
    repositoryUrl: REPOSITORY_URL,
    description:
      'A structured path through modern full stack JavaScript development.',
    author: 'Full Stack JavaScript contributors',
  },
  plugins,
};
