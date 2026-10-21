import { anchorate } from 'anchorate';
import { withPrefix } from 'gatsby';
import prepareExampleApp from './src/utils/prepareExampleApp';

export { default as wrapPageElement } from './wrapPageElement';
export { default as wrapRootElement } from './wrapRootElement';

require('prismjs/themes/prism-dark.css');

export const onClientEntry = () => {
  prepareExampleApp(window, navigator, document, withPrefix('/exampleapp/'));
};

export const onRouteUpdate = () => {
  anchorate({
    scroller: function (element) {
      if (!element) return false;
      element.scrollIntoView({ behavior: 'smooth' });
      return true;
    },
  });
};
