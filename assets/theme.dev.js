
/*
* @license
* Broadcast Theme (c) Invisible Themes
*
* This file is included for advanced development by
* Shopify Agencies.  Modified versions of the theme
* code are not supported by Shopify or Invisible Themes.
*
* In order to use this file you will need to change
* theme.js to theme.dev.js in /layout/theme.liquid
*
*/

(function (scrollLock) {
    'use strict';

    (function() {
        const env = {"NODE_ENV":"production"};
        try {
            if (process) {
                process.env = Object.assign({}, process.env);
                Object.assign(process.env, env);
                return;
            }
        } catch (e) {} // avoid ReferenceError: process is not defined
        globalThis.process = { env:env };
    })();

    window.theme = window.theme || {};

    window.theme.sizes = {
      mobile: 480,
      small: 750,
      large: 990,
      widescreen: 1400,
    };

    window.theme.focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    window.theme.getWindowWidth = function () {
      return document.documentElement.clientWidth || document.body.clientWidth || window.innerWidth;
    };

    window.theme.getWindowHeight = function () {
      return document.documentElement.clientHeight || document.body.clientHeight || window.innerHeight;
    };

    window.theme.isMobile = function () {
      return window.theme.getWindowWidth() < window.theme.sizes.small;
    };

    /**
     * Currency Helpers
     * -----------------------------------------------------------------------------
     * A collection of useful functions that help with currency formatting
     *
     * Current contents
     * - formatMoney - Takes an amount in cents and returns it as a formatted dollar value.
     *
     */

    const moneyFormat = '${{amount}}';

    /**
     * Format money values based on your shop currency settings
     * @param  {Number|string} cents - value in cents or dollar amount e.g. 300 cents
     * or 3.00 dollars
     * @param  {String} format - shop money_format setting
     * @return {String} value - formatted value
     */
    window.theme.formatMoney = function (cents, format) {
      if (typeof cents === 'string') {
        cents = cents.replace('.', '');
      }
      let value = '';
      const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
      const formatString = format || moneyFormat;

      function formatWithDelimiters(number, precision = 2, thousands = ',', decimal = '.') {
        if (isNaN(number) || number == null) {
          return 0;
        }

        number = (number / 100.0).toFixed(precision);

        const parts = number.split('.');
        const dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1${thousands}`);
        const centsAmount = parts[1] ? decimal + parts[1] : '';

        return dollarsAmount + centsAmount;
      }

      switch (formatString.match(placeholderRegex)[1]) {
        case 'amount':
          value = formatWithDelimiters(cents, 2);
          break;
        case 'amount_no_decimals':
          value = formatWithDelimiters(cents, 0);
          break;
        case 'amount_with_comma_separator':
          value = formatWithDelimiters(cents, 2, '.', ',');
          break;
        case 'amount_no_decimals_with_comma_separator':
          value = formatWithDelimiters(cents, 0, '.', ',');
          break;
        case 'amount_with_apostrophe_separator':
          value = formatWithDelimiters(cents, 2, "'", '.');
          break;
        case 'amount_no_decimals_with_space_separator':
          value = formatWithDelimiters(cents, 0, ' ', '');
          break;
        case 'amount_with_space_separator':
          value = formatWithDelimiters(cents, 2, ' ', ',');
          break;
        case 'amount_with_period_and_space_separator':
          value = formatWithDelimiters(cents, 2, ' ', '.');
          break;
      }

      return formatString.replace(placeholderRegex, value);
    };

    window.theme.debounce = function (fn, time) {
      let timeout;
      return function () {
        // eslint-disable-next-line prefer-rest-params
        if (fn) {
          const functionCall = () => fn.apply(this, arguments);
          clearTimeout(timeout);
          timeout = setTimeout(functionCall, time);
        }
      };
    };

    let screenOrientation = getScreenOrientation();
    let firstLoad = true;

    window.theme.readHeights = function () {
      const h = {};
      h.windowHeight = Math.min(window.screen.height, window.innerHeight);
      h.footerHeight = getHeight('[data-section-type*="footer"]');
      h.headerHeight = getHeight('[data-header-height]');
      h.stickyHeaderHeight = document.querySelector('[data-header-sticky]') ? h.headerHeight : 0;
      h.collectionNavHeight = getHeight('[data-collection-nav]');
      h.logoHeight = getFooterLogoWithPadding();

      return h;
    };

    function setVars() {
      const {windowHeight, headerHeight, logoHeight, footerHeight, collectionNavHeight} = window.theme.readHeights();
      const currentScreenOrientation = getScreenOrientation();

      if (!firstLoad || currentScreenOrientation !== screenOrientation || window.innerWidth > window.theme.sizes.mobile) {
        // Only update the heights on screen orientation change or larger than mobile devices
        document.documentElement.style.setProperty('--full-height', `${windowHeight}px`);
        document.documentElement.style.setProperty('--three-quarters', `${windowHeight * (3 / 4)}px`);
        document.documentElement.style.setProperty('--two-thirds', `${windowHeight * (2 / 3)}px`);
        document.documentElement.style.setProperty('--one-half', `${windowHeight / 2}px`);
        document.documentElement.style.setProperty('--one-third', `${windowHeight / 3}px`);

        // Update the screen orientation state
        screenOrientation = currentScreenOrientation;
        firstLoad = false;
      }

      document.documentElement.style.setProperty('--collection-nav-height', `${collectionNavHeight}px`);
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
      document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
      document.documentElement.style.setProperty('--content-full', `${windowHeight - headerHeight - logoHeight / 2}px`);
      document.documentElement.style.setProperty('--content-min', `${windowHeight - headerHeight - footerHeight}px`);
    }

    function getScreenOrientation() {
      if (window.matchMedia('(orientation: portrait)').matches) {
        return 'portrait';
      }

      if (window.matchMedia('(orientation: landscape)').matches) {
        return 'landscape';
      }
    }

    function getHeight(selector) {
      const el = document.querySelector(selector);
      if (el) {
        return el.offsetHeight;
      } else {
        return 0;
      }
    }

    function getFooterLogoWithPadding() {
      const height = getHeight('[data-footer-logo]');
      if (height > 0) {
        return height + 20;
      } else {
        return 0;
      }
    }

    setVars();

    window.addEventListener('DOMContentLoaded', setVars);
    document.addEventListener('theme:resize', setVars);
    document.addEventListener('shopify:section:load', setVars);

    window.theme.scrollTo = (elementTop) => {
      const stickyHeaderHeight = document.querySelector('[data-header-sticky]') ? document.querySelector('[data-header-height]').offsetHeight : 0;

      window.scrollTo({
        top: elementTop + window.scrollY - stickyHeaderHeight,
        left: 0,
        behavior: 'smooth',
      });
    };

    /**
     * A11y Helpers
     * -----------------------------------------------------------------------------
     * A collection of useful functions that help make your theme more accessible
     */

    // Define trapFocusHandlers as a global variable within the module.
    const trapFocusHandlers = {};

    const a11y = {
      /**
       * Moves focus to an HTML element
       * @param {Element} element - The element to focus on.
       * @param {Object} options - Settings unique to your theme.
       * @param {string} options.className - Class name to apply to element on focus.
       */
      forceFocus(element, options) {
        options = options || {};

        var savedTabIndex = element.tabIndex;

        element.tabIndex = -1;
        element.dataset.tabIndex = savedTabIndex;
        element.focus();
        if (typeof options.className !== 'undefined') {
          element.classList.add(options.className);
        }
        element.addEventListener('blur', callback);

        function callback(event) {
          event.target.removeEventListener(event.type, callback);

          element.tabIndex = savedTabIndex;
          delete element.dataset.tabIndex;
          if (typeof options.className !== 'undefined') {
            element.classList.remove(options.className);
          }
        }
      },

      /**
       * Focus the appropriate element based on the URL hash.
       * @param {Object} options - Settings unique to your theme.
       */
      focusHash(options) {
        options = options || {};
        var hash = window.location.hash;
        var element = document.getElementById(hash.slice(1));

        if (element && options.ignore && element.matches(options.ignore)) {
          return false;
        }

        if (hash && element) {
          this.forceFocus(element, options);
        }
      },

      /**
       * Bind in-page links to focus the appropriate element.
       * @param {Object} options - Settings unique to your theme.
       */
      bindInPageLinks(options) {
        options = options || {};
        var links = Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]'));

        function queryCheck(selector) {
          return document.getElementById(selector) !== null;
        }

        return links.filter((link) => {
          if (link.hash === '#' || link.hash === '') {
            return false;
          }

          if (options.ignore && link.matches(options.ignore)) {
            return false;
          }

          if (!queryCheck(link.hash.substr(1))) {
            return false;
          }

          var element = document.querySelector(link.hash);

          if (!element) {
            return false;
          }

          link.addEventListener('click', () => {
            this.forceFocus(element, options);
          });

          return true;
        });
      },

      focusable(container) {
        var elements = Array.prototype.slice.call(
          container.querySelectorAll('[tabindex],' + '[draggable],' + 'a[href],' + 'area,' + 'button:enabled,' + 'input:not([type=hidden]):enabled,' + 'object,' + 'select:enabled,' + 'textarea:enabled')
        );

        return elements.filter((element) => !!((element.offsetWidth || element.offsetHeight || element.getClientRects().length) && this.isVisible(element)));
      },

      trapFocus(container, options) {
        options = options || {};
        var elements = this.focusable(container);
        var elementToFocus = options.elementToFocus || container;
        var first = elements[0];
        var last = elements[elements.length - 1];

        this.removeTrapFocus();

        trapFocusHandlers.focusin = function (event) {
          if (container !== event.target && !container.contains(event.target) && first && first === event.target) {
            first.focus();
          }

          if (event.target !== container && event.target !== last && event.target !== first) return;
          document.addEventListener('keydown', trapFocusHandlers.keydown);
        };

        trapFocusHandlers.focusout = function () {
          document.removeEventListener('keydown', trapFocusHandlers.keydown);
        };

        trapFocusHandlers.keydown = function (event) {
          if (event.code !== 'Tab') return;

          if (event.target === last && !event.shiftKey) {
            event.preventDefault();
            first.focus();
          }

          if ((event.target === container || event.target === first) && event.shiftKey) {
            event.preventDefault();
            last.focus();
          }
        };

        document.addEventListener('focusout', trapFocusHandlers.focusout);
        document.addEventListener('focusin', trapFocusHandlers.focusin);

        this.forceFocus(elementToFocus, options);
      },

      removeTrapFocus() {
        document.removeEventListener('focusin', trapFocusHandlers.focusin);
        document.removeEventListener('focusout', trapFocusHandlers.focusout);
        document.removeEventListener('keydown', trapFocusHandlers.keydown);
      },

      autoFocusLastElement() {
        if (window.a11y.lastElement && document.body.classList.contains('is-focused')) {
          setTimeout(() => {
            window.a11y.lastElement?.focus();
          });
        }
      },

      accessibleLinks(elements, options) {
        if (typeof elements !== 'string') {
          throw new TypeError(elements + ' is not a String.');
        }

        elements = document.querySelectorAll(elements);

        if (elements.length === 0) {
          return;
        }

        options = options || {};
        options.messages = options.messages || {};

        var messages = {
          newWindow: options.messages.newWindow || 'Opens in a new window.',
          external: options.messages.external || 'Opens external website.',
          newWindowExternal: options.messages.newWindowExternal || 'Opens external website in a new window.',
        };

        var prefix = options.prefix || 'a11y';

        var messageSelectors = {
          newWindow: prefix + '-new-window-message',
          external: prefix + '-external-message',
          newWindowExternal: prefix + '-new-window-external-message',
        };

        function generateHTML(messages) {
          var container = document.createElement('ul');
          var htmlMessages = Object.keys(messages).reduce((html, key) => {
            return (html += '<li id=' + messageSelectors[key] + '>' + messages[key] + '</li>');
          }, '');

          container.setAttribute('hidden', true);
          container.innerHTML = htmlMessages;

          document.body.appendChild(container);
        }

        function externalSite(link) {
          return link.hostname !== window.location.hostname;
        }

        elements.forEach((link) => {
          var target = link.getAttribute('target');
          var rel = link.getAttribute('rel');
          var isExternal = externalSite(link);
          var isTargetBlank = target === '_blank';
          var missingRelNoopener = rel === null || rel.indexOf('noopener') === -1;

          if (isTargetBlank && missingRelNoopener) {
            var relValue = rel === null ? 'noopener' : rel + ' noopener';
            link.setAttribute('rel', relValue);
          }

          if (isExternal && isTargetBlank) {
            link.setAttribute('aria-describedby', messageSelectors.newWindowExternal);
          } else if (isExternal) {
            link.setAttribute('aria-describedby', messageSelectors.external);
          } else if (isTargetBlank) {
            link.setAttribute('aria-describedby', messageSelectors.newWindow);
          }
        });

        generateHTML(messages);
      },

      isVisible(el) {
        var style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      },
    };

    window.theme = window.theme || {};
    window.theme.a11y = a11y;

    window.theme.throttle = (fn, wait) => {
      let prev, next;
      return function invokeFn(...args) {
        const now = Date.now();
        next = clearTimeout(next);
        if (!prev || now - prev >= wait) {
          // eslint-disable-next-line prefer-spread
          fn.apply(null, args);
          prev = now;
        } else {
          next = setTimeout(invokeFn.bind(null, ...args), wait - (now - prev));
        }
      };
    };

    function appendCartItems() {
      if (document.querySelector('cart-items')) return;

      // Add cart items tag when the cart drawer section is missing so we can still run the JS associated with the error handling
      const cartItems = document.createElement('cart-items');
      document.body.appendChild(cartItems);
    }

    function floatLabels(container) {
      const floats = container.querySelectorAll('.form-field');
      floats.forEach((element) => {
        const label = element.querySelector('label');
        const input = element.querySelector('input, textarea');
        if (label && input) {
          input.addEventListener('keyup', (event) => {
            if (event.target.value !== '') {
              label.classList.add('label--float');
            } else {
              label.classList.remove('label--float');
            }
          });
          if (input.value && input.value.length) {
            label.classList.add('label--float');
          }
        }
      });
    }

    let lastWindowWidth = window.theme.getWindowWidth();
    let lastWindowHeight = window.theme.getWindowHeight();

    function dispatch$1() {
      document.dispatchEvent(
        new CustomEvent('theme:resize', {
          bubbles: true,
        })
      );

      if (lastWindowWidth !== window.theme.getWindowWidth()) {
        document.dispatchEvent(
          new CustomEvent('theme:resize:width', {
            bubbles: true,
          })
        );

        lastWindowWidth = window.theme.getWindowWidth();
      }

      if (lastWindowHeight !== window.theme.getWindowHeight()) {
        document.dispatchEvent(
          new CustomEvent('theme:resize:height', {
            bubbles: true,
          })
        );

        lastWindowHeight = window.theme.getWindowHeight();
      }
    }

    function resizeListener() {
      window.addEventListener(
        'resize',
        window.theme.debounce(function () {
          dispatch$1();
        }, 50)
      );
    }

    let prev = window.scrollY;
    let up = null;
    let down = null;
    let wasUp = null;
    let wasDown = null;
    let scrollLockTimer = 0;

    function dispatch() {
      const position = window.scrollY;
      if (position > prev) {
        down = true;
        up = false;
      } else if (position < prev) {
        down = false;
        up = true;
      } else {
        up = null;
        down = null;
      }
      prev = position;
      document.dispatchEvent(
        new CustomEvent('theme:scroll', {
          detail: {
            up,
            down,
            position,
          },
          bubbles: false,
        })
      );
      if (up && !wasUp) {
        document.dispatchEvent(
          new CustomEvent('theme:scroll:up', {
            detail: {position},
            bubbles: false,
          })
        );
      }
      if (down && !wasDown) {
        document.dispatchEvent(
          new CustomEvent('theme:scroll:down', {
            detail: {position},
            bubbles: false,
          })
        );
      }
      wasDown = down;
      wasUp = up;
    }

    function lock(e) {
      // Prevent body scroll lock race conditions
      setTimeout(() => {
        if (scrollLockTimer) {
          clearTimeout(scrollLockTimer);
        }

        scrollLock.disablePageScroll(e.detail, {
          allowTouchMove: (el) => el.tagName === 'TEXTAREA',
        });

        document.documentElement.setAttribute('data-scroll-locked', '');
      });
    }

    function unlock(e) {
      const timeout = e.detail;

      if (timeout) {
        scrollLockTimer = setTimeout(removeScrollLock, timeout);
      } else {
        removeScrollLock();
      }
    }

    function removeScrollLock() {
      scrollLock.clearQueueScrollLocks();
      scrollLock.enablePageScroll();
      document.documentElement.removeAttribute('data-scroll-locked');
    }

    function scrollListener() {
      let timeout;
      window.addEventListener(
        'scroll',
        function () {
          if (timeout) {
            window.cancelAnimationFrame(timeout);
          }
          timeout = window.requestAnimationFrame(function () {
            dispatch();
          });
        },
        {passive: true}
      );

      window.addEventListener('theme:scroll:lock', lock);
      window.addEventListener('theme:scroll:unlock', unlock);
    }

    const wrap = (toWrap, wrapperClass = '', wrapperOption) => {
      const wrapper = wrapperOption || document.createElement('div');
      wrapper.classList.add(wrapperClass);
      toWrap.parentNode.insertBefore(wrapper, toWrap);
      return wrapper.appendChild(toWrap);
    };

    function wrapElements(container) {
      // Target tables to make them scrollable
      const tableSelectors = '.rte table';
      const tables = container.querySelectorAll(tableSelectors);
      tables.forEach((table) => {
        wrap(table, 'rte__table-wrapper');
        table.setAttribute('data-scroll-lock-scrollable', '');
      });

      // Target iframes to make them responsive
      const iframeSelectors = '.rte iframe[src*="youtube.com/embed"], .rte iframe[src*="player.vimeo"], .rte iframe#admin_bar_iframe';
      const frames = container.querySelectorAll(iframeSelectors);
      frames.forEach((frame) => {
        wrap(frame, 'rte__video-wrapper');
      });
    }

    function isTouchDevice() {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }

    function isTouch() {
      if (isTouchDevice()) {
        document.documentElement.className = document.documentElement.className.replace('no-touch', 'supports-touch');
        window.theme.touch = true;
      } else {
        window.theme.touch = false;
      }
    }

    function ariaToggle(container) {
      const toggleButtons = container.querySelectorAll('[data-aria-toggle]');
      if (toggleButtons.length) {
        toggleButtons.forEach((element) => {
          element.addEventListener('click', function (event) {
            event.preventDefault();
            const currentTarget = event.currentTarget;
            currentTarget.setAttribute('aria-expanded', currentTarget.getAttribute('aria-expanded') == 'false' ? 'true' : 'false');
            const toggleID = currentTarget.getAttribute('aria-controls');
            const toggleElement = document.querySelector(`#${toggleID}`);
            const removeExpandingClass = () => {
              toggleElement.classList.remove('expanding');
              toggleElement.removeEventListener('transitionend', removeExpandingClass);
            };
            const addExpandingClass = () => {
              toggleElement.classList.add('expanding');
              toggleElement.removeEventListener('transitionstart', addExpandingClass);
            };

            toggleElement.addEventListener('transitionstart', addExpandingClass);
            toggleElement.addEventListener('transitionend', removeExpandingClass);

            toggleElement.classList.toggle('expanded');
          });
        });
      }
    }

    function loading() {
      document.body.classList.add('is-loaded');
    }

    const classes$q = {
      loading: 'is-loading',
    };

    const selectors$v = {
      img: 'img.is-loading',
    };

    /*
      Catch images loaded events and add class "is-loaded" to them and their containers
    */
    function loadedImagesEventHook() {
      document.addEventListener(
        'load',
        (e) => {
          if (e.target.tagName.toLowerCase() == 'img' && e.target.classList.contains(classes$q.loading)) {
            e.target.classList.remove(classes$q.loading);
            e.target.parentNode.classList.remove(classes$q.loading);

            if (e.target.parentNode.parentNode.classList.contains(classes$q.loading)) {
              e.target.parentNode.parentNode.classList.remove(classes$q.loading);
            }
          }
        },
        true
      );
    }

    /*
      Remove "is-loading" class to the loaded images and their containers
    */
    function removeLoadingClassFromLoadedImages(container) {
      container.querySelectorAll(selectors$v.img).forEach((img) => {
        if (img.complete) {
          img.classList.remove(classes$q.loading);
          img.parentNode.classList.remove(classes$q.loading);

          if (img.parentNode.parentNode.classList.contains(classes$q.loading)) {
            img.parentNode.parentNode.classList.remove(classes$q.loading);
          }
        }
      });
    }

    const selectors$u = {
      aos: '[data-aos]:not(.aos-animate)',
      aosAnchor: '[data-aos-anchor]',
      aosIndividual: '[data-aos]:not([data-aos-anchor]):not(.aos-animate)',
    };

    const classes$p = {
      aosAnimate: 'aos-animate',
    };

    const observerConfig = {
      attributes: false,
      childList: true,
      subtree: true,
    };

    let anchorContainers = [];

    const mutationCallback = (mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          const element = mutation.target;
          const elementsToAnimate = element.querySelectorAll(selectors$u.aos);
          const anchors = element.querySelectorAll(selectors$u.aosAnchor);

          if (elementsToAnimate.length) {
            elementsToAnimate.forEach((element) => {
              aosItemObserver.observe(element);
            });
          }

          if (anchors.length) {
            // Get all anchors and attach observers
            initAnchorObservers(anchors);
          }
        }
      }
    };

    /*
      Observe each element that needs to be animated
    */
    const aosItemObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(classes$p.aosAnimate);

            // Stop observing element after it was animated
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    /*
      Observe anchor elements
    */
    const aosAnchorObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio) {
            const elementsToAnimate = entry.target.querySelectorAll(selectors$u.aos);

            if (elementsToAnimate.length) {
              elementsToAnimate.forEach((item) => {
                item.classList.add(classes$p.aosAnimate);
              });
            }

            // Stop observing anchor element after inner elements were animated
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: [0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    /*
      Watch for mutations in the body and start observing the newly added animated elements and anchors
    */
    function bodyMutationObserver() {
      const bodyObserver = new MutationObserver(mutationCallback);
      bodyObserver.observe(document.body, observerConfig);
    }

    /*
      Observe animated elements that have attribute [data-aos]
    */
    function elementsIntersectionObserver() {
      const elementsToAnimate = document.querySelectorAll(selectors$u.aosIndividual);

      if (elementsToAnimate.length) {
        elementsToAnimate.forEach((element) => {
          aosItemObserver.observe(element);
        });
      }
    }

    /*
      Observe animated elements that have attribute [data-aos]
    */
    function anchorsIntersectionObserver() {
      const anchors = document.querySelectorAll(selectors$u.aosAnchor);

      if (anchors.length) {
        // Get all anchors and attach observers
        initAnchorObservers(anchors);
      }
    }

    function initAnchorObservers(anchors) {
      if (!anchors.length) return;

      anchors.forEach((anchor) => {
        const containerId = anchor.dataset.aosAnchor;

        // Avoid adding multiple observers to the same element
        if (containerId && anchorContainers.indexOf(containerId) === -1) {
          const container = document.querySelector(containerId);

          if (container) {
            aosAnchorObserver.observe(container);
            anchorContainers.push(containerId);
          }
        }
      });
    }

    function initAnimations() {
      elementsIntersectionObserver();
      anchorsIntersectionObserver();
      bodyMutationObserver();

      // Remove unloaded section from the anchors array on section:unload event
      document.addEventListener('shopify:section:unload', (e) => {
        const sectionId = '#' + e.target.querySelector('[data-section-id]')?.id;
        const sectionIndex = anchorContainers.indexOf(sectionId);

        if (sectionIndex !== -1) {
          anchorContainers.splice(sectionIndex, 1);
        }
      });
    }

    // Safari requestIdleCallback polyfill
    window.requestIdleCallback =
      window.requestIdleCallback ||
      function (cb) {
        var start = Date.now();
        return setTimeout(function () {
          cb({
            didTimeout: false,
            timeRemaining: function () {
              return Math.max(0, 50 - (Date.now() - start));
            },
          });
        }, 1);
      };
    window.cancelIdleCallback =
      window.cancelIdleCallback ||
      function (id) {
        clearTimeout(id);
      };

    if (window.theme.settings.enableAnimations) {
      initAnimations();
    }

    resizeListener();
    scrollListener();
    isTouch();
    loadedImagesEventHook();

    window.addEventListener('DOMContentLoaded', () => {
      ariaToggle(document);
      floatLabels(document);
      wrapElements(document);
      removeLoadingClassFromLoadedImages(document);
      loading();
      appendCartItems();

      requestIdleCallback(() => {
        if (Shopify.visualPreviewMode) {
          document.documentElement.classList.add('preview-mode');
        }
      });
    });

    document.addEventListener('shopify:section:load', (e) => {
      const container = e.target;
      floatLabels(container);
      wrapElements(container);
      ariaToggle(document);
    });

    const classes$o = {
      focus: 'is-focused',
    };

    const selectors$t = {
      inPageLink: '[data-skip-content]',
      linkesWithOnlyHash: 'a[href="#"]',
    };

    class Accessibility {
      constructor() {
        this.init();
      }

      init() {
        this.a11y = window.theme.a11y;

        // DOM Elements
        this.html = document.documentElement;
        this.body = document.body;
        this.inPageLink = document.querySelector(selectors$t.inPageLink);
        this.linkesWithOnlyHash = document.querySelectorAll(selectors$t.linkesWithOnlyHash);

        // A11Y init methods
        this.a11y.focusHash();
        this.a11y.bindInPageLinks();

        // Events
        this.clickEvents();
        this.focusEvents();
      }

      /**
       * Clicked events accessibility
       *
       * @return  {Void}
       */

      clickEvents() {
        if (this.inPageLink) {
          this.inPageLink.addEventListener('click', (event) => {
            event.preventDefault();
          });
        }

        if (this.linkesWithOnlyHash) {
          this.linkesWithOnlyHash.forEach((item) => {
            item.addEventListener('click', (event) => {
              event.preventDefault();
            });
          });
        }
      }

      /**
       * Focus events
       *
       * @return  {Void}
       */

      focusEvents() {
        document.addEventListener('mousedown', () => {
          this.body.classList.remove(classes$o.focus);
        });

        document.addEventListener('keyup', (event) => {
          if (event.code !== 'Tab') {
            return;
          }

          this.body.classList.add(classes$o.focus);
        });
      }
    }

    window.a11y = new Accessibility();

    /*
      Trigger event after animation completes
    */
    window.theme.waitForAnimationEnd = function (element) {
      return new Promise((resolve) => {
        function onAnimationEnd(event) {
          if (event.target != element) return;

          element.removeEventListener('animationend', onAnimationEnd);
          resolve();
        }

        element?.addEventListener('animationend', onAnimationEnd);
      });
    };

    /*
      Trigger event after all animations complete in a specific section
    */
    window.theme.waitForAllAnimationsEnd = function (section) {
      return new Promise((resolve, rejected) => {
        const animatedElements = section.querySelectorAll('[data-aos]');
        let animationCount = 0;

        function onAnimationEnd(event) {
          animationCount++;

          if (animationCount === animatedElements.length) {
            // All animations have ended
            resolve();
          }

          event.target.removeEventListener('animationend', onAnimationEnd);
        }

        animatedElements.forEach((element) => {
          element.addEventListener('animationend', onAnimationEnd);
        });

        if (!animationCount) rejected();
      });
    };

    function FetchError(object) {
      this.status = object.status || null;
      this.headers = object.headers || null;
      this.json = object.json || null;
      this.body = object.body || null;
    }
    FetchError.prototype = Error.prototype;

    const classes$n = {
      animated: 'is-animated',
      active: 'is-active',
      added: 'is-added',
      disabled: 'is-disabled',
      empty: 'is-empty',
      error: 'has-error',
      headerStuck: 'js__header__stuck',
      hidden: 'is-hidden',
      hiding: 'is-hiding',
      loading: 'is-loading',
      open: 'is-open',
      removed: 'is-removed',
      success: 'is-success',
      visible: 'is-visible',
      expanded: 'is-expanded',
      updated: 'is-updated',
      variantSoldOut: 'variant--soldout',
      variantUnavailable: 'variant--unavailable',
    };

    const selectors$s = {
      apiContent: '[data-api-content]',
      apiLineItems: '[data-api-line-items]',
      apiUpsellItems: '[data-api-upsell-items]',
      apiCartPrice: '[data-api-cart-price]',
      animation: '[data-animation]',
      additionalCheckoutButtons: '.additional-checkout-buttons',
      buttonSkipUpsellProduct: '[data-skip-upsell-product]',
      cartBarAdd: '[data-add-to-cart-bar]',
      cartCloseError: '[data-cart-error-close]',
      cartDrawer: 'cart-drawer',
      cartDrawerClose: '[data-cart-drawer-close]',
      cartEmpty: '[data-cart-empty]',
      cartErrors: '[data-cart-errors]',
      cartItemRemove: '[data-item-remove]',
      cartPage: '[data-cart-page]',
      cartForm: '[data-cart-form]',
      cartTermsCheckbox: '[data-cart-acceptance-checkbox]',
      cartCheckoutButtonWrapper: '[data-cart-checkout-buttons]',
      cartCheckoutButton: '[data-cart-checkout-button]',
      cartTotal: '[data-cart-total]',
      checkoutButtons: '[data-checkout-buttons]',
      errorMessage: '[data-error-message]',
      formCloseError: '[data-close-error]',
      formErrorsContainer: '[data-cart-errors-container]',
      formWrapper: '[data-form-wrapper]',
      freeShipping: '[data-free-shipping]',
      freeShippingGraph: '[data-progress-graph]',
      freeShippingProgress: '[data-progress-bar]',
      headerWrapper: '[data-header-wrapper]',
      item: '[data-item]',
      itemsHolder: '[data-items-holder]',
      leftToSpend: '[data-left-to-spend]',
      navDrawer: '[data-drawer]',
      outerSection: '[data-section-id]',
      priceHolder: '[data-cart-price-holder]',
      quickAddHolder: '[data-quick-add-holder]',
      quickAddModal: '[data-quick-add-modal]',
      qtyInput: 'input[name="updates[]"]',
      upsellProductsHolder: '[data-upsell-products]',
      upsellWidget: '[data-upsell-widget]',
      termsErrorMessage: '[data-terms-error-message]',
      collapsibleBody: '[data-collapsible-body]',
      noscript: 'noscript',
    };

    const attributes$i = {
      cartTotal: 'data-cart-total',
      disabled: 'disabled',
      freeShipping: 'data-free-shipping',
      freeShippingLimit: 'data-free-shipping-limit',
      item: 'data-item',
      itemIndex: 'data-item-index',
      itemTitle: 'data-item-title',
      open: 'open',
      quickAddHolder: 'data-quick-add-holder',
      quickAddVariant: 'data-quick-add-variant',
      scrollLocked: 'data-scroll-locked',
      upsellAutoOpen: 'data-upsell-auto-open',
      name: 'name',
    };

    class CartItems extends HTMLElement {
      constructor() {
        super();

        this.a11y = window.theme.a11y;
      }

      connectedCallback() {
        // DOM Elements
        this.cartPage = document.querySelector(selectors$s.cartPage);
        this.cartForm = document.querySelector(selectors$s.cartForm);
        this.cartDrawer = document.querySelector(selectors$s.cartDrawer);
        this.cartEmpty = document.querySelector(selectors$s.cartEmpty);
        this.cartTermsCheckbox = document.querySelector(selectors$s.cartTermsCheckbox);
        this.cartCheckoutButtonWrapper = document.querySelector(selectors$s.cartCheckoutButtonWrapper);
        this.cartCheckoutButton = document.querySelector(selectors$s.cartCheckoutButton);
        this.checkoutButtons = document.querySelector(selectors$s.checkoutButtons);
        this.itemsHolder = document.querySelector(selectors$s.itemsHolder);
        this.priceHolder = document.querySelector(selectors$s.priceHolder);
        this.items = document.querySelectorAll(selectors$s.item);
        this.cartTotal = document.querySelector(selectors$s.cartTotal);
        this.freeShipping = document.querySelectorAll(selectors$s.freeShipping);
        this.cartErrorHolder = document.querySelector(selectors$s.cartErrors);
        this.cartCloseErrorMessage = document.querySelector(selectors$s.cartCloseError);
        this.headerWrapper = document.querySelector(selectors$s.headerWrapper);
        this.navDrawer = document.querySelector(selectors$s.navDrawer);
        this.upsellProductsHolder = document.querySelector(selectors$s.upsellProductsHolder);
        this.subtotal = window.theme.subtotal;

        // Define Cart object depending on if we have cart drawer or cart page
        this.cart = this.cartDrawer || this.cartPage;

        // Cart events
        this.animateItems = this.animateItems.bind(this);
        this.addToCart = this.addToCart.bind(this);
        this.cartAddEvent = this.cartAddEvent.bind(this);
        this.updateProgress = this.updateProgress.bind(this);
        this.onCartDrawerClose = this.onCartDrawerClose.bind(this);

        // Set global event listeners for "Add to cart" and Announcement bar wheel progress
        document.addEventListener('theme:cart:add', this.cartAddEvent);
        document.addEventListener('theme:announcement:init', this.updateProgress);

        if (theme.settings.cartType == 'drawer') {
          document.addEventListener('theme:cart-drawer:open', this.animateItems);
          document.addEventListener('theme:cart-drawer:close', this.onCartDrawerClose);
        }

        // Upsell products
        this.skipUpsellProductsArray = [];
        this.skipUpsellProductEvent();
        this.checkSkippedUpsellProductsFromStorage();
        this.toggleCartUpsellWidgetVisibility();

        // Free Shipping values
        this.circumference = 28 * Math.PI; // radius - stroke * 4 * PI
        this.freeShippingLimit = this.freeShipping.length ? Number(this.freeShipping[0].getAttribute(attributes$i.freeShippingLimit)) * 100 * window.Shopify.currency.rate : 0;

        this.freeShippingMessageHandle(this.subtotal);
        this.updateProgress();

        this.build = this.build.bind(this);
        this.updateCart = this.updateCart.bind(this);
        this.productAddCallback = this.productAddCallback.bind(this);
        this.formSubmitHandler = window.theme.throttle(this.formSubmitHandler.bind(this), 50);

        if (this.cartPage) {
          this.animateItems();
        }

        if (this.cart) {
          // Checking
          this.hasItemsInCart = this.hasItemsInCart.bind(this);
          this.cartCount = this.getCartItemCount();
        }

        // Set classes
        this.toggleClassesOnContainers = this.toggleClassesOnContainers.bind(this);

        // Flags
        this.totalItems = this.items.length;

        this.cartUpdateFailed = false;

        // Cart Events
        this.cartEvents();
        this.cartRemoveEvents();
        this.cartUpdateEvents();

        document.addEventListener('theme:product:add', this.productAddCallback);
        document.addEventListener('theme:product:add-error', this.productAddCallback);
        document.addEventListener('theme:cart:refresh', this.getCart.bind(this));
      }

      disconnectedCallback() {
        document.removeEventListener('theme:cart:add', this.cartAddEvent);
        document.removeEventListener('theme:cart:refresh', this.cartAddEvent);
        document.removeEventListener('theme:announcement:init', this.updateProgress);
        document.removeEventListener('theme:product:add', this.productAddCallback);
        document.removeEventListener('theme:product:add-error', this.productAddCallback);

        if (document.documentElement.hasAttribute(attributes$i.scrollLocked)) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }
      }

      onCartDrawerClose() {
        this.resetAnimatedItems();

        if (this.cartDrawer?.classList.contains(classes$n.open)) {
          this.cart.classList.remove(classes$n.updated);
        }

        this.cartEmpty.classList.remove(classes$n.updated);
        this.cartErrorHolder.classList.remove(classes$n.expanded);
        this.cart.querySelectorAll(selectors$s.animation).forEach((item) => {
          const removeHidingClass = () => {
            item.classList.remove(classes$n.hiding);
            item.removeEventListener('animationend', removeHidingClass);
          };

          item.classList.add(classes$n.hiding);
          item.addEventListener('animationend', removeHidingClass);
        });
      }

      /**
       * Cart update event hook
       *
       * @return  {Void}
       */

      cartUpdateEvents() {
        this.items = document.querySelectorAll(selectors$s.item);

        this.items.forEach((item) => {
          item.addEventListener('theme:cart:update', (event) => {
            this.updateCart(
              {
                id: event.detail.id,
                quantity: event.detail.quantity,
              },
              item
            );
          });
        });
      }

      /**
       * Cart events
       *
       * @return  {Void}
       */

      cartRemoveEvents() {
        const cartItemRemove = document.querySelectorAll(selectors$s.cartItemRemove);

        cartItemRemove.forEach((button) => {
          const item = button.closest(selectors$s.item);
          button.addEventListener('click', (event) => {
            event.preventDefault();

            if (button.classList.contains(classes$n.disabled)) return;

            this.updateCart(
              {
                id: button.dataset.id,
                quantity: 0,
              },
              item
            );
          });
        });

        if (this.cartCloseErrorMessage) {
          this.cartCloseErrorMessage.addEventListener('click', (event) => {
            event.preventDefault();

            this.cartErrorHolder.classList.remove(classes$n.expanded);
          });
        }
      }

      /**
       * Cart event add product to cart
       *
       * @return  {Void}
       */

      cartAddEvent(event) {
        let formData = '';
        let button = event.detail.button;

        if (button.hasAttribute('disabled')) return;
        const form = button.closest('form');
        // Validate form
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        formData = new FormData(form);

        const hasInputsInNoScript = [...form.elements].some((el) => el.closest(selectors$s.noscript));
        if (hasInputsInNoScript) {
          formData = this.handleFormDataDuplicates([...form.elements], formData);
        }

        if (form !== null && form.querySelector('[type="file"]')) {
          return;
        }
        if (theme.settings.cartType === 'drawer' && this.cartDrawer) {
          event.preventDefault();
        }
        this.addToCart(formData, button);
      }

      /**
       * Modify the `formData` object in case there are key/value pairs with an overlapping `key`
       *  - the presence of form input fields inside a `noscript` tag leads to a duplicate `key`, which overwrites the existing `value` when the `FormData` is constructed
       *  - such key/value pairs discrepancies occur in the Theme editor, when any setting is updated, and right before one presses the "Save" button
       *
       * @param   {Array}  A list of all `HTMLFormElement.elements` DOM nodes
       * @param   {Object}  `FormData` object, created with the `FormData()` constructor
       *
       * @return  {Object} Updated `FormData` object that does not contain any duplicate keys
       */
      handleFormDataDuplicates(elements, formData) {
        if (!elements.length || typeof formData !== 'object') return formData;

        elements.forEach((element) => {
          if (element.closest(selectors$s.noscript)) {
            const key = element.getAttribute(attributes$i.name);
            const value = element.value;

            if (key) {
              const values = formData.getAll(key);
              if (values.length > 1) values.splice(values.indexOf(value), 1);

              formData.delete(key);
              formData.set(key, values[0]);
            }
          }
        });

        return formData;
      }

      /**
       * Cart events
       *
       * @return  {Void}
       */

      cartEvents() {
        if (this.cartTermsCheckbox) {
          this.cartTermsCheckbox.removeEventListener('change', this.formSubmitHandler);
          this.cartCheckoutButtonWrapper.removeEventListener('click', this.formSubmitHandler);
          this.cartForm.removeEventListener('submit', this.formSubmitHandler);

          this.cartTermsCheckbox.addEventListener('change', this.formSubmitHandler);
          this.cartCheckoutButtonWrapper.addEventListener('click', this.formSubmitHandler);
          this.cartForm.addEventListener('submit', this.formSubmitHandler);
        }
      }

      formSubmitHandler() {
        const termsAccepted = document.querySelector(selectors$s.cartTermsCheckbox).checked;
        const termsError = document.querySelector(selectors$s.termsErrorMessage);

        // Disable form submit if terms and conditions are not accepted
        if (!termsAccepted) {
          if (document.querySelector(selectors$s.termsErrorMessage).length > 0) {
            return;
          }

          termsError.innerText = theme.strings.cartAcceptanceError;
          this.cartCheckoutButton.setAttribute(attributes$i.disabled, true);
          termsError.classList.add(classes$n.expanded);
        } else {
          termsError.classList.remove(classes$n.expanded);
          this.cartCheckoutButton.removeAttribute(attributes$i.disabled);
        }
      }

      /**
       * Cart event remove out of stock error
       *
       * @return  {Void}
       */

      formErrorsEvents(errorContainer) {
        const buttonErrorClose = errorContainer.querySelector(selectors$s.formCloseError);
        buttonErrorClose?.addEventListener('click', (e) => {
          e.preventDefault();

          if (errorContainer) {
            errorContainer.classList.remove(classes$n.visible);
          }
        });
      }

      /**
       * Get response from the cart
       *
       * @return  {Void}
       */

      getCart() {
        fetch(theme.routes.cart_url + '?section_id=api-cart-items')
          .then(this.cartErrorsHandler)
          .then((response) => response.text())
          .then((response) => {
            const element = document.createElement('div');
            element.innerHTML = response;

            const cleanResponse = element.querySelector(selectors$s.apiContent);
            this.build(cleanResponse);
          })
          .catch((error) => console.log(error));
      }

      /**
       * Add item(s) to the cart and show the added item(s)
       *
       * @param   {String}  formData
       * @param   {DOM Element}  button
       *
       * @return  {Void}
       */

      addToCart(formData, button) {
        if (this.cart) {
          this.cart.classList.add(classes$n.loading);
        }

        const quickAddHolder = button?.closest(selectors$s.quickAddHolder);

        if (button) {
          button.classList.add(classes$n.loading);
          button.disabled = true;
        }

        if (quickAddHolder) {
          quickAddHolder.classList.add(classes$n.visible);
        }

        fetch(theme.routes.cart_add_url, {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Accept: 'application/javascript',
          },
          body: formData,
        })
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              this.addToCartError(response, button);

              if (button) {
                button.classList.remove(classes$n.loading);
                button.disabled = false;
              }

              return;
            }

            if (this.cart) {
              if (button) {
                button.classList.remove(classes$n.loading);
                button.classList.add(classes$n.added);

                button.dispatchEvent(
                  new CustomEvent('theme:product:add', {
                    detail: {
                      response: response,
                      button: button,
                    },
                    bubbles: true,
                  })
                );
              }
              if (theme.settings.cartType === 'page') {
                window.location = theme.routes.cart_url;
              }
              this.getCart();
            } else {
              // Redirect to cart page if "Add to cart" is successful
              window.location = theme.routes.cart_url;
            }
          })
          .catch((error) => {
            this.addToCartError(error, button);
            this.enableCartButtons();
          });
      }

      /**
       * Update cart
       *
       * @param   {Object}  updateData
       *
       * @return  {Void}
       */

      updateCart(updateData = {}, currentItem = null) {
        this.cart.classList.add(classes$n.loading);

        let updatedQuantity = updateData.quantity;
        if (currentItem !== null) {
          if (updatedQuantity) {
            currentItem.classList.add(classes$n.loading);
          } else {
            currentItem.classList.add(classes$n.removed);
          }
        }
        this.disableCartButtons();

        const newItem = this.cart.querySelector(`[${attributes$i.item}="${updateData.id}"]`) || currentItem;
        const lineIndex = newItem?.hasAttribute(attributes$i.itemIndex) ? parseInt(newItem.getAttribute(attributes$i.itemIndex)) : 0;
        const itemTitle = newItem?.hasAttribute(attributes$i.itemTitle) ? newItem.getAttribute(attributes$i.itemTitle) : null;

        if (lineIndex === 0) return;

        const data = {
          line: lineIndex,
          quantity: updatedQuantity,
        };

        fetch(theme.routes.cart_change_url, {
          method: 'post',
          headers: {'Content-Type': 'application/json', Accept: 'application/json'},
          body: JSON.stringify(data),
        })
          .then((response) => {
            return response.text();
          })
          .then((state) => {
            const parsedState = JSON.parse(state);

            if (parsedState.errors) {
              this.cartUpdateFailed = true;
              this.updateErrorText(itemTitle);
              this.toggleErrorMessage();
              this.resetLineItem(currentItem);
              this.enableCartButtons();

              return;
            }

            this.getCart();
          })
          .catch((error) => {
            console.log(error);
            this.enableCartButtons();
          });
      }

      /**
       * Reset line item initial state
       *
       * @return  {Void}
       */
      resetLineItem(item) {
        const qtyInput = item.querySelector(selectors$s.qtyInput);
        const qty = qtyInput.getAttribute('value');
        qtyInput.value = qty;
        item.classList.remove(classes$n.loading);
      }

      /**
       * Disable cart buttons and inputs
       *
       * @return  {Void}
       */
      disableCartButtons() {
        const inputs = this.cart.querySelectorAll('input');
        const buttons = this.cart.querySelectorAll(`button, ${selectors$s.cartItemRemove}`);

        if (inputs.length) {
          inputs.forEach((item) => {
            item.classList.add(classes$n.disabled);
            item.blur();
            item.disabled = true;
          });
        }

        if (buttons.length) {
          buttons.forEach((item) => {
            item.setAttribute(attributes$i.disabled, true);
          });
        }
      }

      /**
       * Enable cart buttons and inputs
       *
       * @return  {Void}
       */
      enableCartButtons() {
        const inputs = this.cart.querySelectorAll('input');
        const buttons = this.cart.querySelectorAll(`button, ${selectors$s.cartItemRemove}`);

        if (inputs.length) {
          inputs.forEach((item) => {
            item.classList.remove(classes$n.disabled);
            item.disabled = false;
          });
        }

        if (buttons.length) {
          buttons.forEach((item) => {
            item.removeAttribute(attributes$i.disabled);
          });
        }

        this.cart.classList.remove(classes$n.loading);
      }

      /**
       * Update error text
       *
       * @param   {String}  itemTitle
       *
       * @return  {Void}
       */

      updateErrorText(itemTitle) {
        this.cartErrorHolder.querySelector(selectors$s.errorMessage).innerText = itemTitle;
      }

      /**
       * Toggle error message
       *
       * @return  {Void}
       */

      toggleErrorMessage() {
        if (!this.cartErrorHolder) return;

        this.cartErrorHolder.classList.toggle(classes$n.expanded, this.cartUpdateFailed);

        // Reset cart error events flag
        this.cartUpdateFailed = false;
      }

      /**
       * Handle errors
       *
       * @param   {Object}  response
       *
       * @return  {Object}
       */

      cartErrorsHandler(response) {
        if (!response.ok) {
          return response.json().then(function (json) {
            const e = new FetchError({
              status: response.statusText,
              headers: response.headers,
              json: json,
            });
            throw e;
          });
        }
        return response;
      }

      /**
       * Add to cart error handle
       *
       * @param   {Object}  data
       * @param   {DOM Element/Null} button
       *
       * @return  {Void}
       */

      addToCartError(data, button) {
        if (button !== null) {
          const outerContainer = button.closest(selectors$s.outerSection) || button.closest(selectors$s.quickAddHolder) || button.closest(selectors$s.quickAddModal);
          let errorContainer = outerContainer?.querySelector(selectors$s.formErrorsContainer);
          const buttonUpsellHolder = button.closest(selectors$s.quickAddHolder);

          if (buttonUpsellHolder && buttonUpsellHolder.querySelector(selectors$s.formErrorsContainer)) {
            errorContainer = buttonUpsellHolder.querySelector(selectors$s.formErrorsContainer);
          }

          if (errorContainer) {
            let errorMessage = `${data.message}: ${data.description}`;

            if (data.message == data.description) {
              errorMessage = data.message;
            }

            errorContainer.innerHTML = `<div class="errors">${errorMessage}<button type="button" class="errors__close" data-close-error><svg aria-hidden="true" focusable="false" role="presentation" width="24px" height="24px" stroke-width="1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="icon icon-cancel"><path d="M6.758 17.243L12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div>`;
            errorContainer.classList.add(classes$n.visible);
            this.formErrorsEvents(errorContainer);
          }

          button.dispatchEvent(
            new CustomEvent('theme:product:add-error', {
              detail: {
                response: data,
                button: button,
              },
              bubbles: true,
            })
          );
        }

        const quickAddHolder = button?.closest(selectors$s.quickAddHolder);

        if (quickAddHolder) {
          quickAddHolder.dispatchEvent(
            new CustomEvent('theme:cart:error', {
              bubbles: true,
              detail: {
                message: data.message,
                description: data.description,
                holder: quickAddHolder,
              },
            })
          );
        }

        this.cart?.classList.remove(classes$n.loading);
      }

      /**
       * Add product to cart events
       *
       * @return  {Void}
       */
      productAddCallback(event) {
        let buttons = [];
        let quickAddHolder = null;
        const hasError = event.type == 'theme:product:add-error';
        const buttonATC = event.detail.button;
        const cartBarButtonATC = document.querySelector(selectors$s.cartBarAdd);

        buttons.push(buttonATC);
        quickAddHolder = buttonATC.closest(selectors$s.quickAddHolder);

        if (cartBarButtonATC) {
          buttons.push(cartBarButtonATC);
        }

        buttons.forEach((button) => {
          button.classList.remove(classes$n.loading);
          if (!hasError) {
            button.classList.add(classes$n.added);
          }
        });

        setTimeout(() => {
          buttons.forEach((button) => {
            button.classList.remove(classes$n.added);
            const isVariantUnavailable =
              button.closest(selectors$s.formWrapper)?.classList.contains(classes$n.variantSoldOut) || button.closest(selectors$s.formWrapper)?.classList.contains(classes$n.variantUnavailable);

            if (!isVariantUnavailable) {
              button.disabled = false;
            }
          });

          quickAddHolder?.classList.remove(classes$n.visible);
        }, 1000);
      }

      /**
       * Toggle classes on different containers and messages
       *
       * @return  {Void}
       */

      toggleClassesOnContainers() {
        const hasItemsInCart = this.hasItemsInCart();

        this.cart.classList.toggle(classes$n.empty, !hasItemsInCart);

        if (!hasItemsInCart && this.cartDrawer) {
          setTimeout(() => {
            this.a11y.trapFocus(this.cartDrawer, {
              elementToFocus: this.cartDrawer.querySelector(selectors$s.cartDrawerClose),
            });
          }, 100);
        }
      }

      /**
       * Build cart depends on results
       *
       * @param   {Object}  data
       *
       * @return  {Void}
       */

      build(data) {
        const cartItemsData = data.querySelector(selectors$s.apiLineItems);
        const upsellItemsData = data.querySelector(selectors$s.apiUpsellItems);
        const cartEmptyData = Boolean(cartItemsData === null && upsellItemsData === null);
        const priceData = data.querySelector(selectors$s.apiCartPrice);
        const cartTotal = data.querySelector(selectors$s.cartTotal);

        if (this.priceHolder && priceData) {
          this.priceHolder.innerHTML = priceData.innerHTML;
        }

        if (cartEmptyData) {
          this.itemsHolder.innerHTML = data.innerHTML;

          if (this.upsellProductsHolder) {
            this.upsellProductsHolder.innerHTML = '';
          }
        } else {
          this.itemsHolder.innerHTML = cartItemsData.innerHTML;

          if (this.upsellProductsHolder) {
            this.upsellProductsHolder.innerHTML = upsellItemsData.innerHTML;
          }

          this.skipUpsellProductEvent();
          this.checkSkippedUpsellProductsFromStorage();
          this.toggleCartUpsellWidgetVisibility();
        }

        this.newTotalItems = cartItemsData && cartItemsData.querySelectorAll(selectors$s.item).length ? cartItemsData.querySelectorAll(selectors$s.item).length : 0;
        this.subtotal = cartTotal && cartTotal.hasAttribute(attributes$i.cartTotal) ? parseInt(cartTotal.getAttribute(attributes$i.cartTotal)) : 0;
        this.cartCount = this.getCartItemCount();

        document.dispatchEvent(
          new CustomEvent('theme:cart:change', {
            bubbles: true,
            detail: {
              cartCount: this.cartCount,
            },
          })
        );

        // Update cart total price
        this.cartTotal.innerHTML = this.subtotal === 0 ? window.theme.strings.free : window.theme.formatMoney(this.subtotal, theme.moneyWithCurrencyFormat);

        if (this.totalItems !== this.newTotalItems) {
          this.totalItems = this.newTotalItems;

          this.toggleClassesOnContainers();
        }

        // Add class "is-updated" line items holder to reduce cart items animation delay via CSS variables
        if (this.cartDrawer?.classList.contains(classes$n.open)) {
          this.cart.classList.add(classes$n.updated);
        }

        // Remove cart loading class
        this.cart.classList.remove(classes$n.loading);

        // Prepare empty cart buttons for animation
        if (!this.hasItemsInCart()) {
          this.cartEmpty.querySelectorAll(selectors$s.animation).forEach((item) => {
            item.classList.remove(classes$n.animated);
          });
        }

        this.freeShippingMessageHandle(this.subtotal);
        this.cartRemoveEvents();
        this.cartUpdateEvents();
        this.toggleErrorMessage();
        this.enableCartButtons();
        this.updateProgress();
        this.animateItems();

        document.dispatchEvent(
          new CustomEvent('theme:product:added', {
            bubbles: true,
          })
        );
      }

      /**
       * Get cart item count
       *
       * @return  {Void}
       */

      getCartItemCount() {
        return Array.from(this.cart.querySelectorAll(selectors$s.qtyInput)).reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);
      }

      /**
       * Check for items in the cart
       *
       * @return  {Void}
       */

      hasItemsInCart() {
        return this.totalItems > 0;
      }

      /**
       * Show/hide free shipping message
       *
       * @param   {Number}  total
       *
       * @return  {Void}
       */

      freeShippingMessageHandle(total) {
        if (!this.freeShipping.length) return;

        this.freeShipping.forEach((message) => {
          const hasQualifiedShippingMessage = message.hasAttribute(attributes$i.freeShipping) && message.getAttribute(attributes$i.freeShipping) === 'true' && total >= 0;
          message.classList.toggle(classes$n.success, hasQualifiedShippingMessage && total >= this.freeShippingLimit);
        });
      }

      /**
       * Update progress when update cart
       *
       * @return  {Void}
       */

      updateProgress() {
        this.freeShipping = document.querySelectorAll(selectors$s.freeShipping);

        if (!this.freeShipping.length) return;

        const percentValue = isNaN(this.subtotal / this.freeShippingLimit) ? 100 : this.subtotal / this.freeShippingLimit;
        const percent = Math.min(percentValue * 100, 100);
        const dashoffset = this.circumference - ((percent / 100) * this.circumference) / 2;
        const leftToSpend = window.theme.formatMoney(this.freeShippingLimit - this.subtotal, theme.moneyFormat);

        this.freeShipping.forEach((item) => {
          const progressBar = item.querySelector(selectors$s.freeShippingProgress);
          const progressGraph = item.querySelector(selectors$s.freeShippingGraph);
          const leftToSpendMessage = item.querySelector(selectors$s.leftToSpend);

          if (leftToSpendMessage) {
            leftToSpendMessage.innerHTML = leftToSpend.replace('.00', '');
          }

          // Set progress bar value
          if (progressBar) {
            progressBar.value = percent;
          }

          // Set circle progress
          if (progressGraph) {
            progressGraph.style.setProperty('--stroke-dashoffset', `${dashoffset}`);
          }
        });
      }

      /**
       * Skip upsell product
       */
      skipUpsellProductEvent() {
        if (this.upsellProductsHolder === null) {
          return;
        }
        const skipButtons = this.upsellProductsHolder.querySelectorAll(selectors$s.buttonSkipUpsellProduct);

        if (skipButtons.length) {
          skipButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
              event.preventDefault();
              const productID = button.closest(selectors$s.quickAddHolder).getAttribute(attributes$i.quickAddHolder);

              if (!this.skipUpsellProductsArray.includes(productID)) {
                this.skipUpsellProductsArray.push(productID);
              }

              // Add skipped upsell product to session storage
              window.sessionStorage.setItem('skip_upsell_products', this.skipUpsellProductsArray);

              // Remove upsell product from cart
              this.removeUpsellProduct(productID);
              this.toggleCartUpsellWidgetVisibility();
            });
          });
        }
      }

      /**
       * Check for skipped upsell product added to session storage
       */
      checkSkippedUpsellProductsFromStorage() {
        const skippedUpsellItemsFromStorage = window.sessionStorage.getItem('skip_upsell_products');
        if (!skippedUpsellItemsFromStorage) return;

        const skippedUpsellItemsFromStorageArray = skippedUpsellItemsFromStorage.split(',');

        skippedUpsellItemsFromStorageArray.forEach((productID) => {
          if (!this.skipUpsellProductsArray.includes(productID)) {
            this.skipUpsellProductsArray.push(productID);
          }

          this.removeUpsellProduct(productID);
        });
      }

      removeUpsellProduct(productID) {
        if (!this.upsellProductsHolder) return;

        // Remove skipped upsell product from Cart
        const upsellProduct = this.upsellProductsHolder.querySelector(`[${attributes$i.quickAddHolder}="${productID}"]`);

        if (upsellProduct) {
          upsellProduct.parentNode.remove();
        }
      }

      /**
       * Show or hide cart upsell products widget visibility
       */
      toggleCartUpsellWidgetVisibility() {
        if (!this.upsellProductsHolder) return;

        // Hide upsell container if no items
        const upsellItems = this.upsellProductsHolder.querySelectorAll(selectors$s.quickAddHolder);
        const upsellWidget = this.upsellProductsHolder.closest(selectors$s.upsellWidget);

        if (!upsellWidget) return;

        upsellWidget.classList.toggle(classes$n.hidden, !upsellItems.length);

        if (upsellItems.length && !upsellWidget.hasAttribute(attributes$i.open) && upsellWidget.hasAttribute(attributes$i.upsellAutoOpen)) {
          upsellWidget.setAttribute(attributes$i.open, true);
          const upsellWidgetBody = upsellWidget.querySelector(selectors$s.collapsibleBody);

          if (upsellWidgetBody) {
            upsellWidgetBody.style.height = 'auto';
          }
        }
      }

      /**
       * Remove initially added AOS classes to allow animation on cart drawer open
       *
       * @return  {Void}
       */
      resetAnimatedItems() {
        this.cart.querySelectorAll(selectors$s.animation).forEach((item) => {
          item.classList.remove(classes$n.animated);
          item.classList.remove(classes$n.hiding);
        });
      }

      /**
       * Cart elements opening animation
       *
       * @return  {Void}
       */
      animateItems(e) {
        requestAnimationFrame(() => {
          let cart = this.cart;

          if (e && e.detail && e.detail.target) {
            cart = e.detail.target;
          }

          cart?.querySelectorAll(selectors$s.animation).forEach((item) => {
            item.classList.add(classes$n.animated);
          });
        });
      }
    }

    if (!customElements.get('cart-items')) {
      customElements.define('cart-items', CartItems);
    }

    const attributes$h = {
      count: 'data-cart-count',
      limit: 'data-limit',
    };

    class CartCount extends HTMLElement {
      constructor() {
        super();

        this.cartCount = null;
        this.limit = this.getAttribute(attributes$h.limit);
        this.onCartChangeCallback = this.onCartChange.bind(this);
      }

      connectedCallback() {
        document.addEventListener('theme:cart:change', this.onCartChangeCallback);
      }

      disconnectedCallback() {
        document.addEventListener('theme:cart:change', this.onCartChangeCallback);
      }

      onCartChange(event) {
        this.cartCount = event.detail.cartCount;
        this.update();
      }

      update() {
        if (this.cartCount !== null) {
          this.setAttribute(attributes$h.count, this.cartCount);
          let countValue = this.cartCount;

          if (this.limit && this.cartCount >= this.limit) {
            countValue = '9+';
          }

          this.innerText = countValue;
        }
      }
    }

    if (!customElements.get('cart-count')) {
      customElements.define('cart-count', CartCount);
    }

    const classes$m = {
      open: 'is-open',
      closing: 'is-closing',
      duplicate: 'drawer--duplicate',
      drawerEditorError: 'drawer-editor-error',
    };

    const selectors$r = {
      cartDrawer: 'cart-drawer',
      cartDrawerClose: '[data-cart-drawer-close]',
      cartDrawerSection: '[data-section-type="cart-drawer"]',
      cartDrawerInner: '[data-cart-drawer-inner]',
      shopifySection: '.shopify-section',
    };

    const attributes$g = {
      drawerUnderlay: 'data-drawer-underlay',
    };

    class CartDrawer extends HTMLElement {
      constructor() {
        super();

        this.cartDrawerIsOpen = false;

        this.cartDrawerClose = this.querySelector(selectors$r.cartDrawerClose);
        this.cartDrawerInner = this.querySelector(selectors$r.cartDrawerInner);
        this.openCartDrawer = this.openCartDrawer.bind(this);
        this.closeCartDrawer = this.closeCartDrawer.bind(this);
        this.toggleCartDrawer = this.toggleCartDrawer.bind(this);
        this.openCartDrawerOnProductAdded = this.openCartDrawerOnProductAdded.bind(this);
        this.openCartDrawerOnSelect = this.openCartDrawerOnSelect.bind(this);
        this.closeCartDrawerOnDeselect = this.closeCartDrawerOnDeselect.bind(this);
        this.cartDrawerSection = this.closest(selectors$r.shopifySection);
        this.a11y = window.theme.a11y;

        this.closeCartEvents();
      }

      connectedCallback() {
        const drawerSection = this.closest(selectors$r.shopifySection);

        /* Prevent duplicated cart drawers */
        if (window.theme.hasCartDrawer) {
          if (!window.Shopify.designMode) {
            drawerSection.remove();
            return;
          } else {
            const errorMessage = document.createElement('div');
            errorMessage.classList.add(classes$m.drawerEditorError);
            errorMessage.innerText = 'Cart drawer section already exists.';

            if (!this.querySelector(`.${classes$m.drawerEditorError}`)) {
              this.querySelector(selectors$r.cartDrawerInner).append(errorMessage);
            }

            this.classList.add(classes$m.duplicate);
          }
        }

        window.theme.hasCartDrawer = true;

        this.addEventListener('theme:cart-drawer:show', this.openCartDrawer);
        document.addEventListener('theme:cart:toggle', this.toggleCartDrawer);
        document.addEventListener('theme:quick-add:open', this.closeCartDrawer);
        document.addEventListener('theme:product:added', this.openCartDrawerOnProductAdded);
        document.addEventListener('shopify:block:select', this.openCartDrawerOnSelect);
        document.addEventListener('shopify:section:select', this.openCartDrawerOnSelect);
        document.addEventListener('shopify:section:deselect', this.closeCartDrawerOnDeselect);
      }

      disconnectedCallback() {
        document.removeEventListener('theme:product:added', this.openCartDrawerOnProductAdded);
        document.removeEventListener('theme:cart:toggle', this.toggleCartDrawer);
        document.removeEventListener('theme:quick-add:open', this.closeCartDrawer);
        document.removeEventListener('shopify:block:select', this.openCartDrawerOnSelect);
        document.removeEventListener('shopify:section:select', this.openCartDrawerOnSelect);
        document.removeEventListener('shopify:section:deselect', this.closeCartDrawerOnDeselect);

        if (document.querySelectorAll(selectors$r.cartDrawer).length <= 1) {
          window.theme.hasCartDrawer = false;
        }

        appendCartItems();
      }

      /**
       * Open cart drawer when product is added to cart
       *
       * @return  {Void}
       */
      openCartDrawerOnProductAdded() {
        if (!this.cartDrawerIsOpen) {
          this.openCartDrawer();
        }
      }

      /**
       * Open cart drawer on block or section select
       *
       * @return  {Void}
       */
      openCartDrawerOnSelect(e) {
        const cartDrawerSection = e.target.querySelector(selectors$r.shopifySection) || e.target.closest(selectors$r.shopifySection) || e.target;

        if (cartDrawerSection === this.cartDrawerSection) {
          this.openCartDrawer(true);
        }
      }

      /**
       * Close cart drawer on section deselect
       *
       * @return  {Void}
       */
      closeCartDrawerOnDeselect() {
        if (this.cartDrawerIsOpen) {
          this.closeCartDrawer();
        }
      }

      /**
       * Open cart drawer and add class on body
       *
       * @return  {Void}
       */

      openCartDrawer(forceOpen = false) {
        if (!forceOpen && this.classList.contains(classes$m.duplicate)) return;

        this.cartDrawerIsOpen = true;
        this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);
        document.body.addEventListener('click', this.onBodyClickEvent);

        document.dispatchEvent(
          new CustomEvent('theme:cart-drawer:open', {
            detail: {
              target: this,
            },
            bubbles: true,
          })
        );
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));

        this.classList.add(classes$m.open);

        // Observe Additional Checkout Buttons
        this.observeAdditionalCheckoutButtons();

        window.theme.waitForAnimationEnd(this.cartDrawerInner).then(() => {
          this.a11y.trapFocus(this, {
            elementToFocus: this.querySelector(selectors$r.cartDrawerClose),
          });
        });
      }

      /**
       * Close cart drawer and remove class on body
       *
       * @return  {Void}
       */

      closeCartDrawer() {
        if (!this.classList.contains(classes$m.open)) return;

        this.classList.add(classes$m.closing);
        this.classList.remove(classes$m.open);

        this.cartDrawerIsOpen = false;

        document.dispatchEvent(
          new CustomEvent('theme:cart-drawer:close', {
            bubbles: true,
          })
        );

        this.a11y.removeTrapFocus();
        this.a11y.autoFocusLastElement();

        document.body.removeEventListener('click', this.onBodyClickEvent);
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));

        window.theme.waitForAnimationEnd(this.cartDrawerInner).then(() => {
          this.classList.remove(classes$m.closing);
        });
      }

      /**
       * Toggle cart drawer
       *
       * @return  {Void}
       */

      toggleCartDrawer() {
        if (!this.cartDrawerIsOpen) {
          this.openCartDrawer();
        } else {
          this.closeCartDrawer();
        }
      }

      /**
       * Event click to element to close cart drawer
       *
       * @return  {Void}
       */

      closeCartEvents() {
        this.cartDrawerClose.addEventListener('click', (e) => {
          e.preventDefault();
          this.closeCartDrawer();
        });

        this.addEventListener('keyup', (e) => {
          if (e.code === 'Escape') {
            this.closeCartDrawer();
          }
        });
      }

      onBodyClick(e) {
        if (e.target.hasAttribute(attributes$g.drawerUnderlay)) this.closeCartDrawer();
      }

      observeAdditionalCheckoutButtons() {
        // identify an element to observe
        const additionalCheckoutButtons = this.querySelector(selectors$r.additionalCheckoutButtons);
        if (additionalCheckoutButtons) {
          // create a new instance of `MutationObserver` named `observer`,
          // passing it a callback function
          const observer = new MutationObserver(() => {
            this.a11y.trapFocus(this, {
              elementToFocus: this.querySelector(selectors$r.cartDrawerClose),
            });
            observer.disconnect();
          });

          // call `observe()` on that MutationObserver instance,
          // passing it the element to observe, and the options object
          observer.observe(additionalCheckoutButtons, {subtree: true, childList: true});
        }
      }
    }

    if (!customElements.get('cart-drawer')) {
      customElements.define('cart-drawer', CartDrawer);
    }

    const selectors$q = {
      collapsible: '[data-collapsible]',
      trigger: '[data-collapsible-trigger]',
      body: '[data-collapsible-body]',
      content: '[data-collapsible-content]',
    };

    const attributes$f = {
      desktop: 'desktop',
      disabled: 'disabled',
      mobile: 'mobile',
      open: 'open',
      single: 'single',
    };

    class CollapsibleElements extends HTMLElement {
      constructor() {
        super();

        this.collapsibles = this.querySelectorAll(selectors$q.collapsible);
        this.single = this.hasAttribute(attributes$f.single);
        this.toggle = this.toggle.bind(this);
      }

      connectedCallback() {
        this.toggle();
        document.addEventListener('theme:resize:width', this.toggle);

        this.collapsibles.forEach((collapsible) => {
          const trigger = collapsible.querySelector(selectors$q.trigger);
          const body = collapsible.querySelector(selectors$q.body);

          trigger?.addEventListener('click', (event) => this.onCollapsibleClick(event));

          body?.addEventListener('transitionend', (event) => {
            if (event.target !== body) return;

            if (collapsible.getAttribute(attributes$f.open) == 'true') {
              this.setBodyHeight(body, 'auto');
            }

            if (collapsible.getAttribute(attributes$f.open) == 'false') {
              collapsible.removeAttribute(attributes$f.open);
              this.setBodyHeight(body, '');
            }
          });
        });
      }

      disconnectedCallback() {
        document.removeEventListener('theme:resize:width', this.toggle);
      }

      toggle() {
        const isDesktopView = !window.theme.isMobile();

        this.collapsibles.forEach((collapsible) => {
          if (!collapsible.hasAttribute(attributes$f.desktop) && !collapsible.hasAttribute(attributes$f.mobile)) return;

          const enableDesktop = collapsible.hasAttribute(attributes$f.desktop) ? collapsible.getAttribute(attributes$f.desktop) : 'true';
          const enableMobile = collapsible.hasAttribute(attributes$f.mobile) ? collapsible.getAttribute(attributes$f.mobile) : 'true';
          const isEligible = (isDesktopView && enableDesktop == 'true') || (!isDesktopView && enableMobile == 'true');
          const body = collapsible.querySelector(selectors$q.body);

          if (isEligible) {
            collapsible.removeAttribute(attributes$f.disabled);
            collapsible.querySelector(selectors$q.trigger).removeAttribute('tabindex');
            collapsible.removeAttribute(attributes$f.open);

            this.setBodyHeight(body, '');
          } else {
            collapsible.setAttribute(attributes$f.disabled, '');
            collapsible.setAttribute('open', true);
            collapsible.querySelector(selectors$q.trigger).setAttribute('tabindex', -1);
          }
        });
      }

      open(collapsible) {
        if (collapsible.getAttribute('open') == 'true') return;

        const body = collapsible.querySelector(selectors$q.body);
        const content = collapsible.querySelector(selectors$q.content);

        collapsible.setAttribute('open', true);

        this.setBodyHeight(body, content.offsetHeight);
      }

      close(collapsible) {
        if (!collapsible.hasAttribute('open')) return;

        const body = collapsible.querySelector(selectors$q.body);
        const content = collapsible.querySelector(selectors$q.content);

        this.setBodyHeight(body, content.offsetHeight);

        collapsible.setAttribute('open', false);

        setTimeout(() => {
          requestAnimationFrame(() => {
            this.setBodyHeight(body, 0);
          });
        });
      }

      setBodyHeight(body, contentHeight) {
        body.style.height = contentHeight !== 'auto' && contentHeight !== '' ? `${contentHeight}px` : contentHeight;
      }

      onCollapsibleClick(event) {
        event.preventDefault();

        const trigger = event.target;
        const collapsible = trigger.closest(selectors$q.collapsible);

        // When we want only one item expanded at the same time
        if (this.single) {
          this.collapsibles.forEach((otherCollapsible) => {
            // if otherCollapsible has attribute open and it's not the one we clicked on, remove the open attribute
            if (otherCollapsible.hasAttribute(attributes$f.open) && otherCollapsible != collapsible) {
              requestAnimationFrame(() => {
                this.close(otherCollapsible);
              });
            }
          });
        }

        if (collapsible.hasAttribute(attributes$f.open)) {
          this.close(collapsible);
        } else {
          this.open(collapsible);
        }

        collapsible.dispatchEvent(
          new CustomEvent('theme:form:sticky', {
            bubbles: true,
            detail: {
              element: 'accordion',
            },
          })
        );
        collapsible.dispatchEvent(
          new CustomEvent('theme:collapsible:toggle', {
            bubbles: true,
          })
        );
      }
    }

    if (!customElements.get('collapsible-elements')) {
      customElements.define('collapsible-elements', CollapsibleElements);
    }

    const selectors$p = {
      deferredMediaButton: '[data-deferred-media-button]',
      media: 'video, model-viewer, iframe',
      youtube: '[data-host="youtube"]',
      vimeo: '[data-host="vimeo"]',
      template: 'template',
      video: 'video',
      productModel: 'product-model',
    };

    const attributes$e = {
      loaded: 'loaded',
      autoplay: 'autoplay',
    };

    class DeferredMedia extends HTMLElement {
      constructor() {
        super();

        const poster = this.querySelector(selectors$p.deferredMediaButton);
        poster?.addEventListener('click', this.loadContent.bind(this));
      }

      loadContent(focus = true) {
        this.pauseAllMedia();

        if (!this.getAttribute(attributes$e.loaded)) {
          const content = document.createElement('div');
          const templateContent = this.querySelector(selectors$p.template).content.firstElementChild.cloneNode(true);
          content.appendChild(templateContent);
          this.setAttribute(attributes$e.loaded, true);

          const mediaElement = this.appendChild(content.querySelector(selectors$p.media));
          if (focus) mediaElement.focus();
          if (mediaElement.nodeName == 'VIDEO' && mediaElement.getAttribute(attributes$e.autoplay)) {
            // Force autoplay on Safari browsers
            mediaElement.play();
          }
        }
      }

      pauseAllMedia() {
        document.querySelectorAll(selectors$p.youtube).forEach((video) => {
          video.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        });
        document.querySelectorAll(selectors$p.vimeo).forEach((video) => {
          video.contentWindow.postMessage('{"method":"pause"}', '*');
        });
        document.querySelectorAll(selectors$p.video).forEach((video) => video.pause());
        document.querySelectorAll(selectors$p.productModel).forEach((model) => {
          if (model.modelViewerUI) model.modelViewerUI.pause();
        });
      }
    }

    if (!customElements.get('deferred-media')) {
      customElements.define('deferred-media', DeferredMedia);
    }

    window.theme.DeferredMedia = window.theme.DeferredMedia || DeferredMedia;

    /*
      Observe whether or not elements are visible in their container.
      Used for sections with horizontal sliders built by native scrolling
    */

    const classes$l = {
      visible: 'is-visible',
    };

    class IsInView {
      constructor(container, itemSelector) {
        if (!container || !itemSelector) return;

        this.observer = null;
        this.container = container;
        this.itemSelector = itemSelector;

        this.init();
      }

      init() {
        const options = {
          root: this.container,
          threshold: [0.01, 0.5, 0.75, 0.99],
        };

        this.observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.intersectionRatio >= 0.99) {
              entry.target.classList.add(classes$l.visible);
            } else {
              entry.target.classList.remove(classes$l.visible);
            }
          });
        }, options);

        this.container.querySelectorAll(this.itemSelector)?.forEach((item) => {
          this.observer.observe(item);
        });
      }

      destroy() {
        this.observer.disconnect();
      }
    }

    const classes$k = {
      dragging: 'is-dragging',
      enabled: 'is-enabled',
      scrolling: 'is-scrolling',
      visible: 'is-visible',
    };

    const selectors$o = {
      image: 'img, svg',
      productImage: '[data-product-image]',
      slide: '[data-grid-item]',
      slider: '[data-grid-slider]',
    };

    class DraggableSlider {
      constructor(sliderElement) {
        this.slider = sliderElement;
        this.isDown = false;
        this.startX = 0;
        this.scrollLeft = 0;
        this.velX = 0;
        this.scrollAnimation = null;
        this.isScrolling = false;
        this.duration = 800; // Change this value if you want to increase or decrease the velocity

        this.scrollStep = this.scrollStep.bind(this);
        this.scrollToSlide = this.scrollToSlide.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseWheel = this.handleMouseWheel.bind(this);

        this.slider.addEventListener('mousedown', this.handleMouseDown);
        this.slider.addEventListener('mouseleave', this.handleMouseLeave);
        this.slider.addEventListener('mouseup', this.handleMouseUp);
        this.slider.addEventListener('mousemove', this.handleMouseMove);
        this.slider.addEventListener('wheel', this.handleMouseWheel, {passive: true});

        this.slider.classList.add(classes$k.enabled);
      }

      handleMouseDown(e) {
        e.preventDefault();
        this.isDown = true;
        this.startX = e.pageX - this.slider.offsetLeft;
        this.scrollLeft = this.slider.scrollLeft;
        this.cancelMomentumTracking();
      }

      handleMouseLeave() {
        if (!this.isDown) return;
        this.isDown = false;
        this.beginMomentumTracking();
      }

      handleMouseUp() {
        this.isDown = false;
        this.beginMomentumTracking();
      }

      handleMouseMove(e) {
        if (!this.isDown) return;
        e.preventDefault();

        const x = e.pageX - this.slider.offsetLeft;
        const ratio = 1; // Increase the number to make it scroll-fast
        const walk = (x - this.startX) * ratio;
        const prevScrollLeft = this.slider.scrollLeft;
        const direction = walk > 0 ? 1 : -1;

        this.slider.classList.add(classes$k.dragging, classes$k.scrolling);
        this.slider.scrollLeft = this.scrollLeft - walk;

        if (this.slider.scrollLeft !== prevScrollLeft) {
          this.velX = this.slider.scrollLeft - prevScrollLeft || direction;
        }
      }

      handleMouseWheel() {
        this.cancelMomentumTracking();
        this.slider.classList.remove(classes$k.scrolling);
      }

      beginMomentumTracking() {
        this.isScrolling = false;
        this.slider.classList.remove(classes$k.dragging);
        this.cancelMomentumTracking();
        this.scrollToSlide();
      }

      cancelMomentumTracking() {
        cancelAnimationFrame(this.scrollAnimation);
      }

      scrollToSlide() {
        if (!this.velX && !this.isScrolling) return;

        const slide = this.slider.querySelector(`${selectors$o.slide}.${classes$k.visible}`);
        if (!slide) return;

        const gap = parseInt(window.getComputedStyle(slide).marginRight) || 0;
        const slideWidth = slide.offsetWidth + gap;
        const targetPosition = slide.offsetLeft;
        const direction = this.velX > 0 ? 1 : -1;
        const slidesToScroll = Math.floor(Math.abs(this.velX) / 100) || 1;

        this.startPosition = this.slider.scrollLeft;
        this.distance = targetPosition - this.startPosition;
        this.startTime = performance.now();
        this.isScrolling = true;

        // Make sure it will move to the next slide if you don't drag far enough
        if (direction < 0 && this.velX < slideWidth) {
          this.distance -= slideWidth * slidesToScroll;
        }

        // Make sure it will move to the previous slide if you don't drag far enough
        if (direction > 0 && this.velX < slideWidth) {
          this.distance += slideWidth * slidesToScroll;
        }

        // Run scroll animation
        this.scrollAnimation = requestAnimationFrame(this.scrollStep);
      }

      scrollStep() {
        const currentTime = performance.now() - this.startTime;
        const scrollPosition = parseFloat(this.easeOutCubic(Math.min(currentTime, this.duration))).toFixed(1);

        this.slider.scrollLeft = scrollPosition;

        if (currentTime < this.duration) {
          this.scrollAnimation = requestAnimationFrame(this.scrollStep);
        } else {
          this.slider.classList.remove(classes$k.scrolling);

          // Reset velocity
          this.velX = 0;
          this.isScrolling = false;
        }
      }

      easeOutCubic(t) {
        t /= this.duration;
        t--;
        return this.distance * (t * t * t + 1) + this.startPosition;
      }

      destroy() {
        this.slider.classList.remove(classes$k.enabled);
        this.slider.removeEventListener('mousedown', this.handleMouseDown);
        this.slider.removeEventListener('mouseleave', this.handleMouseLeave);
        this.slider.removeEventListener('mouseup', this.handleMouseUp);
        this.slider.removeEventListener('mousemove', this.handleMouseMove);
        this.slider.removeEventListener('wheel', this.handleMouseWheel);
      }
    }

    const selectors$n = {
      buttonArrow: '[data-button-arrow]',
      collectionImage: '[data-collection-image]',
      columnImage: '[data-column-image]',
      productImage: '[data-product-image]',
      slide: '[data-grid-item]',
      slider: '[data-grid-slider]',
    };

    const attributes$d = {
      buttonPrev: 'data-button-prev',
      buttonNext: 'data-button-next',
      alignArrows: 'align-arrows',
    };

    const classes$j = {
      arrows: 'slider__arrows',
      visible: 'is-visible',
      scrollSnapDisabled: 'scroll-snap-disabled',
    };

    if (!customElements.get('grid-slider')) {
      customElements.define(
        'grid-slider',

        class GridSlider extends HTMLElement {
          constructor() {
            super();

            this.isInitialized = false;
            this.draggableSlider = null;
            this.positionArrows = this.positionArrows.bind(this);
            this.onButtonArrowClick = (e) => this.buttonArrowClickEvent(e);
            this.slidesObserver = null;
            this.firstLastSlidesObserver = null;
            this.isDragging = false;
            this.toggleSlider = this.toggleSlider.bind(this);
          }

          connectedCallback() {
            this.init();
            this.addEventListener('theme:grid-slider:init', this.init);
          }

          init() {
            this.slider = this.querySelector(selectors$n.slider);
            this.slides = this.querySelectorAll(selectors$n.slide);
            this.buttons = this.querySelectorAll(selectors$n.buttonArrow);
            this.slider.classList.add(classes$j.scrollSnapDisabled);
            this.toggleSlider();
            document.addEventListener('theme:resize:width', this.toggleSlider);

            window.theme
              .waitForAllAnimationsEnd(this)
              .then(() => {
                this.slider.classList.remove(classes$j.scrollSnapDisabled);
              })
              .catch(() => {
                this.slider.classList.remove(classes$j.scrollSnapDisabled);
              });
          }

          toggleSlider() {
            const sliderWidth = this.slider.clientWidth;
            const slidesWidth = this.getSlidesWidth();
            const isEnabled = sliderWidth < slidesWidth;

            if (isEnabled && (!window.theme.isMobile() || !window.theme.touch)) {
              if (this.isInitialized) return;

              this.slidesObserver = new IsInView(this.slider, selectors$n.slide);

              this.initArrows();
              this.isInitialized = true;

              // Create an instance of DraggableSlider
              this.draggableSlider = new DraggableSlider(this.slider);
            } else {
              this.destroy();
            }
          }

          initArrows() {
            // Create arrow buttons if don't exist
            if (!this.buttons.length) {
              const buttonsWrap = document.createElement('div');
              buttonsWrap.classList.add(classes$j.arrows);
              buttonsWrap.innerHTML = theme.sliderArrows.prev + theme.sliderArrows.next;

              // Append buttons outside the slider element
              this.append(buttonsWrap);
              this.buttons = this.querySelectorAll(selectors$n.buttonArrow);
              this.buttonPrev = this.querySelector(`[${attributes$d.buttonPrev}]`);
              this.buttonNext = this.querySelector(`[${attributes$d.buttonNext}]`);
            }

            this.toggleArrowsObserver();

            if (this.hasAttribute(attributes$d.alignArrows)) {
              this.positionArrows();
              this.arrowsResizeObserver();
            }

            this.buttons.forEach((buttonArrow) => {
              buttonArrow.addEventListener('click', this.onButtonArrowClick);
            });
          }

          buttonArrowClickEvent(e) {
            e.preventDefault();

            const firstVisibleSlide = this.slider.querySelector(`${selectors$n.slide}.${classes$j.visible}`);
            let slide = null;

            if (e.target.hasAttribute(attributes$d.buttonPrev)) {
              slide = firstVisibleSlide?.previousElementSibling;
            }

            if (e.target.hasAttribute(attributes$d.buttonNext)) {
              slide = firstVisibleSlide?.nextElementSibling;
            }

            this.goToSlide(slide);
          }

          removeArrows() {
            this.querySelector(`.${classes$j.arrows}`)?.remove();
          }

          // Go to prev/next slide on arrow click
          goToSlide(slide) {
            if (!slide) return;

            this.slider.scrollTo({
              top: 0,
              left: slide.offsetLeft,
              behavior: 'smooth',
            });
          }

          getSlidesWidth() {
            return this.slider.querySelector(selectors$n.slide)?.clientWidth * this.slider.querySelectorAll(selectors$n.slide).length;
          }

          toggleArrowsObserver() {
            // Add disable class/attribute on prev/next button

            if (this.buttonPrev && this.buttonNext) {
              const slidesCount = this.slides.length;
              const firstSlide = this.slides[0];
              const lastSlide = this.slides[slidesCount - 1];

              const config = {
                attributes: true,
                childList: false,
                subtree: false,
              };

              const callback = (mutationList) => {
                for (const mutation of mutationList) {
                  if (mutation.type === 'attributes') {
                    const slide = mutation.target;
                    const isDisabled = Boolean(slide.classList.contains(classes$j.visible));

                    if (slide == firstSlide) {
                      this.buttonPrev.disabled = isDisabled;
                    }

                    if (slide == lastSlide) {
                      this.buttonNext.disabled = isDisabled;
                    }
                  }
                }
              };

              if (firstSlide && lastSlide) {
                this.firstLastSlidesObserver = new MutationObserver(callback);
                this.firstLastSlidesObserver.observe(firstSlide, config);
                this.firstLastSlidesObserver.observe(lastSlide, config);
              }
            }
          }

          positionArrows() {
            const targetElement =
              this.slider.querySelector(selectors$n.productImage) || this.slider.querySelector(selectors$n.collectionImage) || this.slider.querySelector(selectors$n.columnImage) || this.slider;

            if (!targetElement) return;

            this.style.setProperty('--button-position', `${targetElement.clientHeight / 2}px`);
          }

          arrowsResizeObserver() {
            document.addEventListener('theme:resize:width', this.positionArrows);
          }

          disconnectedCallback() {
            this.destroy();
            document.removeEventListener('theme:resize:width', this.toggleSlider);
          }

          destroy() {
            this.isInitialized = false;
            this.draggableSlider?.destroy();
            this.draggableSlider = null;
            this.slidesObserver?.destroy();
            this.slidesObserver = null;
            this.removeArrows();

            document.removeEventListener('theme:resize:width', this.positionArrows);
          }
        }
      );
    }

    /*
      Observe whether or not there are open modals that require scroll lock
    */

    window.theme.hasOpenModals = function () {
      const openModals = Boolean(document.querySelectorAll('dialog[open][data-scroll-lock-required]').length);
      const openDrawers = Boolean(document.querySelectorAll('.drawer.is-open').length);

      return openModals || openDrawers;
    };

    const selectors$m = {
      cartDrawer: 'cart-drawer',
      cartToggleButton: '[data-cart-toggle]',
      deadLink: '.navlink[href="#"]',
      desktop: '[data-header-desktop]',
      firstSectionOverlayHeader: '.main-content > .shopify-section.section-overlay-header:first-of-type',
      pageHeader: '.page-header',
      preventTransparent: '[data-prevent-transparent-header]',
      style: 'data-header-style',
      widthContent: '[data-child-takes-space]',
      widthContentWrapper: '[data-takes-space-wrapper]',
      wrapper: '[data-header-wrapper]',
    };

    const classes$i = {
      clone: 'js__header__clone',
      firstSectionOverlayHeader: 'has-first-section-overlay-header',
      headerGroup: 'shopify-section-group-header-group',
      showMobileClass: 'js__show__mobile',
      sticky: 'has-header-sticky',
      stuck: 'js__header__stuck',
      transparent: 'has-header-transparent',
      headerWrapper: 'header-wrapper',
    };

    const attributes$c = {
      drawer: 'data-drawer',
      drawerToggle: 'data-drawer-toggle',
      scrollLock: 'data-scroll-locked',
      stickyHeader: 'data-header-sticky',
      transparent: 'data-header-transparent',
    };

    if (!customElements.get('header-component')) {
      customElements.define(
        'header-component',
        class HeaderComponent extends HTMLElement {
          constructor() {
            super();

            this.style = this.dataset.style;
            this.desktop = this.querySelector(selectors$m.desktop);
            this.deadLinks = document.querySelectorAll(selectors$m.deadLink);
            this.resizeObserver = null;
            this.checkWidth = this.checkWidth.bind(this);
            this.isSticky = this.hasAttribute(attributes$c.stickyHeader);

            document.body.classList.toggle(classes$i.sticky, this.isSticky);

            // Fallback for CSS :has() selectors
            let enableTransparentHeader = false;
            const firstSectionOverlayHeader = document.querySelector(selectors$m.firstSectionOverlayHeader);
            if (firstSectionOverlayHeader && !firstSectionOverlayHeader.querySelector(selectors$m.preventTransparent)) {
              enableTransparentHeader = true;
            }

            document.body.classList.toggle(classes$i.transparent, this.hasAttribute(attributes$c.transparent));
            document.body.classList.toggle(classes$i.firstSectionOverlayHeader, enableTransparentHeader);
          }

          connectedCallback() {
            this.killDeadLinks();
            this.drawerToggleEvent();
            this.cartToggleEvent();
            this.initSticky();

            if (this.style !== 'drawer' && this.desktop) {
              this.minWidth = this.getMinWidth();
              this.listenWidth();
            }
          }

          listenWidth() {
            if ('ResizeObserver' in window) {
              this.resizeObserver = new ResizeObserver(this.checkWidth);
              this.resizeObserver.observe(this);
            } else {
              document.addEventListener('theme:resize', this.checkWidth);
            }
          }

          drawerToggleEvent() {
            this.querySelectorAll(`[${attributes$c.drawerToggle}]`)?.forEach((button) => {
              button.addEventListener('click', () => {
                let drawer;
                const key = button.hasAttribute(attributes$c.drawerToggle) ? button.getAttribute(attributes$c.drawerToggle) : '';
                const desktopDrawer = document.querySelector(`[${attributes$c.drawer}="${key}"]`);
                const mobileDrawer = document.querySelector(`mobile-menu > [${attributes$c.drawer}]`);
                const isDesktopView = !window.theme.isMobile();

                if (isDesktopView) {
                  drawer = desktopDrawer;
                } else {
                  drawer = theme.settings.mobileMenuType === 'new' ? mobileDrawer || desktopDrawer : desktopDrawer;
                }

                drawer.dispatchEvent(
                  new CustomEvent('theme:drawer:toggle', {
                    bubbles: false,
                    detail: {
                      button: button,
                    },
                  })
                );
              });
            });
          }

          killDeadLinks() {
            this.deadLinks.forEach((el) => {
              el.onclick = (e) => {
                e.preventDefault();
              };
            });
          }

          checkWidth() {
            if (document.body.clientWidth < this.minWidth) {
              this.classList.add(classes$i.showMobileClass);

              // Update --header-height CSS variable when switching to a mobile nav
              const {headerHeight} = window.theme.readHeights();
              document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
            } else {
              this.classList.remove(classes$i.showMobileClass);
            }
          }

          getMinWidth() {
            const comparitor = document.createElement('div');
            comparitor.classList.add(classes$i.clone, classes$i.headerWrapper);
            comparitor.appendChild(this.querySelector('header').cloneNode(true));
            document.body.appendChild(comparitor);
            const widthWrappers = comparitor.querySelectorAll(selectors$m.widthContentWrapper);
            let minWidth = 0;
            let spaced = 0;

            widthWrappers.forEach((context) => {
              const wideElements = context.querySelectorAll(selectors$m.widthContent);
              let thisWidth = 0;
              if (wideElements.length === 3) {
                thisWidth = this._sumSplitWidths(wideElements);
              } else {
                thisWidth = this._sumWidths(wideElements);
              }
              if (thisWidth > minWidth) {
                minWidth = thisWidth;
                spaced = wideElements.length * 20;
              }
            });

            document.body.removeChild(comparitor);
            return minWidth + spaced;
          }

          cartToggleEvent() {
            if (theme.settings.cartType !== 'drawer') return;

            this.querySelectorAll(selectors$m.cartToggleButton)?.forEach((button) => {
              button.addEventListener('click', (e) => {
                const cartDrawer = document.querySelector(selectors$m.cartDrawer);

                if (cartDrawer) {
                  e.preventDefault();
                  cartDrawer.dispatchEvent(new CustomEvent('theme:cart-drawer:show'));
                  window.a11y.lastElement = button;
                }
              });
            });
          }

          toggleButtonClick(e) {
            e.preventDefault();
            document.dispatchEvent(new CustomEvent('theme:cart:toggle', {bubbles: true}));
          }

          initSticky() {
            if (!this.isSticky) return;

            this.isStuck = false;
            this.cls = this.classList;
            this.headerOffset = document.querySelector(selectors$m.pageHeader)?.offsetTop;
            this.updateHeaderOffset = this.updateHeaderOffset.bind(this);
            this.scrollEvent = (e) => this.onScroll(e);

            this.listen();
            this.stickOnLoad();
          }

          listen() {
            document.addEventListener('theme:scroll', this.scrollEvent);
            document.addEventListener('shopify:section:load', this.updateHeaderOffset);
            document.addEventListener('shopify:section:unload', this.updateHeaderOffset);
          }

          onScroll(e) {
            if (e.detail.down) {
              if (!this.isStuck && e.detail.position > this.headerOffset) {
                this.stickSimple();
              }
            } else if (e.detail.position <= this.headerOffset) {
              this.unstickSimple();
            }
          }

          updateHeaderOffset(event) {
            if (!event.target.classList.contains(classes$i.headerGroup)) return;

            // Update header offset after any "Header group" section has been changed
            setTimeout(() => {
              this.headerOffset = document.querySelector(selectors$m.pageHeader)?.offsetTop;
            });
          }

          stickOnLoad() {
            if (window.scrollY > this.headerOffset) {
              this.stickSimple();
            }
          }

          stickSimple() {
            this.cls.add(classes$i.stuck);
            this.isStuck = true;
          }

          unstickSimple() {
            if (!document.documentElement.hasAttribute(attributes$c.scrollLock)) {
              // check for scroll lock
              this.cls.remove(classes$i.stuck);
              this.isStuck = false;
            }
          }

          _sumSplitWidths(nodes) {
            let arr = [];
            nodes.forEach((el) => {
              if (el.firstElementChild) {
                arr.push(el.firstElementChild.clientWidth);
              }
            });
            if (arr[0] > arr[2]) {
              arr[2] = arr[0];
            } else {
              arr[0] = arr[2];
            }
            const width = arr.reduce((a, b) => a + b);
            return width;
          }

          _sumWidths(nodes) {
            let width = 0;
            nodes.forEach((el) => {
              width += el.clientWidth;
            });
            return width;
          }

          disconnectedCallback() {
            if ('ResizeObserver' in window) {
              this.resizeObserver?.unobserve(this);
            } else {
              document.removeEventListener('theme:resize', this.checkWidth);
            }

            if (this.isSticky) {
              document.removeEventListener('theme:scroll', this.scrollEvent);
              document.removeEventListener('shopify:section:load', this.updateHeaderOffset);
              document.removeEventListener('shopify:section:unload', this.updateHeaderOffset);
            }
          }
        }
      );
    }

    const selectors$l = {
      link: '[data-top-link]',
      wrapper: '[data-header-wrapper]',
      stagger: '[data-stagger]',
      staggerPair: '[data-stagger-first]',
      staggerAfter: '[data-stagger-second]',
      focusable: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    };

    const classes$h = {
      isVisible: 'is-visible',
      meganavVisible: 'meganav--visible',
      meganavIsTransitioning: 'meganav--is-transitioning',
    };

    if (!customElements.get('hover-disclosure')) {
      customElements.define(
        'hover-disclosure',

        class HoverDisclosure extends HTMLElement {
          constructor() {
            super();

            this.wrapper = this.closest(selectors$l.wrapper);
            this.key = this.getAttribute('aria-controls');
            this.link = this.querySelector(selectors$l.link);
            this.grandparent = this.classList.contains('grandparent');
            this.disclosure = document.getElementById(this.key);
            this.transitionTimeout = 0;
          }

          connectedCallback() {
            this.setAttribute('aria-haspopup', true);
            this.setAttribute('aria-expanded', false);
            this.setAttribute('aria-controls', this.key);

            this.connectHoverToggle();
            this.handleTablets();
            this.staggerChildAnimations();

            this.addEventListener('theme:disclosure:show', (evt) => {
              this.showDisclosure(evt);
            });
            this.addEventListener('theme:disclosure:hide', (evt) => {
              this.hideDisclosure(evt);
            });
          }

          showDisclosure(e) {
            if (e && e.type && e.type === 'mouseenter') {
              this.wrapper.classList.add(classes$h.meganavIsTransitioning);
            }

            if (this.grandparent) {
              this.wrapper.classList.add(classes$h.meganavVisible);
            } else {
              this.wrapper.classList.remove(classes$h.meganavVisible);
            }
            this.setAttribute('aria-expanded', true);
            this.classList.add(classes$h.isVisible);
            this.disclosure.classList.add(classes$h.isVisible);

            if (this.transitionTimeout) {
              clearTimeout(this.transitionTimeout);
            }

            this.transitionTimeout = setTimeout(() => {
              this.wrapper.classList.remove(classes$h.meganavIsTransitioning);
            }, 200);
          }

          hideDisclosure() {
            this.classList.remove(classes$h.isVisible);
            this.disclosure.classList.remove(classes$h.isVisible);
            this.setAttribute('aria-expanded', false);
            this.wrapper.classList.remove(classes$h.meganavVisible, classes$h.meganavIsTransitioning);
          }

          staggerChildAnimations() {
            const simple = this.querySelectorAll(selectors$l.stagger);
            let step = 50;
            simple.forEach((el, index) => {
              el.style.transitionDelay = `${index * step + 10}ms`;
              step *= 0.95;
            });

            const pairs = this.querySelectorAll(selectors$l.staggerPair);
            pairs.forEach((child, i) => {
              const d1 = i * 100;
              child.style.transitionDelay = `${d1}ms`;
              child.parentElement.querySelectorAll(selectors$l.staggerAfter).forEach((grandchild, i2) => {
                const di1 = i2 + 1;
                const d2 = di1 * 20;
                grandchild.style.transitionDelay = `${d1 + d2}ms`;
              });
            });
          }

          handleTablets() {
            // first click opens the popup, second click opens the link
            this.addEventListener(
              'touchstart',
              function (e) {
                const isOpen = this.classList.contains(classes$h.isVisible);
                if (!isOpen) {
                  e.preventDefault();
                  this.showDisclosure(e);
                }
              }.bind(this),
              {passive: true}
            );
          }

          connectHoverToggle() {
            this.addEventListener('mouseenter', (e) => this.showDisclosure(e));
            this.link.addEventListener('focus', (e) => this.showDisclosure(e));

            this.addEventListener('mouseleave', () => this.hideDisclosure());
            this.addEventListener('focusout', (e) => {
              const inMenu = this.contains(e.relatedTarget);
              if (!inMenu) {
                this.hideDisclosure();
              }
            });
            this.addEventListener('keyup', (evt) => {
              if (evt.code !== 'Escape') {
                return;
              }
              this.hideDisclosure();
            });
          }
        }
      );
    }

    const selectors$k = {
      drawerInner: '[data-drawer-inner]',
      drawerClose: '[data-drawer-close]',
      underlay: '[data-drawer-underlay]',
      stagger: '[data-stagger-animation]',
      wrapper: '[data-header-wrapper]',
      focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
    };

    const classes$g = {
      animated: 'drawer--animated',
      open: 'is-open',
      closing: 'is-closing',
      isFocused: 'is-focused',
      headerStuck: 'js__header__stuck',
    };

    if (!customElements.get('header-drawer')) {
      customElements.define(
        'header-drawer',
        class HeaderDrawer extends HTMLElement {
          constructor() {
            super();

            this.a11y = window.theme.a11y;
            this.isAnimating = false;
            this.drawer = this;
            this.drawerInner = this.querySelector(selectors$k.drawerInner);
            this.underlay = this.querySelector(selectors$k.underlay);
            this.triggerButton = null;

            this.staggers = this.querySelectorAll(selectors$k.stagger);
            this.showDrawer = this.showDrawer.bind(this);
            this.hideDrawer = this.hideDrawer.bind(this);

            this.connectDrawer();
            this.closers();
          }

          connectDrawer() {
            this.addEventListener('theme:drawer:toggle', (e) => {
              this.triggerButton = e.detail?.button;

              if (this.classList.contains(classes$g.open)) {
                this.dispatchEvent(
                  new CustomEvent('theme:drawer:close', {
                    bubbles: true,
                  })
                );
              } else {
                this.dispatchEvent(
                  new CustomEvent('theme:drawer:open', {
                    bubbles: true,
                  })
                );
              }
            });

            this.addEventListener('theme:drawer:close', this.hideDrawer);
            this.addEventListener('theme:drawer:open', this.showDrawer);

            document.addEventListener('theme:cart-drawer:open', this.hideDrawer);
          }

          closers() {
            this.querySelectorAll(selectors$k.drawerClose)?.forEach((button) => {
              button.addEventListener('click', () => {
                this.hideDrawer();
              });
            });

            document.addEventListener('keyup', (event) => {
              if (event.code !== 'Escape') {
                return;
              }

              this.hideDrawer();
            });

            this.underlay.addEventListener('click', () => {
              this.hideDrawer();
            });
          }

          showDrawer() {
            if (this.isAnimating) return;

            this.isAnimating = true;

            this.triggerButton?.setAttribute('aria-expanded', true);
            this.classList.add(classes$g.open, classes$g.animated);

            document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));

            if (this.drawerInner) {
              this.a11y.removeTrapFocus();

              window.theme.waitForAnimationEnd(this.drawerInner).then(() => {
                this.isAnimating = false;

                this.a11y.trapFocus(this.drawerInner, {
                  elementToFocus: this.querySelector(selectors$k.focusable),
                });
              });
            }
          }

          hideDrawer() {
            if (this.isAnimating || !this.classList.contains(classes$g.open)) return;

            this.isAnimating = true;

            this.classList.add(classes$g.closing);
            this.classList.remove(classes$g.open);

            this.a11y.removeTrapFocus();

            if (this.triggerButton) {
              this.triggerButton.setAttribute('aria-expanded', false);

              if (document.body.classList.contains(classes$g.isFocused)) {
                this.triggerButton.focus();
              }
            }

            document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));

            window.theme.waitForAnimationEnd(this.drawerInner).then(() => {
              this.classList.remove(classes$g.closing, classes$g.animated);

              this.isAnimating = false;

              // Reset menu items state after drawer hiding animation completes
              document.dispatchEvent(new CustomEvent('theme:sliderule:close', {bubbles: false}));
            });
          }

          disconnectedCallback() {
            document.removeEventListener('theme:cart-drawer:open', this.hideDrawer);
          }
        }
      );
    }

    const selectors$j = {
      animates: 'data-animates',
      sliderule: '[data-sliderule]',
      slideruleOpen: 'data-sliderule-open',
      slideruleClose: 'data-sliderule-close',
      sliderulePane: 'data-sliderule-pane',
      drawerContent: '[data-drawer-content]',
      focusable: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      children: `:scope > [data-animates],
             :scope > * > [data-animates],
             :scope > * > * > [data-animates],
             :scope > * > .sliderule-grid  > *`,
    };

    const classes$f = {
      isVisible: 'is-visible',
      isHiding: 'is-hiding',
      isHidden: 'is-hidden',
      focused: 'is-focused',
      scrolling: 'is-scrolling',
    };

    if (!customElements.get('mobile-sliderule')) {
      customElements.define(
        'mobile-sliderule',

        class HeaderMobileSliderule extends HTMLElement {
          constructor() {
            super();

            this.key = this.id;
            this.sliderule = this.querySelector(selectors$j.sliderule);
            const btnSelector = `[${selectors$j.slideruleOpen}='${this.key}']`;
            this.exitSelector = `[${selectors$j.slideruleClose}='${this.key}']`;
            this.trigger = this.querySelector(btnSelector);
            this.exit = document.querySelectorAll(this.exitSelector);
            this.pane = this.trigger.closest(`[${selectors$j.sliderulePane}]`);
            this.childrenElements = this.querySelectorAll(selectors$j.children);
            this.drawerContent = this.closest(selectors$j.drawerContent);
            this.cachedButton = null;
            this.a11y = window.theme.a11y;

            this.trigger.setAttribute('aria-haspopup', true);
            this.trigger.setAttribute('aria-expanded', false);
            this.trigger.setAttribute('aria-controls', this.key);
            this.closeSliderule = this.closeSliderule.bind(this);

            this.clickEvents();
            this.keyboardEvents();

            document.addEventListener('theme:sliderule:close', this.closeSliderule);
          }

          clickEvents() {
            this.trigger.addEventListener('click', () => {
              this.cachedButton = this.trigger;
              this.showSliderule();
            });
            this.exit.forEach((element) => {
              element.addEventListener('click', () => {
                this.hideSliderule();
              });
            });
          }

          keyboardEvents() {
            this.addEventListener('keyup', (evt) => {
              evt.stopPropagation();
              if (evt.code !== 'Escape') {
                return;
              }

              this.hideSliderule();
            });
          }

          trapFocusSliderule(showSliderule = true) {
            const trapFocusButton = showSliderule ? this.querySelector(this.exitSelector) : this.cachedButton;

            this.a11y.removeTrapFocus();

            if (trapFocusButton && this.drawerContent) {
              this.a11y.trapFocus(this.drawerContent, {
                elementToFocus: document.body.classList.contains(classes$f.focused) ? trapFocusButton : null,
              });
            }
          }

          hideSliderule(close = false) {
            const newPosition = parseInt(this.pane.dataset.sliderulePane, 10) - 1;
            this.pane.setAttribute(selectors$j.sliderulePane, newPosition);
            this.pane.classList.add(classes$f.isHiding);
            this.sliderule.classList.add(classes$f.isHiding);
            const hiddenSelector = close ? `[${selectors$j.animates}].${classes$f.isHidden}` : `[${selectors$j.animates}="${newPosition}"]`;
            const hiddenItems = this.pane.querySelectorAll(hiddenSelector);
            if (hiddenItems.length) {
              hiddenItems.forEach((element) => {
                element.classList.remove(classes$f.isHidden);
              });
            }

            const children = close ? this.pane.querySelectorAll(`.${classes$f.isVisible}, .${classes$f.isHiding}`) : this.childrenElements;
            children.forEach((element, index) => {
              const lastElement = children.length - 1 == index;
              element.classList.remove(classes$f.isVisible);
              if (close) {
                element.classList.remove(classes$f.isHiding);
                this.pane.classList.remove(classes$f.isHiding);
              }
              const removeHidingClass = () => {
                if (parseInt(this.pane.getAttribute(selectors$j.sliderulePane)) === newPosition) {
                  this.sliderule.classList.remove(classes$f.isVisible);
                }
                this.sliderule.classList.remove(classes$f.isHiding);
                this.pane.classList.remove(classes$f.isHiding);

                if (lastElement) {
                  this.a11y.removeTrapFocus();
                  if (!close) {
                    this.trapFocusSliderule(false);
                  }
                }

                element.removeEventListener('animationend', removeHidingClass);
              };

              if (window.theme.settings.enableAnimations) {
                element.addEventListener('animationend', removeHidingClass);
              } else {
                removeHidingClass();
              }
            });
          }

          showSliderule() {
            let lastScrollableFrame = null;
            const parent = this.closest(`.${classes$f.isVisible}`);
            let lastScrollableElement = this.pane;

            if (parent) {
              lastScrollableElement = parent;
            }

            lastScrollableElement.scrollTo({
              top: 0,
              left: 0,
              behavior: 'smooth',
            });

            lastScrollableElement.classList.add(classes$f.scrolling);

            const lastScrollableIsScrolling = () => {
              if (lastScrollableElement.scrollTop <= 0) {
                lastScrollableElement.classList.remove(classes$f.scrolling);
                if (lastScrollableFrame) {
                  cancelAnimationFrame(lastScrollableFrame);
                }
              } else {
                lastScrollableFrame = requestAnimationFrame(lastScrollableIsScrolling);
              }
            };

            lastScrollableFrame = requestAnimationFrame(lastScrollableIsScrolling);

            const oldPosition = parseInt(this.pane.dataset.sliderulePane, 10);
            const newPosition = oldPosition + 1;
            this.sliderule.classList.add(classes$f.isVisible);
            this.pane.setAttribute(selectors$j.sliderulePane, newPosition);

            const hiddenItems = this.pane.querySelectorAll(`[${selectors$j.animates}="${oldPosition}"]`);
            if (hiddenItems.length) {
              hiddenItems.forEach((element, index) => {
                const lastElement = hiddenItems.length - 1 == index;
                element.classList.add(classes$f.isHiding);
                const removeHidingClass = () => {
                  element.classList.remove(classes$f.isHiding);
                  if (parseInt(this.pane.getAttribute(selectors$j.sliderulePane)) !== oldPosition) {
                    element.classList.add(classes$f.isHidden);
                  }

                  if (lastElement) {
                    this.trapFocusSliderule();
                  }
                  element.removeEventListener('animationend', removeHidingClass);
                };

                if (window.theme.settings.enableAnimations) {
                  element.addEventListener('animationend', removeHidingClass);
                } else {
                  removeHidingClass();
                }
              });
            }
          }

          closeSliderule() {
            if (this.pane && this.pane.hasAttribute(selectors$j.sliderulePane) && parseInt(this.pane.getAttribute(selectors$j.sliderulePane)) > 0) {
              this.hideSliderule(true);
              if (parseInt(this.pane.getAttribute(selectors$j.sliderulePane)) > 0) {
                this.pane.setAttribute(selectors$j.sliderulePane, 0);
              }
            }
          }

          disconnectedCallback() {
            document.removeEventListener('theme:sliderule:close', this.closeSliderule);
          }
        }
      );
    }

    const selectors$i = {
      details: 'details',
      popdown: '[data-popdown]',
      popdownClose: '[data-popdown-close]',
      input: 'input:not([type="hidden"])',
      mobileMenu: 'mobile-menu',
    };

    const attributes$b = {
      popdownUnderlay: 'data-popdown-underlay',
      scrollLocked: 'data-scroll-locked',
    };

    const classes$e = {
      open: 'is-open',
    };
    class SearchPopdown extends HTMLElement {
      constructor() {
        super();
        this.popdown = this.querySelector(selectors$i.popdown);
        this.popdownContainer = this.querySelector(selectors$i.details);
        this.popdownClose = this.querySelector(selectors$i.popdownClose);
        this.popdownTransitionCallback = this.popdownTransitionCallback.bind(this);
        this.detailsToggleCallback = this.detailsToggleCallback.bind(this);
        this.mobileMenu = this.closest(selectors$i.mobileMenu);
        this.a11y = window.theme.a11y;
      }

      connectedCallback() {
        this.popdown.addEventListener('transitionend', this.popdownTransitionCallback);
        this.popdownContainer.addEventListener('keyup', (event) => event.code.toUpperCase() === 'ESCAPE' && this.close());
        this.popdownContainer.addEventListener('toggle', this.detailsToggleCallback);
        this.popdownClose.addEventListener('click', this.close.bind(this));
      }

      detailsToggleCallback(event) {
        if (event.target.hasAttribute('open')) {
          this.open();
        }
      }

      popdownTransitionCallback(event) {
        if (event.target !== this.popdown) return;

        if (!this.classList.contains(classes$e.open)) {
          this.popdownContainer.removeAttribute('open');
          this.a11y.removeTrapFocus();
        } else if (event.propertyName === 'transform' || event.propertyName === 'opacity') {
          // Wait for the 'transform' transition to complete in order to prevent jumping content issues because of the trapFocus
          this.a11y.trapFocus(this.popdown, {
            elementToFocus: this.popdown.querySelector(selectors$i.input),
          });
        }
      }

      onBodyClick(event) {
        if (!this.contains(event.target) || event.target.hasAttribute(attributes$b.popdownUnderlay)) this.close();
      }

      open() {
        this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);

        document.body.addEventListener('click', this.onBodyClickEvent);
        this.mobileMenu?.dispatchEvent(new CustomEvent('theme:search:open'));

        if (!document.documentElement.hasAttribute(attributes$b.scrollLocked)) {
          document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
        }

        requestAnimationFrame(() => {
          this.classList.add(classes$e.open);
        });
      }

      close() {
        this.classList.remove(classes$e.open);
        this.mobileMenu?.dispatchEvent(new CustomEvent('theme:search:close'));

        document.body.removeEventListener('click', this.onBodyClickEvent);

        if (!this.mobileMenu) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }
      }
    }

    if (!customElements.get('header-search-popdown')) {
      customElements.define('header-search-popdown', SearchPopdown);
    }

    const selectors$h = {
      inputSearch: 'input[type="search"]',
      focusedElements: '[aria-selected="true"] a',
      resetButton: 'button[type="reset"]',
    };

    const classes$d = {
      hidden: 'hidden',
    };

    class HeaderSearchForm extends HTMLElement {
      constructor() {
        super();

        this.input = this.querySelector(selectors$h.inputSearch);
        this.resetButton = this.querySelector(selectors$h.resetButton);

        if (this.input) {
          this.input.form.addEventListener('reset', this.onFormReset.bind(this));
          this.input.addEventListener(
            'input',
            window.theme
              .debounce((event) => {
                this.onChange(event);
              }, 300)
              .bind(this)
          );
        }
      }

      toggleResetButton() {
        const resetIsHidden = this.resetButton.classList.contains(classes$d.hidden);
        if (this.input.value.length > 0 && resetIsHidden) {
          this.resetButton.classList.remove(classes$d.hidden);
        } else if (this.input.value.length === 0 && !resetIsHidden) {
          this.resetButton.classList.add(classes$d.hidden);
        }
      }

      onChange() {
        this.toggleResetButton();
      }

      shouldResetForm() {
        return !document.querySelector(selectors$h.focusedElements);
      }

      onFormReset(event) {
        // Prevent default so the form reset doesn't set the value gotten from the url on page load
        event.preventDefault();
        // Don't reset if the user has selected an element on the predictive search dropdown
        if (this.shouldResetForm()) {
          this.input.value = '';
          this.toggleResetButton();
          event.target.querySelector(selectors$h.inputSearch).focus();
        }
      }
    }

    customElements.define('header-search-form', HeaderSearchForm);

    const selectors$g = {
      inputSearch: 'input[type="search"]',
    };

    class MainSearch extends HeaderSearchForm {
      constructor() {
        super();

        this.allSearchInputs = document.querySelectorAll(selectors$g.inputSearch);
        this.setupEventListeners();
      }

      setupEventListeners() {
        let allSearchForms = [];
        this.allSearchInputs.forEach((input) => allSearchForms.push(input.form));
        this.input.addEventListener('focus', this.onInputFocus.bind(this));
        if (allSearchForms.length < 2) return;
        allSearchForms.forEach((form) => form.addEventListener('reset', this.onFormReset.bind(this)));
        this.allSearchInputs.forEach((input) => input.addEventListener('input', this.onInput.bind(this)));
      }

      onFormReset(event) {
        super.onFormReset(event);
        if (super.shouldResetForm()) {
          this.keepInSync('', this.input);
        }
      }

      onInput(event) {
        const target = event.target;
        this.keepInSync(target.value, target);
      }

      onInputFocus() {
        if (window.theme.isMobile()) {
          this.scrollIntoView({behavior: 'smooth'});
        }
      }

      keepInSync(value, target) {
        this.allSearchInputs.forEach((input) => {
          if (input !== target) {
            input.value = value;
          }
        });
      }
    }

    if (!customElements.get('main-search')) {
      customElements.define('main-search', MainSearch);
    }

    const selectors$f = {
      scrollbar: '[data-scrollbar]',
      scrollbarArrowPrev: '[data-scrollbar-arrow-prev]',
      scrollbarArrowNext: '[data-scrollbar-arrow-next]',
    };

    const classes$c = {
      hidden: 'is-hidden',
    };

    const attributes$a = {
      scrollbarSlider: 'data-scrollbar-slider',
      scrollbarSlideFullWidth: 'data-scrollbar-slide-fullwidth',
    };

    if (!customElements.get('native-scrollbar')) {
      customElements.define(
        'native-scrollbar',
        class NativeScrollbar extends HTMLElement {
          constructor() {
            super();

            this.scrollbar = this.querySelector(selectors$f.scrollbar);
            this.arrowNext = this.querySelector(selectors$f.scrollbarArrowNext);
            this.arrowPrev = this.querySelector(selectors$f.scrollbarArrowPrev);
            this.toggleNextArrow = this.toggleNextArrow.bind(this);
            this.addEventListener('theme:swatches:loaded', this.toggleNextArrow);
          }

          connectedCallback() {
            document.addEventListener('theme:resize', this.toggleNextArrow);

            if (this.scrollbar.hasAttribute(attributes$a.scrollbarSlider)) {
              this.scrollToVisibleElement();
            }

            if (this.arrowNext && this.arrowPrev) {
              this.events();
            }
          }

          disconnectedCallback() {
            document.removeEventListener('theme:resize', this.toggleNextArrow);
          }

          events() {
            this.arrowNext.addEventListener('click', (event) => {
              event.preventDefault();

              this.goToNext();
            });

            this.arrowPrev.addEventListener('click', (event) => {
              event.preventDefault();

              this.goToPrev();
            });

            this.scrollbar.addEventListener('scroll', () => {
              this.togglePrevArrow();
              this.toggleNextArrow();
            });
          }

          goToNext() {
            const moveWith = this.scrollbar.hasAttribute(attributes$a.scrollbarSlideFullWidth) ? this.scrollbar.getBoundingClientRect().width : this.scrollbar.getBoundingClientRect().width / 2;
            const position = moveWith + this.scrollbar.scrollLeft;

            this.move(position);

            this.arrowPrev.classList.remove(classes$c.hidden);

            this.toggleNextArrow();
          }

          goToPrev() {
            const moveWith = this.scrollbar.hasAttribute(attributes$a.scrollbarSlideFullWidth) ? this.scrollbar.getBoundingClientRect().width : this.scrollbar.getBoundingClientRect().width / 2;
            const position = this.scrollbar.scrollLeft - moveWith;

            this.move(position);

            this.arrowNext.classList.remove(classes$c.hidden);

            this.togglePrevArrow();
          }

          toggleNextArrow() {
            requestAnimationFrame(() => {
              this.arrowNext?.classList.toggle(classes$c.hidden, Math.round(this.scrollbar.scrollLeft + this.scrollbar.getBoundingClientRect().width + 1) >= this.scrollbar.scrollWidth);
            });
          }

          togglePrevArrow() {
            requestAnimationFrame(() => {
              this.arrowPrev.classList.toggle(classes$c.hidden, this.scrollbar.scrollLeft <= 0);
            });
          }

          scrollToVisibleElement() {
            [].forEach.call(this.scrollbar.children, (element) => {
              element.addEventListener('click', (event) => {
                event.preventDefault();

                this.move(element.offsetLeft - element.clientWidth);
              });
            });
          }

          move(offsetLeft) {
            this.scrollbar.scrollTo({
              top: 0,
              left: offsetLeft,
              behavior: 'smooth',
            });
          }
        }
      );
    }

    const selectors$e = {
      popoutList: '[data-popout-list]',
      popoutToggle: '[data-popout-toggle]',
      popoutToggleText: '[data-popout-toggle-text]',
      popoutInput: '[data-popout-input]',
      popoutOptions: '[data-popout-option]',
      productGridImage: '[data-product-image]',
      productGridItem: '[data-grid-item]',
      section: '[data-section-type]',
    };

    const classes$b = {
      listVisible: 'popout-list--visible',
      visible: 'is-visible',
      active: 'is-active',
      popoutListTop: 'popout-list--top',
    };

    const attributes$9 = {
      ariaExpanded: 'aria-expanded',
      ariaCurrent: 'aria-current',
      dataValue: 'data-value',
      popoutToggleText: 'data-popout-toggle-text',
      submit: 'submit',
    };

    if (!customElements.get('popout-select')) {
      customElements.define(
        'popout-select',
        class Popout extends HTMLElement {
          constructor() {
            super();
          }

          connectedCallback() {
            this.popoutList = this.querySelector(selectors$e.popoutList);
            this.popoutToggle = this.querySelector(selectors$e.popoutToggle);
            this.popoutToggleText = this.querySelector(selectors$e.popoutToggleText);
            this.popoutInput = this.querySelector(selectors$e.popoutInput) || this.parentNode.querySelector(selectors$e.popoutInput);
            this.popoutOptions = this.querySelectorAll(selectors$e.popoutOptions);
            this.productGridItem = this.popoutList.closest(selectors$e.productGridItem);
            this.fireSubmitEvent = this.hasAttribute(attributes$9.submit);

            this.popupToggleFocusoutEvent = (evt) => this.onPopupToggleFocusout(evt);
            this.popupListFocusoutEvent = (evt) => this.onPopupListFocusout(evt);
            this.popupToggleClickEvent = (evt) => this.onPopupToggleClick(evt);
            this.keyUpEvent = (evt) => this.onKeyUp(evt);
            this.bodyClickEvent = (evt) => this.onBodyClick(evt);

            this._connectOptions();
            this._connectToggle();
            this._onFocusOut();
            this.popupListSetDimensions();
          }

          onPopupToggleClick(evt) {
            const button = evt.currentTarget;
            const ariaExpanded = button.getAttribute(attributes$9.ariaExpanded) === 'true';

            if (this.productGridItem) {
              const productGridItemImage = this.productGridItem.querySelector(selectors$e.productGridImage);

              if (productGridItemImage) {
                productGridItemImage.classList.toggle(classes$b.visible, !ariaExpanded);
              }

              this.popoutList.style.maxHeight = `${Math.abs(this.popoutToggle.getBoundingClientRect().bottom - this.productGridItem.getBoundingClientRect().bottom)}px`;
            }

            evt.currentTarget.setAttribute(attributes$9.ariaExpanded, !ariaExpanded);
            this.popoutList.classList.toggle(classes$b.listVisible);
            this.popupListSetDimensions();
            this.toggleListPosition();

            document.body.addEventListener('click', this.bodyClickEvent);
          }

          onPopupToggleFocusout(evt) {
            const popoutLostFocus = this.contains(evt.relatedTarget);

            if (!popoutLostFocus) {
              this._hideList();
            }
          }

          onPopupListFocusout(evt) {
            const childInFocus = evt.currentTarget.contains(evt.relatedTarget);
            const isVisible = this.popoutList.classList.contains(classes$b.listVisible);

            if (isVisible && !childInFocus) {
              this._hideList();
            }
          }

          toggleListPosition() {
            const button = this.querySelector(selectors$e.popoutToggle);
            const popoutTop = this.getBoundingClientRect().top + this.clientHeight;

            const removeTopClass = () => {
              if (button.getAttribute(attributes$9.ariaExpanded) !== 'true') {
                this.popoutList.classList.remove(classes$b.popoutListTop);
              }

              this.popoutList.removeEventListener('transitionend', removeTopClass);
            };

            if (button.getAttribute(attributes$9.ariaExpanded) === 'true') {
              if (window.innerHeight / 2 < popoutTop) {
                this.popoutList.classList.add(classes$b.popoutListTop);
              }
            } else {
              this.popoutList.addEventListener('transitionend', removeTopClass);
            }
          }

          popupListSetDimensions() {
            this.popoutList.style.setProperty('--max-width', '100vw');
            this.popoutList.style.setProperty('--max-height', '100vh');

            requestAnimationFrame(() => {
              this.popoutList.style.setProperty('--max-width', `${parseInt(document.body.clientWidth - this.popoutList.getBoundingClientRect().left)}px`);
              this.popoutList.style.setProperty('--max-height', `${parseInt(document.body.clientHeight - this.popoutList.getBoundingClientRect().top)}px`);
            });
          }

          popupOptionsClick(evt) {
            const link = evt.target.closest(selectors$e.popoutOptions);

            if (link.attributes.href.value === '#') {
              evt.preventDefault();

              const attrValue = evt.currentTarget.hasAttribute(attributes$9.dataValue) ? evt.currentTarget.getAttribute(attributes$9.dataValue) : '';
              this.popoutInput.value = attrValue;

              if (this.popoutInput.disabled) {
                this.popoutInput.removeAttribute('disabled');
              }

              if (this.fireSubmitEvent) {
                this._submitForm(attrValue);
              } else {
                const currentTarget = evt.currentTarget.parentElement;
                const listTargetElement = this.popoutList.querySelector(`.${classes$b.active}`);
                const targetAttribute = this.popoutList.querySelector(`[${attributes$9.ariaCurrent}]`);

                this.popoutInput.dispatchEvent(new Event('change'));

                if (listTargetElement) {
                  listTargetElement.classList.remove(classes$b.active);
                  currentTarget.classList.add(classes$b.active);
                }

                if (this.popoutInput.name == 'quantity' && !currentTarget.nextSibling) {
                  this.classList.add(classes$b.active);
                }

                if (targetAttribute && targetAttribute.hasAttribute(`${attributes$9.ariaCurrent}`)) {
                  targetAttribute.removeAttribute(`${attributes$9.ariaCurrent}`);
                  evt.currentTarget.setAttribute(`${attributes$9.ariaCurrent}`, 'true');
                }

                if (attrValue !== '') {
                  this.popoutToggleText.innerHTML = attrValue;

                  if (this.popoutToggleText.hasAttribute(attributes$9.popoutToggleText) && this.popoutToggleText.getAttribute(attributes$9.popoutToggleText) !== '') {
                    this.popoutToggleText.setAttribute(attributes$9.popoutToggleText, attrValue);
                  }
                }
                this.onPopupToggleFocusout(evt);
                this.onPopupListFocusout(evt);
              }
            }
          }

          onKeyUp(evt) {
            if (evt.code !== 'Escape') {
              return;
            }
            this._hideList();
            this.popoutToggle.focus();
          }

          onBodyClick(evt) {
            const isOption = this.contains(evt.target);
            const isVisible = this.popoutList.classList.contains(classes$b.listVisible);

            if (isVisible && !isOption) {
              this._hideList();
            }
          }

          _connectToggle() {
            this.popoutToggle.addEventListener('click', this.popupToggleClickEvent);
          }

          _connectOptions() {
            if (this.popoutOptions.length) {
              this.popoutOptions.forEach((element) => {
                element.addEventListener('click', (evt) => this.popupOptionsClick(evt));
              });
            }
          }

          _onFocusOut() {
            this.addEventListener('keyup', this.keyUpEvent);
            this.popoutToggle.addEventListener('focusout', this.popupToggleFocusoutEvent);
            this.popoutList.addEventListener('focusout', this.popupListFocusoutEvent);
          }

          _submitForm() {
            const form = this.closest('form');
            if (form) {
              form.submit();
            }
          }

          _hideList() {
            this.popoutList.classList.remove(classes$b.listVisible);
            this.popoutToggle.setAttribute(attributes$9.ariaExpanded, false);
            this.toggleListPosition();
            document.body.removeEventListener('click', this.bodyClickEvent);
          }
        }
      );
    }

    class PopupCookie {
      constructor(name, value, daysToExpire = 7) {
        const today = new Date();
        const expiresDate = new Date();
        expiresDate.setTime(today.getTime() + 3600000 * 24 * daysToExpire);

        this.config = {
          expires: expiresDate.toGMTString(), // session cookie
          path: '/',
          domain: window.location.hostname,
          sameSite: 'none',
          secure: true,
        };
        this.name = name;
        this.value = value;
      }

      write() {
        const hasCookie = document.cookie.indexOf('; ') !== -1 && !document.cookie.split('; ').find((row) => row.startsWith(this.name));

        if (hasCookie || document.cookie.indexOf('; ') === -1) {
          document.cookie = `${this.name}=${this.value}; expires=${this.config.expires}; path=${this.config.path}; domain=${this.config.domain}; sameSite=${this.config.sameSite}; secure=${this.config.secure}`;
        }
      }

      read() {
        if (document.cookie.indexOf('; ') !== -1 && document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
          const returnCookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(this.name))
            .split('=')[1];

          return returnCookie;
        } else {
          return false;
        }
      }

      destroy() {
        if (document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
          document.cookie = `${this.name}=null; expires=${this.config.expires}; path=${this.config.path}; domain=${this.config.domain}`;
        }
      }
    }

    const selectors$d = {
      open: '[data-popup-open]',
      close: '[data-popup-close]',
      dialog: 'dialog',
      focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
      newsletterForm: '[data-newsletter-form]',
      newsletterHeading: '[data-newsletter-heading]',
      newsletterField: '[data-newsletter-field]',
    };

    const attributes$8 = {
      closing: 'closing',
      delay: 'data-popup-delay',
      scrollLock: 'data-scroll-lock-required',
      cookieName: 'data-cookie-name',
      cookieValue: 'data-cookie-value',
      preventTopLayer: 'data-prevent-top-layer',
    };

    const classes$a = {
      hidden: 'hidden',
      hasValue: 'has-value',
      cartBarVisible: 'cart-bar-visible',
      isVisible: 'is-visible',
      success: 'has-success',
      mobile: 'mobile',
      desktop: 'desktop',
      bottom: 'bottom',
    };

    class PopupComponent extends HTMLElement {
      constructor() {
        super();
        this.popup = this.querySelector(selectors$d.dialog);
        this.preventTopLayer = this.popup.hasAttribute(attributes$8.preventTopLayer);
        this.enableScrollLock = this.popup.hasAttribute(attributes$8.scrollLock);
        this.buttonPopupOpen = this.querySelector(selectors$d.open);
        this.a11y = window.theme.a11y;
        this.isAnimating = false;
        this.cookie = new PopupCookie(this.popup.getAttribute(attributes$8.cookieName), this.popup.getAttribute(attributes$8.cookieValue));

        this.checkTargetReferrer();
        this.checkCookie();
        this.bindListeners();
      }

      checkTargetReferrer() {
        if (!this.popup.hasAttribute(attributes$8.referrer)) return;

        if (location.href.indexOf(this.popup.getAttribute(attributes$8.referrer)) === -1 && !window.Shopify.designMode) {
          this.popup.parentNode.removeChild(this.popup);
        }
      }

      checkCookie() {
        const cookieExists = this.cookie && this.cookie.read() !== false;

        if (!cookieExists) {
          this.showPopupEvents();

          this.popup.addEventListener('theme:popup:onclose', () => this.cookie.write());
        }
      }

      bindListeners() {
        // Open button click event
        this.buttonPopupOpen?.addEventListener('click', (e) => {
          e.preventDefault();
          this.popupOpen();
          window.theme.a11y.lastElement = this.buttonPopupOpen;
        });

        // Close button click event
        this.popup.querySelectorAll(selectors$d.close)?.forEach((closeButton) => {
          closeButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.popupClose();
          });
        });

        // Close dialog on click outside content
        this.popup.addEventListener('click', (event) => {
          if (event.target.nodeName === 'DIALOG' && event.type === 'click') {
            this.popupClose();
          }
        });

        // Close dialog on click ESC key pressed
        this.popup.addEventListener('keydown', (event) => {
          if (event.code === 'Escape') {
            event.preventDefault();
            this.popupClose();
          }
        });

        this.popup.addEventListener('close', () => this.popupCloseActions());
      }

      popupOpen() {
        this.isAnimating = true;

        // Check if browser supports Dialog tags
        if (typeof this.popup.showModal === 'function' && !this.preventTopLayer) {
          this.popup.showModal();
        } else if (typeof this.popup.show === 'function') {
          this.popup.show();
        } else {
          this.popup.setAttribute('open', '');
        }

        this.popup.removeAttribute('inert');
        this.popup.setAttribute('aria-hidden', false);
        this.popup.focus(); // Focus <dialog> tag element to prevent immediate closing on Escape keypress

        if (this.enableScrollLock) {
          document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
        }

        window.theme.waitForAnimationEnd(this.popup).then(() => {
          this.isAnimating = false;

          if (this.enableScrollLock) {
            this.a11y.trapFocus(this.popup);
          }

          const focusTarget = this.popup.querySelector('[autofocus]') || this.popup.querySelector(selectors$d.focusable);
          focusTarget?.focus();
        });
      }

      popupClose() {
        if (this.isAnimating || this.popup.hasAttribute('inert')) {
          return;
        }

        if (!this.popup.hasAttribute(attributes$8.closing)) {
          this.popup.setAttribute(attributes$8.closing, '');
          this.isAnimating = true;

          window.theme.waitForAnimationEnd(this.popup).then(() => {
            this.isAnimating = false;
            this.popupClose();
          });

          return;
        }

        // Check if browser supports Dialog tags
        if (typeof this.popup.close === 'function') {
          this.popup.close();
        } else {
          this.popup.removeAttribute('open');
          this.popup.setAttribute('aria-hidden', true);
        }

        this.popupCloseActions();
      }

      popupCloseActions() {
        if (this.popup.hasAttribute('inert')) return;

        this.popup.setAttribute('inert', '');
        this.popup.setAttribute('aria-hidden', true);
        this.popup.removeAttribute(attributes$8.closing);

        // Unlock scroll if no other popups & modals are open
        if (!window.theme.hasOpenModals() && this.enableScrollLock) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }

        this.popup.dispatchEvent(new CustomEvent('theme:popup:onclose', {bubbles: false}));

        if (this.enableScrollLock) {
          this.a11y.removeTrapFocus();
          this.a11y.autoFocusLastElement();
        }
      }

      showPopupEvents() {
        // Auto show popup if it has open attribute
        if (this.popup.hasAttribute('open') && this.popup.getAttribute('open') == true) {
          this.popupOpen();
        }

        this.delay = this.popup.hasAttribute(attributes$8.delay) ? this.popup.getAttribute(attributes$8.delay) : null;
        this.isSubmitted = window.location.href.indexOf('accepts_marketing') !== -1 || window.location.href.indexOf('customer_posted=true') !== -1;
        this.showOnScrollEvent = window.theme.throttle(this.showOnScroll.bind(this), 200);

        if (this.delay === 'always' || this.isSubmitted) {
          this.popupOpen();
        }

        if (this.delay && this.delay.includes('delayed') && !this.isSubmitted) {
          this.showDelayed();
        }

        if (this.delay === 'bottom' && !this.isSubmitted) {
          this.showOnBottomReached();
        }

        if (this.delay === 'idle' && !this.isSubmitted) {
          this.showOnIdle();
        }
      }

      showDelayed() {
        const seconds = this.delay.includes('_') ? parseInt(this.delay.split('_')[1]) : 10;

        // Show popup after specific seconds
        setTimeout(() => {
          this.popupOpen();
        }, seconds * 1000);
      }

      showOnIdle() {
        let timer = 0;
        let idleTime = 60000;
        const documentEvents = ['mousemove', 'mousedown', 'click', 'touchmove', 'touchstart', 'touchend', 'keydown', 'keypress'];
        const windowEvents = ['load', 'resize', 'scroll'];

        const startTimer = () => {
          timer = setTimeout(() => {
            timer = 0;
            this.popupOpen();
          }, idleTime);

          documentEvents.forEach((eventType) => {
            document.addEventListener(eventType, resetTimer);
          });

          windowEvents.forEach((eventType) => {
            window.addEventListener(eventType, resetTimer);
          });
        };

        const resetTimer = () => {
          if (timer) {
            clearTimeout(timer);
          }

          documentEvents.forEach((eventType) => {
            document.removeEventListener(eventType, resetTimer);
          });

          windowEvents.forEach((eventType) => {
            window.removeEventListener(eventType, resetTimer);
          });

          startTimer();
        };

        startTimer();
      }

      showOnBottomReached() {
        document.addEventListener('theme:scroll', this.showOnScrollEvent);
      }

      showOnScroll() {
        if (window.scrollY + window.innerHeight >= document.body.clientHeight) {
          this.popupOpen();
          document.removeEventListener('theme:scroll', this.showOnScrollEvent);
        }
      }

      disconnectedCallback() {
        document.removeEventListener('theme:scroll', this.showOnScrollEvent);
      }
    }

    class PopupNewsletter extends PopupComponent {
      constructor() {
        super();
        this.form = this.popup.querySelector(selectors$d.newsletterForm);
        this.heading = this.popup.querySelector(selectors$d.newsletterHeading);
        this.newsletterField = this.popup.querySelector(selectors$d.newsletterField);
      }

      connectedCallback() {
        const cookieExists = this.cookie?.read() !== false;
        const submissionSuccess = window.location.search.indexOf('?customer_posted=true') !== -1;
        const classesString = [...this.classList].toString();
        const isPositionBottom = classesString.includes(classes$a.bottom);
        const targetMobile = this.popup.classList.contains(classes$a.mobile);
        const targetDesktop = this.popup.classList.contains(classes$a.desktop);
        const isMobileView = window.theme.isMobile();

        let targetMatches = true;

        if ((targetMobile && !isMobileView) || (targetDesktop && isMobileView)) {
          targetMatches = false;
        }

        if (!targetMatches) {
          super.a11y.removeTrapFocus();
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
          return;
        }

        if (!cookieExists || window.Shopify.designMode) {
          if (!window.Shopify.designMode && !window.location.pathname.endsWith('/challenge')) {
            super.showPopupEvents();
          }

          if (this.form && this.form.classList.contains(classes$a.success)) {
            super.popupOpen();
            this.cookie.write();
          }

          this.popup.addEventListener('theme:popup:onclose', () => this.cookie.write());
        }

        if (submissionSuccess) {
          this.delay = 0;
        }

        if (!cookieExists || window.Shopify.designMode) {
          this.show();

          if (this.form.classList.contains(classes$a.success)) {
            this.popupOpen();
            this.cookie.write();
          }
        }

        if (isPositionBottom) {
          this.observeCartBar();
        }
      }

      show() {
        if (!window.location.pathname.endsWith('/challenge')) {
          if (!window.Shopify.designMode) {
            super.showPopupEvents();
          } else {
            super.popupOpen();
          }
        }

        this.showForm();
        this.inputField();

        this.popup.addEventListener('theme:popup:onclose', () => this.cookie.write());
      }

      observeCartBar() {
        this.cartBar = document.getElementById(selectors$d.cartBar);

        if (!this.cartBar) return;

        const config = {attributes: true, childList: false, subtree: false};
        let isVisible = this.cartBar.classList.contains(classes$a.isVisible);
        document.body.classList.toggle(classes$a.cartBarVisible, isVisible);

        // Callback function to execute when mutations are observed
        const callback = (mutationList) => {
          for (const mutation of mutationList) {
            if (mutation.type === 'attributes') {
              isVisible = mutation.target.classList.contains(classes$a.isVisible);
              document.body.classList.toggle(classes$a.cartBarVisible, isVisible);
            }
          }
        };

        this.observer = new MutationObserver(callback);
        this.observer.observe(this.cartBar, config);
      }

      showForm() {
        this.heading?.addEventListener('click', (event) => {
          event.preventDefault();

          this.heading.classList.add(classes$a.hidden);
          this.form.classList.remove(classes$a.hidden);
          this.newsletterField.focus();
        });

        this.heading?.addEventListener('keyup', (event) => {
          if (event.code === 'Enter') {
            this.heading.dispatchEvent(new Event('click'));
          }
        });
      }

      inputField() {
        const setClass = () => {
          // Reset timer if exists and is active
          if (this.resetClassTimer) {
            clearTimeout(this.resetClassTimer);
          }

          if (this.newsletterField.value !== '') {
            this.popup.classList.add(classes$a.hasValue);
          }
        };

        const unsetClass = () => {
          // Reset timer if exists and is active
          if (this.resetClassTimer) {
            clearTimeout(this.resetClassTimer);
          }

          // Reset class
          this.resetClassTimer = setTimeout(() => {
            this.popup.classList.remove(classes$a.hasValue);
          }, 2000);
        };

        this.newsletterField.addEventListener('input', setClass);
        this.newsletterField.addEventListener('focus', setClass);
        this.newsletterField.addEventListener('focusout', unsetClass);
      }

      disconnectedCallback() {
        if (this.observer) {
          this.observer.disconnect();
        }
      }
    }

    if (!customElements.get('popup-component')) {
      customElements.define('popup-component', PopupComponent);
    }

    if (!customElements.get('popup-newsletter')) {
      customElements.define('popup-newsletter', PopupNewsletter);
    }

    const selectors$c = {
      allVisibleElements: '[role="option"]',
      ariaSelected: '[aria-selected="true"]',
      popularSearches: '[data-popular-searches]',
      predictiveSearch: 'predictive-search',
      predictiveSearchResults: '[data-predictive-search-results]',
      predictiveSearchStatus: '[data-predictive-search-status]',
      searchInput: 'input[type="search"]',
      searchPopdown: '[data-popdown]',
      searchResultsLiveRegion: '[data-predictive-search-live-region-count-value]',
      searchResultsGroupsWrapper: '[data-search-results-groups-wrapper]',
      searchForText: '[data-predictive-search-search-for-text]',
      sectionPredictiveSearch: '#shopify-section-predictive-search',
      selectedLink: '[aria-selected="true"] a',
      selectedOption: '[aria-selected="true"] a, button[aria-selected="true"]',
    };

    if (!customElements.get('predictive-search')) {
      customElements.define(
        'predictive-search',

        class PredictiveSearch extends HeaderSearchForm {
          constructor() {
            super();

            this.a11y = window.theme.a11y;
            this.abortController = new AbortController();
            this.allPredictiveSearchInstances = document.querySelectorAll(selectors$c.predictiveSearch);
            this.cachedResults = {};
            this.input = this.querySelector(selectors$c.searchInput);
            this.isOpen = false;
            this.predictiveSearchResults = this.querySelector(selectors$c.predictiveSearchResults);
            this.searchPopdown = this.closest(selectors$c.searchPopdown);
            this.popularSearches = this.searchPopdown?.querySelector(selectors$c.popularSearches);
            this.searchTerm = '';
          }

          connectedCallback() {
            this.input.addEventListener('focus', this.onFocus.bind(this));
            this.input.form.addEventListener('submit', this.onFormSubmit.bind(this));

            this.addEventListener('focusout', this.onFocusOut.bind(this));
            this.addEventListener('keyup', this.onKeyup.bind(this));
            this.addEventListener('keydown', this.onKeydown.bind(this));
          }

          getQuery() {
            return this.input.value.trim();
          }

          onChange() {
            super.onChange();
            const newSearchTerm = this.getQuery();

            if (!this.searchTerm || !newSearchTerm.startsWith(this.searchTerm)) {
              // Remove the results when they are no longer relevant for the new search term
              // so they don't show up when the dropdown opens again
              this.querySelector(selectors$c.searchResultsGroupsWrapper)?.remove();
            }

            // Update the term asap, don't wait for the predictive search query to finish loading
            this.updateSearchForTerm(this.searchTerm, newSearchTerm);

            this.searchTerm = newSearchTerm;

            if (!this.searchTerm.length) {
              this.reset();
              return;
            }

            this.getSearchResults(this.searchTerm);
          }

          onFormSubmit(event) {
            if (!this.getQuery().length || this.querySelector(selectors$c.selectedLink)) event.preventDefault();
          }

          onFormReset(event) {
            super.onFormReset(event);
            if (super.shouldResetForm()) {
              this.searchTerm = '';
              this.abortController.abort();
              this.abortController = new AbortController();
              this.closeResults(true);
            }
          }

          shouldResetForm() {
            return !document.querySelector(selectors$c.selectedLink);
          }

          onFocus() {
            const currentSearchTerm = this.getQuery();

            if (!currentSearchTerm.length) return;

            if (this.searchTerm !== currentSearchTerm) {
              // Search term was changed from other search input, treat it as a user change
              this.onChange();
            } else if (this.getAttribute('results') === 'true') {
              this.open();
            } else {
              this.getSearchResults(this.searchTerm);
            }
          }

          onFocusOut() {
            setTimeout(() => {
              if (!this.contains(document.activeElement)) this.close();
            });
          }

          onKeyup(event) {
            if (!this.getQuery().length) this.close(true);
            event.preventDefault();

            switch (event.code) {
              case 'ArrowUp':
                this.switchOption('up');
                break;
              case 'ArrowDown':
                this.switchOption('down');
                break;
              case 'Enter':
                this.selectOption();
                break;
            }
          }

          onKeydown(event) {
            // Prevent the cursor from moving in the input when using the up and down arrow keys
            if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
              event.preventDefault();
            }
          }

          updateSearchForTerm(previousTerm, newTerm) {
            const searchForTextElement = this.querySelector(selectors$c.searchForText);
            const currentButtonText = searchForTextElement?.innerText;

            if (currentButtonText) {
              if (currentButtonText.match(new RegExp(previousTerm, 'g'))?.length > 1) {
                // The new term matches part of the button text and not just the search term, do not replace to avoid mistakes
                return;
              }
              const newButtonText = currentButtonText.replace(previousTerm, newTerm);
              searchForTextElement.innerText = newButtonText;
            }
          }

          switchOption(direction) {
            if (!this.getAttribute('open')) return;

            const moveUp = direction === 'up';
            const selectedElement = this.querySelector(selectors$c.ariaSelected);

            // Filter out hidden elements (duplicated page and article resources) thanks
            // to this https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
            const allVisibleElements = Array.from(this.querySelectorAll(selectors$c.allVisibleElements)).filter((element) => element.offsetParent !== null);

            let activeElementIndex = 0;

            if (moveUp && !selectedElement) return;

            let selectedElementIndex = -1;
            let i = 0;

            while (selectedElementIndex === -1 && i <= allVisibleElements.length) {
              if (allVisibleElements[i] === selectedElement) {
                selectedElementIndex = i;
              }
              i++;
            }

            this.statusElement.textContent = '';

            if (!moveUp && selectedElement) {
              activeElementIndex = selectedElementIndex === allVisibleElements.length - 1 ? 0 : selectedElementIndex + 1;
            } else if (moveUp) {
              activeElementIndex = selectedElementIndex === 0 ? allVisibleElements.length - 1 : selectedElementIndex - 1;
            }

            if (activeElementIndex === selectedElementIndex) return;

            const activeElement = allVisibleElements[activeElementIndex];

            activeElement.setAttribute('aria-selected', true);
            if (selectedElement) selectedElement.setAttribute('aria-selected', false);

            this.input.setAttribute('aria-activedescendant', activeElement.id);
          }

          selectOption() {
            const selectedOption = this.querySelector(selectors$c.selectedOption);

            if (selectedOption) selectedOption.click();
          }

          getSearchResults(searchTerm) {
            const queryKey = searchTerm.replace(' ', '-').toLowerCase();
            this.setLiveRegionLoadingState();

            if (this.cachedResults[queryKey]) {
              this.renderSearchResults(this.cachedResults[queryKey]);
              return;
            }

            fetch(`${theme.routes.predictive_search_url}?q=${encodeURIComponent(searchTerm)}&section_id=predictive-search`, {signal: this.abortController.signal})
              .then((response) => {
                if (!response.ok) {
                  var error = new Error(response.status);
                  this.close();
                  throw error;
                }

                return response.text();
              })
              .then((text) => {
                const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector(selectors$c.sectionPredictiveSearch).innerHTML;
                // Save bandwidth keeping the cache in all instances synced
                this.allPredictiveSearchInstances.forEach((predictiveSearchInstance) => {
                  predictiveSearchInstance.cachedResults[queryKey] = resultsMarkup;
                });
                this.renderSearchResults(resultsMarkup);
              })
              .catch((error) => {
                if (error?.code === 20) {
                  // Code 20 means the call was aborted
                  return;
                }
                this.close();
                throw error;
              });
          }

          setLiveRegionLoadingState() {
            this.statusElement = this.statusElement || this.querySelector(selectors$c.predictiveSearchStatus);
            this.loadingText = this.loadingText || this.getAttribute('data-loading-text');

            this.setLiveRegionText(this.loadingText);
            this.setAttribute('loading', true);
          }

          setLiveRegionText(statusText) {
            this.statusElement.setAttribute('aria-hidden', 'false');
            this.statusElement.textContent = statusText;

            setTimeout(() => {
              this.statusElement.setAttribute('aria-hidden', 'true');
            }, 1000);
          }

          renderSearchResults(resultsMarkup) {
            this.predictiveSearchResults.innerHTML = resultsMarkup;

            this.setAttribute('results', true);

            this.setLiveRegionResults();
            this.open();
          }

          setLiveRegionResults() {
            this.removeAttribute('loading');
            this.setLiveRegionText(this.querySelector(selectors$c.searchResultsLiveRegion).textContent);
          }

          open() {
            this.setAttribute('open', true);
            this.input.setAttribute('aria-expanded', true);
            this.isOpen = true;
            this.predictiveSearchResults.style.setProperty('--full-screen', `${window.visualViewport.height}px`);
          }

          close(clearSearchTerm = false) {
            this.closeResults(clearSearchTerm);
            this.isOpen = false;
            this.predictiveSearchResults.style.removeProperty('--full-screen');
          }

          closeResults(clearSearchTerm = false) {
            if (clearSearchTerm) {
              this.input.value = '';
              this.removeAttribute('results');
            }
            const selected = this.querySelector(selectors$c.ariaSelected);

            if (selected) selected.setAttribute('aria-selected', false);

            this.input.setAttribute('aria-activedescendant', '');
            this.removeAttribute('loading');
            this.removeAttribute('open');
            this.input.setAttribute('aria-expanded', false);
            this.predictiveSearchResults?.removeAttribute('style');
          }

          reset() {
            this.predictiveSearchResults.innerHTML = '';

            this.input.val = '';
            this.a11y.removeTrapFocus();

            if (this.popularSearches) {
              this.input.dispatchEvent(new Event('blur', {bubbles: false}));
              this.a11y.trapFocus(this.searchPopdown, {
                elementToFocus: this.input,
              });
            }
          }
        }
      );
    }

    function Listeners() {
      this.entries = [];
    }

    Listeners.prototype.add = function (element, event, fn) {
      this.entries.push({element: element, event: event, fn: fn});
      element.addEventListener(event, fn);
    };

    Listeners.prototype.removeAll = function () {
      this.entries = this.entries.filter(function (listener) {
        listener.element.removeEventListener(listener.event, listener.fn);
        return false;
      });
    };

    /**
     * Convert the Object (with 'name' and 'value' keys) into an Array of values, then find a match & return the variant (as an Object)
     * @param {Object} product Product JSON object
     * @param {Object} collection Object with 'name' and 'value' keys (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
     * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
     */
    function getVariantFromSerializedArray(product, collection) {
      _validateProductStructure(product);

      // If value is an array of options
      var optionArray = _createOptionArrayFromOptionCollection(product, collection);
      return getVariantFromOptionArray(product, optionArray);
    }

    /**
     * Find a match in the project JSON (using Array with option values) and return the variant (as an Object)
     * @param {Object} product Product JSON object
     * @param {Array} options List of submitted values (e.g. ['36', 'Black'])
     * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
     */
    function getVariantFromOptionArray(product, options) {
      _validateProductStructure(product);
      _validateOptionsArray(options);

      var result = product.variants.filter(function (variant) {
        return options.every(function (option, index) {
          return variant.options[index] === option;
        });
      });

      return result[0] || null;
    }

    /**
     * Creates an array of selected options from the object
     * Loops through the project.options and check if the "option name" exist (product.options.name) and matches the target
     * @param {Object} product Product JSON object
     * @param {Array} collection Array of object (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
     * @returns {Array} The result of the matched values. (e.g. ['36', 'Black'])
     */
    function _createOptionArrayFromOptionCollection(product, collection) {
      _validateProductStructure(product);
      _validateSerializedArray(collection);

      var optionArray = [];

      collection.forEach(function (option) {
        for (var i = 0; i < product.options.length; i++) {
          var name = product.options[i].name || product.options[i];
          if (name.toLowerCase() === option.name.toLowerCase()) {
            optionArray[i] = option.value;
            break;
          }
        }
      });

      return optionArray;
    }

    /**
     * Check if the product data is a valid JS object
     * Error will be thrown if type is invalid
     * @param {object} product Product JSON object
     */
    function _validateProductStructure(product) {
      if (typeof product !== 'object') {
        throw new TypeError(product + ' is not an object.');
      }

      if (Object.keys(product).length === 0 && product.constructor === Object) {
        throw new Error(product + ' is empty.');
      }
    }

    /**
     * Validate the structure of the array
     * It must be formatted like jQuery's serializeArray()
     * @param {Array} collection Array of object [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }]
     */
    function _validateSerializedArray(collection) {
      if (!Array.isArray(collection)) {
        throw new TypeError(collection + ' is not an array.');
      }

      if (collection.length === 0) {
        throw new Error(collection + ' is empty.');
      }

      if (collection[0].hasOwnProperty('name')) {
        if (typeof collection[0].name !== 'string') {
          throw new TypeError('Invalid value type passed for name of option ' + collection[0].name + '. Value should be string.');
        }
      } else {
        throw new Error(collection[0] + 'does not contain name key.');
      }
    }

    /**
     * Validate the structure of the array
     * It must be formatted as list of values
     * @param {Array} collection Array of object (e.g. ['36', 'Black'])
     */
    function _validateOptionsArray(options) {
      if (Array.isArray(options) && typeof options[0] === 'object') {
        throw new Error(options + 'is not a valid array of options.');
      }
    }

    var selectors$b = {
      idInput: '[name="id"]',
      planInput: '[name="selling_plan"]',
      optionInput: '[name^="options"]',
      quantityInput: '[name="quantity"]',
      propertyInput: '[name^="properties"]',
    };

    // Public Methods
    // -----------------------------------------------------------------------------

    /**
     * Returns a URL with a variant ID query parameter. Useful for updating window.history
     * with a new URL based on the currently select product variant.
     * @param {string} url - The URL you wish to append the variant ID to
     * @param {number} id  - The variant ID you wish to append to the URL
     * @returns {string} - The new url which includes the variant ID query parameter
     */

    function getUrlWithVariant(url, id) {
      if (/variant=/.test(url)) {
        return url.replace(/(variant=)[^&]+/, '$1' + id);
      } else if (/\?/.test(url)) {
        return url.concat('&variant=').concat(id);
      }

      return url.concat('?variant=').concat(id);
    }

    /**
     * Constructor class that creates a new instance of a product form controller.
     *
     * @param {Element} element - DOM element which is equal to the <form> node wrapping product form inputs
     * @param {Object} product - A product object
     * @param {Object} options - Optional options object
     * @param {Function} options.onOptionChange - Callback for whenever an option input changes
     * @param {Function} options.onPlanChange - Callback for changes to name=selling_plan
     * @param {Function} options.onQuantityChange - Callback for whenever an quantity input changes
     * @param {Function} options.onPropertyChange - Callback for whenever a property input changes
     * @param {Function} options.onFormSubmit - Callback for whenever the product form is submitted
     */
    class ProductFormReader {
      constructor(element, product, options) {
        this.element = element;
        this.product = this._validateProductObject(product);
        this.variantElement = this.element.querySelector(selectors$b.idInput);

        options = options || {};

        this._listeners = new Listeners();
        this._listeners.add(this.element, 'submit', this._onSubmit.bind(this, options));

        this.optionInputs = this._initInputs(selectors$b.optionInput, options.onOptionChange);

        this.planInputs = this._initInputs(selectors$b.planInput, options.onPlanChange);

        this.quantityInputs = this._initInputs(selectors$b.quantityInput, options.onQuantityChange);

        this.propertyInputs = this._initInputs(selectors$b.propertyInput, options.onPropertyChange);
      }

      /**
       * Cleans up all event handlers that were assigned when the Product Form was constructed.
       * Useful for use when a section needs to be reloaded in the theme editor.
       */
      destroy() {
        this._listeners.removeAll();
      }

      /**
       * Getter method which returns the array of currently selected option values
       *
       * @returns {Array} An array of option values
       */
      options() {
        return this._serializeInputValues(this.optionInputs, function (item) {
          var regex = /(?:^(options\[))(.*?)(?:\])/;
          item.name = regex.exec(item.name)[2]; // Use just the value between 'options[' and ']'
          return item;
        });
      }

      /**
       * Getter method which returns the currently selected variant, or `null` if variant
       * doesn't exist.
       *
       * @returns {Object|null} Variant object
       */
      variant() {
        const opts = this.options();
        if (opts.length) {
          return getVariantFromSerializedArray(this.product, opts);
        } else {
          return this.product.variants[0];
        }
      }

      /**
       * Getter method which returns the current selling plan, or `null` if plan
       * doesn't exist.
       *
       * @returns {Object|null} Variant object
       */
      plan(variant) {
        let plan = {
          allocation: null,
          group: null,
          detail: null,
        };
        const sellingPlanChecked = this.element.querySelector(`${selectors$b.planInput}:checked`);
        if (!sellingPlanChecked) return null;
        const sellingPlanCheckedValue = sellingPlanChecked.value;
        const id = sellingPlanCheckedValue && sellingPlanCheckedValue !== '' ? sellingPlanCheckedValue : null;

        if (id && variant) {
          plan.allocation = variant.selling_plan_allocations.find(function (item) {
            return item.selling_plan_id.toString() === id.toString();
          });
        }
        if (plan.allocation) {
          plan.group = this.product.selling_plan_groups.find(function (item) {
            return item.id.toString() === plan.allocation.selling_plan_group_id.toString();
          });
        }
        if (plan.group) {
          plan.detail = plan.group.selling_plans.find(function (item) {
            return item.id.toString() === id.toString();
          });
        }

        if (plan && plan.allocation && plan.detail && plan.allocation) {
          return plan;
        } else return null;
      }

      /**
       * Getter method which returns a collection of objects containing name and values
       * of property inputs
       *
       * @returns {Array} Collection of objects with name and value keys
       */
      properties() {
        return this._serializeInputValues(this.propertyInputs, function (item) {
          var regex = /(?:^(properties\[))(.*?)(?:\])/;
          item.name = regex.exec(item.name)[2]; // Use just the value between 'properties[' and ']'
          return item;
        });
      }

      /**
       * Getter method which returns the current quantity or 1 if no quantity input is
       * included in the form
       *
       * @returns {Array} Collection of objects with name and value keys
       */
      quantity() {
        return this.quantityInputs[0] ? Number.parseInt(this.quantityInputs[0].value, 10) : 1;
      }

      getFormState() {
        const variant = this.variant();
        return {
          options: this.options(),
          variant: variant,
          properties: this.properties(),
          quantity: this.quantity(),
          plan: this.plan(variant),
        };
      }

      // Private Methods
      // -----------------------------------------------------------------------------
      _setIdInputValue(variant) {
        if (variant && variant.id) {
          this.variantElement.value = variant.id.toString();
        } else {
          this.variantElement.value = '';
        }

        this.variantElement.dispatchEvent(new Event('change'));
      }

      _onSubmit(options, event) {
        event.dataset = this.getFormState();
        if (options.onFormSubmit) {
          options.onFormSubmit(event);
        }
      }

      _onOptionChange(event) {
        this._setIdInputValue(event.dataset.variant);
      }

      _onFormEvent(cb) {
        if (typeof cb === 'undefined') {
          return Function.prototype.bind();
        }

        return function (event) {
          event.dataset = this.getFormState();
          this._setIdInputValue(event.dataset.variant);
          cb(event);
        }.bind(this);
      }

      _initInputs(selector, cb) {
        var elements = Array.prototype.slice.call(this.element.querySelectorAll(selector));

        return elements.map(
          function (element) {
            this._listeners.add(element, 'change', this._onFormEvent(cb));
            return element;
          }.bind(this)
        );
      }

      _serializeInputValues(inputs, transform) {
        return inputs.reduce(function (options, input) {
          if (
            input.checked || // If input is a checked (means type radio or checkbox)
            (input.type !== 'radio' && input.type !== 'checkbox') // Or if its any other type of input
          ) {
            options.push(transform({name: input.name, value: input.value}));
          }

          return options;
        }, []);
      }

      _validateProductObject(product) {
        if (typeof product !== 'object') {
          throw new TypeError(product + ' is not an object.');
        }

        if (typeof product.variants[0].options === 'undefined') {
          throw new TypeError('Product object is invalid. Make sure you use the product object that is output from {{ product | json }} or from the http://[your-product-url].js route');
        }
        return product;
      }
    }

    const selectors$a = {
      optionPosition: 'data-option-position',
      optionInput: '[name^="options"], [data-popout-option]',
      optionInputCurrent: '[name^="options"]:checked, [name^="options"][type="hidden"]',
      selectOptionValue: 'data-value',
      popout: '[data-popout]',
    };

    const classes$9 = {
      soldOut: 'sold-out',
      unavailable: 'unavailable',
      sale: 'sale',
    };

    /**
     * Variant Sellout Precrime Click Preview
     * I think of this like the precrime machine in Minority report.  It gives a preview
     * of every possible click action, given the current form state.  The logic is:
     *
     * for each clickable name=options[] variant selection element
     * find the value of the form if the element were clicked
     * lookup the variant with those value in the product json
     * clear the classes, add .unavailable if it's not found,
     * and add .sold-out if it is out of stock
     *
     * Caveat: we rely on the option position so we don't need
     * to keep a complex map of keys and values.
     */

    class SelloutVariants {
      constructor(section, productJSON) {
        this.container = section;
        this.productJSON = productJSON;
        this.optionElements = this.container.querySelectorAll(selectors$a.optionInput);

        if (this.productJSON && this.optionElements.length) {
          this.init();
        }
      }

      init() {
        this.update();
      }

      update() {
        this.getCurrentState();

        this.optionElements.forEach((el) => {
          const parent = el.closest(`[${selectors$a.optionPosition}]`);
          if (!parent) return;
          const val = el.value || el.getAttribute(selectors$a.selectOptionValue);
          const positionString = parent.getAttribute(selectors$a.optionPosition);
          // subtract one because option.position in liquid does not count form zero, but JS arrays do
          const position = parseInt(positionString, 10) - 1;
          const selectPopout = el.closest(selectors$a.popout);

          let newVals = [...this.selections];
          newVals[position] = val;

          const found = this.productJSON.variants.find((element) => {
            // only return true if every option matches our hypothetical selection
            let perfectMatch = true;
            for (let index = 0; index < newVals.length; index++) {
              if (element.options[index] !== newVals[index]) {
                perfectMatch = false;
              }
            }
            return perfectMatch;
          });

          el.classList.remove(classes$9.soldOut, classes$9.unavailable);
          el.parentNode.classList.remove(classes$9.sale);

          if (selectPopout) {
            selectPopout.classList.remove(classes$9.soldOut, classes$9.unavailable, classes$9.sale);
          }

          if (typeof found === 'undefined') {
            el.classList.add(classes$9.unavailable);

            if (selectPopout) {
              selectPopout.classList.add(classes$9.unavailable);
            }
          } else if (found && found.available === false) {
            el.classList.add(classes$9.soldOut);

            if (selectPopout) {
              selectPopout.classList.add(classes$9.soldOut);
            }
          }

          if (found && found.compare_at_price > found.price && theme.settings.variantOnSale) {
            el.parentNode.classList.add(classes$9.sale);
          }
        });
      }

      getCurrentState() {
        this.selections = [];

        const options = this.container.querySelectorAll(selectors$a.optionInputCurrent);
        if (options.length) {
          options.forEach((element) => {
            const elemValue = element.value;
            if (elemValue && elemValue !== '') {
              this.selections.push(elemValue);
            }
          });
        }
      }
    }

    const selectors$9 = {
      product: '[data-product]',
      productForm: '[data-product-form]',
      productNotification: 'product-notification',
      variantTitle: '[data-variant-title]',
      notificationProduct: '[data-notification-product]',
      addToCart: '[data-add-to-cart]',
      addToCartText: '[data-add-to-cart-text]',
      cartPage: '[data-cart-page]',
      comparePrice: '[data-compare-price]',
      comparePriceText: '[data-compare-text]',
      finalSaleBadge: '[data-final-sale-badge]',
      formWrapper: '[data-form-wrapper]',
      originalSelectorId: '[data-product-select]',
      priceWrapper: '[data-price-wrapper]',
      productImages: 'product-images',
      productImage: '[data-product-image]',
      productMediaList: '[data-product-media-list]',
      productJson: '[data-product-json]',
      productPrice: '[data-product-price]',
      unitPrice: '[data-product-unit-price]',
      unitBase: '[data-product-base]',
      unitWrapper: '[data-product-unit]',
      isPreOrder: '[data-product-preorder]',
      productSlide: '.product__slide',
      subPrices: '[data-subscription-watch-price]',
      subSelectors: '[data-subscription-selectors]',
      subsToggle: '[data-toggles-group]',
      subsChild: 'data-group-toggle',
      subDescription: '[data-plan-description]',
      section: '[data-section-type]',
      variantSku: '[data-variant-sku]',
      variantFinalSaleMeta: '[data-variant-final-sale-metafield]',
      variantButtons: '[data-variant-buttons]',
      variantOptionImage: '[data-variant-option-image]',
      quickAddModal: '[data-quick-add-modal]',
      priceOffAmount: '[data-price-off-amount]',
      priceOffBadge: '[data-price-off-badge]',
      priceOffType: '[data-price-off-type]',
      priceOffWrap: '[data-price-off]',
      remainingCount: '[data-remaining-count]',
      remainingMax: '[data-remaining-max]',
      remainingWrapper: '[data-remaining-wrapper]',
      remainingJSON: '[data-product-remaining-json]',
      optionValue: '[data-option-value]',
      optionPosition: '[data-option-position]',
      installment: '[data-product-form-installment]',
      inputId: 'input[name="id"]',
    };

    const classes$8 = {
      hidden: 'hidden',
      variantSoldOut: 'variant--soldout',
      variantUnavailable: 'variant--unavailable',
      productPriceSale: 'product__price--sale',
      remainingLow: 'count-is-low',
      remainingIn: 'count-is-in',
      remainingOut: 'count-is-out',
      remainingUnavailable: 'count-is-unavailable',
    };

    const attributes$7 = {
      remainingMaxAttr: 'data-remaining-max',
      enableHistoryState: 'data-enable-history-state',
      notificationPopup: 'data-notification-popup',
      faderDesktop: 'data-fader-desktop',
      faderMobile: 'data-fader-mobile',
      optionPosition: 'data-option-position',
      imageId: 'data-image-id',
      mediaId: 'data-media-id',
      quickAddButton: 'data-quick-add-btn',
      finalSale: 'data-final-sale',
      variantImageScroll: 'data-variant-image-scroll',
    };

    if (!customElements.get('product-form')) {
      customElements.define(
        'product-form',

        class ProductForm extends HTMLElement {
          constructor() {
            super();
          }

          connectedCallback() {
            this.cartAddEvents();

            this.container = this.closest(selectors$9.section) || this.closest(selectors$9.quickAddModal);
            if (!this.container) return;

            this.sectionId = this.container.dataset.sectionId;
            this.product = this.container.querySelector(selectors$9.product);
            this.productForm = this.container.querySelector(selectors$9.productForm);
            this.productNotification = this.container.querySelector(selectors$9.productNotification);
            this.productImages = this.container.querySelector(selectors$9.productImages);
            this.productMediaList = this.container.querySelector(selectors$9.productMediaList);
            this.installmentForm = this.container.querySelector(selectors$9.installment);
            this.skuWrapper = this.container.querySelector(selectors$9.variantSku);
            this.sellout = null;
            this.variantImageScroll = this.container.getAttribute(attributes$7.variantImageScroll) === 'true';

            this.priceOffWrap = this.container.querySelector(selectors$9.priceOffWrap);
            this.priceOffAmount = this.container.querySelector(selectors$9.priceOffAmount);
            this.priceOffType = this.container.querySelector(selectors$9.priceOffType);
            this.planDescription = this.container.querySelector(selectors$9.subDescription);

            this.remainingWrapper = this.container.querySelector(selectors$9.remainingWrapper);

            if (this.remainingWrapper) {
              const remainingMaxWrap = this.container.querySelector(selectors$9.remainingMax);
              if (remainingMaxWrap) {
                this.remainingMaxInt = parseInt(remainingMaxWrap.getAttribute(attributes$7.remainingMaxAttr), 10);
                this.remainingCount = this.container.querySelector(selectors$9.remainingCount);
                this.remainingJSONWrapper = this.container.querySelector(selectors$9.remainingJSON);
                this.remainingJSON = null;

                if (this.remainingJSONWrapper && this.remainingJSONWrapper.innerHTML !== '') {
                  this.remainingJSON = JSON.parse(this.remainingJSONWrapper.innerHTML);
                } else {
                  console.warn('Missing product quantity JSON');
                }
              }
            }

            this.enableHistoryState = this.container.getAttribute(attributes$7.enableHistoryState) === 'true';
            this.hasUnitPricing = this.container.querySelector(selectors$9.unitWrapper);
            this.subSelectors = this.container.querySelector(selectors$9.subSelectors);
            this.subPrices = this.container.querySelector(selectors$9.subPrices);
            this.isPreOrder = this.container.querySelector(selectors$9.isPreOrder);

            let productJSON = null;
            const productElemJSON = this.container.querySelector(selectors$9.productJson);
            if (productElemJSON) {
              productJSON = productElemJSON.innerHTML;
            }
            if (productJSON) {
              this.productJSON = JSON.parse(productJSON);
              this.linkForm();
              this.sellout = new SelloutVariants(this.container, this.productJSON);
            } else {
              console.error('Missing product JSON');
            }

            this.variantOptionImages = this.container.querySelectorAll(selectors$9.variantOptionImage);
            this.variantButtons = this.container.querySelectorAll(selectors$9.variantButtons);
            if (this.variantOptionImages.length > 1) {
              this.optionImagesWidth();
            }
          }

          cartAddEvents() {
            this.buttonATC = this.querySelector(selectors$9.addToCart);

            this.buttonATC.addEventListener('click', (e) => {
              e.preventDefault();

              document.dispatchEvent(
                new CustomEvent('theme:cart:add', {
                  detail: {
                    button: this.buttonATC,
                  },
                  bubbles: false,
                })
              );

              if (!this.closest(selectors$9.quickAddModal)) {
                window.a11y.lastElement = this.buttonATC;
              }
            });
          }

          destroy() {
            this.productForm.destroy();
          }

          linkForm() {
            this.productForm = new ProductFormReader(this.container, this.productJSON, {
              onOptionChange: this.onOptionChange.bind(this),
              onPlanChange: this.onPlanChange.bind(this),
            });
            this.pushState(this.productForm.getFormState(), true);
            this.subsToggleListeners();
          }

          onOptionChange(evt) {
            this.pushState(evt.dataset);
          }

          onPlanChange(evt) {
            if (this.subPrices) {
              this.pushState(evt.dataset);
            }
          }

          pushState(formState, init = false) {
            this.productState = this.setProductState(formState);
            this.updateAddToCartState(formState);
            this.updateNotificationForm(formState);
            this.updateProductPrices(formState);
            this.updateProductImage(formState);
            this.updateSaleText(formState);
            this.updateSku(formState);
            this.updateSubscriptionText(formState);
            this.updateRemaining(formState);
            this.updateLegend(formState);
            this.fireHookEvent(formState);
            this.sellout?.update(formState);

            if (this.enableHistoryState && !init) {
              this.updateHistoryState(formState);
            }
          }

          updateAddToCartState(formState) {
            const variant = formState.variant;
            let addText = theme.strings.addToCart;
            const priceWrapper = this.container.querySelectorAll(selectors$9.priceWrapper);
            const addToCart = this.container.querySelectorAll(selectors$9.addToCart);
            const addToCartText = this.container.querySelectorAll(selectors$9.addToCartText);
            const formWrapper = this.container.querySelectorAll(selectors$9.formWrapper);

            if (this.installmentForm && variant) {
              const installmentInput = this.installmentForm.querySelector(selectors$9.inputId);
              installmentInput.value = variant.id;
              installmentInput.dispatchEvent(new Event('change', {bubbles: true}));
            }

            if (this.isPreOrder) {
              addText = theme.strings.preOrder;
            }

            if (priceWrapper.length && variant) {
              priceWrapper.forEach((element) => {
                element.classList.remove(classes$8.hidden);
              });
            }

            addToCart?.forEach((button) => {
              if (button.hasAttribute(attributes$7.quickAddButton)) return;

              if (variant) {
                if (variant.available) {
                  button.disabled = false;
                } else {
                  button.disabled = true;
                }
              } else {
                button.disabled = true;
              }
            });

            addToCartText?.forEach((element) => {
              let btnText = addText;
              if (variant) {
                if (!variant.available) {
                  btnText = theme.strings.soldOut;
                }
              } else {
                btnText = theme.strings.unavailable;
              }

              element.textContent = btnText;
            });

            if (formWrapper.length) {
              formWrapper.forEach((element) => {
                if (variant) {
                  if (variant.available) {
                    element.classList.remove(classes$8.variantSoldOut, classes$8.variantUnavailable);
                  } else {
                    element.classList.add(classes$8.variantSoldOut);
                    element.classList.remove(classes$8.variantUnavailable);
                  }

                  const formSelect = element.querySelector(selectors$9.originalSelectorId);
                  if (formSelect) {
                    formSelect.value = variant.id;
                  }

                  const inputId = element.querySelector(`${selectors$9.inputId}[form]`);
                  if (inputId) {
                    inputId.value = variant.id;
                    inputId.dispatchEvent(new Event('change'));
                  }
                } else {
                  element.classList.add(classes$8.variantUnavailable);
                  element.classList.remove(classes$8.variantSoldOut);
                }
              });
            }
          }

          updateNotificationForm(formState) {
            if (!this.productNotification) return;

            const variantTitle = this.productNotification.querySelector(selectors$9.variantTitle);
            const notificationProduct = this.productNotification.querySelector(selectors$9.notificationProduct);
            if (variantTitle != null) {
              variantTitle.textContent = formState.variant.title;
              notificationProduct.value = formState.variant.name;
            }
          }

          updateHistoryState(formState) {
            const variant = formState.variant;
            const plan = formState.plan;
            const location = window.location.href;
            if (variant && location.includes('/product')) {
              const url = new window.URL(location);
              const params = url.searchParams;
              params.set('variant', variant.id);
              if (plan && plan.detail && plan.detail.id && this.productState.hasPlan) {
                params.set('selling_plan', plan.detail.id);
              } else {
                params.delete('selling_plan');
              }
              url.search = params.toString();
              const urlString = url.toString();
              window.history.replaceState({path: urlString}, '', urlString);
            }
          }

          updateRemaining(formState) {
            const variant = formState.variant;

            this.remainingWrapper?.classList.remove(classes$8.remainingIn, classes$8.remainingOut, classes$8.remainingUnavailable, classes$8.remainingLow);

            if (variant && this.remainingWrapper && this.remainingJSON) {
              const remaining = this.remainingJSON[variant.id];

              if (remaining === 'out' || remaining < 1) {
                this.remainingWrapper.classList.add(classes$8.remainingOut);
              }

              if (remaining === 'in' || remaining >= this.remainingMaxInt) {
                this.remainingWrapper.classList.add(classes$8.remainingIn);
              }

              if (remaining === 'low' || (remaining > 0 && remaining < this.remainingMaxInt)) {
                this.remainingWrapper.classList.add(classes$8.remainingLow);

                if (this.remainingCount) {
                  this.remainingCount.innerHTML = remaining;
                }
              }
            } else if (!variant && this.remainingWrapper) {
              this.remainingWrapper.classList.add(classes$8.remainingUnavailable);
            }
          }

          optionImagesWidth() {
            if (!this.variantButtons) return;

            let maxItemWidth = 0;

            requestAnimationFrame(() => {
              this.variantOptionImages.forEach((item) => {
                const itemWidth = item.clientWidth;
                if (itemWidth > maxItemWidth) {
                  maxItemWidth = itemWidth;
                }
              });

              this.variantButtons.forEach((item) => {
                item.style?.setProperty('--option-image-width', maxItemWidth + 'px');
              });
            });
          }

          getBaseUnit(variant) {
            return variant.unit_price_measurement.reference_value === 1
              ? variant.unit_price_measurement.reference_unit
              : variant.unit_price_measurement.reference_value + variant.unit_price_measurement.reference_unit;
          }

          subsToggleListeners() {
            const toggles = this.container.querySelectorAll(selectors$9.subsToggle);

            toggles.forEach((toggle) => {
              toggle.addEventListener(
                'change',
                function (e) {
                  const val = e.target.value.toString();
                  const selected = this.container.querySelector(`[${selectors$9.subsChild}="${val}"]`);
                  const groups = this.container.querySelectorAll(`[${selectors$9.subsChild}]`);
                  if (selected) {
                    selected.classList.remove(classes$8.hidden);
                    const first = selected.querySelector(`[name="selling_plan"]`);
                    first.checked = true;
                    first.dispatchEvent(new Event('change'));
                  }
                  groups.forEach((group) => {
                    if (group !== selected) {
                      group.classList.add(classes$8.hidden);
                      const plans = group.querySelectorAll(`[name="selling_plan"]`);
                      plans.forEach((plan) => {
                        plan.checked = false;
                        plan.dispatchEvent(new Event('change'));
                      });
                    }
                  });
                }.bind(this)
              );
            });
          }

          updateSaleText(formState) {
            if (!this.priceOffWrap) return;

            if (this.productState.planSale) {
              this.updateSaleTextSubscription(formState);
            } else if (this.productState.onSale) {
              this.updateSaleTextStandard(formState);
            } else {
              this.priceOffWrap.classList.add(classes$8.hidden);
            }
          }

          isVariantFinalSale(variant) {
            const metafieldsData = document.querySelector(selectors$9.variantFinalSaleMeta)?.textContent;
            if (!metafieldsData) return;

            const variantsMetafields = JSON.parse(metafieldsData);
            let variantIsFinalSale = false;

            variantsMetafields.forEach((variantMetafield) => {
              if (Number(variantMetafield.variant_id) === variant.id) {
                variantIsFinalSale = variantMetafield.metafield_value === 'true';
              }
            });

            return variantIsFinalSale;
          }

          updateSaleTextStandard(formState) {
            const variant = formState.variant;
            const finalSaleBadge = this.priceOffWrap?.querySelector(selectors$9.finalSaleBadge);
            const priceOffBadge = this.priceOffWrap?.querySelector(selectors$9.priceOffBadge);
            const comparePrice = variant?.compare_at_price;
            const salePrice = variant?.price;

            // Set sale type text if element exists
            if (this.priceOffType) {
              this.priceOffType.innerHTML = window.theme.strings.sale || 'sale';
            }

            // If priceOffBadge or priceOffAmount are missing, hide priceOffBadge and exit early
            if (!priceOffBadge || !this.priceOffAmount || !comparePrice || comparePrice <= salePrice) {
              priceOffBadge?.classList.add(classes$8.hidden);
            } else {
              // Calculate and display discount percentage
              const discountInt = Math.round(((comparePrice - salePrice) / comparePrice) * 100);
              this.priceOffAmount.innerHTML = `${discountInt}%`;
              priceOffBadge.classList.remove(classes$8.hidden);
            }

            // Display or hide the final sale badge
            const isFinalSale = this.priceOffWrap?.hasAttribute(attributes$7.finalSale) || this.isVariantFinalSale(variant);
            if (finalSaleBadge) {
              finalSaleBadge.classList.toggle(classes$8.hidden, !isFinalSale);
            }

            this.priceOffWrap.classList.remove(classes$8.hidden);
          }

          updateSubscriptionText(formState) {
            if (formState.plan && this.planDescription) {
              this.planDescription.innerHTML = formState.plan.detail.description;
              this.planDescription.classList.remove(classes$8.hidden);
            } else if (this.planDescription) {
              this.planDescription.classList.add(classes$8.hidden);
            }
          }

          updateSaleTextSubscription(formState) {
            if (this.priceOffType) {
              this.priceOffType.innerHTML = window.theme.strings.subscription || 'subscripton';
            }

            if (this.priceOffAmount && this.priceOffWrap) {
              const adjustment = formState.plan.detail.price_adjustments[0];
              const discount = adjustment.value;
              if (adjustment && adjustment.value_type === 'percentage') {
                this.priceOffAmount.innerHTML = `${discount}%`;
              } else {
                this.priceOffAmount.innerHTML = window.theme.formatMoney(discount, theme.moneyFormat);
              }
              this.priceOffWrap.classList.remove(classes$8.hidden);
            }
          }

          updateProductPrices(formState) {
            const variant = formState.variant;
            const plan = formState.plan;
            const priceWrappers = this.container.querySelectorAll(selectors$9.priceWrapper);

            priceWrappers.forEach((wrap) => {
              const comparePriceEl = wrap.querySelector(selectors$9.comparePrice);
              const productPriceEl = wrap.querySelector(selectors$9.productPrice);
              const comparePriceText = wrap.querySelector(selectors$9.comparePriceText);

              let comparePrice = '';
              let price = '';

              if (this.productState.available) {
                comparePrice = variant.compare_at_price;
                price = variant.price;
              }

              if (this.productState.hasPlan) {
                price = plan.allocation.price;
              }

              if (this.productState.planSale) {
                comparePrice = plan.allocation.compare_at_price;
                price = plan.allocation.price;
              }

              if (comparePriceEl) {
                if (this.productState.onSale || this.productState.planSale) {
                  comparePriceEl.classList.remove(classes$8.hidden);
                  comparePriceText.classList.remove(classes$8.hidden);
                  productPriceEl.classList.add(classes$8.productPriceSale);
                } else {
                  comparePriceEl.classList.add(classes$8.hidden);
                  comparePriceText.classList.add(classes$8.hidden);
                  productPriceEl.classList.remove(classes$8.productPriceSale);
                }
                comparePriceEl.innerHTML = window.theme.formatMoney(comparePrice, theme.moneyFormat);
              }

              productPriceEl.innerHTML = price === 0 ? window.theme.strings.free : window.theme.formatMoney(price, theme.moneyFormat);
            });

            if (this.hasUnitPricing) {
              this.updateProductUnits(formState);
            }
          }

          updateProductUnits(formState) {
            const variant = formState.variant;
            const plan = formState.plan;
            let unitPrice = null;

            if (variant && variant.unit_price) {
              unitPrice = variant.unit_price;
            }
            if (plan && plan.allocation && plan.allocation.unit_price) {
              unitPrice = plan.allocation.unit_price;
            }

            if (unitPrice) {
              const base = this.getBaseUnit(variant);
              const formattedPrice = window.theme.formatMoney(unitPrice, theme.moneyFormat);
              this.container.querySelector(selectors$9.unitPrice).innerHTML = formattedPrice;
              this.container.querySelector(selectors$9.unitBase).innerHTML = base;
              this.container.querySelector(selectors$9.unitWrapper).classList.remove(classes$8.hidden);
            } else {
              this.container.querySelector(selectors$9.unitWrapper).classList.add(classes$8.hidden);
            }
          }

          updateSku(formState) {
            if (!this.skuWrapper) return;

            this.skuWrapper.innerHTML = `${theme.strings.sku}: ${formState.variant.sku}`;
          }

          fireHookEvent(formState) {
            const variant = formState.variant;
            this.container.dispatchEvent(
              new CustomEvent('theme:variant:change', {
                detail: {
                  variant: variant,
                },
                bubbles: true,
              })
            );
          }

          /**
           * Tracks aspects of the product state that are relevant to UI updates
           * @param {object} evt - variant change event
           * @return {object} productState - represents state of variant + plans
           *  productState.available - current variant and selling plan options result in valid offer
           *  productState.soldOut - variant is sold out
           *  productState.onSale - variant is on sale
           *  productState.showUnitPrice - variant has unit price
           *  productState.requiresPlan - all the product variants requires a selling plan
           *  productState.hasPlan - there is a valid selling plan
           *  productState.planSale - plan has a discount to show next to price
           *  productState.planPerDelivery - plan price does not equal per_delivery_price - a prepaid subscription
           */
          setProductState(dataset) {
            const variant = dataset.variant;
            const plan = dataset.plan;

            const productState = {
              available: true,
              soldOut: false,
              onSale: false,
              showUnitPrice: false,
              requiresPlan: false,
              hasPlan: false,
              planPerDelivery: false,
              planSale: false,
            };

            if (!variant || (variant.requires_selling_plan && !plan)) {
              productState.available = false;
            } else {
              if (!variant.available) {
                productState.soldOut = true;
              }

              if (variant.compare_at_price > variant.price) {
                productState.onSale = true;
              }

              if (variant.unit_price) {
                productState.showUnitPrice = true;
              }

              if (this.product && this.product.requires_selling_plan) {
                productState.requiresPlan = true;
              }

              if (plan && this.subPrices) {
                productState.hasPlan = true;
                if (plan.allocation.per_delivery_price !== plan.allocation.price) {
                  productState.planPerDelivery = true;
                }
                if (variant.price > plan.allocation.price) {
                  productState.planSale = true;
                }
              }
            }
            return productState;
          }

          updateProductImage(evt) {
            const variant = evt.dataset?.variant || evt.variant;

            if (variant) {
              // Update variant image, if one is set
              if (variant.featured_media) {
                const selectedImage = this.container.querySelector(`[${attributes$7.imageId}="${variant.featured_media.id}"]`);
                // If we have a mobile breakpoint or the tall layout is disabled,
                // just switch the slideshow.

                if (selectedImage) {
                  const selectedImageId = selectedImage.getAttribute(attributes$7.mediaId);
                  const isDesktopView = !window.theme.isMobile();

                  selectedImage.dispatchEvent(
                    new CustomEvent('theme:media:select', {
                      bubbles: true,
                      detail: {
                        id: selectedImageId,
                      },
                    })
                  );

                  if (isDesktopView && !this.productImages.hasAttribute(attributes$7.faderDesktop) && this.variantImageScroll) {
                    const selectedImageTop = selectedImage.getBoundingClientRect().top;

                    // Scroll to variant image
                    document.dispatchEvent(
                      new CustomEvent('theme:tooltip:close', {
                        bubbles: false,
                        detail: {
                          hideTransition: false,
                        },
                      })
                    );

                    window.theme.scrollTo(selectedImageTop);
                  }

                  if (!isDesktopView && !this.productImages.hasAttribute(attributes$7.faderMobile)) {
                    this.productMediaList.scrollTo({
                      left: selectedImage.offsetLeft,
                    });
                  }
                }
              }
            }
          }

          updateLegend(formState) {
            const variant = formState.variant;
            if (variant) {
              const optionValues = this.container.querySelectorAll(selectors$9.optionValue);
              if (optionValues.length) {
                optionValues.forEach((optionValue) => {
                  const selectorWrapper = optionValue.closest(selectors$9.optionPosition);
                  if (selectorWrapper) {
                    const optionPosition = selectorWrapper.getAttribute(attributes$7.optionPosition);
                    const optionIndex = parseInt(optionPosition, 10) - 1;
                    const selectedOptionValue = variant.options[optionIndex];
                    optionValue.innerHTML = selectedOptionValue;
                  }
                });
              }
            }
          }
        }
      );
    }

    function fetchProduct(handle) {
      const requestRoute = `${window.theme.routes.root}products/${handle}.js`;

      return window
        .fetch(requestRoute)
        .then((response) => {
          return response.json();
        })
        .catch((e) => {
          console.error(e);
        });
    }

    const selectors$8 = {
      gridSwatchFieldset: '[data-grid-swatch-fieldset]',
      input: '[data-swatch-input]',
      productItem: '[data-grid-item]',
      productInfo: '[data-product-information]',
      sectionId: '[data-section-id]',
      productImage: '[data-product-image]',
      swatchButton: '[data-swatch-button]',
      swatchLink: '[data-swatch-link]',
      swatchText: '[data-swatch-text]',
      template: '[data-swatch-template]',
      nativeScrollbar: 'native-scrollbar',
    };

    const classes$7 = {
      visible: 'is-visible',
      hidden: 'hidden',
      stopEvents: 'no-events',
      swatch: 'swatch',
    };

    const attributes$6 = {
      image: 'data-swatch-image',
      handle: 'data-swatch-handle',
      label: 'data-swatch-label',
      scrollbar: 'data-scrollbar',
      swatchCount: 'data-swatch-count',
      variant: 'data-swatch-variant',
      variantName: 'data-swatch-variant-name',
      variantTitle: 'data-variant-title',
      swatchValues: 'data-swatch-values',
    };

    class GridSwatch extends HTMLElement {
      constructor() {
        super();

        this.productItemMouseLeaveEvent = () => this.hideVariantImages();
        this.showVariantImageEvent = (swatchButton) => this.showVariantImage(swatchButton);
      }

      connectedCallback() {
        this.handle = this.getAttribute(attributes$6.handle);
        this.nativeScrollbar = this.closest(selectors$8.nativeScrollbar);
        this.productItem = this.closest(selectors$8.productItem);
        this.productInfo = this.closest(selectors$8.productInfo);
        this.productImage = this.productItem.querySelector(selectors$8.productImage);
        this.template = document.querySelector(selectors$8.template).innerHTML;
        this.swatchesJSON = this.getSwatchesJSON();
        this.swatchesStyle = theme.settings.collectionSwatchStyle;

        const label = this.getAttribute(attributes$6.label).trim().toLowerCase();

        fetchProduct(this.handle).then((product) => {
          this.product = product;
          this.colorOption = product.options.find(function (element) {
            return element.name.toLowerCase() === label || null;
          });

          if (this.colorOption) {
            this.init();
          }
        });
      }

      init() {
        this.innerHTML = '';
        this.count = 0;
        this.limitedCount = 0;
        this.swatches = this.colorOption.values;
        this.swatchesCount = 0;

        this.swatches.forEach((swatch) => {
          let variant = null;
          let variantAvailable = false;
          let image = '';

          for (const productVariant of this.product.variants) {
            const optionWithSwatch = productVariant.options.includes(swatch);

            if (!variant && optionWithSwatch) {
              variant = productVariant;
            }

            // Use a variant with image if exists
            if (optionWithSwatch && productVariant.featured_media) {
              image = productVariant.featured_media.preview_image.src;
              variant = productVariant;
              break;
            }
          }

          for (const productVariant of this.product.variants) {
            const optionWithSwatch = productVariant.options.includes(swatch);

            if (optionWithSwatch && productVariant.available) {
              variantAvailable = true;
              break;
            }
          }

          if (variant) {
            const swatchTemplate = document.createElement('div');
            swatchTemplate.innerHTML = this.template;
            const swatchButton = swatchTemplate.querySelector(selectors$8.swatchButton);
            const swatchLink = swatchTemplate.querySelector(selectors$8.swatchLink);
            const swatchText = swatchTemplate.querySelector(selectors$8.swatchText);
            const swatchHandle = this.swatchesJSON[swatch];
            const swatchStyle = theme.settings.swatchesType == 'native' ? swatchHandle : `var(--${swatchHandle})`;
            const variantTitle = variant.title.replaceAll('"', "'");

            swatchButton.style = `--animation-delay: ${(100 * this.count) / 1250}s`;
            swatchButton.classList.add(`${classes$7.swatch}-${swatchHandle}`);
            swatchButton.dataset.tooltip = swatch;
            swatchButton.dataset.swatchVariant = variant.id;
            swatchButton.dataset.swatchVariantName = variantTitle;
            swatchButton.dataset.swatchImage = image;
            swatchButton.dataset.variant = variant.id;
            swatchButton.style.setProperty('--swatch', swatchStyle);
            swatchLink.href = getUrlWithVariant(this.product.url, variant.id);
            swatchLink.dataset.swatch = swatch;
            swatchLink.disabled = !variantAvailable;
            swatchText.innerText = swatch;

            if (this.swatchesStyle != 'limited') {
              this.innerHTML += swatchTemplate.innerHTML;
            } else if (this.count <= 4) {
              this.innerHTML += swatchTemplate.innerHTML;
              this.limitedCount++;
            }
            this.count++;
          }
          this.swatchesCount++;

          if (this.swatchesCount == this.swatches.length) {
            this.nativeScrollbar?.dispatchEvent(new Event('theme:swatches:loaded'));
          }
        });

        this.swatchCount = this.productInfo.querySelector(`[${attributes$6.swatchCount}]`);
        this.swatchElements = this.querySelectorAll(selectors$8.swatchLink);
        this.swatchFieldset = this.productInfo.querySelector(selectors$8.gridSwatchFieldset);
        this.hideSwatchesTimer = 0;

        if (this.swatchCount.hasAttribute(attributes$6.swatchCount)) {
          if (this.swatchesStyle == 'text' || this.swatchesStyle == 'text-slider') {
            this.swatchCount.innerText = `${this.count} ${this.count > 1 ? theme.strings.otherColor : theme.strings.oneColor}`;

            if (this.swatchesStyle == 'text') return;

            this.swatchCount.addEventListener('mouseenter', () => {
              if (this.hideSwatchesTimer) clearTimeout(this.hideSwatchesTimer);

              this.productInfo.classList.add(classes$7.stopEvents);
              this.swatchFieldset.classList.add(classes$7.visible);
            });

            // Prevent color swatches blinking on mouse move
            this.productInfo.addEventListener('mouseleave', () => {
              this.hideSwatchesTimer = setTimeout(() => {
                this.productInfo.classList.remove(classes$7.stopEvents);
                this.swatchFieldset.classList.remove(classes$7.visible);
              }, 100);
            });
          }

          if (this.swatchesStyle == 'slider' || this.swatchesStyle == 'grid') {
            this.swatchFieldset.classList.add(classes$7.visible);
          }

          if (this.swatchesStyle == 'limited') {
            const swatchesLeft = this.count - this.limitedCount;

            this.swatchFieldset.classList.add(classes$7.visible);

            if (swatchesLeft > 0) {
              this.innerHTML += `<div class="swatch-limited">+${swatchesLeft}</div>`;
            }
          }
        }

        this.bindSwatchButtonEvents();
      }

      bindSwatchButtonEvents() {
        this.querySelectorAll(selectors$8.swatchButton)?.forEach((swatchButton) => {
          // Show variant image when hover on color swatch
          swatchButton.addEventListener('mouseenter', this.showVariantImageEvent);
        });

        this.productItem.addEventListener('mouseleave', this.productItemMouseLeaveEvent);
      }

      showVariantImage(event) {
        const swatchButton = event.target;
        const variantName = swatchButton.getAttribute(attributes$6.variantName)?.replaceAll('"', "'");
        const variantImages = this.productImage.querySelectorAll(`[${attributes$6.variantTitle}]`);
        const variantImageSelected = this.productImage.querySelector(`[${attributes$6.variantTitle}="${variantName}"]`);

        // Hide all variant images
        variantImages?.forEach((image) => {
          image.classList.remove(classes$7.visible);
        });

        // Show selected variant image
        variantImageSelected?.classList.add(classes$7.visible);
      }

      hideVariantImages() {
        // Hide all variant images
        this.productImage.querySelectorAll(`[${attributes$6.variantTitle}].${classes$7.visible}`)?.forEach((image) => {
          image.classList.remove(classes$7.visible);
        });
      }

      getSwatchesJSON() {
        if (!this.hasAttribute(attributes$6.swatchValues)) return {};

        // Splitting the string by commas to get individual key-value pairs
        const pairs = this.getAttribute(attributes$6.swatchValues).split(',');

        // Creating an empty object to store the key-value pairs
        const jsonObject = {};

        // Iterating through the pairs and constructing the JSON object
        pairs?.forEach((pair) => {
          const [key, value] = pair.split(':');
          jsonObject[key.trim()] = value.trim();
        });

        return jsonObject;
      }
    }

    const selectors$7 = {
      flickityButton: '.flickity-prev-next-button',
      productLink: '[data-product-link]',
      slide: '[data-hover-slide]',
      slideTouch: '[data-hover-slide-touch]',
      slider: '[data-hover-slider]',
      video: 'video',
      vimeo: '[data-host="vimeo"]',
      youtube: '[data-host="youtube"]',
    };

    class HoverImages extends HTMLElement {
      constructor() {
        super();

        this.flkty = null;
        this.slider = this.querySelector(selectors$7.slider);
        this.handleScroll = this.handleScroll.bind(this);
        this.hovered = false;

        this.mouseEnterEvent = () => this.mouseEnterActions();
        this.mouseLeaveEvent = () => this.mouseLeaveActions();

        this.addEventListener('mouseenter', this.mouseEnterEvent);
        this.addEventListener('mouseleave', this.mouseLeaveEvent);
      }

      connectedCallback() {
        if (window.theme.touch) {
          this.initTouch();
        } else {
          this.initFlickity();
        }
      }

      disconnectedCallback() {
        if (this.flkty) {
          this.flkty.options.watchCSS = false;
          this.flkty.destroy();
        }

        this.removeEventListener('mouseenter', this.mouseEnterEvent);
        this.removeEventListener('mouseleave', this.mouseLeaveEvent);
      }

      initTouch() {
        this.style.setProperty('--slides-count', this.querySelectorAll(selectors$7.slideTouch).length);
        this.slider.addEventListener('scroll', this.handleScroll);
      }

      handleScroll() {
        const slideIndex = this.slider.scrollLeft / this.slider.clientWidth;
        this.style.setProperty('--slider-index', slideIndex);
      }

      initFlickity() {
        if (this.querySelectorAll(selectors$7.slide).length < 2) return;

        this.flkty = new window.theme.Flickity(this.slider, {
          cellSelector: selectors$7.slide,
          contain: true,
          wrapAround: true,
          watchCSS: true,
          autoPlay: false,
          draggable: false,
          pageDots: false,
          prevNextButtons: true,
        });

        this.flkty.pausePlayer();

        this.addEventListener('mouseenter', () => {
          this.flkty.unpausePlayer();
        });

        this.addEventListener('mouseleave', () => {
          this.flkty.pausePlayer();
        });

        // Prevent page redirect on Flickity arrow click
        this.closest(selectors$7.productLink).addEventListener('click', (e) => {
          if (e.target.matches(selectors$7.flickityButton)) {
            e.preventDefault();
          }
        });
      }

      mouseEnterActions() {
        this.hovered = true;

        this.videoActions();
      }

      mouseLeaveActions() {
        this.hovered = false;

        this.videoActions();
      }

      videoActions() {
        const youtube = this.querySelector(selectors$7.youtube);
        const vimeo = this.querySelector(selectors$7.vimeo);
        const mediaExternal = youtube || vimeo;
        const mediaNative = this.querySelector(selectors$7.video);

        if (mediaExternal) {
          let action = this.hovered ? 'playVideo' : 'pauseVideo';
          let string = `{"event":"command","func":"${action}","args":""}`;

          if (vimeo) {
            action = this.hovered ? 'play' : 'pause';
            string = `{"method":"${action}"}`;
          }

          mediaExternal.contentWindow.postMessage(string, '*');

          mediaExternal.addEventListener('load', (e) => {
            // Call videoActions() again when iframe is loaded to prevent autoplay being triggered if it loads after the "mouseleave" event
            this.videoActions();
          });
        } else if (mediaNative) {
          if (this.hovered) {
            mediaNative.play();
          } else {
            mediaNative.pause();
          }
        }
      }
    }

    const classes$6 = {
      added: 'is-added',
      animated: 'is-animated',
      disabled: 'is-disabled',
      error: 'has-error',
      loading: 'is-loading',
      open: 'is-open',
      overlayText: 'product-item--overlay-text',
      visible: 'is-visible',
      siblingLinkCurrent: 'sibling__link--current',
    };

    const settings = {
      errorDelay: 3000,
    };

    const selectors$6 = {
      animation: '[data-animation]',
      apiContent: '[data-api-content]',
      buttonQuickAdd: '[data-quick-add-btn]',
      buttonAddToCart: '[data-add-to-cart]',
      cartDrawer: 'cart-drawer',
      cartPage: '[data-cart-page]',
      cartLineItems: '[data-line-items]',
      dialog: 'dialog',
      focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
      messageError: '[data-message-error]',
      modalButton: '[data-quick-add-modal-handle]',
      modalContainer: '[data-product-upsell-container]',
      modalContent: '[data-product-upsell-ajax]',
      modalClose: '[data-quick-add-modal-close]',
      productGridItem: 'data-grid-item',
      productInformationHolder: '[data-product-information]',
      quickAddHolder: '[data-quick-add-holder]',
      quickAddModal: '[data-quick-add-modal]',
      quickAddModalTemplate: '[data-quick-add-modal-template]',
      tooltip: '[data-tooltip]',
    };

    const attributes$5 = {
      closing: 'closing',
      productId: 'data-product-id',
      modalHandle: 'data-quick-add-modal-handle',
      siblingSwapper: 'data-sibling-swapper',
      quickAddHolder: 'data-quick-add-holder',
    };

    class QuickAddProduct extends HTMLElement {
      constructor() {
        super();

        this.quickAddHolder = this.querySelector(selectors$6.quickAddHolder);

        if (this.quickAddHolder) {
          this.modal = null;
          this.currentModal = null;
          this.productId = this.quickAddHolder.getAttribute(attributes$5.quickAddHolder);
          this.modalButton = this.quickAddHolder.querySelector(selectors$6.modalButton);
          this.handle = this.modalButton?.getAttribute(attributes$5.modalHandle);
          this.buttonQuickAdd = this.quickAddHolder.querySelector(selectors$6.buttonQuickAdd);
          this.buttonATC = this.quickAddHolder.querySelector(selectors$6.buttonAddToCart);
          this.button = this.modalButton || this.buttonATC;
          this.modalClose = this.modalClose.bind(this);
          this.modalCloseOnProductAdded = this.modalCloseOnProductAdded.bind(this);
          this.a11y = window.theme.a11y;
          this.isAnimating = false;

          this.modalButtonClickEvent = this.modalButtonClickEvent.bind(this);
          this.quickAddLoadingToggle = this.quickAddLoadingToggle.bind(this);
        }
      }

      connectedCallback() {
        /**
         * Modal button works for multiple variants products
         */
        if (this.modalButton) {
          this.modalButton.addEventListener('click', this.modalButtonClickEvent);
        }

        /**
         * Quick add button works for single variant products
         */
        if (this.buttonATC) {
          this.buttonATC.addEventListener('click', (e) => {
            e.preventDefault();

            window.a11y.lastElement = this.buttonATC;

            document.dispatchEvent(
              new CustomEvent('theme:cart:add', {
                detail: {
                  button: this.buttonATC,
                },
              })
            );
          });
        }

        if (this.quickAddHolder) {
          this.quickAddHolder.addEventListener('animationend', this.quickAddLoadingToggle);
          this.errorHandler();
        }
      }

      modalButtonClickEvent(e) {
        e.preventDefault();

        const isSiblingSwapper = this.modalButton.hasAttribute(attributes$5.siblingSwapper);
        const isSiblingLinkCurrent = this.modalButton.classList.contains(classes$6.siblingLinkCurrent);

        if (isSiblingLinkCurrent) return;

        this.modalButton.classList.add(classes$6.loading);
        this.modalButton.disabled = true;

        // Siblings product modal swapper
        if (isSiblingSwapper && !isSiblingLinkCurrent) {
          this.currentModal = e.target.closest(selectors$6.quickAddModal);
          this.currentModal.classList.add(classes$6.loading);
        }

        this.renderModal();
      }

      modalCreate(response) {
        const cachedModal = document.querySelector(`${selectors$6.quickAddModal}[${attributes$5.productId}="${this.productId}"]`);

        if (cachedModal) {
          this.modal = cachedModal;
          this.modalOpen();
        } else {
          const modalTemplate = this.quickAddHolder.querySelector(selectors$6.quickAddModalTemplate);
          if (!modalTemplate) return;

          const htmlObject = document.createElement('div');
          htmlObject.innerHTML = modalTemplate.innerHTML;

          // Add dialog to the body
          document.body.appendChild(htmlObject.querySelector(selectors$6.quickAddModal));
          modalTemplate.remove();

          this.modal = document.querySelector(`${selectors$6.quickAddModal}[${attributes$5.productId}="${this.productId}"]`);
          this.modal.querySelector(selectors$6.modalContent).innerHTML = new DOMParser().parseFromString(response, 'text/html').querySelector(selectors$6.apiContent).innerHTML;

          this.modalCreatedCallback();
        }
      }

      modalOpen() {
        if (this.currentModal) {
          this.currentModal.dispatchEvent(new CustomEvent('theme:modal:close', {bubbles: false}));
        }

        // Check if browser supports Dialog tags
        if (typeof this.modal.show === 'function') {
          this.modal.show();
        }

        this.modal.setAttribute('open', true);
        this.modal.removeAttribute('inert');

        this.quickAddHolder.classList.add(classes$6.disabled);

        if (this.modalButton) {
          this.modalButton.classList.remove(classes$6.loading);
          this.modalButton.disabled = false;
          window.a11y.lastElement = this.modalButton;
        }

        // Animate items
        requestAnimationFrame(() => {
          this.modal.querySelectorAll(selectors$6.animation).forEach((item) => {
            item.classList.add(classes$6.animated);
          });
        });

        document.dispatchEvent(new CustomEvent('theme:quick-add:open', {bubbles: true}));
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
        document.addEventListener('theme:product:added', this.modalCloseOnProductAdded, {once: true});
      }

      modalClose() {
        if (this.isAnimating) {
          return;
        }

        if (!this.modal.hasAttribute(attributes$5.closing)) {
          this.modal.setAttribute(attributes$5.closing, '');
          this.isAnimating = true;
          return;
        }

        // Check if browser supports Dialog tags
        if (typeof this.modal.close === 'function') {
          this.modal.close();
        } else {
          this.modal.removeAttribute('open');
        }

        this.modal.removeAttribute(attributes$5.closing);
        this.modal.setAttribute('inert', '');
        this.modal.classList.remove(classes$6.loading);

        if (this.modalButton) {
          this.modalButton.disabled = false;
        }

        if (this.quickAddHolder && this.quickAddHolder.classList.contains(classes$6.disabled)) {
          this.quickAddHolder.classList.remove(classes$6.disabled);
        }

        this.resetAnimatedItems();

        // Unlock scroll if no other drawers & modals are open
        if (!window.theme.hasOpenModals()) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }

        document.removeEventListener('theme:product:added', this.modalCloseOnProductAdded);

        this.a11y.removeTrapFocus();
        this.a11y.autoFocusLastElement();
      }

      modalEvents() {
        // Close button click event
        this.modal.querySelector(selectors$6.modalClose)?.addEventListener('click', (e) => {
          e.preventDefault();
          this.modalClose();
        });

        // Close dialog on click outside content
        this.modal.addEventListener('click', (event) => {
          if (event.target.nodeName === 'DIALOG' && event.type === 'click') {
            this.modalClose();
          }
        });

        // Close dialog on click ESC key pressed
        this.modal.addEventListener('keydown', (event) => {
          if (event.code == 'Escape') {
            event.preventDefault();
            this.modalClose();
          }
        });

        this.modal.addEventListener('theme:modal:close', () => {
          this.modalClose();
        });

        // Close dialog after animation completes
        this.modal.addEventListener('animationend', (event) => {
          if (event.target !== this.modal) return;
          this.isAnimating = false;

          if (this.modal.hasAttribute(attributes$5.closing)) {
            this.modalClose();
          } else {
            setTimeout(() => {
              this.a11y.trapFocus(this.modal);
              const focusTarget = this.modal.querySelector('[autofocus]') || this.modal.querySelector(selectors$6.focusable);
              focusTarget?.focus();
            }, 50);
          }
        });
      }

      modalCloseOnProductAdded() {
        this.resetQuickAddButtons();
        if (this.modal && this.modal.hasAttribute('open')) {
          this.modalClose();
        }
      }

      quickAddLoadingToggle(e) {
        if (e.target != this.quickAddHolder) return;

        this.quickAddHolder.classList.remove(classes$6.disabled);
      }

      /**
       * Handle error cart response
       */
      errorHandler() {
        this.quickAddHolder.addEventListener('theme:cart:error', (event) => {
          const holder = event.detail.holder;
          const parentProduct = holder.closest(`[${selectors$6.productGridItem}]`);
          if (!parentProduct) return;

          const errorMessageHolder = holder.querySelector(selectors$6.messageError);
          const hasOverlayText = parentProduct.classList.contains(classes$6.overlayText);
          const productInfo = parentProduct.querySelector(selectors$6.productInformationHolder);
          const button = holder.querySelector(selectors$6.buttonAddToCart);

          if (button) {
            button.classList.remove(classes$6.added, classes$6.loading);
            holder.classList.add(classes$6.error);
          }

          if (errorMessageHolder) {
            errorMessageHolder.innerText = event.detail.description;
          }

          if (hasOverlayText) {
            productInfo.classList.add(classes$6.hidden);
          }

          setTimeout(() => {
            this.resetQuickAddButtons();

            if (hasOverlayText) {
              productInfo.classList.remove(classes$6.hidden);
            }
          }, settings.errorDelay);
        });
      }

      /**
       * Reset buttons to default states
       */
      resetQuickAddButtons() {
        if (this.quickAddHolder) {
          this.quickAddHolder.classList.remove(classes$6.visible, classes$6.error);
        }

        if (this.buttonQuickAdd) {
          this.buttonQuickAdd.classList.remove(classes$6.added);
          this.buttonQuickAdd.disabled = false;
        }
      }

      renderModal() {
        if (this.modal) {
          this.modalOpen();
        } else {
          window
            .fetch(`${window.theme.routes.root}products/${this.handle}?section_id=api-product-upsell`)
            .then(this.upsellErrorsHandler)
            .then((response) => {
              return response.text();
            })
            .then((response) => {
              this.modalCreate(response);
            });
        }
      }

      modalCreatedCallback() {
        this.modalEvents();
        this.modalOpen();

        wrapElements(this.modal);
      }

      upsellErrorsHandler(response) {
        if (!response.ok) {
          return response.json().then(function (json) {
            const e = new FetchError({
              status: response.statusText,
              headers: response.headers,
              json: json,
            });
            throw e;
          });
        }
        return response;
      }

      resetAnimatedItems() {
        this.modal?.querySelectorAll(selectors$6.animation).forEach((item) => {
          item.classList.remove(classes$6.animated);
        });
      }
    }

    if (!customElements.get('quick-add-product')) {
      customElements.define('quick-add-product', QuickAddProduct);
    }

    if (!customElements.get('grid-swatch')) {
      customElements.define('grid-swatch', GridSwatch);
    }

    if (!customElements.get('hover-images')) {
      customElements.define('hover-images', HoverImages);
    }

    const selectors$5 = {
      buttonArrow: '[data-button-arrow]',
      deferredMediaButton: '[data-deferred-media-button]',
      focusedElement: 'model-viewer, video, iframe, button, [href], input, [tabindex]',
      productMedia: '[data-image-id]',
      productMediaList: '[data-product-media-list]',
      section: '[data-section-type]',
    };

    const classes$5 = {
      arrows: 'slider__arrows',
      dragging: 'is-dragging',
      hidden: 'hidden',
      isFocused: 'is-focused',
      mediaActive: 'media--active',
      mediaHidden: 'media--hidden',
      mediaHiding: 'media--hiding',
    };

    const attributes$4 = {
      activeMedia: 'data-active-media',
      buttonPrev: 'data-button-prev',
      buttonNext: 'data-button-next',
      imageId: 'data-image-id',
      mediaId: 'data-media-id',
      type: 'data-type',
      faderDesktop: 'data-fader-desktop',
      faderMobile: 'data-fader-mobile',
    };

    if (!customElements.get('product-images')) {
      customElements.define(
        'product-images',
        class ProductImages extends HTMLElement {
          constructor() {
            super();

            this.initialized = false;
            this.buttons = false;
            this.isDown = false;
            this.startX = 0;
            this.startY = 0;
            this.scrollLeft = 0;
            this.onButtonArrowClick = (e) => this.buttonArrowClickEvent(e);
            this.container = this.closest(selectors$5.section);
            this.handleMouseDown = this.handleMouseDown.bind(this);
            this.handleMouseLeave = this.handleMouseLeave.bind(this);
            this.handleMouseUp = this.handleMouseUp.bind(this);
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.handleKeyUp = this.handleKeyUp.bind(this);
            this.productMediaItems = this.querySelectorAll(selectors$5.productMedia);
            this.productMediaList = this.querySelector(selectors$5.productMediaList);
            this.setHeight = this.setHeight.bind(this);
            this.toggleEvents = this.toggleEvents.bind(this);
            this.selectMediaEvent = (e) => this.showMediaOnVariantSelect(e);
          }

          connectedCallback() {
            if (Object.keys(this.productMediaItems).length === 1) return;

            this.productMediaObserver();
            this.toggleEvents();
            this.listen();
            this.setHeight();
          }

          disconnectedCallback() {
            this.unlisten();
          }

          listen() {
            document.addEventListener('theme:resize:width', this.toggleEvents);
            document.addEventListener('theme:resize:width', this.setHeight);
            this.addEventListener('theme:media:select', this.selectMediaEvent);
          }

          unlisten() {
            document.removeEventListener('theme:resize:width', this.toggleEvents);
            document.removeEventListener('theme:resize:width', this.setHeight);
            this.removeEventListener('theme:media:select', this.selectMediaEvent);
          }

          toggleEvents() {
            const isMobileView = window.theme.isMobile();

            if ((isMobileView && this.hasAttribute(attributes$4.faderMobile)) || (!isMobileView && this.hasAttribute(attributes$4.faderDesktop))) {
              this.bindEventListeners();
            } else {
              this.unbindEventListeners();
            }
          }

          bindEventListeners() {
            if (this.initialized) return;

            this.productMediaList.addEventListener('mousedown', this.handleMouseDown);
            this.productMediaList.addEventListener('mouseleave', this.handleMouseLeave);
            this.productMediaList.addEventListener('mouseup', this.handleMouseUp);
            this.productMediaList.addEventListener('mousemove', this.handleMouseMove);
            this.productMediaList.addEventListener('touchstart', this.handleMouseDown, {passive: true});
            this.productMediaList.addEventListener('touchend', this.handleMouseUp, {passive: true});
            this.productMediaList.addEventListener('touchmove', this.handleMouseMove, {passive: true});
            this.productMediaList.addEventListener('keyup', this.handleKeyUp);
            this.initArrows();
            this.resetScrollPosition();

            this.initialized = true;
          }

          unbindEventListeners() {
            if (!this.initialized) return;

            this.productMediaList.removeEventListener('mousedown', this.handleMouseDown);
            this.productMediaList.removeEventListener('mouseleave', this.handleMouseLeave);
            this.productMediaList.removeEventListener('mouseup', this.handleMouseUp);
            this.productMediaList.removeEventListener('mousemove', this.handleMouseMove);
            this.productMediaList.removeEventListener('touchstart', this.handleMouseDown);
            this.productMediaList.removeEventListener('touchend', this.handleMouseUp);
            this.productMediaList.removeEventListener('touchmove', this.handleMouseMove);
            this.productMediaList.removeEventListener('keyup', this.handleKeyUp);
            this.removeArrows();

            this.initialized = false;
          }

          handleMouseDown(e) {
            this.isDown = true;
            this.startX = (e.pageX || e.changedTouches[0].screenX) - this.offsetLeft;
            this.startY = (e.pageY || e.changedTouches[0].screenY) - this.offsetTop;
          }

          handleMouseLeave() {
            if (!this.isDown) return;
            this.isDown = false;
          }

          handleMouseUp(e) {
            const x = (e.pageX || e.changedTouches[0].screenX) - this.offsetLeft;
            const y = (e.pageY || e.changedTouches[0].screenY) - this.offsetTop;
            const distanceX = x - this.startX;
            const distanceY = y - this.startY;
            const direction = distanceX > 0 ? 1 : -1;
            const isImage = this.getCurrentMedia().hasAttribute(attributes$4.type) && this.getCurrentMedia().getAttribute(attributes$4.type) === 'image';

            if (Math.abs(distanceX) > 10 && Math.abs(distanceX) > Math.abs(distanceY) && isImage) {
              direction < 0 ? this.showNextImage() : this.showPreviousImage();
            }

            this.isDown = false;

            requestAnimationFrame(() => {
              this.classList.remove(classes$5.dragging);
            });
          }

          handleMouseMove() {
            if (!this.isDown) return;

            this.classList.add(classes$5.dragging);
          }

          handleKeyUp(e) {
            if (e.code === 'ArrowLeft') {
              this.showPreviousImage();
            }

            if (e.code === 'ArrowRight') {
              this.showNextImage();
            }
          }

          handleArrowsClickEvent() {
            this.querySelectorAll(selectors$5.buttonArrow)?.forEach((button) => {
              button.addEventListener('click', (e) => {
                e.preventDefault();

                if (e.target.hasAttribute(attributes$4.buttonPrev)) {
                  this.showPreviousImage();
                }

                if (e.target.hasAttribute(attributes$4.buttonNext)) {
                  this.showNextImage();
                }
              });
            });
          }

          // When changing from Mobile do Desktop view
          resetScrollPosition() {
            if (this.productMediaList.scrollLeft !== 0) {
              this.productMediaList.scrollLeft = 0;
            }
          }

          initArrows() {
            // Create arrow buttons if don't exist
            if (!this.buttons.length) {
              const buttonsWrap = document.createElement('div');
              buttonsWrap.classList.add(classes$5.arrows);
              buttonsWrap.innerHTML = theme.sliderArrows.prev + theme.sliderArrows.next;

              // Append buttons outside the slider element
              this.productMediaList.append(buttonsWrap);
              this.buttons = this.querySelectorAll(selectors$5.buttonArrow);
              this.buttonPrev = this.querySelector(`[${attributes$4.buttonPrev}]`);
              this.buttonNext = this.querySelector(`[${attributes$4.buttonNext}]`);
            }

            this.handleArrowsClickEvent();
            this.preloadImageOnArrowHover();
          }

          removeArrows() {
            this.querySelector(`.${classes$5.arrows}`)?.remove();
          }

          preloadImageOnArrowHover() {
            this.buttonPrev?.addEventListener('mouseover', () => {
              const id = this.getPreviousMediaId();
              this.preloadImage(id);
            });

            this.buttonNext?.addEventListener('mouseover', () => {
              const id = this.getNextMediaId();
              this.preloadImage(id);
            });
          }

          preloadImage(id) {
            this.querySelector(`[${attributes$4.mediaId}="${id}"] img`)?.setAttribute('loading', 'eager');
          }

          showMediaOnVariantSelect(e) {
            const id = e.detail.id;
            this.setActiveMedia(id);
          }

          getCurrentMedia() {
            return this.querySelector(`${selectors$5.productMedia}.${classes$5.mediaActive}`);
          }

          getNextMediaId() {
            const currentMedia = this.getCurrentMedia();
            const nextMedia = currentMedia?.nextElementSibling.hasAttribute(attributes$4.imageId) ? currentMedia?.nextElementSibling : this.querySelector(selectors$5.productMedia);

            return nextMedia?.getAttribute(attributes$4.mediaId);
          }

          getPreviousMediaId() {
            const currentMedia = this.getCurrentMedia();
            const lastIndex = this.productMediaItems.length - 1;
            const previousMedia = currentMedia?.previousElementSibling || this.productMediaItems[lastIndex];

            return previousMedia?.getAttribute(attributes$4.mediaId);
          }

          showNextImage() {
            const id = this.getNextMediaId();
            this.selectMedia(id);
          }

          showPreviousImage() {
            const id = this.getPreviousMediaId();
            this.selectMedia(id);
          }

          selectMedia(id) {
            this.dispatchEvent(
              new CustomEvent('theme:media:select', {
                detail: {
                  id: id,
                },
              })
            );
          }

          setActiveMedia(id) {
            if (!id) return;

            this.setAttribute(attributes$4.activeMedia, id);

            const activeImage = this.querySelector(`${selectors$5.productMedia}.${classes$5.mediaActive}`);
            const selectedImage = this.querySelector(`[${attributes$4.mediaId}="${id}"]`);
            const selectedImageFocus = selectedImage?.querySelector(selectors$5.focusedElement);
            const deferredMedia = selectedImage.querySelector('deferred-media');

            activeImage?.classList.add(classes$5.mediaHiding);
            activeImage?.classList.remove(classes$5.mediaActive);

            selectedImage?.classList.remove(classes$5.mediaHiding, classes$5.mediaHidden);
            selectedImage?.classList.add(classes$5.mediaActive);

            // Force media loading if slide becomes visible
            if (deferredMedia && deferredMedia.getAttribute('loaded') !== true) {
              selectedImage.querySelector(selectors$5.deferredMediaButton)?.dispatchEvent(new Event('click', {bubbles: false}));
            }

            requestAnimationFrame(() => {
              this.setHeight();

              // Move focus to the selected media
              if (document.body.classList.contains(classes$5.isFocused)) {
                selectedImageFocus?.focus();
              }
            });
          }

          // Set current product image height variable to product images container
          setHeight() {
            const mediaHeight = this.querySelector(`${selectors$5.productMedia}.${classes$5.mediaActive}`)?.offsetHeight || this.productMediaItems[0]?.offsetHeight;
            this.style.setProperty('--height', `${mediaHeight}px`);
          }

          productMediaObserver() {
            this.productMediaItems.forEach((media) => {
              media.addEventListener('transitionend', (e) => {
                if (e.target == media && media.classList.contains(classes$5.mediaHiding)) {
                  media.classList.remove(classes$5.mediaHiding);
                  media.classList.add(classes$5.mediaHidden);
                }
              });
              media.addEventListener('transitioncancel', (e) => {
                if (e.target == media && media.classList.contains(classes$5.mediaHiding)) {
                  media.classList.remove(classes$5.mediaHiding);
                  media.classList.add(classes$5.mediaHidden);
                }
              });
            });
          }
        }
      );
    }

    /**
     * Adds a Shopify size attribute to a URL
     *
     * @param src
     * @param size
     * @returns {*}
     */
    function getSizedImageUrl(src, size) {
      if (size === null) {
        return src;
      }

      if (size === 'master') {
        return removeProtocol(src);
      }

      const match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);

      if (match) {
        const prefix = src.split(match[0]);
        const suffix = match[0];

        return removeProtocol(`${prefix[0]}_${size}${suffix}`);
      } else {
        return null;
      }
    }

    function removeProtocol(path) {
      return path.replace(/http(s)?:/, '');
    }

    const selectors$4 = {
      productCutline: '[data-product-cutline]',
      productLink: '[data-product-link]',
      productGridItem: '[data-grid-item]',
      productInfo: '[data-product-information]',
      productImage: '[data-product-image-default]',
      productImageSibling: '[data-product-image-sibling]',
      productPrice: '[data-product-price]',
      siblingCount: '[data-sibling-count]',
      siblingFieldset: '[data-sibling-fieldset]',
      siblingLink: '[data-sibling-link]',
    };

    const classes$4 = {
      visible: 'is-visible',
      fade: 'is-fade',
      stopEvents: 'no-events',
      active: 'is-active',
    };

    const attributes$3 = {
      siblingAddedImage: 'data-sibling-added-image',
      siblingCutline: 'data-sibling-cutline',
      siblingImage: 'data-sibling-image',
      siblingLink: 'data-sibling-link',
      siblingPrice: 'data-sibling-price',
      productLink: 'data-product-link',
    };

    class SiblingSwatches {
      constructor(swatches, product) {
        this.swatches = swatches;
        this.product = product;
        this.productLinks = this.product.querySelectorAll(selectors$4.productLink);
        this.productCutline = this.product.querySelector(selectors$4.productCutline);
        this.productPrice = this.product.querySelector(selectors$4.productPrice);
        this.productImage = this.product.querySelector(selectors$4.productImage);
        this.productImageSibling = this.product.querySelector(selectors$4.productImageSibling);

        this.init();
      }

      init() {
        this.cacheDefaultValues();

        this.product.addEventListener('mouseleave', () => this.resetProductValues());

        this.swatches.forEach((swatch) => {
          swatch.addEventListener('mouseenter', (event) => this.showSibling(event));
        });

        if (this.productLinks.length) {
          this.swatches.forEach((swatch) => {
            swatch.addEventListener('click', () => {
              this.productLinks[0].click();
            });
          });
        }
      }

      cacheDefaultValues() {
        this.productLinkValue = this.productLinks[0].hasAttribute(attributes$3.productLink) ? this.productLinks[0].getAttribute(attributes$3.productLink) : '';
        this.productPriceValue = this.productPrice.innerHTML;

        if (this.productCutline) {
          this.productCutlineValue = this.productCutline.innerHTML;
        }
      }

      resetProductValues() {
        this.product.classList.remove(classes$4.active);

        if (this.productLinkValue) {
          this.productLinks.forEach((productLink) => {
            productLink.href = this.productLinkValue;
          });
        }

        if (this.productPrice) {
          this.productPrice.innerHTML = this.productPriceValue;
        }

        if (this.productCutline && this.productCutline) {
          this.productCutline.innerHTML = this.productCutlineValue;
          this.productCutline.title = this.productCutlineValue;
        }

        this.hideSiblingImage();
      }

      showSibling(event) {
        const swatch = event.target;
        const siblingLink = swatch.hasAttribute(attributes$3.siblingLink) ? swatch.getAttribute(attributes$3.siblingLink) : '';
        const siblingPrice = swatch.hasAttribute(attributes$3.siblingPrice) ? swatch.getAttribute(attributes$3.siblingPrice) : '';
        const siblingCutline = swatch.hasAttribute(attributes$3.siblingCutline) ? swatch.getAttribute(attributes$3.siblingCutline) : '';
        const siblingImage = swatch.hasAttribute(attributes$3.siblingImage) ? swatch.getAttribute(attributes$3.siblingImage) : '';

        if (siblingLink) {
          this.productLinks.forEach((productLink) => {
            productLink.href = siblingLink;
          });
        }

        if (siblingPrice) {
          this.productPrice.innerHTML = `<span class="price">${siblingPrice}</span>`;
        }

        if (this.productCutline) {
          if (siblingCutline) {
            this.productCutline.innerHTML = siblingCutline;
            this.productCutline.title = siblingCutline;
          } else {
            this.productCutline.innerHTML = '';
            this.productCutline.title = '';
          }
        }

        if (siblingImage) {
          this.showSiblingImage(siblingImage);
        }
      }

      showSiblingImage(siblingImage) {
        if (!this.productImageSibling) return;

        // Add current sibling swatch image to PGI image
        const ratio = window.devicePixelRatio || 1;
        const pixels = this.productImage.offsetWidth * ratio;
        const widthRounded = Math.ceil(pixels / 180) * 180;
        const imageSrc = getSizedImageUrl(siblingImage, `${widthRounded}x`);
        const imageExists = this.productImageSibling.querySelector(`[src="${imageSrc}"]`);
        const showCurrentImage = () => {
          this.productImageSibling.classList.add(classes$4.visible);
          this.productImageSibling.querySelector(`[src="${imageSrc}"]`).classList.add(classes$4.fade);
        };
        const swapImages = () => {
          this.productImageSibling.querySelectorAll('img').forEach((image) => {
            image.classList.remove(classes$4.fade);
          });
          requestAnimationFrame(showCurrentImage);
        };

        if (imageExists) {
          swapImages();
        } else {
          const imageTag = document.createElement('img');

          imageTag.src = imageSrc;

          if (this.productCutline) {
            imageTag.alt = this.productCutline.innerText;
          }

          imageTag.addEventListener('load', () => {
            this.productImageSibling.append(imageTag);

            swapImages();
          });
        }
      }

      hideSiblingImage() {
        if (!this.productImageSibling) return;

        this.productImageSibling.classList.remove(classes$4.visible);
        this.productImageSibling.querySelectorAll('img').forEach((image) => {
          image.classList.remove(classes$4.fade);
        });
      }
    }

    class ProductSiblings extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        this.product = this.closest(selectors$4.productGridItem);
        this.siblingCount = this.querySelector(selectors$4.siblingCount);
        this.siblingFieldset = this.querySelector(selectors$4.siblingFieldset);
        this.siblingLinks = this.querySelectorAll(selectors$4.siblingLink);
        this.productInfo = this.closest(selectors$4.productInfo);
        this.productLink = this.closest(selectors$4.link);
        this.hideSwatchesTimer = 0;
        this.swatchesStyle = theme.settings.collectionSwatchStyle;

        if (this.siblingFieldset && this.productInfo) {
          if (this.swatchesStyle == 'grid' || this.swatchesStyle == 'slider' || this.swatchesStyle == 'limited') {
            this.siblingFieldset.classList.add(classes$4.visible);
          }

          if (this.siblingCount) {
            this.siblingCount.addEventListener('mouseenter', () => this.showSiblings());

            // Prevent color swatches blinking on mouse move
            this.productInfo.addEventListener('mouseleave', () => this.hideSiblings());
          }
        }

        if (this.siblingLinks.length) {
          new SiblingSwatches(this.siblingLinks, this.product);
        }
      }

      showSiblings() {
        if (this.hideSwatchesTimer) clearTimeout(this.hideSwatchesTimer);

        if (this.productLink) {
          this.productLink.classList.add(classes$4.stopEvents);
        }

        if (this.swatchesStyle == 'text') return;

        this.siblingFieldset.classList.add(classes$4.visible);
      }

      hideSiblings() {
        this.hideSwatchesTimer = setTimeout(() => {
          if (this.productLink) {
            this.productLink.classList.remove(classes$4.stopEvents);
          }

          this.siblingFieldset.classList.remove(classes$4.visible);
        }, 100);
      }
    }

    if (!customElements.get('product-siblings')) {
      customElements.define('product-siblings', ProductSiblings);
    }

    /**
     * Module to show Recently Viewed Products
     *
     * Copyright (c) 2014 Caroline Schnapp (11heavens.com)
     * Dual licensed under the MIT and GPL licenses:
     * http://www.opensource.org/licenses/mit-license.php
     * http://www.gnu.org/licenses/gpl.html
     *
     */

    Shopify.Products = (function () {
      const config = {
        howManyToShow: 4,
        howManyToStoreInMemory: 10,
        wrapperId: 'recently-viewed-products',
        section: null,
        target: 'api-product-grid-item',
        onComplete: null,
      };

      let productHandleQueue = [];
      let wrapper = null;
      let howManyToShowItems = null;

      const today = new Date();
      const expiresDate = new Date();
      const daysToExpire = 90;
      expiresDate.setTime(today.getTime() + 3600000 * 24 * daysToExpire);

      const cookie = {
        configuration: {
          expires: expiresDate.toGMTString(),
          path: '/',
          domain: window.location.hostname,
          sameSite: 'none',
          secure: true,
        },
        name: 'shopify_recently_viewed',
        write: function (recentlyViewed) {
          const recentlyViewedString = encodeURIComponent(recentlyViewed.join(' '));
          document.cookie = `${this.name}=${recentlyViewedString}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}; sameSite=${this.configuration.sameSite}; secure=${this.configuration.secure}`;
        },
        read: function () {
          let recentlyViewed = [];
          let cookieValue = null;

          if (document.cookie.indexOf('; ') !== -1 && document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
            cookieValue = document.cookie
              .split('; ')
              .find((row) => row.startsWith(this.name))
              .split('=')[1];
          }

          if (cookieValue !== null) {
            recentlyViewed = decodeURIComponent(cookieValue).split(' ');
          }

          return recentlyViewed;
        },
        destroy: function () {
          const cookieVal = null;
          document.cookie = `${this.name}=${cookieVal}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}`;
        },
        remove: function (productHandle) {
          const recentlyViewed = this.read();
          const position = recentlyViewed.indexOf(productHandle);
          if (position !== -1) {
            recentlyViewed.splice(position, 1);
            this.write(recentlyViewed);
          }
        },
      };

      const finalize = (wrapper, section) => {
        wrapper.classList.remove('hidden');
        const cookieItemsLength = cookie.read().length;

        if (Shopify.recentlyViewed && howManyToShowItems && cookieItemsLength && cookieItemsLength < howManyToShowItems && wrapper.children.length) {
          let allClassesArr = [];
          let addClassesArr = [];
          let objCounter = 0;
          for (const property in Shopify.recentlyViewed) {
            objCounter += 1;
            const objString = Shopify.recentlyViewed[property];
            const objArr = objString.split(' ');
            const propertyIdx = parseInt(property.split('_')[1]);
            allClassesArr = [...allClassesArr, ...objArr];

            if (cookie.read().length === propertyIdx || (objCounter === Object.keys(Shopify.recentlyViewed).length && !addClassesArr.length)) {
              addClassesArr = [...addClassesArr, ...objArr];
            }
          }

          for (let i = 0; i < wrapper.children.length; i++) {
            const element = wrapper.children[i];
            if (allClassesArr.length) {
              element.classList.remove(...allClassesArr);
            }

            if (addClassesArr.length) {
              element.classList.add(...addClassesArr);
            }
          }
        }

        // If we have a callback.
        if (config.onComplete) {
          try {
            config.onComplete(wrapper, section);
          } catch (error) {
            console.log(error);
          }
        }
      };

      const moveAlong = (shown, productHandleQueue, wrapper, section, target, howManyToShow) => {
        if (productHandleQueue.length && shown < howManyToShow) {
          fetch(`${window.theme.routes.root}products/${productHandleQueue[0]}?section_id=${target}`)
            .then((response) => response.text())
            .then((product) => {
              const aosDelay = shown * 100;
              const aosAnchor = wrapper.id ? `#${wrapper.id}` : '';
              const fresh = document.createElement('div');
              let productReplaced = product;
              productReplaced = productReplaced.includes('||itemAnimationDelay||') ? productReplaced.replaceAll('||itemAnimationDelay||', aosDelay) : productReplaced;
              productReplaced = productReplaced.includes('||itemAnimationAnchor||') ? productReplaced.replaceAll('||itemAnimationAnchor||', aosAnchor) : productReplaced;
              fresh.innerHTML = productReplaced;

              wrapper.innerHTML += fresh.querySelector('[data-api-content]').innerHTML;

              productHandleQueue.shift();
              shown++;
              moveAlong(shown, productHandleQueue, wrapper, section, target, howManyToShow);
            })
            .catch(() => {
              cookie.remove(productHandleQueue[0]);
              productHandleQueue.shift();
              moveAlong(shown, productHandleQueue, wrapper, section, target, howManyToShow);
            });
        } else {
          finalize(wrapper, section);
        }
      };

      return {
        showRecentlyViewed: function (params) {
          const paramsNew = params || {};
          const shown = 0;

          // Update defaults.
          Object.assign(config, paramsNew);

          // Read cookie.
          productHandleQueue = cookie.read();

          // Element where to insert.
          wrapper = document.querySelector(`#${config.wrapperId}`);

          // How many products to show.
          howManyToShowItems = config.howManyToShow;
          config.howManyToShow = Math.min(productHandleQueue.length, config.howManyToShow);

          // If we have any to show.
          if (config.howManyToShow && wrapper) {
            // Getting each product with an Ajax call and rendering it on the page.
            moveAlong(shown, productHandleQueue, wrapper, config.section, config.target, howManyToShowItems);
          }
        },

        getConfig: function () {
          return config;
        },

        clearList: function () {
          cookie.destroy();
        },

        recordRecentlyViewed: function (params) {
          const paramsNew = params || {};

          // Update defaults.
          Object.assign(config, paramsNew);

          // Read cookie.
          let recentlyViewed = cookie.read();

          // If we are on a product page.
          if (window.location.pathname.indexOf('/products/') !== -1) {
            // What is the product handle on this page.
            let productHandle = decodeURIComponent(window.location.pathname)
              .match(
                /\/products\/([a-z0-9\-]|[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|[\u203B]|[\w\u0430-\u044f]|[\u0400-\u04FF]|[\u0900-\u097F]|[\u0590-\u05FF\u200f\u200e]|[\u0621-\u064A\u0660-\u0669 ])+/
              )[0]
              .split('/products/')[1];

            if (config.handle) {
              productHandle = config.handle;
            }

            // In what position is that product in memory.
            const position = recentlyViewed.indexOf(productHandle);

            // If not in memory.
            if (position === -1) {
              // Add product at the start of the list.
              recentlyViewed.unshift(productHandle);
              // Only keep what we need.
              recentlyViewed = recentlyViewed.splice(0, config.howManyToStoreInMemory);
            } else {
              // Remove the product and place it at start of list.
              recentlyViewed.splice(position, 1);
              recentlyViewed.unshift(productHandle);
            }

            // Update cookie.
            cookie.write(recentlyViewed);
          }
        },

        hasProducts: cookie.read().length > 0,
      };
    })();

    const selectors$3 = {
      aos: '[data-aos]',
      collectionImage: '.collection-item__image',
      columnImage: '[data-column-image]',
      flickityNextArrow: '.flickity-button.next',
      flickityPrevArrow: '.flickity-button.previous',
      link: 'a:not(.btn)',
      productItemImage: '.product-item__image',
      section: '[data-section-type]',
      slide: '[data-slide]',
      slideValue: 'data-slide',
      sliderThumb: '[data-slider-thumb]',
    };

    const attributes$2 = {
      arrowPositionMiddle: 'data-arrow-position-middle',
      slideIndex: 'data-slide-index',
      sliderOptions: 'data-options',
      slideTextColor: 'data-slide-text-color',
    };

    const classes$3 = {
      aosAnimate: 'aos-animate',
      desktop: 'desktop',
      focused: 'is-focused',
      flickityEnabled: 'flickity-enabled',
      heroContentTransparent: 'hero__content--transparent',
      hidden: 'hidden',
      initialized: 'is-initialized',
      isLoading: 'is-loading',
      isSelected: 'is-selected',
      mobile: 'mobile',
      singleSlide: 'single-slide',
    };

    if (!customElements.get('slider-component')) {
      customElements.define(
        'slider-component',
        class SliderComponent extends HTMLElement {
          constructor() {
            super();

            this.flkty = null;
            this.slides = this.querySelectorAll(selectors$3.slide);
            this.thumbs = this.querySelectorAll(selectors$3.sliderThumb);
            this.section = this.closest(selectors$3.section);
            this.bindEvents();
          }

          connectedCallback() {
            if (this.slides.length <= 1) return;

            if (this.hasAttribute(attributes$2.sliderOptions)) {
              this.customOptions = JSON.parse(decodeURIComponent(this.getAttribute(attributes$2.sliderOptions)));
            }

            this.classList.add(classes$3.isLoading);

            let slideSelector = selectors$3.slide;
            const isDesktopView = !window.theme.isMobile();
            const slideMobile = `${selectors$3.slide}:not(.${classes$3.mobile})`;
            const slideDesktop = `${selectors$3.slide}:not(.${classes$3.desktop})`;
            const hasDeviceSpecificSelectors = this.querySelectorAll(slideDesktop).length || this.querySelectorAll(slideMobile).length;

            if (hasDeviceSpecificSelectors) {
              if (isDesktopView) {
                slideSelector = slideMobile;
              } else {
                slideSelector = slideDesktop;
              }
            }

            if (this.querySelectorAll(slideSelector).length <= 1) {
              this.classList.add(classes$3.singleSlide);
              this.classList.remove(classes$3.isLoading);
            }

            this.sliderOptions = {
              cellSelector: slideSelector,
              contain: true,
              wrapAround: true,
              adaptiveHeight: true,
              ...this.customOptions,
              on: {
                ready: () => {
                  requestAnimationFrame(() => {
                    this.classList.add(classes$3.initialized);
                    this.classList.remove(classes$3.isLoading);
                    this.parentNode.dispatchEvent(
                      new CustomEvent('theme:slider:loaded', {
                        bubbles: true,
                        detail: {
                          slider: this,
                        },
                      })
                    );
                  });

                  this.slideActions();

                  if (this.sliderOptions.prevNextButtons) {
                    this.positionArrows();
                  }
                },
                change: (index) => {
                  const slide = this.slides[index];
                  if (!slide || this.sliderOptions.groupCells) return;

                  const elementsToAnimate = slide.querySelectorAll(selectors$3.aos);
                  if (elementsToAnimate.length) {
                    elementsToAnimate.forEach((el) => {
                      el.classList.remove(classes$3.aosAnimate);
                      requestAnimationFrame(() => {
                        // setTimeout with `0` delay fixes functionality on Mobile and Firefox
                        setTimeout(() => {
                          el.classList.add(classes$3.aosAnimate);
                        }, 0);
                      });
                    });
                  }
                },
                resize: () => {
                  if (this.sliderOptions.prevNextButtons) {
                    this.positionArrows();
                  }
                },
              },
            };

            this.initSlider();

            this.flkty.on('change', () => this.slideActions(true));

            this.thumbs?.forEach((thumb) => {
              thumb.addEventListener('click', (e) => {
                e.preventDefault();
                const slideIndex = [...thumb.parentElement.children].indexOf(thumb);
                this.flkty.select(slideIndex);
              });
            });

            if (!this.flkty || !this.flkty.isActive) {
              this.classList.remove(classes$3.isLoading);
            }
          }

          initSlider() {
            if (this.sliderOptions.fade) {
              this.flkty = new window.theme.FlickityFade(this, this.sliderOptions);
            } else {
              this.flkty = new window.theme.Flickity(this, this.sliderOptions);
            }
          }

          bindEvents() {
            this.addEventListener('theme:slider:init', () => {
              this.initSlider();
            });

            this.addEventListener('theme:slider:select', (e) => {
              this.flkty.selectCell(e.detail.index);
              this.flkty.stopPlayer();
            });

            this.addEventListener('theme:slider:deselect', () => {
              if (this.flkty && this.sliderOptions.hasOwnProperty('autoPlay') && this.sliderOptions.autoPlay) {
                this.flkty.playPlayer();
              }
            });

            this.addEventListener('theme:slider:reposition', () => {
              this.flkty?.reposition();
            });

            this.addEventListener('theme:slider:destroy', () => {
              this.flkty?.destroy();
            });

            this.addEventListener('theme:slider:remove-slide', (e) => {
              if (!e.detail.slide) return;

              this.flkty?.remove(e.detail.slide);

              if (this.flkty?.cells.length === 0) {
                this.section.classList.add(classes$3.hidden);
              }
            });
          }

          slideActions(changeEvent = false) {
            const currentSlide = this.querySelector(`.${classes$3.isSelected}`);
            if (!currentSlide) return;
            const currentSlideTextColor = currentSlide.hasAttribute(attributes$2.slideTextColor) ? currentSlide.getAttribute(attributes$2.slideTextColor) : '';
            const currentSlideLink = currentSlide.querySelector(selectors$3.link);
            const buttons = this.querySelectorAll(`${selectors$3.slide} a, ${selectors$3.slide} button`);

            if (document.body.classList.contains(classes$3.focused) && currentSlideLink && this.sliderOptions.groupCells && changeEvent) {
              currentSlideLink.focus();
            }

            if (buttons.length) {
              buttons.forEach((button) => {
                const slide = button.closest(selectors$3.slide);
                if (slide) {
                  const tabIndex = slide.classList.contains(classes$3.isSelected) ? 0 : -1;
                  button.setAttribute('tabindex', tabIndex);
                }
              });
            }

            this.style.setProperty('--text', currentSlideTextColor);

            if (this.thumbs.length && this.thumbs.length === this.slides.length && currentSlide.hasAttribute(attributes$2.slideIndex)) {
              const slideIndex = parseInt(currentSlide.getAttribute(attributes$2.slideIndex));
              const currentThumb = this.querySelector(`${selectors$3.sliderThumb}.${classes$3.isSelected}`);
              if (currentThumb) {
                currentThumb.classList.remove(classes$3.isSelected);
              }
              this.thumbs[slideIndex].classList.add(classes$3.isSelected);
            }
          }

          positionArrows() {
            if (this.hasAttribute(attributes$2.arrowPositionMiddle) && this.sliderOptions.prevNextButtons) {
              const itemImage = this.querySelector(selectors$3.collectionImage) || this.querySelector(selectors$3.productItemImage) || this.querySelector(selectors$3.columnImage);

              // Prevent 'clientHeight' of null error if no image
              if (!itemImage) return;

              this.querySelector(selectors$3.flickityPrevArrow).style.top = itemImage.clientHeight / 2 + 'px';
              this.querySelector(selectors$3.flickityNextArrow).style.top = itemImage.clientHeight / 2 + 'px';
            }
          }

          disconnectedCallback() {
            if (this.flkty) {
              this.flkty.options.watchCSS = false;
              this.flkty.destroy();
            }
          }
        }
      );
    }

    const selectors$2 = {
      relatedSection: '[data-related-section]',
      aos: '[data-aos]',
      tabsLi: '[data-tab]',
      tabLink: '.tab-link',
      tabLinkRecent: '.tab-link__recent',
      tabContent: '.tab-content',
    };

    const classes$2 = {
      current: 'current',
      hidden: 'hidden',
      aosAnimate: 'aos-animate',
      aosNoTransition: 'aos-no-transition',
      focused: 'is-focused',
    };

    const attributes$1 = {
      dataTab: 'data-tab',
      dataTabIndex: 'data-tab-index',
    };

    if (!customElements.get('tabs-component')) {
      customElements.define(
        'tabs-component',
        class GlobalTabs extends HTMLElement {
          constructor() {
            super();

            this.a11y = window.a11y;
          }

          connectedCallback() {
            const tabsNavList = this.querySelectorAll(selectors$2.tabsLi);

            this.addEventListener('theme:tab:check', () => this.checkRecentTab());
            this.addEventListener('theme:tab:hide', () => this.hideRelatedTab());

            tabsNavList?.forEach((element) => {
              const tabId = parseInt(element.getAttribute(attributes$1.dataTab));
              const tab = this.querySelector(`${selectors$2.tabContent}-${tabId}`);

              element.addEventListener('click', () => {
                this.tabChange(element, tab);
              });

              element.addEventListener('keyup', (event) => {
                if ((event.code === 'Space' || event.code === 'Enter') && document.body.classList.contains(classes$2.focused)) {
                  this.tabChange(element, tab);
                }
              });
            });
          }

          tabChange(element, tab) {
            if (element.classList.contains(classes$2.current)) {
              return;
            }

            const currentTab = this.querySelector(`${selectors$2.tabsLi}.${classes$2.current}`);
            const currentTabContent = this.querySelector(`${selectors$2.tabContent}.${classes$2.current}`);

            currentTab?.classList.remove(classes$2.current);
            currentTabContent?.classList.remove(classes$2.current);

            element.classList.add(classes$2.current);
            tab.classList.add(classes$2.current);

            if (element.classList.contains(classes$2.hidden)) {
              tab.classList.add(classes$2.hidden);
            }

            this.a11y.a11y.removeTrapFocus();

            this.dispatchEvent(new CustomEvent('theme:tab:change', {bubbles: true}));

            element.dispatchEvent(
              new CustomEvent('theme:form:sticky', {
                bubbles: true,
                detail: {
                  element: 'tab',
                },
              })
            );

            this.animateItems(tab);
          }

          animateItems(tab, animated = true) {
            const animatedItems = tab.querySelectorAll(selectors$2.aos);

            if (animatedItems.length) {
              animatedItems.forEach((animatedItem) => {
                animatedItem.classList.remove(classes$2.aosAnimate);

                if (animated) {
                  animatedItem.classList.add(classes$2.aosNoTransition);

                  requestAnimationFrame(() => {
                    animatedItem.classList.remove(classes$2.aosNoTransition);
                    animatedItem.classList.add(classes$2.aosAnimate);
                  });
                }
              });
            }
          }

          checkRecentTab() {
            const tabLink = this.querySelector(selectors$2.tabLinkRecent);

            if (tabLink) {
              tabLink.classList.remove(classes$2.hidden);
              const tabLinkIdx = parseInt(tabLink.getAttribute(attributes$1.dataTab));
              const tabContent = this.querySelector(`${selectors$2.tabContent}[${attributes$1.dataTabIndex}="${tabLinkIdx}"]`);

              if (tabContent) {
                tabContent.classList.remove(classes$2.hidden);

                this.animateItems(tabContent, false);
              }
            }
          }

          hideRelatedTab() {
            const relatedSection = this.querySelector(selectors$2.relatedSection);
            if (!relatedSection) {
              return;
            }

            const parentTabContent = relatedSection.closest(`${selectors$2.tabContent}.${classes$2.current}`);
            if (!parentTabContent) {
              return;
            }
            const parentTabContentIdx = parseInt(parentTabContent.getAttribute(attributes$1.dataTabIndex));
            const tabsNavList = this.querySelectorAll(selectors$2.tabsLi);

            if (tabsNavList.length > parentTabContentIdx) {
              const nextTabsNavLink = tabsNavList[parentTabContentIdx].nextSibling;

              if (nextTabsNavLink) {
                tabsNavList[parentTabContentIdx].classList.add(classes$2.hidden);
                nextTabsNavLink.dispatchEvent(new Event('click'));
              }
            }
          }
        }
      );
    }

    const selectors$1 = {
      actions: '[data-actions]',
      content: '[data-content]',
      trigger: '[data-button]',
    };

    const attributes = {
      height: 'data-height',
    };

    const classes$1 = {
      open: 'is-open',
      enabled: 'is-enabled',
    };

    class ToggleEllipsis extends HTMLElement {
      constructor() {
        super();

        this.initialHeight = this.getAttribute(attributes.height);
        this.content = this.querySelector(selectors$1.content);
        this.trigger = this.querySelector(selectors$1.trigger);
        this.actions = this.querySelector(selectors$1.actions);
        this.toggleActions = this.toggleActions.bind(this);
      }

      connectedCallback() {
        // Make sure the data attribute height value matches the CSS value
        this.setHeight(this.initialHeight);

        this.trigger.addEventListener('click', () => {
          this.setHeight(this.content.offsetHeight);
          this.classList.add(classes$1.open);
        });

        this.setHeight(this.initialHeight);
        this.toggleActions();

        document.addEventListener('theme:resize', this.toggleActions);
        document.addEventListener('theme:collapsible:toggle', this.toggleActions);
      }

      disconnectedCallback() {
        document.removeEventListener('theme:resize', this.toggleActions);
        document.removeEventListener('theme:collapsible:toggle', this.toggleActions);
      }

      setHeight(contentHeight) {
        this.style.setProperty('--height', `${contentHeight}px`);
      }

      toggleActions() {
        this.classList.toggle(classes$1.enabled, this.content.offsetHeight + this.actions.offsetHeight > this.initialHeight);
      }
    }

    if (!customElements.get('toggle-ellipsis')) {
      customElements.define('toggle-ellipsis', ToggleEllipsis);
    }

    const selectors = {
      sectionId: '[data-section-id]',
      tooltip: 'data-tooltip',
      tooltipStopMouseEnter: 'data-tooltip-stop-mouseenter',
    };

    const classes = {
      tooltipDefault: 'tooltip-default',
      visible: 'is-visible',
      hiding: 'is-hiding',
    };

    if (!customElements.get('tooltip-component')) {
      customElements.define(
        'tooltip-component',
        class Tooltip extends HTMLElement {
          constructor() {
            super();

            this.label = this.hasAttribute(selectors.tooltip) ? this.getAttribute(selectors.tooltip) : '';
            this.transitionSpeed = 200;
            this.hideTransitionTimeout = 0;
            this.addPinEvent = () => this.addPin();
            this.addPinMouseEvent = () => this.addPin(true);
            this.removePinEvent = (event) => window.theme.throttle(this.removePin(event), 50);
            this.removePinMouseEvent = (event) => this.removePin(event, true, true);
          }

          connectedCallback() {
            if (!document.querySelector(`.${classes.tooltipDefault}`)) {
              const tooltipTemplate = `<div class="${classes.tooltipDefault}__arrow"></div><div class="${classes.tooltipDefault}__inner"><div class="${classes.tooltipDefault}__text"></div></div>`;
              const tooltipElement = document.createElement('div');
              tooltipElement.className = classes.tooltipDefault;
              tooltipElement.innerHTML = tooltipTemplate;
              document.body.appendChild(tooltipElement);
            }

            this.addEventListener('mouseenter', this.addPinMouseEvent);
            this.addEventListener('mouseleave', this.removePinMouseEvent);
            this.addEventListener('theme:tooltip:init', this.addPinEvent);
            document.addEventListener('theme:tooltip:close', this.removePinEvent);
          }

          addPin(stopMouseEnter = false) {
            const tooltipTarget = document.querySelector(`.${classes.tooltipDefault}`);

            const section = this.closest(selectors.sectionId);
            const colorSchemeClass = Array.from(section.classList).find((cls) => cls.startsWith('color-scheme-'));
            tooltipTarget?.classList.add(colorSchemeClass); // add the section's color scheme class to the tooltip

            if (this.label && tooltipTarget && ((stopMouseEnter && !this.hasAttribute(selectors.tooltipStopMouseEnter)) || !stopMouseEnter)) {
              const tooltipTargetArrow = tooltipTarget.querySelector(`.${classes.tooltipDefault}__arrow`);
              const tooltipTargetInner = tooltipTarget.querySelector(`.${classes.tooltipDefault}__inner`);
              const tooltipTargetText = tooltipTarget.querySelector(`.${classes.tooltipDefault}__text`);
              tooltipTargetText.innerHTML = this.label;

              const tooltipTargetWidth = tooltipTargetInner.offsetWidth;
              const tooltipRect = this.getBoundingClientRect();
              const tooltipTop = tooltipRect.top;
              const tooltipWidth = tooltipRect.width;
              const tooltipHeight = tooltipRect.height;
              const tooltipTargetPositionTop = tooltipTop + tooltipHeight + window.scrollY;
              let tooltipTargetPositionLeft = tooltipRect.left - tooltipTargetWidth / 2 + tooltipWidth / 2;
              const tooltipLeftWithWidth = tooltipTargetPositionLeft + tooltipTargetWidth;
              const sideOffset = 24;
              const tooltipTargetWindowDifference = tooltipLeftWithWidth - window.theme.getWindowWidth() + sideOffset;

              if (tooltipTargetWindowDifference > 0) {
                tooltipTargetPositionLeft -= tooltipTargetWindowDifference;
              }

              if (tooltipTargetPositionLeft < 0) {
                tooltipTargetPositionLeft = 0;
              }

              tooltipTargetArrow.style.left = `${tooltipRect.left + tooltipWidth / 2}px`;
              tooltipTarget.style.setProperty('--tooltip-top', `${tooltipTargetPositionTop}px`);

              tooltipTargetInner.style.transform = `translateX(${tooltipTargetPositionLeft}px)`;
              tooltipTarget.classList.remove(classes.hiding);
              tooltipTarget.classList.add(classes.visible);

              document.addEventListener('theme:scroll', this.removePinEvent);
            }
          }

          removePin(event, stopMouseEnter = false, hideTransition = false) {
            const tooltipTarget = document.querySelector(`.${classes.tooltipDefault}`);
            const tooltipVisible = tooltipTarget.classList.contains(classes.visible);

            if (tooltipTarget && ((stopMouseEnter && !this.hasAttribute(selectors.tooltipStopMouseEnter)) || !stopMouseEnter)) {
              if (tooltipVisible && (hideTransition || event.detail.hideTransition)) {
                tooltipTarget.classList.add(classes.hiding);

                if (this.hideTransitionTimeout) {
                  clearTimeout(this.hideTransitionTimeout);
                }

                this.hideTransitionTimeout = setTimeout(() => {
                  tooltipTarget.classList.remove(classes.hiding);
                }, this.transitionSpeed);
              }

              tooltipTarget.classList.remove(classes.visible);

              document.removeEventListener('theme:scroll', this.removePinEvent);
            }
          }

          disconnectedCallback() {
            this.removeEventListener('mouseenter', this.addPinMouseEvent);
            this.removeEventListener('mouseleave', this.removePinMouseEvent);
            this.removeEventListener('theme:tooltip:init', this.addPinEvent);
            document.removeEventListener('theme:tooltip:close', this.removePinEvent);
            document.removeEventListener('theme:scroll', this.removePinEvent);
          }
        }
      );
    }

    function getScript(url, callback, callbackError) {
      let head = document.getElementsByTagName('head')[0];
      let done = false;
      let script = document.createElement('script');
      script.src = url;

      // Attach handlers for all browsers
      script.onload = script.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
          done = true;
          callback();
        } else {
          callbackError();
        }
      };

      head.appendChild(script);
    }

    const loaders = {};

    function loadScript(options = {}) {
      if (!options.type) {
        options.type = 'json';
      }

      if (options.url) {
        if (loaders[options.url]) {
          return loaders[options.url];
        } else {
          return getScriptWithPromise(options.url, options.type);
        }
      } else if (options.json) {
        if (loaders[options.json]) {
          return Promise.resolve(loaders[options.json]);
        } else {
          return window
            .fetch(options.json)
            .then((response) => {
              return response.json();
            })
            .then((response) => {
              loaders[options.json] = response;
              return response;
            });
        }
      } else if (options.name) {
        const key = ''.concat(options.name, options.version);
        if (loaders[key]) {
          return loaders[key];
        } else {
          return loadShopifyWithPromise(options);
        }
      } else {
        return Promise.reject();
      }
    }

    function getScriptWithPromise(url, type) {
      const loader = new Promise((resolve, reject) => {
        if (type === 'text') {
          fetch(url)
            .then((response) => response.text())
            .then((data) => {
              resolve(data);
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          getScript(
            url,
            function () {
              resolve();
            },
            function () {
              reject();
            }
          );
        }
      });

      loaders[url] = loader;
      return loader;
    }

    function loadShopifyWithPromise(options) {
      const key = ''.concat(options.name, options.version);
      const loader = new Promise((resolve, reject) => {
        try {
          window.Shopify.loadFeatures([
            {
              name: options.name,
              version: options.version,
              onLoad: (err) => {
                onLoadFromShopify(resolve, reject, err);
              },
            },
          ]);
        } catch (err) {
          reject(err);
        }
      });
      loaders[key] = loader;
      return loader;
    }

    function onLoadFromShopify(resolve, reject, err) {
      if (err) {
        return reject(err);
      } else {
        return resolve();
      }
    }

    document.addEventListener('DOMContentLoaded', function () {
      // Scroll to top button
      const scrollTopButton = document.querySelector('[data-scroll-top-button]');
      if (scrollTopButton) {
        scrollTopButton.addEventListener('click', () => {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
          });
        });
        document.addEventListener('theme:scroll', () => {
          scrollTopButton.classList.toggle('is-visible', window.scrollY > window.innerHeight);
        });
      }

      if (window.self !== window.top) {
        document.querySelector('html').classList.add('iframe');
      }

      // Safari smoothscroll polyfill
      let hasNativeSmoothScroll = 'scrollBehavior' in document.documentElement.style;
      if (!hasNativeSmoothScroll) {
        loadScript({url: window.theme.assets.smoothscroll});
      }
    });

    // Apply a specific class to the html element for browser support of cookies.
    if (window.navigator.cookieEnabled) {
      document.documentElement.className = document.documentElement.className.replace('supports-no-cookies', 'supports-cookies');
    }

})(themeVendor.ScrollLock);
