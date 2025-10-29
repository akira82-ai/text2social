// Preview Renderer Module
(function() {
  'use strict';

  class PreviewRenderer {
    constructor() {
      this.previewWindow = null;
      this.currentTemplateId = null;
      this.callbacks = {
        templateSelected: [],
        exportRequest: []
      };
    }

    showPreview(selectedText, templates) {
      // Close any existing preview
      if (this.previewWindow && !this.previewWindow.closed) {
        this.previewWindow.close();
      }

      // Create a new preview window
      this.previewWindow = window.open('', 'text2social-preview', 'width=600,height=700,resizable,scrollbars=yes');
      
      // Write the preview UI to the new window
      this.previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Text2Social Preview</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background-color: #f5f5f5;
            }
            .container { 
              max-width: 560px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 8px; 
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header { 
              background-color: #4285f4; 
              color: white; 
              padding: 15px; 
              text-align: center;
            }
            .controls { 
              padding: 15px; 
              background: #f9f9f9; 
              border-bottom: 1px solid #eee;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .template-selector { 
              padding: 8px 12px; 
              border-radius: 4px; 
              border: 1px solid #ddd; 
            }
            .export-btn { 
              background-color: #34a853; 
              color: white; 
              border: none; 
              padding: 10px 20px; 
              border-radius: 4px; 
              cursor: pointer; 
            }
            .export-btn:hover { 
              background-color: #2d8f47; 
            }
            .preview-content { 
              padding: 20px; 
              min-height: 300px; 
              display: flex; 
              justify-content: center; 
              align-items: center;
            }
            .loading { 
              text-align: center; 
              padding: 40px; 
              color: #666; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Text2Social Preview</h2>
            </div>
            <div class="controls">
              <select class="template-selector" id="templateSelector">
                ${templates.map(t => `<option value="${t.id}">${t.id}</option>`).join('')}
              </select>
              <button class="export-btn" id="exportBtn">Copy as Image</button>
            </div>
            <div class="preview-content" id="previewContent">
              <div class="loading">Select a template to preview</div>
            </div>
          </div>
          
          <script>
            // In preview window context
            let selectedText = "${selectedText.replace(/"/g, '&quot;')}"; // Escape quotes
            let templates = ${JSON.stringify(templates)};
            
            const templateSelector = document.getElementById('templateSelector');
            const exportBtn = document.getElementById('exportBtn');
            const previewContent = document.getElementById('previewContent');
            
            // Set up template selection
            templateSelector.onchange = function() {
              const selectedTemplateId = this.value;
              // Send message to parent window
              window.opener.postMessage({
                type: 'templateSelected',
                templateId: selectedTemplateId,
                selectedText: selectedText
              }, '*');
            };
            
            // Set up export button
            exportBtn.onclick = function() {
              const selectedTemplateId = templateSelector.value;
              // Send message to parent window
              window.opener.postMessage({
                type: 'exportRequest',
                templateId: selectedTemplateId,
                selectedText: selectedText
              }, '*');
            };
            
            // Listen for rendered template from parent
            window.addEventListener('message', function(event) {
              if (event.data.type === 'renderTemplate') {
                previewContent.innerHTML = event.data.renderedTemplate;
              }
            });
          <\/script>
        </body>
        </html>
      `);
      
      this.previewWindow.document.close();
    }

    renderTemplate(templateId, selectedText) {
      // Get the template from template manager
      const templateManager = new window.TemplateManager(); // In a real implementation, this would be shared
      const templateContent = templateManager.getTemplateById(templateId);
      
      if (!templateContent) {
        console.error(`Template ${templateId} not found`);
        return;
      }
      
      // Get current page title
      const pageTitle = document.title;
      
      // Replace variables in template
      let processedTemplate = templateContent
        .replace(/\{\{selectedText\}\}/g, DOMPurify.sanitize(selectedText))
        .replace(/\{\{pageTitle\}\}/g, DOMPurify.sanitize(pageTitle));
      
      // Render the template using Mustache or simple replace
      processedTemplate = this.processTemplate(processedTemplate, {
        selectedText: selectedText,
        pageTitle: pageTitle
      });
      
      // Send the rendered template to the preview window
      if (this.previewWindow && !this.previewWindow.closed) {
        this.previewWindow.postMessage({
          type: 'renderTemplate',
          renderedTemplate: processedTemplate
        }, '*');
      }
      
      this.currentTemplateId = templateId;
    }
    
    processTemplate(template, data) {
      // Use Mustache.js if available, otherwise simple replace
      if (typeof Mustache !== 'undefined') {
        return Mustache.render(template, data);
      } else {
        // Simple template processing as fallback
        return template
          .replace(/\{\{selectedText\}\}/g, data.selectedText)
          .replace(/\{\{pageTitle\}\}/g, data.pageTitle);
      }
    }

    onTemplateSelected(callback) {
      this.callbacks.templateSelected.push(callback);
    }
    
    onExportRequest(callback) {
      this.callbacks.exportRequest.push(callback);
    }

    notifyTemplateSelected(templateId, selectedText) {
      this.callbacks.templateSelected.forEach(callback => {
        callback(templateId, selectedText);
      });
    }
    
    notifyExportRequest(templateId, selectedText) {
      this.callbacks.exportRequest.forEach(callback => {
        callback(templateId, selectedText);
      });
    }
    
    // Listen to messages from the preview window
    initMessageListener() {
      window.addEventListener('message', (event) => {
        if (event.data.type === 'templateSelected') {
          this.notifyTemplateSelected(event.data.templateId, event.data.selectedText);
        } else if (event.data.type === 'exportRequest') {
          this.notifyExportRequest(event.data.templateId, event.data.selectedText);
        }
      });
    }
  }

  // Initialize message listener when the class is loaded
  const previewRenderer = new PreviewRenderer();
  previewRenderer.initMessageListener();
  
  // Make the instance available globally
  window.PreviewRenderer = PreviewRenderer;
})();