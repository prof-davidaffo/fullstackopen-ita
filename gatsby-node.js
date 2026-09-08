const path = require('path');
const express = require('express');
const snakeCase = require('lodash/fp/snakeCase');
const isEmpty = require('lodash/fp/isEmpty');
const navigation = require('./src/content/partnavigation/partnavigation');
const { isContentVisible } = require('./src/courseConfig');

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
    return;
  }

  if (!page.context.langKey && !page.context.lang) {
    actions.deletePage(page);
    actions.createPage({
      ...page,
      context: { ...page.context, langKey: 'en' },
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
            frontmatter {
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

    result.data.allMarkdownRemark.edges.forEach(({ node }) => {
      const { frontmatter } = node;
      const { part, lang } = frontmatter;

      const legitPart = part || part === '0' || part === 0;

      if (legitPart && !frontmatter.letter) {
        createPage({
          path:
            lang === 'fi'
              ? `/osa${part.toString()}`
              : `/${lang}/part${part.toString()}`,
          component: partIntroTemplate,
          context: {
            part: part,
            lang: lang,
          },
        });
      } else if (
        legitPart &&
        navigation[lang] &&
        !isEmpty(navigation[lang][part]) &&
        frontmatter.letter &&
        isContentVisible(part, frontmatter.letter)
      ) {
        createPage({
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
            part: part,
            letter: frontmatter.letter,
            lang: lang,
          },
        });
      } else return;
    });
  });
};
