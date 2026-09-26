import './PartIntroTemplate.scss';

import Arrow from '../components/Arrow/Arrow';
import { Banner } from '../components/Banner/Banner';
import Element from '../components/Element/Element';
import Layout from '../components/layout';
import Parser, { domToReact } from 'html-react-parser';
import PrevNext from '../components/PrevNext/PrevNext';
import React from 'react';
import Seo from '../components/seo';
import colors from '../colors';
import { graphql } from 'gatsby';
import isEmpty from 'lodash/fp/isEmpty';
import mainSEOdescription from '../content/seo/mainSEOdescription';
import mainSEOtags from '../content/seo/mainSEOtags';
import navigation from '../content/partnavigation/partnavigation';
import { partColors } from './partColors';
import snakeCase from 'lodash/fp/snakeCase';
import getPartTranslationPath from '../utils/getPartTranslationPath';
import { COURSE_NAME, isContentVisible } from '../courseConfig';
import { getCourseNavigation, getCourseTitle } from '../courseTracks';
import { CourseAnchor } from '../components/CourseTrack';

export default function PartIntroTemplate({ data, pageContext }) {
  const { markdownRemark } = data;
  const { frontmatter, html } = markdownRemark;
  const { mainImage } = frontmatter;
  const { part, lang, course } = pageContext;
  const partNavigation = getCourseNavigation(lang, part, course);

  const titles = !isEmpty(partNavigation)
    ? Object.keys(partNavigation).filter((letter) =>
        isContentVisible(part, letter)
      )
    : [];

  const parserOptions = {
    replace: ({ type, name, attribs, children }) => {
      if (type === 'tag' && name === 'a')
        return (
          <CourseAnchor {...attribs}>
            {domToReact(children, parserOptions)}
          </CourseAnchor>
        );
      if (type === 'tag' && attribs.class === 'intro') {
        return (
          <div className="col-7">{domToReact(children, parserOptions)}</div>
        );
      }
      return;
    },
  };

  return (
    <Layout>
      <Seo
        lang={lang}
        title={`${COURSE_NAME} · ${lang === 'fi' ? 'osa' : 'part'} ${part}`}
        description={mainSEOdescription[lang]}
        keywords={[
          ...mainSEOtags,
          navigation[lang][part] ? Object.values(navigation[lang][part]) : [],
        ]}
      />

      <div className="spacing--after">
        <Banner
          className="part-intro__banner spacing--mobile--small"
          style={{
            backgroundImage: `url(${mainImage.publicURL})`,
            backgroundColor: colors[partColors[part]],
          }}
        >
          <Element className="container">
            <Arrow
              className="breadcrumb"
              content={[
                {
                  backgroundColor: colors[partColors[part]],
                  text: COURSE_NAME,
                  link: `/${lang === 'fi' ? '' : `${lang}/`}#course-contents`,
                },
                {
                  backgroundColor: colors['black'],
                  text: `${lang === 'fi' ? 'Osa' : 'Part'} ${part}`,
                },
              ]}
            />

            <div className="part-intro col-7 col-10--mobile spacing--after-small">
              {Parser(html, parserOptions)}
            </div>

            {titles && (
              <Arrow
                wrapperClassName="spacing--mobile--large"
                stack
                content={titles.map((n) => {
                  return {
                    backgroundColor: colors['white'],
                    letter: n,
                    path: getPartTranslationPath(
                      n === 'f' && lang !== 'it' ? 'en' : lang,
                      part,
                      `/${snakeCase(partNavigation[n])}`
                    ),
                    text: `${n} ${getCourseTitle(lang, part, n, course)}`,
                  };
                })}
              />
            )}
          </Element>
        </Banner>

        <PrevNext part={part} lang={lang} />
      </div>
    </Layout>
  );
}

export const partInfoQuery = graphql`
  query ($contentId: String!) {
    markdownRemark(id: { eq: $contentId }) {
      html
      frontmatter {
        mainImage {
          publicURL
        }
        part
        lang
      }
    }
  }
`;
