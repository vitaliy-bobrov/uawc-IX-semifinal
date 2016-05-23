((document, window) => {
  'use strict';

  const preloaderActive = 'preloader_active';
  const minDuration = 3000;
  const animationDuration = 800;

  /**
   * Starts preloder.
   * @return {Stirng} - preloader start time.
   */
  const preloaderStart = () => {
    window.scrollTo(0, 0);
    document.body.classList.add(preloaderActive);

    return new Date().getTime();
  };

  /**
   * Stops preloder.
   */
  const preloaderStop = () => {
    document.body.classList.remove(preloaderActive);

    setTimeout(() => {
      let spinner = document.querySelector('.preloader__spinner');

      document.body.classList.remove('preloader');
      document.body.removeChild(spinner);
    }, animationDuration);
  };

  let start = preloaderStart();

  window.addEventListener('load', () => {
    let finish = new Date().getTime();
    let duration = finish - start;

    if (duration > minDuration) {
      preloaderStop();
    } else {
      setTimeout(preloaderStop, minDuration - duration);
    }
  });
})(document, window);
