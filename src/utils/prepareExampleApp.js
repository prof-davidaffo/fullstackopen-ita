// GitHub Pages has no API server. Prepare its replacement from the handbook,
// keeping the demonstration HTML and JavaScript free of hosting setup code.
function prepareExampleApp(browser, navigator, document, basePath) {
  if (!('serviceWorker' in navigator)) return Promise.resolve(false);

  const ready = navigator.serviceWorker
    .register(`${basePath}service-worker.js`, { scope: basePath })
    .then((registration) => {
      // serviceWorker.ready cannot be used here: the handbook is outside the
      // worker's scope. Wait for this registration's worker instead.
      const worker =
        registration.installing || registration.waiting || registration.active;
      if (!worker) throw new Error('Example app worker is unavailable');
      return new Promise((resolve, reject) => {
        const check = () => {
          if (worker.state === 'activated' || worker.state === 'redundant') {
            worker.removeEventListener('statechange', check);
            if (worker.state === 'activated') resolve(true);
            else reject(new Error('Example app worker installation failed'));
          }
        };
        worker.addEventListener('statechange', check);
        check();
      });
    })
    .catch((error) => {
      browser.console.error('Could not prepare the example app:', error);
      return false;
    });

  document.addEventListener('click', (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const link = event.target.closest('a[href]');
    if (
      !link ||
      link.hasAttribute('download') ||
      (link.target && link.target !== '_self')
    )
      return;
    const url = new URL(link.href, browser.location.href);
    if (
      url.origin !== browser.location.origin ||
      !(
        url.pathname === basePath.slice(0, -1) ||
        url.pathname.startsWith(basePath)
      )
    )
      return;

    event.preventDefault();
    ready.then(() => browser.location.assign(url.href));
  });

  return ready;
}

module.exports = prepareExampleApp;
