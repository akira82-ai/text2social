/**
 * text2social - Background Script
 * 处理插件后台逻辑
 */

(function() {
  'use strict';

  if (typeof chrome === 'undefined' || !chrome.runtime) {
    console.error('Chrome extension API not available');
    return;
  }

  const templateCache = {};
  const TEMPLATE_FILES = ['template1.html', '纯文本.html', '黑色.html'];

  chrome.runtime.onInstalled.addListener(() => {
    refreshTemplateCache();
  });

  refreshTemplateCache();

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const actionHandlers = {
      'generateImage': async () => {
        const result = await handleImageGeneration(request.data);
        return { success: true, data: result };
      },
      'getTemplate': () => {
        const templateName = request.templateName;
        if (templateCache[templateName]) {
          return { success: true, template: templateCache[templateName] };
        }
        return { success: false, error: 'Template not found' };
      },
      'getAvailableTemplates': () => {
        return { success: true, templates: Object.keys(templateCache) };
      },
      'refreshTemplates': () => {
        refreshTemplateCache();
        return { success: true };
      }
    };

    const handler = actionHandlers[request.action];
    if (handler) {
      handler().then(response => sendResponse(response))
               .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
    }
  });

  async function refreshTemplateCache() {
    for (const templateFile of TEMPLATE_FILES) {
      try {
        const templateName = templateFile.replace(/\.[^/.]+$/, "");
        const templateUrl = chrome.runtime.getURL(`templates/${templateFile}`);

        const response = await fetch(templateUrl);
        const content = await response.text();

        templateCache[templateName] = {
          content: content,
          file: templateFile,
          lastUpdated: new Date().toISOString()
        };
      } catch (error) {
        console.error(`Error loading template ${templateFile}:`, error);
      }
    }
  }

  async function handleImageGeneration(data) {
    return {
      generatedAt: new Date().toISOString(),
      success: true
    };
  }

})();