import React, { createContext, useContext } from 'react';
import { Link as GatsbyLink, navigate, withPrefix } from 'gatsby';
import { coursePath } from '../courseTracks';

export const CourseContext = createContext('sqlite');
export const CourseLocationContext = createContext('/');
export const useCourse = () => useContext(CourseContext);

export const Link = ({ to, ...props }) => {
  const course = useCourse();
  return <GatsbyLink to={coursePath(to, course)} {...props} />;
};

export const CourseAnchor = ({ href = '', ...props }) => {
  const course = useCourse();
  const prefix = withPrefix('/').replace(/\/$/, '');
  const bare =
    prefix && href.startsWith(prefix + '/') ? href.slice(prefix.length) : href;
  const target =
    bare.startsWith('/') && !bare.startsWith('//')
      ? withPrefix(coursePath(bare, course))
      : href;
  return <a href={target} {...props} />;
};

export const CoursePicker = ({ lang, path }) => {
  const course = useCourse();
  return (
    <div className="course-picker">
      <label htmlFor="course-select">
        {lang === 'it' ? 'Percorso' : 'Course track'}
      </label>
      <select
        id="course-select"
        value={course}
        onChange={(event) => {
          const selected = event.target.value;
          try {
            localStorage.setItem('course-track', selected);
          } catch {
            /* Storage may be disabled. */
          }
          // The deployment chapter only exists in the SQLite track.
          const target =
            /\/(pubblicare_lapplicazione|deploying_the_application)\/?$/.test(
              path
            )
              ? lang === 'fi'
                ? '/osa5'
                : `/${lang}/part5`
              : path;
          navigate(coursePath(target, selected));
        }}
      >
        <option value="sqlite">
          SQLite — {lang === 'it' ? 'percorso scolastico' : 'school track'}
        </option>
        <option value="mongodb">
          MongoDB — {lang === 'it' ? 'percorso originale' : 'original track'}
        </option>
      </select>
    </div>
  );
};
