import React from 'react';
import { Link } from '../CourseTrack';
import snakeCase from 'lodash/fp/snakeCase';
import { useTranslation } from 'react-i18next';

import navigation from '../../content/partnavigation/partnavigation';
import Element from '../Element/Element';
import { SubHeader } from '../SubHeader/SubHeader';
import getPartTranslationPath from '../../utils/getPartTranslationPath';
import { useCourse } from '../CourseTrack';
import { getCourseNavigation, getCourseTitle } from '../../courseTracks';

const SearchResults = ({ query, results = [] }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const course = useCourse();

  if (results.length === 0) {
    return (
      <Element>
        <SubHeader text={t('searchPage:noMatches')} headingLevel="h2" />
      </Element>
    );
  }

  if (results.length > 0) {
    return (
      <Element>
        <SubHeader
          text={t('searchPage:matchesTitle', { count: results.length, query })}
          headingLevel="h2"
        />

        <ol>
          {results.map(({ part, letter, lang: resultLang }) => (
            <li key={`${part}${letter}`}>
              <Link
                to={getPartTranslationPath(
                  resultLang || lang,
                  part,
                  `/${snakeCase(getCourseNavigation(resultLang || lang, part, course)[letter])}`
                )}
              >
                <div>
                  {`part ${part}, ${letter}: ${getCourseTitle(resultLang || lang, part, letter, course)}`}
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </Element>
    );
  }
};

export default SearchResults;
