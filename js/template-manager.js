// Template Manager Module
(function() {
  'use strict';

  class TemplateManager {
    constructor() {
      this.templates = new Map();
      this.loadTemplates();
    }

    async loadTemplates() {
      // Load existing templates from the templates directory
      try {
        // Using fetch to get template files
        const templateFiles = ['模板 1.html', '模板 2.html'];
        
        for (const fileName of templateFiles) {
          const response = await fetch(chrome.runtime.getURL(`templates/${fileName}`));
          if (response.ok) {
            const templateContent = await response.text();
            const templateId = fileName.replace('.html', '');
            this.templates.set(templateId, templateContent);
          } else {
            console.warn(`Failed to load template: ${fileName}`);
          }
        }
        
        // If running as content script without chrome API access, fall back to embedded templates
        if (this.templates.size === 0) {
          this.loadEmbeddedTemplates();
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        // Fall back to embedded templates
        this.loadEmbeddedTemplates();
      }
    }

    loadEmbeddedTemplates() {
      // Default templates as fallback
      this.templates.set('template1', `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); width: 400px; height: 300px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
          <h2 style="color: #333; margin-bottom: 15px;">{{pageTitle}}</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">{{selectedText}}</p>
          <div style="position: absolute; bottom: 10px; right: 10px; font-size: 12px; color: #999;">Powered by Text2Social</div>
        </div>
      `);
      
      this.templates.set('template2', `
        <div style="font-family: 'Georgia', serif; padding: 30px; background-color: #fff9e6; border: 2px solid #ffd700; width: 450px; height: 350px; display: flex; flex-direction: column; justify-content: center; text-align: center;">
          <h2 style="color: #8b4513; margin-bottom: 20px; border-bottom: 1px solid #d2b48c; padding-bottom: 10px;">{{pageTitle}}</h2>
          <blockquote style="color: #5d4037; font-size: 18px; font-style: italic; margin: 0 20px; flex-grow: 1; display: flex; align-items: center; justify-content: center;">
            {{selectedText}}
          </blockquote>
          <footer style="margin-top: 20px; font-size: 14px; color: #a67c52;">Shared from Text2Social</footer>
        </div>
      `);
    }

    getTemplates() {
      return Array.from(this.templates.entries()).map(([id, content]) => ({
        id,
        content
      }));
    }

    getTemplateById(templateId) {
      return this.templates.get(templateId);
    }
  }

  // Make the class available globally
  window.TemplateManager = TemplateManager;
})();