import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { navigate } from 'gatsby';

import './Navigation.scss';

import LanguagePicker from '../LanguagePicker';
import { NavigationItem } from './Item';
import SearchLink from './SearchLink';
import ThemeSwitcher from './ThemeSwitcher';
import { getSectionCopy } from '../../courseConfig';
import { useCourse } from '../CourseTrack';
import { coursePath } from '../../courseTracks';

const getTranslationPath = (path, language) => {
  return language === 'fi' ? path : `/${language}${path}`;
};

export const getNavigation = (language, t) => {
  const sections = getSectionCopy(language);

  return [
    {
      text: t('homePage:startCourseButton'),
      path: getTranslationPath('/#course-contents', language),
    },
    {
      text: sections.core.title,
      path: getTranslationPath('/#course-core', language),
    },
    {
      text: sections.advanced.title,
      path: getTranslationPath('/#course-advanced', language),
    },
    {
      text: sections.specializations.title,
      path: getTranslationPath('/#course-specializations', language),
    },
  ];
};

const searchIsEnabledForLang = (lang) => {
  return ['fi', 'en', 'es', 'it', 'zh', 'ptbr'].includes(lang);
};

const handleCloseMenu = () =>
  document.body.classList.remove('is-open--navigation');

const handleHamburgerClick = () => {
  document.body.classList.toggle('is-open--navigation');
};

const Navigation = (props) => {
  const { t, i18n } = useTranslation();
  const course = useCourse();
  const [navigationOpen, setNavigationOpen] = useState(false);

  const { className = '' } = props;
  const lang = i18n.language;
  const navigation = getNavigation(lang, t);
  const showSearchLink = searchIsEnabledForLang(lang);

  const onLanguageChange = (newLang) => {
    navigate(coursePath(getTranslationPath('/', newLang), course));
  };

  return (
    <div className={`navigation__wrapper ${className}`}>
      <button
        aria-label="Navigation menu"
        aria-expanded={navigationOpen}
        onClick={() => {
          setNavigationOpen((prevOpen) => !prevOpen);
          handleHamburgerClick();
        }}
        className="navigation__toggle"
      >
        <div className="navigation__toggle-icon" />
      </button>
      <nav>
        <ul className="navigation">
          {navigation.map((i) => (
            <NavigationItem key={i.path} {...i} onClick={handleCloseMenu} />
          ))}

          <div className="navigation__icon-buttons">
            {showSearchLink && <SearchLink lang={lang} />}
            <ThemeSwitcher />
          </div>

          <LanguagePicker
            className="navigation__language-picker"
            onChange={onLanguageChange}
            value={lang}
          />
        </ul>
      </nav>
    </div>
  );
};

Navigation.propTypes = {
  className: PropTypes.string,
};

export default Navigation;
