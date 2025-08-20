
/**
 * @typedef {Object} EditAction - Input action (in Undo/Redo history)
 * @property {string} inputType - Input type of the event
 * @property {string} insertedText - Text added to the input
 * @property {string} replacedText - Text that was replaced
 * @property {number} startPos - Start position of inserted text
 * @property {number} endPos - Start position of inserted text
 * @property {'select'|'start'|'end'} selectionMode - Selection mode after undo/redo
 * @property {boolean} chained - Is this a chained event?
 * @property {EditAction} [undo] - Previous undo
 */

/** Custom TextArea element with undo/redo stack */
class URTTextAreaElement extends HTMLTextAreaElement {
  // static observedAttributes = ['max'+'length'];
  /** Constructor */
  constructor() {
    super(); // Always call super first in constructor
  }

  /** @type EditAction[] - Undo stack */
  undoStack = [];
  /** @type EditAction[] - Redo stack */
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

  /** @type {function} Callback function for content change */
  updateCallback;

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
   * Start a timer for update delay
   */
  startUpdateDelay() {
    if (this.updateDelayTimer) {
      clearTimeout(this.updateDelayTimer);
    } else {
      this.classList.add('update-pending');
    };
    this.updateDelayTimer = setTimeout(updateCallback, this.updateDelay);
  }

  /**
   * Chained addEventListener
   * @param {string} type
   * @param {function} handler
   * @return {HTMLElement}
   */
  on(type, handler) {
    this.addEventListener(type, handler);
    return this;
  }

  /**
   * Undo change
   * @param {*} chained - Continue to do next Undo?
   */
  undo(chained) {
    if (this.undoStack.length === 0) return;
    const action = this.undoStack.pop();

    this.setRangeText(
        action.replacedText,
        action.startPos,
        action.endPos,
        action.selectionMode);

    this.focus();

    this.redoStack.push({
      inputType: action.inputType,
      insertedText: action.replacedText,
      replacedText: action.insertedText,
      startPos: action.startPos,
      endPos: action.startPos + action.replacedText.length,
      selectionMode: action.selectionMode,
      chained: chained,
      undo: action,
    });

    if (action.chained) this.undo(true);
    else this.startUpdateDelay();
  }

  /**
   * Redo change
   */
  redo() {
    if (this.redoStack.length === 0) return;
    const action = this.redoStack.pop();
    this.setRangeText(
        action.replacedText,
        action.startPos,
        action.endPos,
        action.selectionMode,
    );

    this.focus();
    this.undoStack.push(action.undo);

    if (action.chained) this.redo();
    else this.startUpdateDelay();
  }

  /**
   * Add an action to undo history
   * @param {EditAction} action
   */
  pushUndo(action) {
    this.undoStack.push(action);
    this.redoStack.length = 0; // Clear redo history
    this.startUpdateDelay();
  }


  /**
   * Perform an editing action
   * @param {string} inserted - Replacement text
   * @param {number} selStart - Index of the first selected character.
   * @param {number} selEnd - Index of the character *after* the last selected character
   */
  edit(inserted, selStart, selEnd) {
    this.focus();
    this.setRangeText(inserted, selStart, selEnd, 'select');
    const action = {
      insertedText: inserted,
      replacedText: this.selectedText,
      startPos: selStart,
      endPos: selStart + inserted.length,
      selectionMode: 'select',
      chained: false,
    };
    this.pushUndo(action);
  }

