(() => {
  // Detect requestAnimationFrame for any vendor.
  const requestAnimationFrame = window.requestAnimationFrame ||
                                window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame ||
                                window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

((document, window, Sticky) => {
  'use strict';

  /**
   * Parallax effect class.
   */
  class Parallax {

    /**
     * Contructor function.
     * @param {String} selector - selector to init parallax.
     * @param {Number} speed - default effect speed.
     */
    constructor(selector = '.js-parallax', speed = -5) {
      this.speed = this.limitSpeed(speed);
      this.elems = document.querySelectorAll(selector);
      this.length = this.elems.length;
      this.blocks = [];
      this.update = this.update.bind(this);

      if (this.length) {
        this.init();
      } else {
        throw new Error(`Elements matching selector ${selector} don't exist.`);
      }
    }

    /**
     * Check if device can support effect.
     * @return {Boolean} can be effect enabled on device.
     */
    static checkDevice() {
      return typeof window.orientation === 'undefined' && innerWidth > 1200;
    }

    /**
     * Limits effect speed to +/-10.
     * @param {Number} speed - effect speed.
     * @return {Number} - corrected speed.
     */
    limitSpeed(speed) {
      let correctSpeed;

      if (speed < -10) {
        correctSpeed = -10;
      } else if (speed > 10) {
        correctSpeed = 10;
      } else {
        correctSpeed = speed;
      }

      return correctSpeed;
    }

    /**
     * Initialise effect on elements.
     */
    init() {
      let i;

      // Get and cache initial position of all elements
      for (i = 0; i < this.length; i++) {
        this.blocks.push(this.createBlock(this.elems[i]));
      }

      window.addEventListener('scroll', this.update);
      window.addEventListener('resize', this.update);

      requestAnimationFrame(this.update);
    }

    /**
     * Creates elemnt data.
     * @param {HTMLElement} el - element.
     * @return {Object} - calculated data.
     */
    createBlock(el) {
      let dimensions = el.getBoundingClientRect();
      let blockTop = pageYOffset + dimensions.top;
      let blockHeight = dimensions.height;

      // Apparently parallax equation everyone uses.
      let percentage = (-blockTop + innerHeight) /
                       (blockHeight + innerHeight);

      // Optional individual block speed as data attr, otherwise global speed.
      let speed = el.dataset.parallaxSpeed ?
                  parseInt(el.dataset.parallaxSpeed, 10) : this.speed;
      let base = this.updatePosition(percentage, speed);

      return {
        base,
        top: blockTop,
        height: blockHeight,
        speed,
        style: el.style
      };
    }

    /**
     * Updates element position.
     * @param {String} percentage - multiplier relative to dimensions.
     * @param {Number} speed - effect speed.
     * @return {Number} - position.
     */
    updatePosition(percentage, speed) {
      let value = (speed * (100 * (1 - percentage)));

      return Math.round(value);
    }

    /**
     * Checks if element visible.
     * @param {Number} i - element index.
     * @return {Boolean} - visibility.
     */
    visible(i) {
      if ((pageYOffset + innerHeight) > this.blocks[i].top &&
          pageYOffset < this.blocks[i].top + this.blocks[i].height) {
        return true;
      }

      return false;
    }

    /**
     * Updates element transform.
     */
    update() {
      requestAnimationFrame(this.update);

      let i;

      for (i = 0; i < this.length; i++) {
        if (this.visible(i)) {
          let percentage = ((pageYOffset - this.blocks[i].top + innerHeight) /
                         (this.blocks[i].height + innerHeight));
          let position = this.updatePosition(percentage, this.blocks[i].speed) -
                         this.blocks[i].base;

          this.elems[i].style.transform = `translate3d(0, ${position}px, 0)`;
        }
      }
    }
  }

  window.addEventListener('load', () => {
    if (Parallax.checkDevice()) {
      let parallax = new Parallax();

      // Can't enable on Safari.
      if (!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/)) {
        Sticky.autoInit({
          selector: '.section__title_sticky'
        });
      }
    }
  });
})(document, window, Sticky);
