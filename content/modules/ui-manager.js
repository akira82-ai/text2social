/**
 * text2social - UI Manager Module
 * UI组件管理模块
 */

(function(global) {
  'use strict';

  let button, previewWindow, currentCanvas;
  let buttonVisible = false;
  let previewVisible = false;
  let justShownButton = false;
  let buttonShowTimer = null;

  /**
   * 创建浮动按钮
   */
  function createFloatingButton() {
    console.log('🔧 Creating floating button...');

    try {
      button = document.createElement('div');
      button.id = 'text2social-button';

      // 安全获取图标URL
      let iconUrl = '';
      let useImage = false;

      try {
        iconUrl = chrome.runtime.getURL('icons/camera-icon.png');
        console.log('🔍 Camera icon URL:', iconUrl);
        // Chrome扩展URL通常以 chrome-extension:// 开头
        useImage = iconUrl && (iconUrl.includes('chrome-extension://') || iconUrl.includes('http'));
      } catch (error) {
        console.warn('⚠️ Could not load camera icon, using emoji:', error);
        iconUrl = '📷';
        useImage = false;
      }

      if (useImage) {
        button.innerHTML = `<img src="${iconUrl}" style="width: 20px; height: 20px; display: block;">`;
        console.log('✅ Using camera icon image');
      } else {
        button.innerHTML = `<span style="font-size: 20px; display: block;">${iconUrl}</span>`;
        console.log('✅ Using emoji fallback');
      }
      // 基本样式由CSS文件控制，不需要内联样式
      // 按钮默认是隐藏的 (display: none)

      document.body.appendChild(button);

      // 立即绑定按钮事件
      try {
        bindButtonEvents();
        console.log('✅ Button events bound immediately after creation');
      } catch (error) {
        console.error('❌ Error binding button events:', error);
      }

      console.log('✅ Floating button created');
    } catch (error) {
      console.error('❌ Error creating floating button:', error);
    }
  }

  /**
   * 创建预览窗口
   */
  function createPreviewWindow() {
    console.log('🔧 Creating preview window...');

    previewWindow = document.createElement('div');
    previewWindow.id = 'text2social-preview';
    // 不需要内联样式，CSS文件已经定义了所有样式
    // previewWindow的样式由content.css控制

    // 预览标题
    const previewHeader = document.createElement('div');
    previewHeader.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      border-bottom: 1px solid #e9ecef;
      font-size: 14px;
      font-weight: bold;
      background: #f8f9fa;
      border-radius: 8px 8px 0 0;
    `;

    const titleSpan = document.createElement('span');
    titleSpan.textContent = 'text2social - 预览';

    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      transition: all 0.2s ease;
    `;

    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.backgroundColor = '#e9ecef';
      closeButton.style.color = '#333';
    });

    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.backgroundColor = 'transparent';
      closeButton.style.color = '#666';
    });

    closeButton.addEventListener('click', () => {
      console.log('👁️ Close button clicked');
      hidePreview();
    });

    previewHeader.appendChild(titleSpan);
    previewHeader.appendChild(closeButton);

    // 模板选择区域
    const templateSelector = document.createElement('div');
    templateSelector.id = 'template-selector';
    templateSelector.style.cssText = `
      padding: 15px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    `;

    // 创建模板选择HTML
    let templateHtml = '<div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">';

    // 这里会在模板管理器中动态填充
    templateHtml += '</div>';

    templateSelector.innerHTML = templateHtml;

    // 图片容器
    const imageContainer = document.createElement('div');
    imageContainer.id = 'image-container';
    imageContainer.style.cssText = `
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      max-height: 50vh;
      overflow: auto;
      background: white;
    `;

    // 操作按钮区域
    const actionButtons = document.createElement('div');
    actionButtons.style.cssText = `
      padding: 15px;
      border-top: 1px solid #e9ecef;
      background: #f8f9fa;
      border-radius: 0 0 8px 8px;
      display: flex;
      gap: 10px;
      justify-content: center;
    `;

    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = '📥 下载图片';
    downloadBtn.style.cssText = `
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background: #007bff;
      color: white;
      cursor: pointer;
      font-size: 12px;
      transition: background-color 0.2s ease;
    `;

    const copyBtn = document.createElement('button');
    copyBtn.textContent = '📋 复制图片';
    copyBtn.style.cssText = `
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background: #28a745;
      color: white;
      cursor: pointer;
      font-size: 12px;
      transition: background-color 0.2s ease;
    `;

    actionButtons.appendChild(downloadBtn);
    actionButtons.appendChild(copyBtn);

    // 组装预览窗口
    previewWindow.appendChild(previewHeader);
    previewWindow.appendChild(templateSelector);
    previewWindow.appendChild(imageContainer);
    previewWindow.appendChild(actionButtons);

    document.body.appendChild(previewWindow);

    // 立即绑定预览窗口事件
    try {
      bindPreviewEvents();
      console.log('✅ Preview events bound immediately after creation');
    } catch (error) {
      console.error('❌ Error binding preview events:', error);
    }

    console.log('✅ Preview window created');
  }

  /**
   * 显示按钮
   */
  function showButton(x, y) {
    // 确保按钮已初始化
    if (!button) {
      console.log('🔧 Button not initialized, creating now...');
      createFloatingButton();
      if (!button) {
        console.error('❌ Failed to create button');
        return;
      }
      console.log('✅ Button created successfully');
    }

    if (justShownButton) {
      console.log('🔄 Button recently shown, skipping to avoid flickering');
      return;
    }

    console.log(`👁️ Showing button at (${x}, ${y})`);

    // 清除现有的隐藏计时器
    if (buttonShowTimer) {
      clearTimeout(buttonShowTimer);
      buttonShowTimer = null;
    }

    // 计算按钮位置，确保不超出视窗
    const buttonSize = 40; // 按钮大小
    const margin = 10; // 边距

    let finalX = x + margin;
    let finalY = y - buttonSize - margin;

    // 确保按钮不超出视窗右边界
    if (finalX + buttonSize > window.innerWidth) {
      finalX = x - buttonSize - margin;
    }

    // 确保按钮不超出视窗左边界
    if (finalX < margin) {
      finalX = margin;
    }

    // 确保按钮不超出视窗顶部
    if (finalY < margin) {
      finalY = y + margin;
    }

    // 确保按钮不超出视窗底部
    if (finalY + buttonSize > window.innerHeight - margin) {
      finalY = window.innerHeight - buttonSize - margin;
    }

    button.style.left = finalX + 'px';
    button.style.top = finalY + 'px';
    button.style.display = 'flex'; // 使用flex以居中内容
    button.style.opacity = '1';
    button.style.transform = 'scale(1)';

    // 添加CSS类来确保样式一致性
    button.classList.add('visible');

    buttonVisible = true;
    justShownButton = true;

    // 设置标记重置计时器
    setTimeout(() => {
      justShownButton = false;
    }, 100);

    // 设置自动隐藏计时器（3秒后自动隐藏）
    buttonShowTimer = setTimeout(() => {
      console.log('⏰ Auto-hide timer triggered');
      hideButton();
      buttonShowTimer = null;
    }, 3000);
  }

  /**
   * 隐藏按钮
   */
  function hideButton() {
    if (!button || !buttonVisible) {
      return;
    }

    console.log('🙈 Hiding button');

    // 清除计时器
    if (buttonShowTimer) {
      clearTimeout(buttonShowTimer);
      buttonShowTimer = null;
    }

    button.style.opacity = '0';
    button.style.transform = 'scale(0.8)';

    // 等待动画完成后隐藏元素
    setTimeout(() => {
      if (button) {
        button.style.display = 'none';
        // 移除visible类
        button.classList.remove('visible');
      }
    }, 200);

    buttonVisible = false;
  }

  /**
   * 显示预览窗口
   */
  function showPreview() {
    // 确保预览窗口已初始化
    if (!previewWindow) {
      console.log('🔧 Preview window not initialized, creating now...');
      createPreviewWindow();
      if (!previewWindow) {
        console.error('❌ Failed to create preview window');
        return;
      }
      console.log('✅ Preview window created successfully');
    }

    console.log('👁️ Showing preview window (top-right corner)');

    // 确保模板管理器已初始化并更新模板选择器
    if (global.Text2SocialTemplate && global.Text2SocialTemplate.refreshTemplatesSafe) {
      global.Text2SocialTemplate.refreshTemplatesSafe().then(() => {
        console.log('🔄 Templates refreshed and selector updated');
      }).catch(error => {
        console.error('❌ Error refreshing templates:', error);
      });
    }

    // 不再设置位置，让CSS中的右上角定位生效
    // 移除居中定位逻辑，使用CSS定义的右上角固定定位

    // 添加CSS类来确保样式一致性并触发动画
    previewWindow.classList.add('visible');

    previewVisible = true;
  }

  /**
   * 隐藏预览窗口
   */
  function hidePreview() {
    if (!previewWindow || !previewVisible) {
      return;
    }

    console.log('🙈 Hiding preview window with slide-out animation');

    // 移除visible类，添加hiding类来触发滑出动画
    previewWindow.classList.remove('visible');
    previewWindow.classList.add('hiding');

    setTimeout(() => {
      if (previewWindow) {
        previewWindow.style.display = 'none';
        // 移除hiding类
        previewWindow.classList.remove('hiding');
      }
    }, 300); // 匹配动画时长

    previewVisible = false;
    currentCanvas = null;
  }

  /**
   * 绑定按钮事件
   */
  function bindButtonEvents() {
    if (!button) {
      console.error('❌ Button not initialized for event binding');
      return;
    }

    // 检查是否已经绑定过事件
    if (button.hasAttribute('data-events-bound')) {
      console.log('ℹ️ Button events already bound');
      return;
    }

    // 鼠标进入按钮时停止自动隐藏
    button.addEventListener('mouseenter', () => {
      if (buttonShowTimer) {
        clearTimeout(buttonShowTimer);
        buttonShowTimer = null;
        console.log('⏸️ Auto-hide paused (mouse entered button)');
      }
    });

    // 鼠标离开按钮时重启自动隐藏计时器
    button.addEventListener('mouseleave', () => {
      if (!buttonShowTimer && buttonVisible) {
        buttonShowTimer = setTimeout(() => {
          console.log('⏰ Auto-hide timer restarted (mouse left button)');
          hideButton();
          buttonShowTimer = null;
        }, 2000); // 鼠标离开后2秒隐藏
      }
    });

    // 点击事件
    button.addEventListener('click', handleButtonClick);

    // 标记事件已绑定
    button.setAttribute('data-events-bound', 'true');

    console.log('✅ Button events bound');
  }

  /**
   * 处理按钮点击
   */
  function handleButtonClick() {
    console.log('🖱️ Floating button clicked');

    // 立即隐藏按钮
    hideButton();

    // 触发预览生成事件（让主控制器处理）
    if (global.Text2SocialEvents && global.Text2SocialEvents.emit) {
      global.Text2SocialEvents.emit('button:click');
    }
  }

  /**
   * 绑定预览窗口事件
   */
  function bindPreviewEvents() {
    if (!previewWindow) {
      console.error('❌ Preview window not initialized for event binding');
      return;
    }

    // 检查是否已经绑定过事件
    if (previewWindow.hasAttribute('data-events-bound')) {
      console.log('ℹ️ Preview events already bound');
      return;
    }

    // 下载按钮
    const downloadBtn = previewWindow.querySelector('button:nth-of-type(1)');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        console.log('📥 Download button clicked');
        if (global.Text2SocialEvents && global.Text2SocialEvents.emit) {
          global.Text2SocialEvents.emit('preview:download');
        }
      });
    }

    // 复制按钮
    const copyBtn = previewWindow.querySelector('button:nth-of-type(2)');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        console.log('📋 Copy button clicked');
        if (global.Text2SocialEvents && global.Text2SocialEvents.emit) {
          global.Text2SocialEvents.emit('preview:copy');
        }
      });
    }

    // 模板选择事件
    const templateSelector = previewWindow.querySelector('#template-selector');
    if (templateSelector) {
      templateSelector.addEventListener('click', (e) => {
        const templateOption = e.target.closest('.template-option');
        if (templateOption) {
          const template = templateOption.getAttribute('data-template');
          console.log('🎨 Template selected:', template);
          if (global.Text2SocialEvents && global.Text2SocialEvents.emit) {
            global.Text2SocialEvents.emit('template:change', template);
          }
        }
      });
    }

    // 标记事件已绑定
    previewWindow.setAttribute('data-events-bound', 'true');

    console.log('✅ Preview events bound');
  }

  /**
   * 更新图片容器
   */
  function updateImageContainer(canvas) {
    if (!previewWindow) {
      console.error('❌ Preview window not initialized');
      return;
    }

    const imageContainer = previewWindow.querySelector('#image-container');
    if (!imageContainer) {
      console.error('❌ Image container not found');
      return;
    }

    imageContainer.innerHTML = '';
    const img = document.createElement('img');
    img.src = canvas.toDataURL();
    img.style.cssText = `
      max-width: 100%;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    `;
    imageContainer.appendChild(img);

    currentCanvas = canvas;
  }

  /**
   * 更新模板选择器
   */
  function updateTemplateSelector(templates, currentTemplate) {
    if (!previewWindow) {
      console.error('❌ Preview window not initialized');
      return;
    }

    const templateSelector = previewWindow.querySelector('#template-selector');
    if (!templateSelector) {
      console.error('❌ Template selector not found');
      return;
    }

    let templateHtml = '<div style="display: flex; justify-content: flex-start; gap: 8px; flex-wrap: wrap; padding: 2px 4px;">';

    templates.forEach(template => {
      const icon = getTemplateIcon(template);
      const displayName = getTemplateDisplayName(template);
      const isActive = template === currentTemplate ? 'style="color: #667eea; font-weight: bold;"' : '';
      templateHtml += `
        <div class="template-option" data-template="${template}" style="text-align: center; cursor: pointer; padding: 8px 4px; width: 70px; border-radius: 6px; transition: all 0.2s ease; flex: 0 0 auto;">
          <div ${isActive} style="font-size: 20px; height: 24px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; line-height: 1;">${icon}</div>
          <div ${isActive} style="font-size: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; line-height: 1.1;">${displayName}</div>
        </div>
      `;
    });

    templateHtml += '</div>';
    templateSelector.innerHTML = templateHtml;
  }

  /**
   * 获取模板图标
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
   * 显示加载状态
   */
  function showLoading(container) {
    if (container) {
      container.innerHTML = '<div style="text-align: center;">生成中...</div>';
    }
  }

  /**
   * 显示错误状态
   */
  function showError(container, message = '生成失败，请重试') {
    if (container) {
      container.innerHTML = `<div style="color: red; text-align: center;">${message}</div>`;
    }
  }

  // 初始化UI管理器
  function init() {
    createFloatingButton();
    createPreviewWindow();
    bindButtonEvents();
    bindPreviewEvents();
  }

  // 初始化状态检查
  function isInitialized() {
    return button !== null && previewWindow !== null;
  }

  // 确保初始化完成
  function ensureInitialized() {
    if (!isInitialized()) {
      console.log('🔧 Auto-initializing UI manager...');
      // 直接创建必要组件，避免重复初始化
      if (!button) {
        createFloatingButton();
      }
      if (!previewWindow) {
        createPreviewWindow();
      }
    }
  }

  // 初始化UI管理器
  function init() {
    if (isInitialized()) {
      console.log('ℹ️ UI manager already initialized');
      return;
    }

    console.log('🔧 Initializing UI manager...');
    createFloatingButton();
    createPreviewWindow();
    bindButtonEvents();
    bindPreviewEvents();
    console.log('✅ UI manager initialized successfully');
  }

  // 导出到全局
  global.Text2SocialUI = {
    init,
    showButton: function(x, y) {
      ensureInitialized();
      return showButton(x, y);
    },
    hideButton,
    showPreview: function() {
      ensureInitialized();
      return showPreview();
    },
    hidePreview,
    updateImageContainer,
    updateTemplateSelector,
    showLoading,
    showError,
    getCurrentCanvas: () => currentCanvas,
    isButtonVisible: () => buttonVisible,
    isPreviewVisible: () => previewVisible,
    isInitialized,
    ensureInitialized
  };

})(typeof window !== 'undefined' ? window : this);