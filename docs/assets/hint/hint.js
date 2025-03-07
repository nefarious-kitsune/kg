/* eslint-env browser */

/** Is the external reference document loaded? */
let refDocLoaded = false;

/** Is the local document loaded? */
let localDocLoaded = false;

/** @type {Map<string, DocumentFragment} */
const hintTemplates = new Map();

const touchScreen =
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0);

const xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
  if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
    const parser = new DOMParser();
    const dom = parser.parseFromString(htmlString, xhr.responseText);
    loadHintTemplates(dom);
    refDocLoaded = true;
    prepareHints();
  }
};

xhr.open('GET', '/assets/hint/hint-templates', true);
xhr.send();

document.addEventListener('DOMContentLoaded', (e) => {
  loadHintTemplates(document);
  localDocLoaded = true;
  prepareHints();
});

/**
 * Cache hint templates
 * @param {Document} dom
 */
function loadHintTemplates(dom) {
  const templates = [...dom.querySelectorAll('template[--hint-id]')];
  templates.forEach((temp) => {
    const id = temp.getAttribute('--hint-id');
    const content = temp.content;
    hintTemplates.set(id, content);
  });
}

/**
 * Prepare hints
 */
function prepareHints() {
  if (!localDocLoaded || !refDocLoaded) return;

  // Prepare .has-hint elements
  const elements = [...document.querySelectorAll('[--has-hint]')];
  elements.forEach((element) => {
    const hintRef = element.getAttribute('--hint-ref');
    if (hintRef && hintTemplates.has(hintRef)) {
      const hintNode = hintTemplates.get(hintRef).cloneNode(true);
      element.appendChild(hintNode);
      element.hintNode = element.lastElementChild;
      element.classList.add('has-hint');
      if (touchScreen) element.setAttribute('tabindex', 0);
      else element.addEventListener('mouseover', showHint);
    } else {
      console.warn(`Hint ref '${hintRef}' not found`);
    };
  });
}

/**
 * Get the best placement for the element's hint
 * @param {Element} target - target element
 * @param {Element} hint - hint element
 * @return {string} - best placement for the hint
 */
function getHintPlacement(target, hint) {
  // Viewport width and height (without scrollbars)
  const clientWidth = document.documentElement.clientWidth;
  const clientHeight = document.documentElement.clientHeight;

  /** Minimum clearance from viewport */
  const gutter = 20;

  const rect = target.getBoundingClientRect();
  const hintRect = hint.getBoundingClientRect();

  const hCenter = rect.left + (rect.width / 2);
  const vCenter = rect.top + (rect.height / 2);
  const topClearance = vCenter - (hintRect.height / 2);
  const bottomClearance = clientHeight - vCenter - (hintRect.height / 2);
  const rightClearance = clientWidth - hCenter - (hintRect.width / 2);
  const leftClearance = hCenter - (hintRect.width / 2);

  if (topClearance > 0 && bottomClearance > 0) {
    if (rightClearance < gutter) return 'place-left';
    if (leftClearance < gutter) return 'place-right';
  }
  if (rect.top - hintRect.height < gutter) {
    return 'place-bottom';
  }
  return 'place-top';
}


/**
 * Show hint
 * @param {MouseEvent} e - event
 */
function showHint(e) {
  /** @type {Element} */ const target = e.target;
  /** @type {Element} */ const hint = target.hintNode;

  if (hint) {
    const placement = getHintPlacement(target, hint);
    hint.classList.remove(
        'place-left', 'place-right',
        'place-top', 'place-bottom');
    hint.classList.add(placement);
  }
}
