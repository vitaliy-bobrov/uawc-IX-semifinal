(document => {
  'use strict';

  /**
   * Click on menu button handler.
   *
   * @param {HTMLElement} elem - Target element.
   */
  const dropPerChar = elem => {
    let chars = elem.textContent.split('');

    elem.textContent = '';

    chars.forEach(char => {
      let symbol = document.createElement('span');
      symbol.textContent = char === ' ' ? '' : char;

      elem.appendChild(symbol);
    });
  };

  /**
   * Inits wrapping on target elements.
   */
  const init = () => {
    let containers = document.querySelectorAll('.js-char-wrap');

    if (containers.length) {
      Array.prototype.forEach.call(containers, title => dropPerChar(title));
    }
  };

  document.addEventListener('DOMContentLoaded', init);
})(document);