  /**
  * Event handler for IME input change
  * @param {InputEvent} e
  */
  imgChange(e) {
    if (this.imeTextStart === this.selectionEnd) return; // All input were deleted
    const inserted = this.value.slice(this.imeTextStart, this.imeTextEnd);
    const replaced = this.imeBefore;
    this.pushUndo({
      inputType: 'insertCompositionText',
      insertedText: inserted,
      replacedText: replaced,
      startPos: this.imeTextStart,
      endPos: this.imeTextEnd,
      selectionMode: 'end',
    });
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
   * Event handler for paste command
   * @param {InputEvent} e
   */
  paste(e) {
    const inserted = e.clipboardData.getData('text');
    const action = {
      inputType: 'paste',
      insertedText: inserted,
      replacedText: this.selectedText,
      startPos: this.selectionEnd,
      endPos: this.selectionEnd + inserted.length,
      selectionMode: 'end',
      chained: false,
    };
    this.pushUndo(action);
  }

  /**
   * Event handler for cut command
   * @param {InputEvent} e
   */
  cut(e) {
    const action = {
      inputType: 'cut',
      insertedText: '',
      replacedText: this.selectedText,
      startPos: this.selectionStart,
      endPos: this.selectionStart,
      selectionMode: 'select',
      chained: false,
    };
    this.pushUndo(action);
  }

  /**
   * Cache content deleted by BackSpace/Delete
   * @param {InputEvent} e
   */
  beforeInputChange(e) {
    const {selectionStart, selectionEnd} = this;
    if (selectionStart === selectionEnd) {
      switch (e.inputType) {
        case 'deleteContentBackward':
          this.selectedText = this.value.slice(
              selectionStart - 1,
              selectionEnd,
          );
          return;
        case 'deleteContentForward':
          this.selectedText = this.value.slice(
              selectionStart,
              selectionEnd + 1,
          );
          return;
      }
    }
  }

  /**
   * Event handler for input change
   * @param {InputEvent} e
   */
  inputChange(e) {
    const replaced = this.getSelectionText();

    /** @type {EditAction|null} */
    let action = null;

    switch (e.inputType) {
      case 'historyUndo':
      case 'historyRedo':
        e.preventDefault();
        return;

      case 'insertCompositionText':
        return; // Already handled by imgChange

      case 'deleteContentBackward':
        action = {
          inputType: e.inputType,
          insertedText: '',
          replacedText: replaced,
          startPos: this.selectionEnd,
          endPos: this.selectionEnd,
          selectionMode: 'end',
          chained: false,
        };
        break;

      case 'deleteContentForward':
        action = {
          inputType: e.inputType,
          insertedText: '',
          replacedText: replaced,
          startPos: this.selectionEnd,
          endPos: this.selectionEnd,
          selectionMode: 'start',
          chained: false,
        };
        break;

      case 'deleteByDrag':
        action = {
          inputType: e.inputType,
          insertedText: '',
          replacedText: replaced,
          startPos: this.selectionEnd,
          endPos: this.selectionEnd,
          selectionMode: 'select',
          chained: false,
        };
        break;

      case 'insertFromDrop': {
        action = {
          inputType: e.inputType,
          insertedText: replaced,
          replacedText: '',
          startPos: this.selectionStart,
          endPos: this.selectionEnd,
          selectionMode: 'select',
          chained: false,
        };
        if (this.undoStack.length) {
          const prevUndo = this.undoStack[this.undoStack.length - 1];
          if (
            (prevUndo.inputType === 'deleteByDrag') &&
            (prevUndo.replacedText === replaced)
          ) {
            action.chained = true;
          }
        }
        break;
      }

      case 'insertLineBreak': {
        action = {
          inputType: e.inputType,
          insertedText: '\n',
          replacedText: replaced,
          startPos: this.selectionEnd - 1,
          endPos: this.selectionEnd,
          selectionMode: 'end',
          chained: false,
        };
        break;
      }

      case 'insertText':
      default: {
        if (e.data !== null) {
          action = {
            inputType: e.inputType,
            insertedText: e.data,
            replacedText: replaced,
            startPos: this.selectionEnd - e.data.length,
            endPos: this.selectionEnd,
            selectionMode: 'end',
            chained: false,
          };
        };
      }
    };

    if (action !== null) {
      this.pushUndo(action);
      this.startUpdateDelay();
    }
  }

  /** Called when added to DOM */
  connectedCallback() {
    this
        .on('selectionchange', (e) => this.selectionChange(e))
        .on('compositionstart', (e) => this.imeStart(e))
        .on('compositionupdate', (e) => this.imeUpdate(e))
        .on('compositionend', (e) => this.imgChange(e))
        .on('cut', (e) => this.cut(e))
        .on('paste', (e) => this.paste(e))
        .on('beforeinput', (e) => this.beforeInputChange(e))
        .on('input', (e) => this.inputChange(e));

    const macOS = (navigator.userAgent.toLowerCase().indexOf('mac os') !== -1);

    if (macOS) {
      this.on('keydown', (e) => {
        if ((e.metaKey) && (e.key === 'z')) {
          if (!e.shiftKey) this.undo(); else this.redo();
        }
      });
    } else {
      this.on('keydown', (e) => {
        if (!e.ctrlKey) return;
        if (e.key === 'z') {
          if (!e.shiftKey) this.undo(); else this.redo();
        } else if (e.key === 'y') {
          this.redo();
        }
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

customElements.define('urt-text-area', URTTextAreaElement);
