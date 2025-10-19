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
        selectedText = text;

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

  // 获取网页信息
  function getPageInfo() {
    function getFavicon() {
      const iconLink = document.querySelector('link[rel="icon"]') ||
                       document.querySelector('link[rel="shortcut icon"]');
      return iconLink ? iconLink.href : window.location.origin + '/favicon.ico';
    }

    const pageInfo = {
      title: document.title,
      url: window.location.href,
      favicon: getFavicon(),
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
      // 生成图片
      const canvas = createShareImage(pageInfo);

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

    } catch (error) {
      console.error('❌ Error generating preview:', error);
      if (imageContainer) {
        imageContainer.innerHTML = '<div style="color: red; text-align: center;">生成失败，请重试</div>';
      }
    }
  }

  // 创建分享图片
  function createShareImage(pageInfo) {
    console.log('🎨 Creating share image...');

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

    // 处理长文本换行
    const maxWidth = 800;
    const lineHeight = 70;
    const words = pageInfo.selectedText.split('');
    let line = '';
    let y = 300;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n];
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, canvas.width / 2, y);
        line = words[n];
        y += lineHeight;

        if (y > 700) break;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, canvas.width / 2, y);

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

    try {
      currentCanvas.toBlob(async function(blob) {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        alert('图片已复制到剪贴板');
        console.log('📋 Image copied to clipboard');
      });
    } catch (error) {
      console.error('❌ Error copying image:', error);
      alert('复制失败，请使用下载功能');
    }
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