let DEBUG = true;

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
      this.undo();
      e.preventDefault();
    } else if (e.key === 'Z') {
      this.redo();
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
    this.updateDelayTimer = setTimeout(() => this.update(), this.updateDelay);
  }

  /**
   * Update TextArea
   */
  update() {
    this.updatePending = false;
    if (typeof this.updateCallback === 'function') {
      this.updateCallback();
    }
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
   * Undo change
   * @param {*} chained - Continue to do next Undo?
   */
  undo() {
    if (this.undoStack.length === 0) return;
    const action = this.undoStack.pop();

    this.setRangeText(
        action.replacedText,
        action.startPos,
        action.endPos,
        action.selectionMode);

    this.focus();

    if (DEBUG) console.log('Undo action', action);

    this.redoStack.push({
      inputType: action.inputType,
      insertedText: action.replacedText,
      replacedText: action.insertedText,
      startPos: action.startPos,
      endPos: action.startPos + action.replacedText.length,
      selectionMode: action.selectionMode,
      chained: action.chained,
      undo: action,
    });

    if (action.chained) this.undo();
    else this.update();
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

    if (DEBUG) console.log('Redo action', action);

    this.undoStack.push(action.undo);

    if (action.chained) this.redo();
    else this.update();
  }

  /**
   * Update undo history with a new action
   * @param {EditAction} newAction
   */
  updateUndo(newAction) {
    if (this.undoStack.length && this.updatePending) {
      const prevAction = this.undoStack[this.undoStack.length - 1];
      if (prevAction.inputType === newAction.inputType) {
        switch (prevAction.inputType) {
          case 'insertText':
            if (prevAction.endPos === newAction.startPos) {
              prevAction.endPos = newAction.endPos;
              prevAction.insertedText += newAction.insertedText;
              if (DEBUG) console.log('Action updated', prevAction);
              return;
            };
            break;
          case 'insertLineBreak':
            if (prevAction.endPos === newAction.startPos) {
              prevAction.endPos = newAction.endPos;
              prevAction.insertedText += '\n';
              if (DEBUG) console.log('Action updated', prevAction);
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
              if (DEBUG) console.log('Action updated', prevAction);
              return;
            };
            break;
          case 'deleteContentForward':
            if (prevAction.endPos === newAction.endPos) {
              prevAction.replacedText += newAction.replacedText;
              if (DEBUG) console.log('Action updated', prevAction);
              return;
            };
            break;
        };
      }
    }
    this.undoStack.push(newAction);
    if (DEBUG) console.log('Action added', newAction);
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
    this.updateUndo(action);
  }

  /**
  * Event handler for IME input change
  * @param {InputEvent} e
  */
  imgChange(e) {
    if (this.imeTextStart === this.selectionEnd) return; // All input were deleted
    const inserted = this.value.slice(this.imeTextStart, this.imeTextEnd);
    const replaced = this.imeBefore;
    this.updateUndo({
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
    this.updateUndo(action);
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
    this.updateUndo(action);
  }

  /**
   * Cache content deleted by BackSpace/Delete
   * @param {InputEvent} e
   */
  beforeInputChange(e) {
    switch (e.inputType) {
      case 'deleteContentBackward':
      case 'deleteContentForward':
      case 'deleteWordBackward':
      case 'deleteWordForward':
        this.prevValue = this.value;
        return;
    }
    /*
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
    */
  }

  /**
   * Event handler for input change
   * @param {InputEvent} e
   */
  inputChange(e) {
    const replaced = this.selectedText;
    let deletedText;
    let deletedLen;

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
      case 'deleteWordBackward':
        deletedLen = this.prevValue.length - this.value.length;
        deletedText = this.prevValue.slice(
            this.selectionStart,
            this.selectionStart + deletedLen,
        );
        action = {
          inputType: e.inputType,
          insertedText: '',
          replacedText: deletedText,
          startPos: this.selectionEnd,
          endPos: this.selectionEnd,
          /*
          replacedText: replaced,
          startPos: this.selectionEnd,
          endPos: this.selectionEnd,
          */
          selectionMode: 'end',
          chained: false,
        };
        break;

      case 'deleteContentForward':
      case 'deleteWordForward':
        deletedLen = this.prevValue.length - this.value.length;
        deletedText = this.prevValue.slice(
            this.selectionStart,
            this.selectionStart + deletedLen,
        );
        action = {
          inputType: e.inputType,
          insertedText: '',
          replacedText: deletedText,
          startPos: this.selectionStart,
          endPos: this.selectionStart,
          /*
          replacedText: replaced,
          startPos: this.selectionEnd,
          endPos: this.selectionEnd,
          */
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
      this.updateUndo(action);
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
