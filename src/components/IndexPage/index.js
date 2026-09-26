import React from 'react';
import { useTranslation } from 'react-i18next';

import { BodyText } from '../BodyText/BodyText';
import Element from '../Element/Element';
import { Image } from './../Image/Image';
import Layout from '../layout';
import { PartBanner } from '../PartBanner/PartBanner';
import Seo from '../seo';
import { SubHeader } from '../SubHeader/SubHeader';
import { TripleBorder } from '../TripleBorder/TripleBorder';
import content from '../../content/pages/main.json';
import landingImage from '../../images/landing.svg';
import licenceIcon from '../../images/cc-logo.png';
import mainSEOdescription from '../../content/seo/mainSEOdescription';
import mainSEOtags from '../../content/seo/mainSEOtags';
import { useCourse } from '../CourseTrack';
import { COURSE_NAME, getSectionCopy } from '../../courseConfig';

const IndexPage = ({ lang, title = COURSE_NAME }) => {
  const { t } = useTranslation();

  const { mainTitle, licence, licenced } = content[lang] || content.en;
  const course = useCourse();
  const intro = getSectionCopy(lang).core.description.replace(
    'MongoDB',
    course === 'sqlite' ? 'SQLite' : 'MongoDB'
  );

  const seoDescription = mainSEOdescription[lang];

  return (
    <Layout hideFooter={true}>
      <Seo
        lang={lang}
        title={title}
        description={seoDescription}
        keywords={[...mainSEOtags]}
      />
      <div className="frontpage-hero container spacing--after spacing--mobile">
        <Element
          flex
          spaceBetween
          className="spacing--small spacing--mobile"
          relative
        >
          <Element dirColumn className="frontpage-hero__content col-6">
            <SubHeader
              className="frontpage-hero__heading"
              text={mainTitle}
              headingLevel="h1"
            />

            <SubHeader text={COURSE_NAME} headingLevel="h2" />

            <a
              className="frontpage-hero__cta centered about__challenge-button spacing--after--mobile"
              href="#course-core"
            >
              {t('homePage:startCourseButton')}
            </a>

            <BodyText
              className="frontpage-hero__description"
              headingFont
              text={intro}
            />
          </Element>

          <Image
            contain
            className="col-4 frontpage-hero__image"
            style={{ margin: 0 }}
            alt="Stacked cubes with React logo and JavaScript text"
            src={landingImage}
          />
        </Element>
      </div>

      <PartBanner lang={lang} />

      <Element className="container col-10 spacing--after">
        <TripleBorder
          largeMargin
          backgroundColor="var(--color-main)"
          className="col-8 col-10--mobile centered--mobile"
        >
          <Element
            flex
            spaceBetween
            className="spacing--small spacing--after col-9 col-10--mobile"
          >
            <div className="col-7 col-10--mobile">
              <BodyText
                headingFont
                className="link"
                heading={{
                  title: t('homePage:authorsTitle'),
                  level: 'h3',
                }}
                text={licence}
              />
            </div>
            <div className="col-2 col-5--mobile">
              <Image
                contain
                src={licenceIcon}
                alt="Creative Commons BY-NC-SA 3.0 -lisenssi"
                className="col-4--mobile"
              />

              <BodyText headingFont text={licenced} className="link" />
            </div>
          </Element>
        </TripleBorder>
      </Element>
    </Layout>
  );
};

export default IndexPage;
