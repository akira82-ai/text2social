/**
 * text2social - Debug Content Script
 * 添加调试信息的版本
 */

(function() {
  'use strict';

  // 检查Chrome扩展API是否可用
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    console.error('❌ Chrome extension API not available in content script');
    return;
  }

  console.log('🚀 text2social content script loaded');

  // 全局变量
  let selectedText = '';
  let buttonVisible = false;
  let previewVisible = false;
  let button, previewWindow, currentCanvas;
  let justShownButton = false;
  let buttonShowTimer = null;
  let currentTemplate = 'template1'; // 默认模板
  const availableTemplates = ['template1']; // 目前只有template1，后续可动态获取

  // 获取所有可用模板
  function getAvailableTemplates() {
    // 这里可以动态从templates目录获取模板列表
    // 目前只返回已知的模板
    return availableTemplates;
  }
  
  // 获取模板对应的图标
  function getTemplateIcon(templateName) {
    // 根据模板名称返回对应的图标
    const iconMap = {
      'template1': '📄',
      'template2': '📝',
      'template3': '📋',
      'template4': '📊',
      'template5': '🎨',
      'default': '📄'
    };
    
    return iconMap[templateName] || iconMap.default;
  }

  // 初始化
  function init() {
    console.log('🔧 Initializing text2social...');

    try {
      createFloatingButton();
      createPreviewWindow();
      bindEvents();

      // 添加调试功能
      window.text2socialDebug = {
        testPreview: () => {
          console.log('🧪 Testing preview functionality...');
          selectedText = '测试文字';
          showPreview();
        },
        hidePreview: () => hidePreview(),
        getStatus: () => ({
          selectedText,
          buttonVisible,
          previewVisible,
          buttonExists: !!button,
          previewExists: !!previewWindow
        })
      };

      console.log('✅ text2social initialized successfully');
      console.log('🔍 Debug functions available: window.text2socialDebug');
    } catch (error) {
      console.error('❌ Error during initialization:', error);
    }
  }

  // 创建浮动按钮
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
      console.log('✅ Floating button created');
    } catch (error) {
      console.error('❌ Error creating floating button:', error);
    }
  }

  // 创建预览窗口
  function createPreviewWindow() {
    console.log('🔧 Creating preview window...');

    previewWindow = document.createElement('div');
    previewWindow.id = 'text2social-preview';
    // 不需要内联样式，CSS文件已经定义了所有样式
    // previewWindow的样式由content.css控制

    // 预览标题
    const previewHeader = document.createElement('div');
    previewHeader.style.cssText = `
      padding: 15px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    previewHeader.innerHTML = `
      <span>预览图片</span>
      <span id="close-preview" style="cursor: pointer; font-size: 18px;">✕</span>
    `;

    // 模板选择区域
    const templateSelector = document.createElement('div');
    templateSelector.id = 'template-selector';
    templateSelector.style.cssText = `
      padding: 15px;
      background: #f8f9fa;
      border-bottom: 1px solid #eee;
    `;
    
    // 创建模板选择HTML
    const templates = getAvailableTemplates();
    let templateHtml = '<div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">';
    
    templates.forEach(template => {
      const icon = getTemplateIcon(template); // 获取模板对应的图标
      const isActive = template === currentTemplate ? 'style="color: #667eea; font-weight: bold;"' : '';
      templateHtml += `
        <div class="template-option" data-template="${template}" style="text-align: center; cursor: pointer; padding: 5px 10px;">
          <div ${isActive}>${icon}</div>
          <div ${isActive} style="font-size: 12px; margin-top: 4px;">${template}</div>
        </div>
      `;
    });
    
    templateHtml += '</div>';
    templateSelector.innerHTML = templateHtml;

    // 图片容器
    const imageContainer = document.createElement('div');
    imageContainer.id = 'preview-image-container';
    imageContainer.style.cssText = `
      padding: 15px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
    `;

    // 操作按钮
    const actionButtons = document.createElement('div');
    actionButtons.style.cssText = `
      padding: 15px;
      display: flex;
      gap: 10px;
      border-top: 1px solid #eee;
    `;

    actionButtons.innerHTML = `
      <button id="download-image" style="
        flex: 1;
        padding: 10px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
      ">下载图片</button>
      <button id="copy-image" style="
        flex: 1;
        padding: 10px;
        background: #764ba2;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
      ">复制图片</button>
    `;

    previewWindow.appendChild(previewHeader);
    previewWindow.appendChild(templateSelector);
    previewWindow.appendChild(imageContainer);
    previewWindow.appendChild(actionButtons);
    document.body.appendChild(previewWindow);

    // 绑定预览窗口相关事件
    bindPreviewEvents();

    console.log('✅ Preview window created');
  }

  // 绑定预览窗口相关事件
  function bindPreviewEvents() {
    console.log('🔧 Binding preview window events...');

    // 关闭预览
    const closeBtn = document.getElementById('close-preview');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        console.log('❌ Close preview clicked');
        hidePreview();
      });
      console.log('✅ Close preview event bound');
    } else {
      console.error('❌ Close preview button not found!');
    }

    // 下载图片
    const downloadBtn = document.getElementById('download-image');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', function() {
        console.log('💾 Download clicked');
        downloadImage();
      });
      console.log('✅ Download event bound');
    } else {
      console.error('❌ Download button not found!');
    }

    // 复制图片
    const copyBtn = document.getElementById('copy-image');
    if (copyBtn) {
      copyBtn.addEventListener('click', function() {
        console.log('📋 Copy clicked');
        copyImage();
      });
      console.log('✅ Copy event bound');
    } else {
      console.error('❌ Copy button not found!');
    }
    
    // 绑定模板选择事件
    const templateOptions = document.querySelectorAll('.template-option');
    templateOptions.forEach(option => {
      option.addEventListener('click', function() {
        const template = this.getAttribute('data-template');
        console.log('🎨 Template selected:', template);
        changeTemplate(template);
      });
    });
  }

  // 绑定按钮事件（独立函数，方便重新绑定）
  function bindButtonEvents() {
    console.log('🔧 Binding button events...');

    if (button) {
      // 移除之前的事件监听器（如果存在）
      button.removeEventListener('click', handleButtonClick);
      // 添加新的事件监听器
      button.addEventListener('click', handleButtonClick);
      console.log('✅ Button click event rebound');
    } else {
      console.error('❌ Button not found for event rebinding!');
    }
  }

  // 按钮点击处理函数
  function handleButtonClick() {
    console.log('📸 Button clicked!');
    event.preventDefault();
    event.stopPropagation();
    generatePreview();
  }

  // 绑定事件
  function bindEvents() {
    console.log('🔧 Binding events...');

    // 文字选择事件
    document.addEventListener('mouseup', function(e) {
      console.log('🖱️ Mouse up event detected');

      const selection = window.getSelection();
      const text = selection.toString().trim();

      console.log('📝 Selected text:', text);
      console.log('📏 Text length:', text.length);

      if (text && text.length > 0) {
        // 获取选中范围的HTML内容，保留结构
        let selectedHtml = '';
        try {
          const range = selection.getRangeAt(0);
          const container = document.createElement('div');
          container.appendChild(range.cloneContents());
          selectedHtml = container.innerHTML;
          console.log('🔤 Selected HTML:', selectedHtml);
        } catch (error) {
          console.warn('⚠️ Could not get HTML content, using plain text:', error);
          selectedHtml = text;
        }

        // 保存HTML内容而不是纯文本，这样我们可以在处理时保留换行结构
        selectedText = selectedHtml;

        // 获取选中文本的准确位置
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // 计算选中文本的结尾位置
        const endX = rect.right + window.scrollX;
        const endY = rect.top + window.scrollY + (rect.height / 2);

        console.log('✅ Text selected, showing button at selection end:', endX, endY);
        console.log('📏 Selection rect:', rect);
        showButton(endX, endY);
      } else {
        console.log('❌ No text selected, hiding button');
        hideButton();
      }
    });

    // 点击其他地方隐藏按钮
    document.addEventListener('click', function(e) {
      if (justShownButton) {
        // 如果刚刚显示按钮，不立即隐藏
        return;
      }

      if (button && !button.contains(e.target)) {
        console.log('🖱️ Click outside button, hiding');
        hideButton();
      }
    });

    // 按钮点击事件 - 使用新的绑定函数
    bindButtonEvents();

    console.log('✅ Main events bound');
  }

  // 显示浮动按钮
  function showButton(x, y) {
    console.log('📍 Showing button at position:', x, y);

    // 检查按钮是否存在于DOM中
    if (!button || !document.body.contains(button)) {
      console.error('❌ Button not found in DOM, recreating...');
      createFloatingButton();
      // 重新绑定事件监听器，因为创建了新按钮
      bindButtonEvents();
    }

    // 设置位置和显示状态
    button.style.left = `${x + 10}px`;
    button.style.top = `${y - 50}px`;
    button.classList.add('visible');

    buttonVisible = true;

    console.log('🎨 Button styles applied:', {
      cssText: button.style.cssText,
      inDOM: document.body.contains(button),
      parentNode: button.parentNode
    });

    // 设置标志防止立即被click事件隐藏
    justShownButton = true;
    if (buttonShowTimer) {
      clearTimeout(buttonShowTimer);
    }
    buttonShowTimer = setTimeout(() => {
      justShownButton = false;
      console.log('⏰ Button protection timer ended');
    }, 200);

    // 验证按钮是否真的可见
    setTimeout(() => {
      const rect = button.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(button);
      console.log('🔍 Button visibility check:', {
        display: button.style.display,
        computedDisplay: computedStyle.display,
        position: { x: rect.left, y: rect.top },
        size: { width: rect.width, height: rect.height },
        visible: rect.width > 0 && rect.height > 0,
        inDOM: document.body.contains(button)
      });
    }, 100);
  }

  // 隐藏浮动按钮
  function hideButton() {
    if (button) {
      button.classList.remove('visible');
    }
    buttonVisible = false;
    console.log('🙈 Button hidden');
  }

  // HTML内容清理函数 - 保留结构但移除样式
  function cleanHtmlContent(html) {
    if (!html) return '';

    console.log('🧹 Original HTML:', html);

    let cleaned = html;

    // 1. 移除样式相关标签，但保留内容
    const styleTags = [
      /<strong[^>]*>(.*?)<\/strong>/gi,
      /<b[^>]*>(.*?)<\/b>/gi,
      /<em[^>]*>(.*?)<\/em>/gi,
      /<i[^>]*>(.*?)<\/i>/gi,
      /<u[^>]*>(.*?)<\/u>/gi,
      /<s[^>]*>(.*?)<\/s>/gi,
      /<del[^>]*>(.*?)<\/del>/gi,
      /<ins[^>]*>(.*?)<\/ins>/gi,
      /<small[^>]*>(.*?)<\/small>/gi,
      /<big[^>]*>(.*?)<\/big>/gi,
      /<sub[^>]*>(.*?)<\/sub>/gi,
      /<sup[^>]*>(.*?)<\/sup>/gi,
      /<code[^>]*>(.*?)<\/code>/gi,
      /<kbd[^>]*>(.*?)<\/kbd>/gi,
      /<samp[^>]*>(.*?)<\/samp>/gi,
      /<var[^>]*>(.*?)<\/var>/gi,
      /<mark[^>]*>(.*?)<\/mark>/gi,
      /<abbr[^>]*>(.*?)<\/abbr>/gi,
      /<cite[^>]*>(.*?)<\/cite>/gi,
      /<dfn[^>]*>(.*?)<\/dfn>/gi,
      /<q[^>]*>(.*?)<\/q>/gi,
      /<time[^>]*>(.*?)<\/time>/gi,
      /<span[^>]*>(.*?)<\/span>/gi,
      /<font[^>]*>(.*?)<\/font>/gi
    ];

    styleTags.forEach(regex => {
      cleaned = cleaned.replace(regex, '$1');
    });

    // 2. 移除自闭合样式标签
    const selfClosingStyleTags = [
      /<br[^>]*>/gi,
      /<hr[^>]*>/gi
    ];

    // 保留br但移除属性
    cleaned = cleaned.replace(/<br[^>]*>/gi, '<br>');
    // 保留hr但移除属性
    cleaned = cleaned.replace(/<hr[^>]*>/gi, '<hr>');

    // 3. 移除所有HTML属性（除了结构标签）
    const allowedTags = ['html', 'head', 'body', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                        'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot',
                        'section', 'article', 'header', 'footer', 'nav', 'aside', 'main', 'figure', 'figcaption',
                        'br', 'hr', 'blockquote', 'pre', 'address'];

    // 移除所有标签的属性
    cleaned = cleaned.replace(/<([a-zA-Z0-9]+)([^>]*)>/gi, function(match, tagName, attributes) {
      // 对于所有标签，都移除属性
      return '<' + tagName.toLowerCase() + '>';
    });

    // 4. 处理HTML实体
    cleaned = cleaned.replace(/&nbsp;/g, ' ')
                     .replace(/&amp;/g, '&')
                     .replace(/&lt;/g, '<')
                     .replace(/&gt;/g, '>')
                     .replace(/&quot;/g, '"')
                     .replace(/&#39;/g, "'")
                     .replace(/&apos;/g, "'")
                     .replace(/&\d+;/g, '') // 移除其他数字实体
                     .replace(/&[a-zA-Z]+;/g, ''); // 移除其他命名实体

    // 5. 清理多余的空白字符
    cleaned = cleaned.replace(/\s+/g, ' ') // 多个空白字符合并为一个
                     .replace(/>\s+</g, '><') // 移除标签间的空白
                     .replace(/^\s+|\s+$/g, ''); // 移除首尾空白

    // 6. 确保标签是正确的格式
    cleaned = cleaned.replace(/<([a-zA-Z0-9]+)>/g, '<$1>'); // 标签名小写

    console.log('✨ Cleaned HTML:', cleaned);
    return cleaned;
  }

  // 获取网页信息
  function getPageInfo() {
    const pageInfo = {
      title: document.title,
      url: window.location.href,
      selectedText: selectedText
    };

    console.log('📄 Page info:', pageInfo);
    return pageInfo;
  }

  // 生成预览
  function generatePreview() {
    console.log('🎨 Starting preview generation...');
    console.log('📝 Selected text:', selectedText);

    const pageInfo = getPageInfo();
    console.log('📄 Page info:', pageInfo);

    // 检查预览窗口是否存在
    if (!previewWindow) {
      console.error('❌ Preview window not found, recreating...');
      createPreviewWindow();
    }

    // 显示加载状态
    const imageContainer = document.getElementById('preview-image-container');
    if (imageContainer) {
      console.log('✅ Image container found, showing loading state...');
      imageContainer.innerHTML = '<div style="text-align: center;">生成中...</div>';
    } else {
      console.error('❌ Image container not found!');
    }

    console.log('👁️ Showing preview window...');
    showPreview();

    try {
      // 生成图片（现在返回Promise）
      createShareImageWithTemplate(pageInfo, currentTemplate).then(canvas => {
        if (imageContainer) {
          imageContainer.innerHTML = '';
          const img = document.createElement('img');
          img.src = canvas.toDataURL();
          img.style.cssText = `
            max-width: 100%;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          `;
          imageContainer.appendChild(img);
        }

        // 保存canvas供下载使用
        currentCanvas = canvas;
        console.log('✅ Preview generated successfully');
      }).catch(error => {
        console.error('❌ Error generating preview:', error);
        if (imageContainer) {
          imageContainer.innerHTML = '<div style="color: red; text-align: center;">生成失败，请重试</div>';
        }
      });

    } catch (error) {
      console.error('❌ Error generating preview:', error);
      if (imageContainer) {
        imageContainer.innerHTML = '<div style="color: red; text-align: center;">生成失败，请重试</div>';
      }
    }
  }

  // 创建分享图片
  function createShareImage(pageInfo) {
    console.log('🎨 Creating share image using template1...');

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
      const templateUrl = chrome.runtime.getURL('templates/template1.html');

      // 先生成二维码
      generateQRCodeInContentScript(pageInfo.url || window.location.href)
        .then(qrCodeDataUrl => {
          console.log('✅ QR Code generated as data URL');

          // 加载模板内容
          return fetch(templateUrl).then(response => response.text()).then(htmlContent => {
            return { htmlContent, qrCodeDataUrl };
          });
        })
        .then(({ htmlContent, qrCodeDataUrl }) => {
          // 替换模板变量 - 只保留三种核心元素
          let processedHtml = htmlContent
            .replace(/{{title}}/g, pageInfo.title || '未知标题')
            .replace(/{{text}}/g, cleanHtmlContent(pageInfo.selectedText) || '无内容')
            // 替换二维码占位符为实际的二维码图片
            .replace('<div class="qr-placeholder">QR</div>',
                     `<img src="${qrCodeDataUrl}" style="width:80px;height:80px;" alt="QR Code">`);

          // 修复CSS和JS路径
          processedHtml = processedHtml
            .replace('href="template1.css"', `href="${chrome.runtime.getURL('templates/template1.css')}"`)
            .replace('href="https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap"',
                     `href="${chrome.runtime.getURL('fonts/fonts.css')}"`);

          // 完全移除script标签和其中的所有内容
          processedHtml = processedHtml.replace(/<script\\b[^>]*>.*?<\/script>/gi, '');

          // 移除HTML注释
          processedHtml = processedHtml.replace(/<!--[\s\S]*?-->/g, '');

          // 移除多余的空白字符和换行
          processedHtml = processedHtml.replace(/\s+/g, ' ').trim();

          console.log('📄 Processed HTML length:', processedHtml.length);

          container.innerHTML = processedHtml;
          document.body.appendChild(container);

          // 二维码已经生成，直接进行图片转换
          setTimeout(() => {
            console.log('📸 Converting template to image...');

            // 使用html2canvas转换成图片
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
              console.log('✅ Share image created using template1');
              resolve(canvas);
            }).catch(error => {
              console.error('❌ Error creating image from template:', error);
              document.body.removeChild(container);

              // 如果模板失败，回退到原始Canvas方法
              console.log('🔄 Falling back to Canvas method...');
              const fallbackCanvas = createShareImageCanvas(pageInfo);
              resolve(fallbackCanvas);
            });
          }, 500); // 等待CSS和字体加载
        })
        .catch(error => {
          console.error('❌ Error loading template:', error);

          // 如果模板加载失败，使用原始Canvas方法
          console.log('🔄 Falling back to Canvas method...');
          const fallbackCanvas = createShareImageCanvas(pageInfo);
          resolve(fallbackCanvas);
        });
    });
  }

  // 在content script中生成二维码
  function generateQRCodeInContentScript(url) {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔲 Generating QR code in content script for:', url);

        // 创建临时div来生成二维码
        const tempDiv = document.createElement('div');
        tempDiv.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
        document.body.appendChild(tempDiv);

        // 在content script环境中生成二维码
        const qrCode = new QRCode(tempDiv, {
          text: url,
          width: 80,
          height: 80,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });

        // 等待二维码生成完成
        setTimeout(() => {
          const img = tempDiv.querySelector('img');
          if (img && img.src) {
            console.log('✅ QR code generated successfully');
            const dataUrl = img.src;
            document.body.removeChild(tempDiv);
            resolve(dataUrl);
          } else {
            console.error('❌ QR code image not found');
            document.body.removeChild(tempDiv);
            reject(new Error('QR code image not found'));
          }
        }, 500);

      } catch (error) {
        console.error('❌ Error generating QR code:', error);
        reject(error);
      }
    });
  }

  // 回退的Canvas方法（原实现）
  function createShareImageCanvas(pageInfo) {
    console.log('🎨 Creating share image using Canvas method...');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 设置画布尺寸
    canvas.width = 1080;
    canvas.height = 1080;

    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 白色内容区域
    ctx.fillStyle = 'white';
    roundRect(ctx, 60, 60, canvas.width - 120, canvas.height - 120, 20);
    ctx.fill();

    // 文字内容
    ctx.fillStyle = '#333';
    ctx.font = '48px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';

    // 使用HTML清理函数，然后转换为纯文本
    const cleanHtml = cleanHtmlContent(pageInfo.selectedText);
    const cleanText = cleanHtml.replace(/<[^>]*>/g, ''); // 移除HTML标签得到纯文本

    // 处理长文本换行，支持换行符
    const maxWidth = 800;
    const lineHeight = 70;
    const lines = cleanText.split('\n'); // 先按换行符分割
    let y = 300;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const lineText = lines[lineIndex].trim();
      if (!lineText) continue;

      // 如果单行文本太长，需要自动换行
      if (ctx.measureText(lineText).width > maxWidth) {
        // 单行文本过长，需要按字符换行
        const words = lineText.split('');
        let currentLine = '';

        for (let n = 0; n < words.length; n++) {
          const testLine = currentLine + words[n];
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;

          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(currentLine, canvas.width / 2, y);
            currentLine = words[n];
            y += lineHeight;

            if (y > 700) break;
          } else {
            currentLine = testLine;
          }
        }

        if (currentLine && y <= 700) {
          ctx.fillText(currentLine, canvas.width / 2, y);
          y += lineHeight;
        }
      } else {
        // 单行文本长度合适，直接绘制
        ctx.fillText(lineText, canvas.width / 2, y);
        y += lineHeight;
      }

      if (y > 700) break;
    }

    // 网页标题
    ctx.fillStyle = '#666';
    ctx.font = '32px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText('—— ' + pageInfo.title, canvas.width / 2, 850);

    // 生成二维码
    try {
      console.log('🔲 Generating QR code for URL:', pageInfo.url);

      // 创建一个临时的canvas来生成二维码
      const qrCanvas = document.createElement('canvas');
      qrCanvas.width = 120;
      qrCanvas.height = 120;

      // 使用QRCode库直接生成到canvas
      const qrCode = new QRCode(document.createElement('div'), {
        text: pageInfo.url,
        width: 120,
        height: 120,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });

      // 获取QR码数据并手动绘制
      const qr = qrCode._oQRCode;
      if (qr && qr.modules) {
        const cellSize = 120 / qr.getModuleCount();
        const qrCtx = qrCanvas.getContext('2d');

        // 绘制白色背景
        qrCtx.fillStyle = '#ffffff';
        qrCtx.fillRect(0, 0, 120, 120);

        // 绘制二维码模块
        for (let row = 0; row < qr.getModuleCount(); row++) {
          for (let col = 0; col < qr.getModuleCount(); col++) {
            if (qr.isDark(row, col)) {
              qrCtx.fillStyle = '#000000';
              qrCtx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            }
          }
        }

        // 将二维码绘制到主画布上
        ctx.drawImage(qrCanvas, 850, 850, 120, 120);
        console.log('✅ QR code generated and drawn');
      } else {
        // 如果QR码数据生成失败，使用占位符
        console.warn('⚠️ QR code data not available, using placeholder');
        ctx.fillStyle = '#ddd';
        ctx.fillRect(850, 850, 120, 120);
        ctx.fillStyle = '#999';
        ctx.font = '16px Arial';
        ctx.fillText('QR码', 910, 915);
      }

    } catch (error) {
      console.error('❌ Error generating QR code:', error);
      // 如果二维码生成失败，使用占位符
      ctx.fillStyle = '#ddd';
      ctx.fillRect(850, 850, 120, 120);
      ctx.fillStyle = '#999';
      ctx.font = '16px Arial';
      ctx.fillText('QR码', 910, 915);
    }

    console.log('✅ Share image created');
    return canvas;
  }

  // 辅助函数：绘制圆角矩形
  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // 显示预览窗口
  function showPreview() {
    console.log('👁️ Attempting to show preview window...');
    if (previewWindow) {
      console.log('🔍 Preview window found, adding visible class...');
      previewWindow.classList.add('visible');
      previewVisible = true;
      hideButton();
      console.log('✅ Preview window shown successfully');
    } else {
      console.error('❌ Preview window not found!');
    }
  }

  // 隐藏预览窗口
  function hidePreview() {
    console.log('🙈 Attempting to hide preview window...');
    if (previewWindow) {
      console.log('🔍 Preview window found, removing visible class...');
      previewWindow.classList.remove('visible');
    }
    previewVisible = false;
    console.log('✅ Preview window hidden successfully');
  }

  // 下载图片
  function downloadImage() {
    if (!currentCanvas) {
      console.error('❌ No canvas to download');
      return;
    }

    const link = document.createElement('a');
    link.download = 'text2social-' + Date.now() + '.png';
    link.href = currentCanvas.toDataURL();
    link.click();
    console.log('💾 Image download started');
  }

  // 复制图片到剪贴板
  async function copyImage() {
    if (!currentCanvas) {
      console.error('❌ No canvas to copy');
      return;
    }

    // 获取复制按钮元素
    const copyBtn = document.getElementById('copy-image');
    if (!copyBtn) {
      console.error('❌ Copy button not found');
      return;
    }

    // 保存原始按钮文本
    const originalText = copyBtn.textContent;

    try {
      currentCanvas.toBlob(async function(blob) {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        
        // 更改按钮文本为"已复制"
        copyBtn.textContent = '已复制';
        
        // 3秒后恢复原始文本
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 3000);
        
        console.log('📋 Image copied to clipboard');
      });
    } catch (error) {
      console.error('❌ Error copying image:', error);
      
      // 更改按钮文本为"复制失败"
      copyBtn.textContent = '复制失败';
      
      // 3秒后恢复原始文本
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 3000);
    }
  }

  // 切换模板
  async function changeTemplate(templateName) {
    if (!selectedText) {
      console.error('❌ No text selected to generate preview with new template');
      return;
    }

    // 更新当前模板
    currentTemplate = templateName;
    console.log('🎨 Switching to template:', templateName);

    // 更新模板选择区域的显示状态
    updateTemplateSelectionUI();

    // 重新生成预览
    const pageInfo = {
      title: document.title,
      url: window.location.href,
      selectedText: selectedText
    };

    // 显示加载状态
    const imageContainer = document.getElementById('preview-image-container');
    if (imageContainer) {
      imageContainer.innerHTML = '<div style="text-align: center;">切换中...</div>';
    }

    try {
      // 生成新模板的图片
      const canvas = await createShareImageWithTemplate(pageInfo, templateName);
      if (imageContainer) {
        imageContainer.innerHTML = '';
        const img = document.createElement('img');
        img.src = canvas.toDataURL();
        img.style.cssText = `
          max-width: 100%;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        `;
        imageContainer.appendChild(img);
      }

      // 保存canvas供下载使用
      currentCanvas = canvas;
      console.log('✅ Template switched and preview updated successfully');
    } catch (error) {
      console.error('❌ Error switching template:', error);
      if (imageContainer) {
        imageContainer.innerHTML = '<div style="color: red; text-align: center;">切换失败，请重试</div>';
      }
    }
  }
  
  // 更新模板选择UI的显示状态
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
        iconDiv.style.color = '';
        iconDiv.style.fontWeight = '';
        nameDiv.style.color = '';
        nameDiv.style.fontWeight = '';
      }
    });
  }

  // 使用指定模板创建分享图片
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
      generateQRCodeInContentScript(pageInfo.url || window.location.href)
        .then(qrCodeDataUrl => {
          console.log('✅ QR Code generated as data URL');

          // 加载模板内容
          return fetch(templateUrl).then(response => response.text()).then(htmlContent => {
            return { htmlContent, qrCodeDataUrl };
          });
        })
        .then(({ htmlContent, qrCodeDataUrl }) => {
          // 替换模板变量 - 只保留三种核心元素
          let processedHtml = htmlContent
            .replace(/{{title}}/g, pageInfo.title || '未知标题')
            .replace(/{{text}}/g, cleanHtmlContent(pageInfo.selectedText) || '无内容')
            // 替换二维码占位符为实际的二维码图片
            .replace('<div class="qr-placeholder">QR</div>',
                     `<img src="${qrCodeDataUrl}" style="width:80px;height:80px;" alt="QR Code">`);

          // 修复CSS和JS路径
          processedHtml = processedHtml
            .replace('href="template1.css"', `href="${chrome.runtime.getURL('templates/' + templateName + '.css')}"`)
            .replace('href="https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap"',
                     `href="${chrome.runtime.getURL('fonts/fonts.css')}"`);

          // 完全移除script标签和其中的所有内容
          processedHtml = processedHtml.replace(/<script\\b[^>]*>.*?<\/script>/gi, '');

          // 移除HTML注释
          processedHtml = processedHtml.replace(/<!--[\\s\\S]*?-->/g, '');

          // 移除多余的空白字符和换行
          processedHtml = processedHtml.replace(/\\s+/g, ' ').trim();

          console.log('📄 Processed HTML length:', processedHtml.length);

          container.innerHTML = processedHtml;
          document.body.appendChild(container);

          // 二维码已经生成，直接进行图片转换
          setTimeout(() => {
            console.log('📸 Converting template to image...');

            // 使用html2canvas转换成图片
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

              // 如果模板失败，回退到原始Canvas方法
              console.log('🔄 Falling back to Canvas method...');
              const fallbackCanvas = createShareImageCanvas(pageInfo);
              resolve(fallbackCanvas);
            });
          }, 500); // 等待CSS和字体加载
        })
        .catch(error => {
          console.error(`❌ Error loading ${templateName}:`, error);

          // 如果模板加载失败，使用原始Canvas方法
          console.log('🔄 Falling back to Canvas method...');
          const fallbackCanvas = createShareImageCanvas(pageInfo);
          resolve(fallbackCanvas);
        });
    });
  }

  // 页面加载完成后初始化
  function startInitialization() {
    console.log('🚀 Starting text2social initialization...');

    // 等待DOM完全加载
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 DOM content loaded');
        setTimeout(init, 100); // 稍微延迟确保所有资源加载完成
      });
    } else {
      console.log('📄 DOM already loaded');
      setTimeout(init, 100);
    }
  }

  // 开始初始化
  startInitialization();

})();
