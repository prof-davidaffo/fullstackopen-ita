import React, { useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { navigate, withPrefix } from 'gatsby';
import {
  CourseContext,
  CourseLocationContext,
} from './src/components/CourseTrack';
import { coursePath } from './src/courseTracks';

const isSSR = typeof window === 'undefined';

const LanguageWrapper = ({ language, children }) => {
  const { i18n } = useTranslation();

  if (isSSR) {
    i18n.changeLanguage(language);
  }

  useEffect(() => {
    language !== i18n.language && i18n.changeLanguage(language);
  }, [language, i18n]);

  return children;
};

const TrackWrapper = ({ course, location, children }) => {
  const prefix = withPrefix('/').replace(/\/$/, '');
  const pathname =
    prefix && location.pathname.startsWith(prefix + '/')
      ? location.pathname.slice(prefix.length)
      : location.pathname;
  useEffect(() => {
    // Only an unqualified landing page restores the preference. A chapter URL
    // always identifies its track, including when opened from a shared link.
    try {
      const landing = /^\/(en|it|fi|es|fr|ptbr|zh)?\/?$/.test(pathname);
      if (
        course === 'sqlite' &&
        landing &&
        localStorage.getItem('course-track') === 'mongodb'
      ) {
        navigate(coursePath(pathname, 'mongodb') + location.hash, {
          replace: true,
        });
      } else {
        // A shared chapter URL takes precedence over an older preference.
        localStorage.setItem('course-track', course);
      }
    } catch {
      /* Browsing still works without storage. */
    }
  }, [course, pathname, location.hash]);
  return (
    <CourseContext.Provider value={course}>
      <CourseLocationContext.Provider value={pathname}>
        {children}
      </CourseLocationContext.Provider>
    </CourseContext.Provider>
  );
};

const wrapPageElement = ({ element, props }) => {
  const { pageContext } = props;
  const { langKey, lang } = pageContext;
  const language = langKey || lang;

  return (
    <TrackWrapper
      key={props.path}
      course={pageContext.course || 'sqlite'}
      location={props.location}
    >
      <LanguageWrapper language={language}>{element}</LanguageWrapper>
    </TrackWrapper>
  );
};

export default wrapPageElement;
