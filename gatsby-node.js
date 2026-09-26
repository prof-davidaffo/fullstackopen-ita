const path = require('path');
const express = require('express');
const snakeCase = require('lodash/fp/snakeCase');
const isEmpty = require('lodash/fp/isEmpty');
const navigation = require('./src/content/partnavigation/partnavigation');
const { isContentVisible } = require('./src/courseConfig');
const { getCourseNavigation, coursePath } = require('./src/courseTracks');

exports.onCreateDevServer = ({ app }) => {
  app.use(
    '/exampleapp',
    express.static(path.resolve(__dirname, 'static/exampleapp'))
  );
};

exports.onCreateWebpackConfig = ({ actions, getConfig }) => {
  const config = getConfig();
  const cssPlugin = config.plugins.find(
    (plugin) => plugin.constructor.name === 'MiniCssExtractPlugin'
  );

  // Component styles use independent BEM selectors, so their bundle order is
  // intentionally irrelevant across the different page templates.
  if (cssPlugin) cssPlugin.options.ignoreOrder = true;

  actions.replaceWebpackConfig(config);
};

const legacyPagePattern = /\/(about|faq|companies|challenge)(\.[a-z]+)?\/?$/;
const translatedPagePattern = /^\/(.+)\.(en|es|fr|it|ptbr|zh)\/?$/;

exports.onCreatePage = ({ page, actions }) => {
  if (page.context.course === 'mongodb') return;
  if (legacyPagePattern.test(page.path)) {
    actions.deletePage(page);
    return;
  }

  const translatedPage = page.path.match(translatedPagePattern);

  if (translatedPage) {
    const [, pageName, lang] = translatedPage;
    const localizedPath =
      pageName === 'index' ? `/${lang}` : `/${lang}/${pageName}`;

    actions.deletePage(page);
    actions.createPage({
      ...page,
      path: localizedPath,
      context: { ...page.context, langKey: lang },
    });
    actions.createPage({
      ...page,
      path: coursePath(localizedPath, 'mongodb'),
      context: { ...page.context, langKey: lang, course: 'mongodb' },
    });
    return;
  }

  if (!page.context.langKey && !page.context.lang) {
    actions.deletePage(page);
    actions.createPage({
      ...page,
      context: { ...page.context, langKey: 'en' },
    });
    if (!page.path.includes('404')) {
      actions.createPage({
        ...page,
        path: coursePath(page.path, 'mongodb'),
        context: { ...page.context, langKey: 'en', course: 'mongodb' },
      });
    }
    return;
  }
  // Markdown pages are created separately, with the correct source node.
  if (!page.context.contentId && !page.path.includes('404')) {
    actions.createPage({
      ...page,
      path: coursePath(page.path, 'mongodb'),
      context: { ...page.context, course: 'mongodb' },
    });
  }
};

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;

  const contentTemplate = path.resolve(`src/templates/ContentTemplate.js`);
  const partIntroTemplate = path.resolve(`src/templates/PartIntroTemplate.js`);

  return graphql(`
    {
      allMarkdownRemark(limit: 1000) {
        edges {
          node {
            id
            frontmatter {
              course
              mainImage {
                publicURL
              }
              part
              letter
              lang
            }
          }
        }
      }
    }
  `).then((result) => {
    if (result.errors) {
      return Promise.reject(result.errors);
    }

    const nodes = result.data.allMarkdownRemark.edges.map(({ node }) => node);
    const variants = nodes.filter(
      (node) => node.frontmatter.course === 'sqlite'
    );
    nodes
      .filter((node) => !node.frontmatter.course)
      .forEach((node) => {
        const { frontmatter } = node;
        const { part, lang } = frontmatter;

        const legitPart = part || part === '0' || part === 0;

        if (legitPart && !frontmatter.letter) {
          const page = {
            path:
              lang === 'fi'
                ? `/osa${part.toString()}`
                : `/${lang}/part${part.toString()}`,
            component: partIntroTemplate,
            context: {
              contentId: node.id,
              part: part,
              lang: lang,
            },
          };
          createPage({
            ...page,
            path: coursePath(page.path, 'mongodb'),
            context: { ...page.context, course: 'mongodb' },
          });
          const variant =
            variants.find(
              (v) =>
                v.frontmatter.part === part &&
                !v.frontmatter.letter &&
                v.frontmatter.lang === lang
            ) ||
            variants.find(
              (v) =>
                v.frontmatter.part === part &&
                !v.frontmatter.letter &&
                v.frontmatter.lang === 'en'
            );
          createPage({
            ...page,
            context: {
              ...page.context,
              course: 'sqlite',
              contentId: variant?.id || node.id,
            },
          });
        } else if (
          legitPart &&
          navigation[lang] &&
          !isEmpty(navigation[lang][part]) &&
          frontmatter.letter &&
          isContentVisible(part, frontmatter.letter)
        ) {
          const page = {
            path:
              lang === 'fi'
                ? `/osa${part}/${snakeCase(
                    navigation[lang][part][frontmatter.letter]
                  )}`
                : `/${lang}/part${part}/${snakeCase(
                    navigation[lang][part][frontmatter.letter]
                  )}`,
            component: contentTemplate,
            context: {
              contentId: node.id,
              part: part,
              letter: frontmatter.letter,
              lang: lang,
            },
          };
          createPage({
            ...page,
            path: coursePath(page.path, 'mongodb'),
            context: { ...page.context, course: 'mongodb' },
          });
          const variant =
            variants.find(
              (v) =>
                v.frontmatter.part === part &&
                v.frontmatter.letter === frontmatter.letter &&
                v.frontmatter.lang === lang
            ) ||
            variants.find(
              (v) =>
                v.frontmatter.part === part &&
                v.frontmatter.letter === frontmatter.letter &&
                v.frontmatter.lang === 'en'
            );
          createPage({
            ...page,
            context: {
              ...page.context,
              course: 'sqlite',
              contentId: variant?.id || node.id,
            },
          });
        } else return;
      });
    for (const node of variants.filter(
      (v) => v.frontmatter.part === 5 && v.frontmatter.letter === 'f'
    )) {
      const { lang, part, letter } = node.frontmatter;
      createPage({
        path: `/${lang}/part5/${snakeCase(getCourseNavigation(lang, 5, 'sqlite').f)}`,
        component: contentTemplate,
        context: { contentId: node.id, part, letter, lang, course: 'sqlite' },
      });
    }
  });
};

exports.createSchemaCustomization = ({ actions }) => {
  actions.createTypes(`type MarkdownRemarkFrontmatter { course: String }`);
};
