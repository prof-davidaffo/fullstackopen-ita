import './ContentTemplate.scss';

import React, { Component } from 'react';

import Arrow from '../components/Arrow/Arrow';
import ArrowToTop from '../images/up-arrow.svg';
import { Banner } from '../components/Banner/Banner';
import Element from '../components/Element/Element';
import Layout from '../components/layout';
import Parser, { domToReact } from 'html-react-parser';
import PrevNext from '../components/PrevNext/PrevNext';
import Seo from '../components/seo';
import ScrollNavigation from '../components/ScrollNavigation/ScrollNavigation';
import { SubHeader } from '../components/SubHeader/SubHeader';
import colors from '../colors';
import { graphql, withPrefix } from 'gatsby';
import { coursePath, getCourseTitle } from '../courseTracks';
import mainSEOdescription from '../content/seo/mainSEOdescription';
import mainSEOtags from '../content/seo/mainSEOtags';
import navigation from '../content/partnavigation/partnavigation';
import { partColors } from './partColors';
import snakeCase from 'lodash/fp/snakeCase';
import getPartTranslationPath from '../utils/getPartTranslationPath';
import { COURSE_NAME } from '../courseConfig';
import { createCopyButton } from './copy-code-button/create-copy-buttons';

export default class ContentTemplate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      h1Title: '',
      otherTitles: '',
      showArrowUp: false,
    };
  }

  componentDidMount() {
    const links = Array.from(
      document.querySelectorAll('a:not(.skip-to-content')
    );
    const h1 = document.querySelector('h1');
    const h3 = document.querySelectorAll('h3');
    const h3Arr = Array.from(h3).map((t) => t.innerText);

    const { frontmatter } = this.props.data.markdownRemark;

    links.map((i) => {
      i.style = `border-color: ${colors[partColors[frontmatter.part]]}`;
      const isExternal =
        new URL(i.href, window.location.origin).origin !==
        window.location.origin;

      if (isExternal) {
        i.target = '_blank';
        i.rel = 'noopener noreferrer';
      }

      function over() {
        i.style.backgroundColor = colors[partColors[frontmatter.part]];
      }
      function out() {
        i.style.backgroundColor = 'transparent';
      }

      i.onmouseover = over;
      i.onmouseleave = out;

      return null;
    });

    this.setState({
      h1Title: h1.innerText,
      otherTitles: [...h3Arr],
    });

    window.addEventListener('scroll', this.handleScroll);
    createCopyButton();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll = () => {
    if (window.scrollY > 300 && !this.state.showArrowUp) {
      this.setState({
        showArrowUp: true,
      });
    } else if (window.scrollY <= 300 && this.state.showArrowUp) {
      this.setState({
        showArrowUp: false,
      });
    }
  };

  render() {
    const { markdownRemark } = this.props.data;
    const { frontmatter, html } = markdownRemark;
    const { mainImage } = frontmatter;
    const { letter, part, lang, course } = this.props.pageContext;
    const title = getCourseTitle(lang, part, letter, course);
    const colorCode = colors[partColors[part]];

    const parserOptions = {
      replace: (props) => {
        const { type, name, attribs, children } = props;
        if (type === 'tag' && name === 'a' && attribs.href?.startsWith('/')) {
          const prefix = withPrefix('/').replace(/\/$/, '');
          const href =
            prefix && attribs.href.startsWith(prefix + '/')
              ? attribs.href.slice(prefix.length)
              : attribs.href;
          return (
            <a {...attribs} href={withPrefix(coursePath(href, course))}>
              {domToReact(children, parserOptions)}
            </a>
          );
        }
        if (type === 'tag' && name === 'picture') {
          const alt = children[0].attribs.alt
            ? children[0].attribs.alt
            : 'fullstack content';
          return (
            <picture>
              <img
                style={{ borderColor: colorCode }}
                alt={alt}
                src={children[0].attribs.src}
              />
            </picture>
          );
        } else if (type === 'tag' && name === 'pre') {
          return <pre>{domToReact(children, parserOptions)}</pre>;
        } else if (type === 'tag' && attribs.class === 'content') {
          return (
            <Element className="course-content">
              <Element className="course-content-inner">
                {domToReact(children, parserOptions)}
              </Element>
            </Element>
          );
        } else if (type === 'tag' && attribs.class === 'tasks') {
          return (
            <Banner
              style={{
                backgroundColor: colorCode,
                borderColor: colorCode,
              }}
              className="spacing tasks content-banner"
            >
              <Element
                className="course-content"
                style={{
                  borderColor: colorCode,
                  backgroundColor: 'transparent',
                }}
              >
                <Element className="course-content-inner">
                  {children.name === 'pre' ? (
                    <pre>{domToReact(children, parserOptions)}</pre>
                  ) : (
                    domToReact(children, parserOptions)
                  )}
                </Element>
              </Element>
            </Banner>
          );
        }
        return;
      },
    };

    return (
      <Layout isCoursePage={true}>
        <Seo
          lang={lang}
          title={`${COURSE_NAME} · ${lang === 'fi' ? 'osa' : 'part'} ${part} | ${title}`}
          description={mainSEOdescription[lang]}
          keywords={[
            ...mainSEOtags,
            this.state.h1Title,
            ...this.state.otherTitles,
          ]}
        />

        {/* eslint-disable */}
        {this.state.showArrowUp && (
          <div
            className="arrow-go-up"
            onClick={() =>
              window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth',
              })
            }
          >
            <img src={ArrowToTop} alt="arrow-up" />
          </div>
        )}
        {/* eslint-enable */}

        <div className="course-container spacing--after">
          <Banner
            className="part-main__banner spacing--mobile--small"
            backgroundColor={colorCode}
            style={{
              backgroundImage: `url(${mainImage.publicURL})`,
              backgroundColor: colorCode,
            }}
          >
            <div className="container spacing--after">
              <Arrow
                className="breadcrumb"
                content={[
                  {
                    backgroundColor: colorCode,
                    text: COURSE_NAME,
                    link: `/${lang === 'fi' ? '' : `${lang}/`}#course-contents`,
                  },
                  {
                    backgroundColor: colorCode,
                    text: `${lang === 'fi' ? 'Osa' : 'Part'} ${part}`,
                    link: getPartTranslationPath(lang, part),
                  },
                  {
                    backgroundColor: colors['black'],
                    text: title,
                  },
                ]}
              />
            </div>
          </Banner>

          <Element className="course" id="course-main-content">
            <ScrollNavigation
              part={part}
              letter={letter}
              lang={lang}
              course={course}
              currentPartTitle={title}
              currentPath={getPartTranslationPath(
                lang,
                part,
                `/${snakeCase(navigation[lang]?.[part]?.[letter] || title)}`
              )}
              colorCode={colorCode}
            />

            <Element className="course-content-container">
              <Element className="course-content" autoBottomMargin>
                <Element className="course-content-inner">
                  <p
                    className="col-1 letter"
                    style={{ borderColor: colorCode }}
                  >
                    {letter}
                  </p>

                  <SubHeader headingLevel="h1" text={title} />
                </Element>
              </Element>

              {frontmatter.lang !== lang && (
                <p className="course-content">
                  SQLite material is currently available in Italian and English.
                  This chapter is shown in English.
                </p>
              )}
              {Parser(html, parserOptions)}
            </Element>
          </Element>

          <PrevNext part={part} letter={letter} lang={lang} />
        </div>
      </Layout>
    );
  }
}

export const contentPageQuery = graphql`
  query ($contentId: String!) {
    markdownRemark(id: { eq: $contentId }) {
      html
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
`;
