// Image Exporter Module
(function() {
  'use strict';

  class ImageExporter {
    constructor() {
      this.templateManager = new window.TemplateManager();
    }

    async exportAsImage(templateId, selectedText) {
      // Create a temporary DOM element with the template
      const templateContent = this.templateManager.getTemplateById(templateId);
      
      if (!templateContent) {
        console.error(`Template ${templateId} not found`);
        return;
      }
      
      // Get current page title
      const pageTitle = document.title;
      
      // Process template with data
      let processedTemplate = templateContent
        .replace(/\{\{selectedText\}\}/g, DOMPurify.sanitize(selectedText))
        .replace(/\{\{pageTitle\}\}/g, DOMPurify.sanitize(pageTitle));
      
      // Render template using Mustache if available
      if (typeof Mustache !== 'undefined') {
        processedTemplate = Mustache.render(processedTemplate, {
          selectedText: selectedText,
          pageTitle: pageTitle
        });
      }
      
      // Create a hidden container to render the template
      const container = document.createElement('div');
      container.id = 'text2social-hidden-container';
      container.innerHTML = processedTemplate;
      container.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 400px;
        height: 300px;
        overflow: hidden;
        z-index: -1;
        background: white;
      `;
      
      document.body.appendChild(container);

      try {
        // Wait for any images to load
        await this.waitForImages(container);
        
        // Use html2canvas to convert the DOM element to canvas
        const canvas = await html2canvas(container, {
          backgroundColor: null, // Use transparent background if needed
          scale: 2, // Higher scale for better quality
          useCORS: true, // Enable CORS for external images
          allowTaint: true, // Allow cross-origin images
          width: container.offsetWidth,
          height: container.offsetHeight
        });
        
        // Convert canvas to PNG blob
        canvas.toBlob((blob) => {
          this.copyImageToClipboard(blob);
        }, 'image/png');
      } catch (error) {
        console.error('Error generating image:', error);
      } finally {
        // Remove the temporary container
        document.body.removeChild(container);
      }
    }

    async waitForImages(container) {
      const images = container.querySelectorAll('img');
      const promises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = resolve; // Continue even if image fails to load
          // Set timeout to avoid hanging indefinitely
          setTimeout(reject, 5000);
        });
      });
      
      try {
        await Promise.all(promises);
      } catch (error) {
        console.warn('Some images failed to load before timeout');
      }
    }

    copyImageToClipboard(blob) {
      const item = new ClipboardItem({ 'image/png': blob });
      navigator.clipboard.write([item])
        .then(() => {
          console.log('Image copied to clipboard');
          
          // Show a temporary notification
          this.showNotification('Image copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy image: ', err);
          
          // Fallback for browsers that don't support clipboard API
          this.downloadImage(blob);
        });
    }

    showNotification(message) {
      // Create a temporary notification element
      const notification = document.createElement('div');
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #34a853;
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: Arial, sans-serif;
      `;
      
      document.body.appendChild(notification);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
    }

    downloadImage(blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'text2social-export.png';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    }
  }

  // Make the class available globally
  window.ImageExporter = ImageExporter;
})();