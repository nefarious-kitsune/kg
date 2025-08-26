let DEBUG_URT_TEXTAREA;

/**
 * @typedef {Object} EditHistory - Edit history
 * @property {string} inputType - Input type of the event
 * @property {string} insertedText - Text added to the input
 * @property {string} replacedText - Text that was replaced
 * @property {number} startPos - Start position of inserted text
 * @property {number} endPos - End position of inserted text
 * @property {'select'|'start'|'end'} selectionMode - Selection mode after undo/redo
 * @property {boolean} chained - Is this a chained event?
 */

/** Custom TextArea element with undo/redo stack */
export class URTTextAreaElement extends HTMLTextAreaElement {
  // static observedAttributes = ['max'+'length'];
  /** Constructor */
  constructor() {
    super(); // Always call super first in constructor
  }

  /** @type EditHistory[] - Undo stack */
  undoStack = [];
  /** @type EditHistory[] - Redo stack */
  redoStack = [];
  /** @type {string} - IME input text */
  imeBefore = '';
  /** @type {number} - IME selection start position */
  imeTextStart = 0;
  /** @type {number} - IME selection end position*/
  imeTextEnd = 0;
  /** @type {string} Selected text */
  selectedText = '';

  /** @type {number} Timer ID for update cooldown timer */
  updateDelayTimer = 0;

  /** @type {number} Update cooldown in milliseconds */
  updateDelay = 800;

  /** @type {boolean} Is the TextArea under update cooldown? */
  updatePending = false;

  /** @type {function} Callback function for content change */
  updateCallback;

  /** @type {function} Callback function for command action */
  commandCallback;

  /** @type {string} Cached value for delete event */
  prevValue;

  /**
   * Event handler for command key stroke
   * @param {InputEvent} e
   */
  commandKey(e) {
    if (e.key === 'z') {
      this.undoHistory();
      e.preventDefault();
    } else if (e.key === 'Z') {
      this.redoHistory();
      e.preventDefault();
    } else {
      if (typeof this.commandCallback === 'function') {
        this.commandCallback.call(this, e);
      };
    }
  }

  /**
   * Start a timer for update delay
   */
  startUpdateDelay() {
    if (this.updatePending) {
      clearTimeout(this.updateDelayTimer);
    } else {
      this.updatePending = true;
      this.classList.add('update-pending');
    };
    this.updateDelayTimer = setTimeout((e) => this.update(), this.updateDelay);
  }

  /**
   * Clear timer for update delay
   */
  clearUpdateDelay() {
    this.updatePending = false;
    this.classList.remove('update-pending');
    clearTimeout(this.updateDelayTimer);
  }

  /**
   * Update TextArea
   */
  update() {
    this.clearUpdateDelay();
    if (typeof this.updateCallback === 'function') this.updateCallback();
  }

  /** @type {string} selected text */
  selectedText = '';

  /**
   * Get selection text
   * @return {string}
   */
  getSelectionText() {
    return this.value.slice(this.selectionStart, this.selectionEnd);
  }

  /**
   * Event handler for selection change
   * @param {InputEvent} e
   */
  selectionChange(e) {
    this.selectedText = this.getSelectionText();
  }

  /**
   * Chained addEventListener
   * @param {string} type - Event type
   * @param {function} handler - Event handler
   * @return {HTMLElement}
   */
  on(type, handler) {
    this.addEventListener(type, handler);
    return this;
  }

  /**
   * Clear editing history
   */
  clearHistory() {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
  }

  /**
   * Undo change
   * @param {*} chained - Continue to do next Undo?
   */
  undoHistory() {
    if (this.undoStack.length === 0) return;
    const action = this.undoStack.pop();

    this.setRangeText(
        action.replacedText,
        action.startPos,
        action.endPos,
        action.selectionMode);

    this.focus();

    if (DEBUG_URT_TEXTAREA) console.log('Undo action', action);

    this.redoStack.push(action);

    if (action.chained) this.undoHistory();
    else this.update();
  }

  /**
   * Redo change
   */
  redoHistory() {
    if (this.redoStack.length === 0) return;
    const action = this.redoStack.pop();
    this.setRangeText(
        action.insertedText,
        action.startPos,
        action.startPos + action.replacedText.length,
        action.selectionMode,
    );

    this.focus();

    if (DEBUG_URT_TEXTAREA) console.log('Redo action', action);

    // this.undoStack.push(action.undo);
    this.undoStack.push(action);

    if (action.chained) this.redoHistory();
    else this.update();
  }

