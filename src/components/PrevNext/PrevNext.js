import './PrevNext.scss';

import translationProgress from '../../utils/translationProgress';
import Element from '../Element/Element';
import { Link } from '../CourseTrack';
import { PropTypes } from 'prop-types';
import React from 'react';
import navigation from '../../content/partnavigation/partnavigation';
import snakeCase from 'lodash/fp/snakeCase';
import getPartTranslationPath from '../../utils/getPartTranslationPath';
import { useTranslation } from 'react-i18next';
import { isContentVisible } from '../../courseConfig';
import { useCourse } from '../CourseTrack';
import { getCourseNavigation } from '../../courseTracks';

const hasPart = (part, lang) =>
  Object.keys(navigation[lang]).includes(part.toString());
const visibleLetters = (part, lang, course) =>
  Object.keys(getCourseNavigation(lang, part, course)).filter((letter) =>
    isContentVisible(part, letter)
  );

const labelOsaPart = (lang) => (lang === 'fi' ? 'Osa' : 'Part');

const langUrl = (lang) => (lang === 'fi' ? '/osa' : `/${lang}/part`);

const PrevNext = ({ part, letter, lang }) => {
  const { t } = useTranslation();
  const course = useCourse();
  const letters = visibleLetters(part, lang, course);
  const letterIndex = letter ? letters.indexOf(letter) : -1;
  const hasNextDestination = letter
    ? letterIndex < letters.length - 1 || hasPart(part + 1, lang)
    : hasPart(part + 1, lang);

  const contentPath = (targetLetter) =>
    `${langUrl(targetLetter === 'f' && lang !== 'it' ? 'en' : lang)}${part}/${snakeCase(
      getCourseNavigation(lang, part, course)[targetLetter]
    )}`;

  const getPrev = () => {
    if (!letter && hasPart(part - 1, lang)) {
      return (
        <>
          <Link
            to={`${langUrl(lang)}${part - 1}`}
            className="col-4--mobile push-right-1 prev"
          >
            <Element flex dirColumn>
              <p>
                {labelOsaPart(lang)} {part - 1}
              </p>

              <b>{t('previousPart')}</b>
            </Element>
          </Link>

          {hasNextDestination && <div className="col-1--mobile separator" />}
        </>
      );
    } else if (letter) {
      if (letterIndex > 0) {
        const previousLetter = letters[letterIndex - 1];
        return (
          <>
            <Link
              to={contentPath(previousLetter)}
              className="col-4--mobile push-right-1 prev"
            >
              <Element flex dirColumn>
                <p>
                  {labelOsaPart(lang)} {`${part}${previousLetter}`}
                </p>

                <b>{t('previousPart')}</b>
              </Element>
            </Link>

            {hasNextDestination && <div className="col-1--mobile separator" />}
          </>
        );
      } else if (hasPart(part - 1, lang)) {
        return (
          <>
            <Link
              to={`${langUrl(lang)}${part - 1}`}
              className="col-4--mobile push-right-1 prev"
            >
              <Element flex dirColumn>
                <p>
                  {labelOsaPart(lang)} {part - 1}
                </p>

                <b>{t('previousPart')}</b>
              </Element>
            </Link>

            {hasNextDestination && <div className="col-1--mobile separator" />}
          </>
        );
      } else {
        return <Element className="push-right-1" />;
      }
    } else {
      return <Element className="push-right-1" />;
    }
  };

  const getNext = () => {
    if (!letter && hasPart(part + 1, lang)) {
      if (translationProgress[lang] <= part) {
        lang = 'en';
      }
      return (
        <Link
          to={`${langUrl(lang)}${part + 1}`}
          className="col-4--mobile push-left-1 next"
        >
          <Element flex dirColumn>
            <p>
              {labelOsaPart(lang)} {part + 1}
            </p>

            <b>{t('nextPart')}</b>
          </Element>
        </Link>
      );
    } else if (letter) {
      if (letterIndex < letters.length - 1) {
        const nextLetter = letters[letterIndex + 1];
        return (
          <Link
            to={contentPath(nextLetter)}
            className="col-4--mobile push-left-1 next"
          >
            <Element flex dirColumn>
              <p>
                {labelOsaPart(lang)} {`${part}${nextLetter}`}
              </p>

              <b>{t('nextPart')}</b>
            </Element>
          </Link>
        );
      } else if (hasPart(part + 1, lang)) {
        return (
          <Link
            to={getPartTranslationPath(lang, part + 1)}
            className="col-4--mobile push-left-1 next"
          >
            <Element flex dirColumn>
              <p>
                {labelOsaPart(lang)} {part + 1}
              </p>

              <b>{t('nextPart')}</b>
            </Element>
          </Link>
        );
      } else {
        return <Element className="push-left-1" />;
      }
    } else {
      return <Element className="push-left-1" />;
    }
  };

  return (
    <Element className="container spacing spacing--after-large prev-next__container">
      {getPrev()}

      {getNext()}
    </Element>
  );
};

PrevNext.defaultProps = {
  part: undefined,
  letter: undefined,
};

PrevNext.propTypes = {
  part: PropTypes.number,
  letter: PropTypes.string,
  lang: PropTypes.string.isRequired,
};

export default PrevNext;
