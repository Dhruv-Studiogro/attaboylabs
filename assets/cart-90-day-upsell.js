(function () {
  const selectors = {
    root: '[data-cart-90-day-upsell-root]',
    giftsRoot: '[data-cart-90-day-gifts-root]',
    button: '[data-cart-90-day-upsell-button]',
    cartPriceRoot: '[data-cart-price-root]',
    cartPriceCompare: '[data-cart-price-compare]',
    startNowTrigger: '[data-attaboy-start-now-cart-trigger]',
    reploCartTrigger: '[data-replo-add-product-variant-to-cart]',
    reploProductContainer: '[data-replo-product-container]',
    reploProductForm: 'product-form form[action*="/cart/add"], form[data-type="add-to-cart-form"]',
  };

  const events = {
    shown: 'attaboy:cart-90-day-upsell:shown',
    clicked: 'attaboy:cart-90-day-upsell:clicked',
    success: 'attaboy:cart-90-day-upsell:success',
    error: 'attaboy:cart-90-day-upsell:error',
    startNowClicked: 'attaboy:start-now:clicked',
    startNowSuccess: 'attaboy:start-now:success',
    startNowError: 'attaboy:start-now:error',
  };

  const classes = {
    control: 'attaboy-90day-cart-control',
    v1: 'attaboy-90day-cart-v1',
  };

  const validVariants = new Set(['control', 'v1']);
  const cartFlowEnabledClass = 'attaboy-90day-cart-flow-enabled';
  const startNowEligibleHandles = new Set(['every-damn-day-kit', 'starter-kit']);
  const startNowEligibleProductIds = new Set(['8458689478690', '8156483026978']);
  const buttonLoadingText = 'UPGRADING...';
  const startNowLoadingAttribute = 'data-attaboy-start-now-loading';

  let delegatedClickListenerBound = false;
  let experimentClassObserver = null;
  let initQueued = false;
  let windowExperimentObserverBound = false;

  function normalizeValue(value) {
    return String(value || '')
      .trim()
      .toLowerCase();
  }

  function normalizeVariant(value) {
    const normalizedValue = normalizeValue(value);
    return validVariants.has(normalizedValue) ? normalizedValue : '';
  }

  function normalizeBooleanFlag(value) {
    if (typeof value === 'string') {
      const normalizedValue = normalizeValue(value);
      return normalizedValue === 'true' || normalizedValue === '1' || normalizedValue === 'yes';
    }

    return value === true;
  }

  function readNumber(value, fallback = null) {
    const parsedValue = parseInt(value, 10);
    return Number.isNaN(parsedValue) ? fallback : parsedValue;
  }

  function getCartAddUrl() {
    return window.theme?.routes?.cart_add_url || '/cart/add.js';
  }

  function getCartChangeUrl() {
    return window.theme?.routes?.cart_change_url || '/cart/change.js';
  }

  function getCart90Data(root, name) {
    return root?.getAttribute(`data-cart-90-day-${name}`) || '';
  }

  function setCart90Data(root, name, value) {
    if (!root) {
      return;
    }

    root.setAttribute(`data-cart-90-day-${name}`, value);
  }

  function getCartPriceData(root, name) {
    return root?.getAttribute(`data-cart-price-${name}`) || '';
  }

  function getVariantData(root, variantKey, name) {
    return root?.getAttribute(`data-cart-90-day-${variantKey}-${name}`) || '';
  }

  function isButtonBound(button) {
    return button?.getAttribute('data-cart-90-day-bound') === 'true';
  }

  function dispatchEventWithDetail(name, detail) {
    document.dispatchEvent(
      new CustomEvent(name, {
        bubbles: true,
        detail,
      })
    );
  }

  function stopEvent(event) {
    if (!event) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (typeof event.stopImmediatePropagation === 'function') {
      event.stopImmediatePropagation();
    }
  }

  function getUpsellRoots() {
    return Array.from(document.querySelectorAll(`${selectors.root}[data-cart-90-day-mode="upsell"]`));
  }

  function getPreferredRoot(target = null) {
    if (target instanceof Element) {
      if (target.matches(selectors.root)) {
        return target;
      }

      return target.closest(selectors.root);
    }

    const roots = getUpsellRoots();
    return roots.find((root) => !root.hidden) || roots[0] || null;
  }

  function getButtonForRoot(root) {
    return root?.querySelector(selectors.button) || null;
  }

  function getRootDetail(root, extra = {}) {
    const cartFlowState = getCartFlowState();

    return Object.assign(
      {
        cartFlowEnabled: cartFlowState.enabled,
        cartFlowEnabledFromWindow: cartFlowState.enabledFromWindow,
        cartFlowEnabledFromClass: cartFlowState.enabledFromClass,
        mode: getCart90Data(root, 'mode'),
        lineKey: getCart90Data(root, 'line-key'),
        flavor: getCart90Data(root, 'current-flavor'),
        quantity: readNumber(getCart90Data(root, 'current-quantity'), 1),
        upgradeHandle: getCart90Data(root, 'upgrade-handle'),
        upgradeProductId: getCart90Data(root, 'upgrade-product-id'),
        sellingPlanId: getCart90Data(root, 'upgrade-selling-plan-id'),
        activeVariant: getCart90Data(root, 'active-variant') || 'control',
        activeVariantSource: getCart90Data(root, 'active-variant-source') || 'default',
      },
      extra
    );
  }

  function getVariantFromUrl() {
    try {
      const url = new URL(window.location.href);
      return normalizeVariant(url.searchParams.get('attaboy90day'));
    } catch (error) {
      return '';
    }
  }

  function getVariantFromWindow() {
    return normalizeVariant(window.ATTABOY_90_DAY_CART_VARIANT);
  }

  function getVariantFromClasses() {
    const nodes = [document.documentElement, document.body].filter(Boolean);
    const classEntries = Object.entries(classes);

    for (const node of nodes) {
      for (const [variantKey, className] of classEntries) {
        if (node.classList.contains(className)) {
          return variantKey;
        }
      }
    }

    return '';
  }

  function getActiveExperimentVariant() {
    const urlVariant = getVariantFromUrl();
    if (urlVariant) {
      return {
        key: urlVariant,
        source: 'url',
      };
    }

    const windowVariant = getVariantFromWindow();
    if (windowVariant) {
      return {
        key: windowVariant,
        source: 'window',
      };
    }

    const classVariant = getVariantFromClasses();
    if (classVariant) {
      return {
        key: classVariant,
        source: 'class',
      };
    }

    return {
      key: 'control',
      source: 'default',
    };
  }

  function isUpsellVariantKey(variantKey) {
    return variantKey === 'v1';
  }

  function getCartFlowEnabledFromWindow() {
    return normalizeBooleanFlag(window.ATTABOY_90_DAY_CART_FLOW_ENABLED);
  }

  function hasCartFlowEnabledClass() {
    return [document.documentElement, document.body]
      .filter(Boolean)
      .some((node) => node.classList.contains(cartFlowEnabledClass));
  }

  function getCartFlowState() {
    const activeVariant = getActiveExperimentVariant();
    const enabledFromWindow = getCartFlowEnabledFromWindow();
    const enabledFromClass = hasCartFlowEnabledClass();
    const enabled = isUpsellVariantKey(activeVariant.key) && (enabledFromWindow || enabledFromClass);

    return {
      activeVariant,
      enabled,
      enabledFromWindow,
      enabledFromClass,
    };
  }

  function isCartFlowEnabled() {
    return getCartFlowState().enabled;
  }

  function getAppliedVariantConfig(root, variantKey) {
    if (!root || variantKey === 'control') {
      return null;
    }

    return {
      key: variantKey,
      upgradeHandle: getVariantData(root, variantKey, 'upgrade-handle'),
      upgradeProductId: getVariantData(root, variantKey, 'upgrade-product-id'),
      variantIds: {
        'coastal lime': getVariantData(root, variantKey, 'upgrade-variant-id-coastal-lime'),
        'attaboy punch': getVariantData(root, variantKey, 'upgrade-variant-id-attaboy-punch'),
      },
      sellingPlanId: getVariantData(root, variantKey, 'upgrade-selling-plan-id'),
      billingNote: getVariantData(root, variantKey, 'billing-note'),
      imageUrl: getVariantData(root, variantKey, 'image-url'),
      imageAlt: getVariantData(root, variantKey, 'image-alt'),
    };
  }

  function applyVariantConfig(root, config) {
    if (!root || !config) {
      return;
    }

    setCart90Data(root, 'upgrade-handle', config.upgradeHandle || '');
    setCart90Data(root, 'upgrade-product-id', config.upgradeProductId || '');
    setCart90Data(root, 'upgrade-variant-id-coastal-lime', config.variantIds['coastal lime'] || '');
    setCart90Data(root, 'upgrade-variant-id-attaboy-punch', config.variantIds['attaboy punch'] || '');
    setCart90Data(root, 'upgrade-selling-plan-id', config.sellingPlanId || '');

    const billingNode = root.querySelector('.cart-90-day-upsell__billing-note');
    if (billingNode && config.billingNote) {
      billingNode.textContent = config.billingNote;
    }

    const imageWrap = root.querySelector('.cart-90-day-upsell__product-image');
    const imageNode = imageWrap?.querySelector('img');

    if (imageWrap && imageNode) {
      const hasImage = Boolean(config.imageUrl);
      imageWrap.classList.toggle('cart-90-day-upsell__product-image--empty', !hasImage);

      if (hasImage) {
        imageNode.src = config.imageUrl;
      } else {
        imageNode.removeAttribute('src');
      }

      imageNode.alt = config.imageAlt || imageNode.alt || '90 Day Starter Kit';
    }
  }

  function clearAppliedVariantConfig(root) {
    if (!root) {
      return;
    }

    setCart90Data(root, 'upgrade-handle', '');
    setCart90Data(root, 'upgrade-product-id', '');
    setCart90Data(root, 'upgrade-variant-id-coastal-lime', '');
    setCart90Data(root, 'upgrade-variant-id-attaboy-punch', '');
    setCart90Data(root, 'upgrade-selling-plan-id', '');
  }

  function toggleUpsellVisibility(root) {
    const activeVariant = getActiveExperimentVariant();
    const config = getAppliedVariantConfig(root, activeVariant.key);
    const isActive = Boolean(config && (config.upgradeProductId || config.upgradeHandle));

    setCart90Data(root, 'active-variant', activeVariant.key);
    setCart90Data(root, 'active-variant-source', activeVariant.source);

    if (config) {
      applyVariantConfig(root, config);
    } else {
      clearAppliedVariantConfig(root);
    }

    root.hidden = !isActive;
    root.setAttribute('aria-hidden', isActive ? 'false' : 'true');

    if (isActive && getCart90Data(root, 'shown') !== 'true') {
      setCart90Data(root, 'shown', 'true');
      dispatchEventWithDetail(events.shown, getRootDetail(root));
    }
  }

  function toggleGiftsVisibility(root) {
    const activeVariant = getActiveExperimentVariant();
    const hasTriggerItem = getCart90Data(root, 'has-trigger-item') === 'true';
    const hasUpgradeItem = getCart90Data(root, 'has-upgrade-item') === 'true';
    const hasRenderableState = hasTriggerItem || hasUpgradeItem;
    const isActive = hasUpgradeItem || (hasRenderableState && activeVariant.key !== 'control');

    setCart90Data(root, 'active-variant', activeVariant.key);
    setCart90Data(root, 'active-variant-source', activeVariant.source);

    root.hidden = !isActive;
    root.setAttribute('aria-hidden', isActive ? 'false' : 'true');
  }

  function hideElement(root) {
    if (!root) {
      return;
    }

    root.hidden = true;
    root.setAttribute('aria-hidden', 'true');
  }

  function disableUpsellVisibility(root) {
    if (!root) {
      return;
    }

    const activeVariant = getActiveExperimentVariant();

    clearAppliedVariantConfig(root);
    setCart90Data(root, 'active-variant', activeVariant.key);
    setCart90Data(root, 'active-variant-source', activeVariant.source);
    hideElement(root);
  }

  function disableCartPriceCompare(root) {
    const compareNode = root?.querySelector(selectors.cartPriceCompare);

    if (!compareNode) {
      return;
    }

    compareNode.hidden = true;
    compareNode.setAttribute('aria-hidden', 'true');
  }

  function getMoneyFormat() {
    return window.theme?.moneyWithCurrencyFormat || window.theme?.moneyFormat || '${{amount}}';
  }

  function formatMoney(valueInCents) {
    return window.theme?.formatMoney
      ? window.theme.formatMoney(valueInCents, getMoneyFormat())
      : String(valueInCents || 0);
  }

  function toggleCartPriceCompare(root) {
    if (!root) {
      return;
    }

    const compareNode = root.querySelector(selectors.cartPriceCompare);
    if (!compareNode) {
      return;
    }

    const subtotal = readNumber(getCartPriceData(root, 'subtotal'), 0);
    const compareSubtotal = readNumber(getCartPriceData(root, 'compare-subtotal'), 0);
    const shouldShowCompare = compareSubtotal > subtotal;

    compareNode.hidden = !shouldShowCompare;
    compareNode.setAttribute('aria-hidden', shouldShowCompare ? 'false' : 'true');

    if (shouldShowCompare) {
      compareNode.textContent = formatMoney(compareSubtotal);
    }
  }

  function setButtonLoadingState(button, isLoading, options = {}) {
    const {restoreLabel = false} = options;
    const root = button?.closest(selectors.root);

    if (button) {
      const originalLabel = button.getAttribute('data-cart-90-day-original-label') || button.textContent.trim();
      button.setAttribute('data-cart-90-day-original-label', originalLabel);
      button.disabled = isLoading;
      button.classList.toggle('is-loading', isLoading);
      button.setAttribute('aria-busy', isLoading ? 'true' : 'false');

      if (isLoading) {
        button.textContent = buttonLoadingText;
      } else if (restoreLabel) {
        button.textContent = originalLabel;
      }
    }

    root?.classList.toggle('is-loading', isLoading);
  }

  function getConfiguredVariantId(root, flavor) {
    const variantMap = {
      'coastal lime': getCart90Data(root, 'upgrade-variant-id-coastal-lime'),
      'attaboy punch': getCart90Data(root, 'upgrade-variant-id-attaboy-punch'),
    };

    return variantMap[normalizeValue(flavor)] || '';
  }

  async function resolveUpgradeVariantId(root) {
    const flavor = getCart90Data(root, 'current-flavor');
    const configuredVariantId = getConfiguredVariantId(root, flavor);

    if (configuredVariantId) {
      return configuredVariantId;
    }

    const productHandle = getCart90Data(root, 'upgrade-handle');

    if (!productHandle) {
      throw new Error('Missing 90-day upgrade product handle or variant mapping.');
    }

    const response = await fetch(`/products/${productHandle}.js`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Unable to load the 90-day upgrade product.');
    }

    const product = await response.json();
    const normalizedFlavor = normalizeValue(flavor);
    let matchedVariant = null;

    if (normalizedFlavor) {
      matchedVariant = product.variants.find((variant) => {
        const options = Array.isArray(variant.options) ? variant.options : [];

        return options.some((optionValue) => normalizeValue(optionValue) === normalizedFlavor);
      });
    }

    if (!matchedVariant) {
      matchedVariant = product.variants.find((variant) => variant.available) || product.variants[0];
    }

    if (!matchedVariant?.id) {
      throw new Error('Unable to resolve a matching 90-day variant.');
    }

    return matchedVariant.id;
  }

  async function addUpgradeItem(variantId, quantity, sellingPlanId) {
    const payload = {
      items: [
        {
          id: variantId,
          quantity,
        },
      ],
    };

    if (sellingPlanId) {
      payload.items[0].selling_plan = sellingPlanId;
    }

    const response = await fetch(getCartAddUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.status) {
      throw new Error(data.description || data.message || 'Failed to add the 90-day item to cart.');
    }

    return data;
  }

  async function removeTriggerItem(lineKey) {
    const response = await fetch(getCartChangeUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        id: lineKey,
        quantity: 0,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.errors) {
      throw new Error(data.description || data.message || data.errors || 'Failed to remove the 30-day item from cart.');
    }

    return data;
  }

  function refreshCartDrawer() {
    document.dispatchEvent(
      new CustomEvent('theme:cart:refresh', {
        bubbles: true,
      })
    );
  }

  function openCartDrawer() {
    const cartDrawer = document.querySelector('cart-drawer');

    if (cartDrawer) {
      cartDrawer.dispatchEvent(
        new CustomEvent('theme:cart-drawer:show', {
          bubbles: true,
        })
      );
    }
  }

  function waitForCartChange(timeoutMs = 3000) {
    return new Promise((resolve) => {
      let isResolved = false;

      const finalize = () => {
        if (isResolved) {
          return;
        }

        isResolved = true;
        clearTimeout(timeoutId);
        document.removeEventListener('theme:cart:change', onCartChange);
        resolve();
      };

      const onCartChange = () => {
        finalize();
      };

      const timeoutId = window.setTimeout(finalize, timeoutMs);
      document.addEventListener('theme:cart:change', onCartChange);
    });
  }

  function debug(target = null) {
    const root = getPreferredRoot(target);
    const button = target?.matches?.(selectors.button) ? target : getButtonForRoot(root);
    const cartFlowState = getCartFlowState();
    const state = {
      root,
      button,
      activeVariant: getActiveExperimentVariant(),
      cartFlowState,
      dataset: root
        ? {
            mode: getCart90Data(root, 'mode'),
            lineKey: getCart90Data(root, 'line-key'),
            currentFlavor: getCart90Data(root, 'current-flavor'),
            currentQuantity: getCart90Data(root, 'current-quantity'),
            upgradeHandle: getCart90Data(root, 'upgrade-handle'),
            upgradeProductId: getCart90Data(root, 'upgrade-product-id'),
            upgradeSellingPlanId: getCart90Data(root, 'upgrade-selling-plan-id'),
            upgradeVariantIdCoastalLime: getCart90Data(root, 'upgrade-variant-id-coastal-lime'),
            upgradeVariantIdAttaboyPunch: getCart90Data(root, 'upgrade-variant-id-attaboy-punch'),
            activeVariant: getCart90Data(root, 'active-variant'),
            activeVariantSource: getCart90Data(root, 'active-variant-source'),
            shown: getCart90Data(root, 'shown'),
          }
        : null,
      rootHidden: root ? root.hidden : null,
      buttonDisabled: button ? button.disabled : null,
      buttonBound: isButtonBound(button),
    };

    return state;
  }

  async function upgrade(target = null) {
    const root = getPreferredRoot(target);
    const button = target?.matches?.(selectors.button) ? target : getButtonForRoot(root);
    const activeVariant = getActiveExperimentVariant();

    if (!isCartFlowEnabled() || !root || !button) {
      return null;
    }

    if (button.disabled || root.hidden || getCart90Data(root, 'mode') !== 'upsell' || activeVariant.key === 'control') {
      return null;
    }

    const lineKey = getCart90Data(root, 'line-key');
    const quantity = readNumber(getCart90Data(root, 'current-quantity'), 1);
    const sellingPlanId = getCart90Data(root, 'upgrade-selling-plan-id');
    let upgradeVariantId = null;
    let didAddUpgrade = false;
    let didSucceed = false;

    dispatchEventWithDetail(events.clicked, getRootDetail(root));
    setButtonLoadingState(button, true);

    try {
      if (!lineKey) {
        throw new Error('Missing 30-day cart line item key.');
      }

      upgradeVariantId = await resolveUpgradeVariantId(root);
      await addUpgradeItem(upgradeVariantId, quantity, sellingPlanId);
      didAddUpgrade = true;
      await removeTriggerItem(lineKey);

      dispatchEventWithDetail(
        events.success,
        getRootDetail(root, {
          upgradeVariantId,
        })
      );

      didSucceed = true;
      refreshCartDrawer();
      return {
        ok: true,
        upgradeVariantId,
      };
    } catch (error) {
      dispatchEventWithDetail(
        events.error,
        getRootDetail(root, {
          upgradeVariantId,
          message: error.message,
        })
      );

      if (didAddUpgrade) {
        refreshCartDrawer();
      }

      return {
        ok: false,
        error,
      };
    } finally {
      if (!didSucceed) {
        setButtonLoadingState(button, false, {
          restoreLabel: true,
        });
      }
    }
  }

  function isLegacyStartNowTrigger(element) {
    if (!(element instanceof Element) || !element.matches(selectors.reploCartTrigger)) {
      return false;
    }

    return normalizeValue(element.textContent).replace(/\s+/g, ' ') === 'start now';
  }

  function isStartNowTrigger(element) {
    if (!(element instanceof Element)) {
      return false;
    }

    return element.matches(selectors.startNowTrigger) || isLegacyStartNowTrigger(element);
  }

  function hydrateStartNowTriggers() {
    const shouldHydrateStartNowTriggers = isCartFlowEnabled();

    document.querySelectorAll(selectors.reploCartTrigger).forEach((element) => {
      const container = getStartNowContainer(element);
      const form = getStartNowForm(container);
      const isEligible = Boolean(container && form && isEligibleStartNowContainer(container));

      if (shouldHydrateStartNowTriggers && isLegacyStartNowTrigger(element) && isEligible) {
        element.setAttribute('data-attaboy-start-now-cart-trigger', 'true');
      } else {
        element.removeAttribute('data-attaboy-start-now-cart-trigger');
      }
    });
  }

  function isStartNowLoading(trigger) {
    return trigger?.getAttribute(startNowLoadingAttribute) === 'true';
  }

  function setStartNowLoadingState(trigger, isLoading) {
    if (!trigger) {
      return;
    }

    trigger.setAttribute(startNowLoadingAttribute, isLoading ? 'true' : 'false');
    trigger.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    trigger.setAttribute('aria-disabled', isLoading ? 'true' : 'false');
    trigger.classList.toggle('is-loading', isLoading);

    if ('disabled' in trigger) {
      trigger.disabled = isLoading;
    }
  }

  function isEligibleStartNowContainer(container) {
    const productHandle = normalizeValue(container?.getAttribute('data-replo-product-handle'));
    const productId = String(container?.getAttribute('data-replo-product-container') || '').trim();

    return startNowEligibleHandles.has(productHandle) || startNowEligibleProductIds.has(productId);
  }

  function getStartNowForm(container) {
    return container?.querySelector(selectors.reploProductForm) || null;
  }

  function isVisibleElement(element) {
    return Boolean(element && (element.offsetWidth || element.offsetHeight || element.getClientRects().length));
  }

  function getEligibleStartNowContainers(root = document) {
    return Array.from(root.querySelectorAll(selectors.reploProductContainer)).filter((container) => {
      return isEligibleStartNowContainer(container) && Boolean(getStartNowForm(container));
    });
  }

  function getFallbackStartNowContainer(trigger) {
    const triggerRoot = trigger?.closest('[id^="replo-section-"], [id^="shopify-section-"], [data-section-id]') || null;
    const searchRoots = [triggerRoot, document].filter((root, index, roots) => {
      return root && roots.indexOf(root) === index;
    });

    for (const searchRoot of searchRoots) {
      const eligibleContainers = getEligibleStartNowContainers(searchRoot);

      if (!eligibleContainers.length) {
        continue;
      }

      const visibleContainers = eligibleContainers.filter(isVisibleElement);
      const candidatePool = visibleContainers.length ? visibleContainers : eligibleContainers;

      if (trigger) {
        const followingContainer = candidatePool.find((container) => {
          return Boolean(trigger.compareDocumentPosition(container) & Node.DOCUMENT_POSITION_FOLLOWING);
        });

        if (followingContainer) {
          return followingContainer;
        }
      }

      return candidatePool[0] || null;
    }

    return null;
  }

  function getStartNowContainer(trigger) {
    const nearestContainer = trigger?.closest(selectors.reploProductContainer) || null;

    if (nearestContainer && isEligibleStartNowContainer(nearestContainer) && getStartNowForm(nearestContainer)) {
      return nearestContainer;
    }

    return getFallbackStartNowContainer(trigger);
  }

  function getStartNowContext(trigger) {
    const container = getStartNowContainer(trigger);
    const form = getStartNowForm(container);
    const isEligible = Boolean(container && form && isEligibleStartNowContainer(container));

    return {
      trigger,
      container,
      form,
      isEligible,
    };
  }

  async function addStartNowItem(form) {
    const formData = new FormData(form);

    if (!formData.get('quantity')) {
      formData.set('quantity', '1');
    }

    if (!formData.get('selling_plan')) {
      formData.delete('selling_plan');
    }

    if (!formData.get('id')) {
      throw new Error('Missing Starter Kit variant id.');
    }

    const response = await fetch(getCartAddUrl(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.status) {
      throw new Error(data.description || data.message || 'Failed to add Starter Kit to cart.');
    }

    return data;
  }

  function getStartNowDetail(trigger, container, form, extra = {}) {
    return Object.assign(
      {
        productHandle: container?.getAttribute('data-replo-product-handle') || '',
        productId: container?.getAttribute('data-replo-product-container') || '',
        variantId: form?.querySelector('[name="id"]')?.value || '',
        sellingPlanId: form?.querySelector('[name="selling_plan"]')?.value || '',
      },
      extra
    );
  }

  async function handleStartNow(target = null) {
    const trigger = target instanceof Element ? target : null;
    const {container, form, isEligible} = getStartNowContext(trigger);

    if (!isCartFlowEnabled() || !trigger || isStartNowLoading(trigger) || !isEligible) {
      return null;
    }

    dispatchEventWithDetail(events.startNowClicked, getStartNowDetail(trigger, container, form));
    setStartNowLoadingState(trigger, true);

    try {
      await addStartNowItem(form);
      openCartDrawer();
      refreshCartDrawer();
      await waitForCartChange();

      dispatchEventWithDetail(events.startNowSuccess, getStartNowDetail(trigger, container, form));
      return {ok: true};
    } catch (error) {
      dispatchEventWithDetail(
        events.startNowError,
        getStartNowDetail(trigger, container, form, {
          message: error.message,
        })
      );

      return {
        ok: false,
        error,
      };
    } finally {
      setStartNowLoadingState(trigger, false);
    }
  }

  function onDirectButtonClick(event) {
    if (!isCartFlowEnabled()) {
      return;
    }

    event.__attaboyCart90DayHandled = true;
    stopEvent(event);
    upgrade(event.currentTarget);
  }

  function onDelegatedClick(event) {
    if (event.__attaboyCart90DayHandled) {
      return;
    }

    if (!(event.target instanceof Element)) {
      return;
    }

    const startNowTrigger = event.target.closest(
      `${selectors.startNowTrigger}, ${selectors.reploCartTrigger}`
    );

    if (startNowTrigger && isStartNowTrigger(startNowTrigger)) {
      if (!isCartFlowEnabled()) {
        return;
      }

      const {isEligible} = getStartNowContext(startNowTrigger);

      if (!isEligible) {
        return;
      }

      event.__attaboyCart90DayHandled = true;
      stopEvent(event);
      handleStartNow(startNowTrigger);
      return;
    }

    const button = event.target.closest(selectors.button);

    if (!button) {
      return;
    }

    if (!isCartFlowEnabled()) {
      return;
    }

    event.__attaboyCart90DayHandled = true;
    stopEvent(event);
    upgrade(button);
  }

  function bindDelegatedClickListener() {
    if (delegatedClickListenerBound) {
      return;
    }

    delegatedClickListenerBound = true;
    document.addEventListener('click', onDelegatedClick, true);
  }

  function bindDirectButtonListener(button) {
    if (!button || isButtonBound(button)) {
      return;
    }

    button.setAttribute('data-cart-90-day-bound', 'true');
    button.addEventListener('click', onDirectButtonClick);
  }

  function queueInit() {
    if (initQueued) {
      return;
    }

    initQueued = true;

    requestAnimationFrame(() => {
      initQueued = false;
      init();
    });
  }

  function bindWindowExperimentObserver() {
    if (windowExperimentObserverBound) {
      return;
    }

    windowExperimentObserverBound = true;

    ['ATTABOY_90_DAY_CART_VARIANT', 'ATTABOY_90_DAY_CART_FLOW_ENABLED'].forEach((propertyName) => {
      let currentValue = window[propertyName];

      try {
        Object.defineProperty(window, propertyName, {
          configurable: true,
          enumerable: true,
          get() {
            return currentValue;
          },
          set(value) {
            currentValue = value;
            queueInit();
          },
        });
      } catch (error) {
        // Ignore environments where the property cannot be redefined.
      }
    });
  }

  function bindExperimentClassObserver() {
    if (experimentClassObserver) {
      return;
    }

    experimentClassObserver = new MutationObserver(() => {
      queueInit();
    });

    [document.documentElement, document.body]
      .filter(Boolean)
      .forEach((node) => {
        experimentClassObserver.observe(node, {
          attributes: true,
          attributeFilter: ['class'],
        });
      });
  }

  function init() {
    const shouldEnableCartFlowBehavior = isCartFlowEnabled();

    hydrateStartNowTriggers();

    document.querySelectorAll(selectors.root).forEach((root) => {
      if (shouldEnableCartFlowBehavior) {
        toggleUpsellVisibility(root);
        bindDirectButtonListener(getButtonForRoot(root));
      } else {
        disableUpsellVisibility(root);
      }
    });

    document.querySelectorAll(selectors.giftsRoot).forEach((root) => {
      if (shouldEnableCartFlowBehavior) {
        toggleGiftsVisibility(root);
      } else {
        hideElement(root);
      }
    });

    document.querySelectorAll(selectors.cartPriceRoot).forEach((root) => {
      if (shouldEnableCartFlowBehavior) {
        toggleCartPriceCompare(root);
      } else {
        disableCartPriceCompare(root);
      }
    });

    bindDelegatedClickListener();
    bindWindowExperimentObserver();
    bindExperimentClassObserver();

    return debug();
  }

  window.AttaboyCart90DayUpsell = {
    init,
    debug,
    upgrade,
    handleStartNow,
    getActiveVariant: getActiveExperimentVariant,
    getCartFlowState,
    isCartFlowEnabled,
  };

  document.addEventListener('theme:cart:change', init);
  document.addEventListener('shopify:section:load', init);
  window.addEventListener('load', queueInit);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
