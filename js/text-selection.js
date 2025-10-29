// Text Selection Module
(function() {
  'use strict';

  class TextSelection {
    constructor() {
      this.callbacks = [];
      this.lastSelection = null;
      this.debounceTimer = null;
    }

    init() {
      document.addEventListener('mouseup', this.handleTextSelection.bind(this));
      document.addEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
          this.clearSelection();
        }
      });
    }

    handleTextSelection() {
      // Debounce to avoid multiple calls
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        const selectedText = this.getSelectedText();
        
        if (selectedText && selectedText !== this.lastSelection) {
          this.lastSelection = selectedText;
          this.notifyCallbacks(selectedText);
        }
      }, 150);
    }

    getSelectedText() {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = selection.toString().trim();
        
        // Only return non-empty selections
        if (selectedText) {
          return {
            text: selectedText,
            range: range,
            rect: range.getBoundingClientRect()
          };
        }
      }
      return null;
    }

    clearSelection() {
      this.lastSelection = null;
      window.getSelection().removeAllRanges();
    }

    onTextSelected(callback) {
      this.callbacks.push(callback);
    }

    notifyCallbacks(selectedTextData) {
      this.callbacks.forEach(callback => {
        callback(selectedTextData);
      });
    }
  }

  // Make the class available globally
  window.TextSelection = TextSelection;
})();