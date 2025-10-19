/**
 * text2social - Content Script
 * 监听文字选择，显示浮动按钮，生成分享图片
 */

(function() {
  'use strict';

  // 全局变量
  let selectedText = '';
  let buttonVisible = false;
  let previewVisible = false;
  let button, previewWindow, currentCanvas;

  // 初始化
  function init() {
    createFloatingButton();
    createPreviewWindow();
    bindEvents();
  }

  // 创建浮动按钮
  function createFloatingButton() {
    button = document.createElement('div');
    button.id = 'text2social-button';
    button.innerHTML = '📸';
    button.style.cssText = `
      position: absolute;
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: none;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      z-index: 2147483647;
      font-size: 18px;
      transition: all 0.3s ease;
      border: none;
      font-family: system-ui, -apple-system, sans-serif;
    `;

    button.addEventListener('mouseenter', function() {
      button.style.transform = 'scale(1.1)';
    });

    button.addEventListener('mouseleave', function() {
      button.style.transform = 'scale(1)';
    });

    document.body.appendChild(button);
  }

  // 创建预览窗口
  function createPreviewWindow() {
    previewWindow = document.createElement('div');
    previewWindow.id = 'text2social-preview';
    previewWindow.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      z-index: 2147483647;
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: system-ui, -apple-system, sans-serif;
    `;

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
  }

  // 绑定事件
  function bindEvents() {
    // 文字选择事件
    document.addEventListener('mouseup', function(e) {
      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (text && text.length > 0) {
        selectedText = text;
        showButton(e.pageX, e.pageY);
      } else {
        hideButton();
      }
    });

    // 点击其他地方隐藏按钮
    document.addEventListener('click', function(e) {
      if (!button.contains(e.target)) {
        hideButton();
      }
    });

    // 按钮点击事件
    button.addEventListener('click', function() {
      generatePreview();
    });

    // 关闭预览
    document.getElementById('close-preview').addEventListener('click', function() {
      hidePreview();
    });

    // 下载图片
    document.getElementById('download-image').addEventListener('click', function() {
      downloadImage();
    });

    // 复制图片
    document.getElementById('copy-image').addEventListener('click', function() {
      copyImage();
    });
  }

  // 显示浮动按钮
  function showButton(x, y) {
    button.style.display = 'flex';
    button.style.left = (x + 10) + 'px';
    button.style.top = (y - 50) + 'px';
    buttonVisible = true;
  }

  // 隐藏浮动按钮
  function hideButton() {
    button.style.display = 'none';
    buttonVisible = false;
  }

  // 获取网页信息
  function getPageInfo() {
    function getFavicon() {
      const iconLink = document.querySelector('link[rel="icon"]') ||
                       document.querySelector('link[rel="shortcut icon"]');
      return iconLink ? iconLink.href : window.location.origin + '/favicon.ico';
    }

    return {
      title: document.title,
      url: window.location.href,
      favicon: getFavicon(),
      selectedText: selectedText
    };
  }

  // 生成预览
  function generatePreview() {
    const pageInfo = getPageInfo();

    // 显示加载状态
    const imageContainer = document.getElementById('preview-image-container');
    imageContainer.innerHTML = '<div style="text-align: center;">生成中...</div>';

    showPreview();

    try {
      // 生成图片 (这里先放一个占位符，后续会实现完整的生成逻辑)
      const canvas = createShareImage(pageInfo);

      imageContainer.innerHTML = '';
      const img = document.createElement('img');
      img.src = canvas.toDataURL();
      img.style.cssText = `
        max-width: 100%;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      `;
      imageContainer.appendChild(img);

      // 保存canvas供下载使用
      currentCanvas = canvas;

    } catch (error) {
      console.error('生成图片失败:', error);
      imageContainer.innerHTML = '<div style="color: red; text-align: center;">生成失败，请重试</div>';
    }
  }

  // 创建分享图片 (基础版本)
  function createShareImage(pageInfo) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 设置画布尺寸 (1080x1080 正方形)
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

        if (y > 700) break; // 最多显示6行
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, canvas.width / 2, y);

    // 网页标题
    ctx.fillStyle = '#666';
    ctx.font = '32px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText('—— ' + pageInfo.title, canvas.width / 2, 850);

    // 二维码占位符
    ctx.fillStyle = '#ddd';
    ctx.fillRect(850, 850, 120, 120);
    ctx.fillStyle = '#999';
    ctx.font = '16px Arial';
    ctx.fillText('QR码', 910, 915);

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
    previewWindow.style.display = 'flex';
    previewVisible = true;
    hideButton();
  }

  // 隐藏预览窗口
  function hidePreview() {
    previewWindow.style.display = 'none';
    previewVisible = false;
  }

  // 下载图片
  function downloadImage() {
    if (!currentCanvas) return;

    const link = document.createElement('a');
    link.download = 'text2social-' + Date.now() + '.png';
    link.href = currentCanvas.toDataURL();
    link.click();
  }

  // 复制图片到剪贴板
  async function copyImage() {
    if (!currentCanvas) return;

    try {
      currentCanvas.toBlob(async function(blob) {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        alert('图片已复制到剪贴板');
      });
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败，请使用下载功能');
    }
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();