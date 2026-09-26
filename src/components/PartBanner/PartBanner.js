import './PartBanner.scss';

import translationProgress from '../../utils/translationProgress';
import { Banner } from '../Banner/Banner';
import { ContentLiftup } from '../ContentLiftup/ContentLiftup';
import React from 'react';
import getPartTranslationPath from '../../utils/getPartTranslationPath';
import { Link, useCourse } from '../CourseTrack';
import { curriculum, getPartNames, getSectionCopy } from '../../courseConfig';

const partName = {
  en: 'Part',
  es: 'Parte',
  fi: 'Osa',
  fr: 'Partie',
  it: 'Parte',
  ptbr: 'Parte',
  zh: '部分',
};

export const PartBanner = ({ lang }) => {
  const course = useCourse();
  const partNames = getPartNames(lang);
  const sections = getSectionCopy(lang);

  return (
    <Banner
      className="spacing spacing--after-small spacing--after-mobile offset"
      id="course-contents"
    >
      <div className="container course-sections spacing col-7--mobile">
        {curriculum.map(({ id, parts }) => (
          <section
            className="course-section col-10"
            id={`course-${id}`}
            key={id}
          >
            <header className="course-section__header col-8 col-10--mobile">
              <p className="course-section__eyebrow">
                {id === 'core' ? '01' : id === 'advanced' ? '02' : '03'}
              </p>
              <h2>{sections[id].title}</h2>
              <p>
                {sections[id].description.replace(
                  'MongoDB',
                  course === 'sqlite' ? 'SQLite' : 'MongoDB'
                )}
              </p>
            </header>

            <div className="course-section__parts flex-fix-aligning">
              {parts.map((part) => {
                const englishOnly = translationProgress[lang] < part;
                const summary = englishOnly
                  ? `${partNames[part]} · English only`
                  : partNames[part];

                return (
                  <ContentLiftup
                    key={part}
                    className="col-3 col-10--mobile col-4--tablet"
                    image={{
                      src: require(`../../images/thumbnails/part-${part}.svg`),
                      alt: partNames[part],
                    }}
                    hoverImageSrc={require(
                      `../../images/thumbnails/part-${part}_ovr.svg`
                    )}
                    name={`${partName[lang] || partName.en} ${part}`}
                    summary={summary}
                    path={getPartTranslationPath(lang, part)}
                  />
                );
              })}
            </div>
            {id === 'core' && course === 'sqlite' && (
              <p>
                <Link
                  to={
                    lang === 'it'
                      ? '/it/part5/pubblicare_lapplicazione'
                      : '/en/part5/deploying_the_application'
                  }
                >
                  {lang === 'it'
                    ? 'Conclusione del corso base: pubblicare l’applicazione (dopo la Parte 5)'
                    : 'Core course conclusion: deploy your application (after Part 5)'}
                </Link>
              </p>
            )}
          </section>
        ))}
      </div>
    </Banner>
  );
};
