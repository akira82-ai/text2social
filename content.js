// Text2Social Content Script
// Main entry point for the extension functionality

// Initialize modules in proper order
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modules when DOM is ready
  if (window.TextSelection && window.IconDisplay && window.TemplateManager && window.PreviewRenderer && window.ImageExporter) {
    console.log('Text2Social: All modules loaded, initializing...');
    
    // Initialize the feature
    const text2Social = new Text2Social();
    text2Social.init();
  }
});

// Main Text2Social controller class
class Text2Social {
  constructor() {
    this.textSelection = new window.TextSelection();
    this.iconDisplay = new window.IconDisplay();
    this.templateManager = new window.TemplateManager();
    this.previewRenderer = new window.PreviewRenderer();
    this.imageExporter = new window.ImageExporter();
  }

  init() {
    // Initialize text selection detection
    this.textSelection.init();
    
    // Listen for text selection events
    this.textSelection.onTextSelected((selectedText) => {
      // Show icon near selected text
      this.iconDisplay.showIcon(selectedText);
    });
    
    // Listen for icon click events
    this.iconDisplay.onIconClick((selectedText) => {
      // Load templates and show preview
      const templates = this.templateManager.getTemplates();
      this.previewRenderer.showPreview(selectedText, templates);
    });
    
    // Listen for template selection events
    this.previewRenderer.onTemplateSelected((templateId, selectedText) => {
      // Render selected template with text
      this.previewRenderer.renderTemplate(templateId, selectedText);
    });
    
    // Listen for export requests
    this.previewRenderer.onExportRequest((templateId, selectedText) => {
      // Export as image
      this.imageExporter.exportAsImage(templateId, selectedText);
    });
  }
}