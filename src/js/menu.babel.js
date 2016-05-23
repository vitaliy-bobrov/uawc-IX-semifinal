(document => {
  'use strict';

  let menuButton = document.querySelector('.js-menu-toggle');
  let menu = document.querySelector('.js-menu');
  const menuButtonOpenClass = 'menu-toggle_active';
  const menuOpenClass = 'menu_active';
  const a11yMenuButton = 'aria-expanded';
  const a11yMenu = 'aria-hidden';

  /**
   * Click on menu button handler.
   *
   * @param {Object} event - object with event data.
   * @return {Boolean} - tr prevent hash in history.
   */
  const menuButtonHandler = event => {
    event.preventDefault();

    if (menu.className.indexOf(menuOpenClass) === -1) {
      menuButton.setAttribute(a11yMenuButton, false);
      menuButton.classList.add(menuButtonOpenClass);

      menu.setAttribute(a11yMenu, true);
      menu.classList.add(menuOpenClass);
    } else {
      menuButton.setAttribute(a11yMenuButton, true);
      menuButton.classList.remove(menuButtonOpenClass);

      menu.setAttribute(a11yMenu, false);
      menu.classList.remove(menuOpenClass);
    }

    return false;
  };

  if (menuButton && menu) {
    document.addEventListener('DOMContentLoaded', () => {
      menuButton.addEventListener('click', menuButtonHandler);
    });
  }
})(document);
