// Icon Display Module
(function() {
  'use strict';

  class IconDisplay {
    constructor() {
      this.iconElement = null;
      this.callbacks = [];
      this.currentPageTitle = document.title;
    }

    showIcon(selectionData) {
      // Remove existing icon if present
      this.removeIcon();
      
      // Create icon element
      this.iconElement = document.createElement('div');
      this.iconElement.id = 'text2social-icon';
      this.iconElement.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5"></path>
        </svg>
      `;
      
      // Add styling
      this.iconElement.style.cssText = `
        position: fixed;
        z-index: 10000;
        width: 40px;
        height: 40px;
        background-color: #4285f4;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        transition: all 0.2s ease;
      `;
      
      // Position the icon to the right of the selection
      const rect = selectionData.rect;
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      
      this.iconElement.style.left = (rect.right + scrollX + 10) + 'px';
      this.iconElement.style.top = (rect.top + scrollY) + 'px';
      
      // Add hover effect
      this.iconElement.addEventListener('mouseenter', () => {
        this.iconElement.style.transform = 'scale(1.1)';
        this.iconElement.style.backgroundColor = '#3367d6';
      });
      
      this.iconElement.addEventListener('mouseleave', () => {
        this.iconElement.style.transform = 'scale(1)';
        this.iconElement.style.backgroundColor = '#4285f4';
      });
      
      // Add click handler
      this.iconElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleClick(selectionData.text);
      });
      
      // Append to document
      document.body.appendChild(this.iconElement);
      
      // Auto-hide after some time
      setTimeout(() => {
        this.removeIcon();
      }, 5000);
    }

    handleClick(selectedText) {
      this.removeIcon();
      this.notifyCallbacks(selectedText);
    }

    removeIcon() {
      if (this.iconElement && this.iconElement.parentNode) {
        this.iconElement.parentNode.removeChild(this.iconElement);
        this.iconElement = null;
      }
    }

    onIconClick(callback) {
      this.callbacks.push(callback);
    }

    notifyCallbacks(selectedText) {
      this.callbacks.forEach(callback => {
        callback(selectedText);
      });
    }
  }

  // Make the class available globally
  window.IconDisplay = IconDisplay;
})();