  /**
   * Update undo history with a new action
   * @param {EditHistory} newAction
   */
  updateHistory(newAction) {
    if (this.undoStack.length && this.updatePending) {
      const prevAction = this.undoStack[this.undoStack.length - 1];
      if (
        (prevAction.inputType === newAction.inputType) &&
        (prevAction.selectionMode !== 'select')
      ) {
        switch (prevAction.inputType) {
          case 'insertText':
            if (prevAction.endPos === newAction.startPos) {
              prevAction.endPos = newAction.endPos;
              prevAction.insertedText += newAction.insertedText;
              if (DEBUG_URT_TEXTAREA) console.log('Action updated', prevAction);
              return;
            };
            break;
          case 'insertLineBreak':
            if (prevAction.endPos === newAction.startPos) {
              prevAction.endPos = newAction.endPos;
              prevAction.insertedText += '\n';
              if (DEBUG_URT_TEXTAREA) console.log('Action updated', prevAction);
              return;
            };
            break;
          case 'deleteContentBackward':
            if (
              prevAction.endPos ===
              newAction.endPos + newAction.replacedText.length
            ) {
              prevAction.endPos = newAction.endPos;
              prevAction.startPos = newAction.endPos;
              prevAction.replacedText =
                  newAction.replacedText +
                  prevAction.replacedText;
              if (DEBUG_URT_TEXTAREA) console.log('Action updated', prevAction);
              return;
            };
            break;
          case 'deleteContentForward':
            if (prevAction.endPos === newAction.endPos) {
              prevAction.replacedText += newAction.replacedText;
              if (DEBUG_URT_TEXTAREA) console.log('Action updated', prevAction);
              return;
            };
            break;
        };
      }
    }
    this.undoStack.push(newAction);
    if (DEBUG_URT_TEXTAREA) console.log('Action added', newAction);
    this.redoStack.length = 0; // Clear redo history
    this.startUpdateDelay();
  }

  /**
   * Perform a programmatic editing action
   * @param {string} inserted - Replacement text
   * @param {number} selStart - Index of the first selected character.
   * @param {number} selEnd - Index of the character *after* the last selected character
   */
  edit(inserted, selStart, selEnd) {
    const replaced = this.value.slice(selStart, selEnd);

    this.focus();
    this.setRangeText(inserted, selStart, selEnd, 'select');

    /** @type {EditHistory} */
    const action = {
      inputType: 'insertText',
      insertedText: inserted,
      replacedText: replaced,
      startPos: selStart,
      endPos: selStart + inserted.length,
      selectionMode: 'select',
      chained: false,
    };
    this.updateHistory(action);
  }

  /**
   * Event handler for IME composition start
   * @param {InputEvent} e
   */
  imeStart(e) {
    this.imeBefore = this.getSelectionText();
  }

  /**
   * Event handler for IME composition update
   * @param {InputEvent} e
   */
  imeUpdate(e) {
    this.imeTextStart = this.selectionStart;
    this.imeTextEnd = this.selectionEnd;
  }

  /**
   * Event handler for text insertion
   * @param {InputEvent} e
   */
  insertText(e) {
    const inserted = e.data;
    const replaced = this.selectedText;
    const action = {
      inputType: e.inputType,
      insertedText: inserted,
      replacedText: replaced,
      startPos: this.selectionEnd - inserted.length,
      endPos: this.selectionEnd,
      selectionMode: 'end',
      chained: false,
    };
    if (replaced.length) action.selectionMode = 'select';
    this.updateHistory(action);
  }

  /**
   * Event handler for text drag and drop
   * @param {InputEvent} e
   */
  insertFromDrop(e) {
    const inserted = e.data;
    const replaced = '';
    const action = {
      inputType: e.inputType,
      insertedText: inserted,
      replacedText: replaced,
      startPos: this.selectionStart,
      endPos: this.selectionEnd,
      selectionMode: 'select',
      chained: false,
    };
    if (this.undoStack.length) {
      const prevUndo = this.undoStack[this.undoStack.length - 1];
      if (
        (prevUndo.inputType === 'deleteByDrag') &&
        (prevUndo.replacedText === inserted)
      ) {
        action.chained = true;
      }
    }
    this.updateHistory(action);
  }

