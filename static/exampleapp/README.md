# Internal example application

This directory contains the browser/server demonstration used in part 0.
It is based on the University of Helsinki example application:
<https://github.com/mluukkai/example_app>.

GitHub Pages cannot run the original Express server. A service worker therefore
implements the small JSON API locally in the browser, including the GET and POST
responses used by the course exercises. Notes are stored in the browser cache
and can be restored to the initial data by opening `reset` inside this directory.

The handbook registers the worker through `src/utils/prepareExampleApp.js`.
Normal clicks on example links wait for activation before navigating. The worker
is scoped to `exampleapp/`, so it does not control handbook pages.

The example HTML contains no inline scripts or worker registration. The front
page requests only HTML and `kuva.png`; the notes pages request HTML, `main.css`,
`main.js` (or `spa.js`), and `data.json`. The lesson scripts start on `window.onload`
and have no dependency on the handbook's setup code.

On a fresh browser profile, open the handbook before visiting an example. A direct
visit without prior setup can display the static files, but saving notes requires
the worker installed by the handbook. After installation, direct visits work too.
DevTools labels API responses as coming from a service worker; this is a
static-hosting simulation, not an Express server.
