import './layout.css';
import './index.scss';

import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import Header from './Header/Header';
import Footer from './Footer/Footer';
import PropTypes from 'prop-types';
import SkipToContent from './SkipToContent/SkipToContent';
import { CoursePicker, CourseLocationContext } from './CourseTrack';

const Layout = (props) => {
  const { i18n } = useTranslation();

  const { children, hideFooter, isCoursePage } = props;
  const siteLanguage = i18n.language;
  const path = useContext(CourseLocationContext);

  return (
    <div className="main-wrapper">
      <SkipToContent isCoursePage={isCoursePage} />

      <Header lang={siteLanguage} />

      <main id="main-content">
        <CoursePicker lang={siteLanguage} path={path} />
        {children}
      </main>

      {!hideFooter && <Footer lang={siteLanguage} />}
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