  /**
  * Event handler for text insertion by IME
  * @param {InputEvent} e
  */
  insertByComposition(e) {
    if (this.imeTextStart === this.selectionEnd) return; // All input were deleted
    const inserted = this.value.slice(this.imeTextStart, this.imeTextEnd);
    const replaced = this.imeBefore;
    const action = {
      inputType: e.inputType,
      insertedText: inserted,
      replacedText: replaced,
      startPos: this.imeTextStart,
      endPos: this.imeTextEnd,
      selectionMode: 'end',
    };
    if (replaced.length) action.selectionMode = 'select';

    this.updateHistory();
  }


  /**
   * Event handler for 'deleteContentForward' and 'deleteWordForward'
   * @param {InputEvent} e
   */
  deleteForward(e) {
    const deletedLen = this.prevValue.length - this.value.length;
    const deletedText = this.prevValue.slice(
        this.selectionStart,
        this.selectionStart + deletedLen,
    );

    const action = {
      inputType: e.inputType,
      insertedText: '',
      replacedText: deletedText,
      startPos: this.selectionStart,
      endPos: this.selectionStart,
      selectionMode: 'start',
      chained: false,
    };

    if (this.selectedText.length) action.selectionMode = 'select';

    this.updateHistory(action);
  }

  /**
   * Event handler for 'deleteContentBackward' and 'deleteWordBackward'
   * @param {InputEvent} e
   */
  deleteBackward(e) {
    const deletedLen = this.prevValue.length - this.value.length;
    const deletedText = this.prevValue.slice(
        this.selectionStart,
        this.selectionStart + deletedLen,
    );

    const action = {
      inputType: 'deleteContentBackward',
      insertedText: '',
      replacedText: deletedText,
      startPos: this.selectionEnd,
      endPos: this.selectionEnd,
      selectionMode: 'end',
      chained: false,
    };

    if (this.selectedText.length) {
      // action.endPos += this.selectedText.length;
      action.selectionMode = 'select';
    }

    this.updateHistory(action);
  }

  /**
   * Cache content deleted by BackSpace/Delete
   * @param {InputEvent} e
   */
  beforeInputChange(e) {
    this.prevValue = this.value;
    // switch (e.inputType) {
    //   case 'deleteContentBackward':
    //   case 'deleteContentForward':
    //   case 'deleteWordBackward':
    //   case 'deleteWordForward':
    //     this.prevValue = this.value;
    //     return;
    // }
  }

  /**
   * Event handler for input change
   * @param {InputEvent} e
   */
  inputChange(e) {
    switch (e.inputType) {
      case 'historyUndo':
      case 'historyRedo':
        e.preventDefault();
        return;

      case 'deleteWordBackward': e.inputType = 'deleteContentBackward';
      case 'deleteContentBackward':
        this.deleteBackward(e);
        return;

      case 'deleteWordForward': e.inputType = 'deleteContentForward';
      case 'deleteContentForward':
        this.deleteForward(e);
        return;

      case 'deleteContent':
      case 'deleteByCut':
      case 'deleteByDrag':
        this.deleteForward(e);
        return;

      case 'insertLineBreak':
        e.data = '\n';
      case 'insertText':
      case 'insertFromPaste':
        this.insertText(e);
        return;

      case 'insertFromDrop':
        this.insertFromDrop(e);
        return;

      case 'insertCompositionText':
        this.insertByComposition(e);
        return;

      default: {
        if (DEBUG_URT_TEXTAREA) console.log('Unknown event: ', e.inputType);
        if (e.data !== null) this.insertText(e);
        else this.deleteForward(e);
      }
    };
  }

  /** Called when added to DOM */
  connectedCallback() {
    this
        .on('selectionchange', (e) => this.selectionChange(e))
        .on('compositionstart', (e) => this.imeStart(e))
        .on('compositionupdate', (e) => this.imeUpdate(e))
        .on('beforeinput', (e) => this.beforeInputChange(e))
        .on('input', (e) => this.inputChange(e));

    const macOS = (navigator.userAgent.toLowerCase().indexOf('mac os') !== -1);

    if (macOS) {
      this.on('keydown', (e) => {
        if (e.metaKey) this.commandKey(e);
      });
    } else {
      this.on('keydown', (e) => {
        if (e.ctrlKey) this.commandKey(e);
      });
    }
  }

  /** Called when removed to DOM */
  disconnectedCallback() {
  }

  /** Called when moved within DOM */
  connectedMoveCallback() {
  }

  /**
   * Called when observed attributes are changed
   * @param {*} name Attribute name
   * @param {*} oldValue Old attribute value
   * @param {*} newValue New attribute value
   */
  attributeChangedCallback(name, oldValue, newValue) {
  }
}

customElements.define(
    'urt-text-area',
    URTTextAreaElement,
    {extends: 'textarea'});
