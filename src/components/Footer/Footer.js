import { Link } from '../CourseTrack';
import React from 'react';
import { useTranslation } from 'react-i18next';

import './Footer.scss';

import Element from '../Element/Element';
import { getNavigation } from '../Navigation/Navigation';
import { COURSE_NAME } from '../../courseConfig';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const navigation = getNavigation(i18n.language, t);

  return (
    <Element
      Tag="footer"
      id="footer"
      className="container spacing--after-small spacing--mobile"
      flex
    >
      <p className="col-3 col-10--mobile">{COURSE_NAME}</p>

      <Element flex className="col-7 col-10--mobile footer__navigation">
        <div className="footer__navigation-link-container">
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="footer__navigation-link nav-item-hover"
              style={{ marginLeft: '4.5rem' }}
            >
              {item.text}
            </Link>
          ))}
        </div>
      </Element>
    </Element>
  );
};

export default Footer;
