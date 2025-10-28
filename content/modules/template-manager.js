/**
 * text2social - Template Manager Module
 * 模板管理模块
 */

(function(global) {
  'use strict';

  let availableTemplates = ['template1', '纯文本', '黑色']; // 初始化所有可用模板列表
  let currentTemplate = 'template1'; // 默认模板

  /**
   * 获取所有可用模板
   */
  function getAvailableTemplates() {
    return availableTemplates;
  }

  /**
   * 异步获取最新的可用模板列表
   */
  async function fetchAvailableTemplates() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'getAvailableTemplates'
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('❌ Error getting available templates:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else if (response.success) {
          availableTemplates = response.templates;
          console.log('📋 Available templates updated:', availableTemplates);
          resolve(availableTemplates);
        } else {
          console.error('❌ Error response getting templates:', response.error);
          reject(new Error(response.error || 'Failed to get templates'));
        }
      });
    });
  }

  /**
   * 获取模板对应的图标
   */
  function getTemplateIcon(templateName) {
    const iconMap = {
      'template1': '📄',
      '纯文本': '📝',
      '黑色': '⚫',
      '紅文本': '🔴',
      '红色': '🔴',
      '默认': '📄',
      'default': '📄'
    };

    if (iconMap[templateName]) {
      return iconMap[templateName];
    }

    // 否则，根据模板名生成一个默认图标
    const firstChar = templateName.charAt(0).toLowerCase();
    if (firstChar >= 'a' && firstChar <= 'e') {
      return '📝';
    } else if (firstChar >= 'f' && firstChar <= 'j') {
      return '📋';
    } else if (firstChar >= 'k' && firstChar <= 'o') {
      return '📊';
    } else if (firstChar >= 'p' && firstChar <= 't') {
      return '🎨';
    } else {
      return '📄';
    }
  }

  /**
   * 获取模板显示名称
   */
  function getTemplateDisplayName(templateName) {
    // 直接返回模板名称，不做任何映射
    return templateName;
  }

  /**
   * 从后台获取模板内容
   */
  function getTemplateContent(templateName) {
    return new Promise((resolve, reject) => {
      // 向background script发送获取模板内容的请求
      chrome.runtime.sendMessage({
        action: 'getTemplate',
        templateName: templateName
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response.success) {
          resolve(response.template);
        } else {
          reject(new Error(response.error || 'Failed to get template'));
        }
      });
    });
  }

  /**
   * 使用指定模板创建分享图片
   */
  function createShareImageWithTemplate(pageInfo, templateName) {
    console.log(`🎨 Creating share image using ${templateName}...`);

    return new Promise((resolve, reject) => {
      // 创建一个临时的容器来渲染模板
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 1080px;
        height: 1080px;
        background: white;
        z-index: -9999;
      `;

      // 获取模板URL
      const templateUrl = chrome.runtime.getURL(`templates/${templateName}.html`);

      // 先生成二维码
      if (global.Text2SocialQRCode && global.Text2SocialQRCode.generateQRCodeInContentScript) {
        global.Text2SocialQRCode.generateQRCodeInContentScript(pageInfo.url || window.location.href)
          .then(qrCodeDataUrl => {
            console.log('✅ QR Code generated as data URL');

            // 加载模板内容
            return fetch(templateUrl).then(response => response.text()).then(htmlContent => {
              return { htmlContent, qrCodeDataUrl };
            });
          })
          .then(({ htmlContent, qrCodeDataUrl }) => {
            // 处理模板内容
            const processedHtml = processTemplate(htmlContent, pageInfo, qrCodeDataUrl);

            container.innerHTML = processedHtml;
            document.body.appendChild(container);

            // 使用html2canvas转换成图片
            setTimeout(() => {
              console.log('📸 Converting template to image...');

              if (typeof html2canvas !== 'undefined') {
                html2canvas(container, {
                  width: 1080,
                  height: 1080,
                  scale: 1,
                  useCORS: true,
                  allowTaint: true,
                  backgroundColor: '#ffffff',
                  logging: false
                }).then(canvas => {
                  // 移除临时容器
                  document.body.removeChild(container);
                  console.log(`✅ Share image created using ${templateName}`);
                  resolve(canvas);
                }).catch(error => {
                  console.error(`❌ Error creating image from ${templateName}:`, error);
                  document.body.removeChild(container);

                  // 如果模板失败，回退到Canvas方法
                  console.log('🔄 Falling back to Canvas method...');
                  if (global.Text2SocialImageGenerator && global.Text2SocialImageGenerator.createShareImageCanvas) {
                    const fallbackCanvas = global.Text2SocialImageGenerator.createShareImageCanvas(pageInfo);
                    resolve(fallbackCanvas);
                  } else {
                    reject(error);
                  }
                });
              } else {
                console.error('❌ html2canvas not available');
                document.body.removeChild(container);
                reject(new Error('html2canvas library not loaded'));
              }
            }, 500); // 等待CSS和字体加载
          })
          .catch(error => {
            console.error(`❌ Error loading ${templateName}:`, error);

            // 如果模板加载失败，使用原始Canvas方法
            console.log('🔄 Falling back to Canvas method...');
            if (global.Text2SocialImageGenerator && global.Text2SocialImageGenerator.createShareImageCanvas) {
              const fallbackCanvas = global.Text2SocialImageGenerator.createShareImageCanvas(pageInfo);
              resolve(fallbackCanvas);
            } else {
              reject(error);
            }
          });
      } else {
        reject(new Error('QR Code generator not available'));
      }
    });
  }

  /**
   * 处理模板内容
   */
  function processTemplate(htmlContent, pageInfo, qrCodeDataUrl) {
    // 使用工具函数清理HTML内容
    const cleanHtml = global.Text2SocialUtils && global.Text2SocialUtils.cleanHtmlContent
      ? global.Text2SocialUtils.cleanHtmlContent(pageInfo.selectedText)
      : pageInfo.selectedText || '无内容';

    // 替换模板变量 - 只保留三种核心元素
    let processedHtml = htmlContent
      .replace(/{{title}}/g, pageInfo.title || '未知标题')
      .replace(/{{text}}/g, cleanHtml)
      // 替换二维码占位符为实际的二维码图片
      .replace('<div class="qr-placeholder">QR</div>',
               `<img src="${qrCodeDataUrl}" style="width:80px;height:80px;" alt="QR Code">`);

    // 修复CSS和JS路径
    processedHtml = processedHtml
      .replace('href="https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap"',
               `href="${chrome.runtime.getURL('fonts/fonts.css')}"`);

    // 完全移除script标签和其中的所有内容
    processedHtml = processedHtml.replace(/<script\\b[^>]*>.*?<\/script>/gi, '');

    // 移除HTML注释
    processedHtml = processedHtml.replace(/<!--[\\s\\S]*?-->/g, '');

    // 移除多余的空白字符和换行
    processedHtml = processedHtml.replace(/\\s+/g, ' ').trim();

    console.log('📄 Processed HTML length:', processedHtml.length);
    return processedHtml;
  }

  /**
   * 切换模板
   */
  async function changeTemplate(templateName) {
    if (!global.Text2SocialUtils || !global.Text2SocialUtils.getPageInfo) {
      console.error('❌ Utils not available');
      return;
    }

    // 获取当前选中的文本信息
    const pageInfo = global.Text2SocialUtils.getPageInfo(global.Text2SocialState?.getSelectedText());

    if (!pageInfo.selectedText) {
      console.error('❌ No text selected to generate preview with new template');
      return;
    }

    // 更新当前模板
    currentTemplate = templateName;
    console.log('🎨 Switching to template:', templateName);

    // 更新UI显示
    updateTemplateSelectionUI();

    // 通知UI更新加载状态
    if (global.Text2SocialUI) {
      const imageContainer = document.querySelector('#image-container');
      global.Text2SocialUI.showLoading(imageContainer);
    }

    try {
      // 生成新模板的图片
      const canvas = await createShareImageWithTemplate(pageInfo, templateName);

      // 更新UI
      if (global.Text2SocialUI) {
        global.Text2SocialUI.updateImageContainer(canvas);
      }

      console.log('✅ Template switched and preview updated successfully');
    } catch (error) {
      console.error('❌ Error switching template:', error);

      // 显示错误状态
      if (global.Text2SocialUI) {
        const imageContainer = document.querySelector('#image-container');
        global.Text2SocialUI.showError(imageContainer);
      }
    }
  }

  /**
   * 更新模板选择UI的显示状态
   */
  function updateTemplateSelectionUI() {
    const templateOptions = document.querySelectorAll('.template-option');
    templateOptions.forEach(option => {
      const template = option.getAttribute('data-template');
      const iconDiv = option.querySelector('div:first-child');
      const nameDiv = option.querySelector('div:last-child');

      if (template === currentTemplate) {
        // 当前模板高亮显示
        iconDiv.style.color = '#667eea';
        iconDiv.style.fontWeight = 'bold';
        nameDiv.style.color = '#667eea';
        nameDiv.style.fontWeight = 'bold';
      } else {
        // 其他模板正常显示
        iconDiv.style.color = '#666';
        iconDiv.style.fontWeight = 'normal';
        nameDiv.style.color = '#666';
        nameDiv.style.fontWeight = 'normal';
      }
    });
  }

  /**
   * 刷新模板列表
   */
  async function refreshTemplates() {
    try {
      await fetchAvailableTemplates();

      // 更新UI中的模板选择器
      if (global.Text2SocialUI) {
        global.Text2SocialUI.updateTemplateSelector(availableTemplates, currentTemplate);
      }

      console.log('✅ Templates refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing templates:', error);
    }
  }

  /**
   * 设置当前模板
   */
  function setCurrentTemplate(templateName) {
    if (availableTemplates.includes(templateName)) {
      currentTemplate = templateName;
      console.log('📝 Current template set to:', templateName);
    } else {
      console.warn('⚠️ Template not found in available templates:', templateName);
    }
  }

  /**
   * 获取当前模板
   */
  function getCurrentTemplate() {
    return currentTemplate;
  }

  let initialized = false;

  // 检查是否已初始化
  function isInitialized() {
    return initialized;
  }

  // 确保初始化完成
  async function ensureInitialized() {
    if (!initialized) {
      await init();
    }
  }

  // 初始化模板管理器
  async function init() {
    if (initialized) {
      console.log('ℹ️ Template manager already initialized');
      return;
    }

    try {
      console.log('🔧 Initializing template manager...');
      await fetchAvailableTemplates();
      initialized = true;
      console.log('✅ Template manager initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing template manager:', error);
    }
  }

  // 修改需要初始化的函数
  async function createShareImageWithTemplateSafe(pageInfo, templateName) {
    await ensureInitialized();
    return createShareImageWithTemplate(pageInfo, templateName);
  }

  async function changeTemplateSafe(templateName) {
    await ensureInitialized();
    return changeTemplate(templateName);
  }

  async function refreshTemplatesSafe() {
    await ensureInitialized();
    return refreshTemplates();
  }

  // 导出到全局
  global.Text2SocialTemplate = {
    init,
    getAvailableTemplates,
    fetchAvailableTemplates,
    getTemplateIcon,
    getTemplateDisplayName,
    getTemplateContent,
    createShareImageWithTemplate: createShareImageWithTemplateSafe,
    changeTemplate: changeTemplateSafe,
    updateTemplateSelectionUI,
    refreshTemplates: refreshTemplatesSafe,
    setCurrentTemplate,
    getCurrentTemplate,
    processTemplate,
    isInitialized,
    ensureInitialized
  };

})(typeof window !== 'undefined' ? window : this);