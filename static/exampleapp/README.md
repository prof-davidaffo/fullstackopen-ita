# Internal example application

This directory contains the browser/server demonstration used in part 0.
It is based on the University of Helsinki example application:
<https://github.com/mluukkai/example_app>.

GitHub Pages cannot run the original Express server. A service worker therefore
implements the small JSON API locally in the browser, including the GET and POST
responses used by the course exercises. Notes are stored in the browser cache
and can be restored to the initial data by opening `reset` inside this directory.

Worker registration is inline in the static HTML, so it does not add a separate
script request to the examples. Pages already controlled by this worker skip
registration. The generated front page contains no scripts. On subsequent visits,
the application requests match the lesson: HTML and `kuva.png` on the front page;
HTML, `main.css`, `main.js` (or `spa.js`), and `data.json` on the notes pages.

The first visit still installs the service worker and reloads the page before
using the simulated API. Let that setup finish, then clear the Network panel and
reload to inspect the lesson's sequence. DevTools labels API responses as coming
from a service worker; this is a static-hosting simulation, not an Express server.
