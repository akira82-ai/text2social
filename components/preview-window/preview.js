// preview-window/preview.js
class PreviewWindow {
  constructor() {
    this.templateSelector = null;
    this.currentTemplate = null;
    this.init();
  }

  init() {
    this.loadTemplateSelector();
    this.bindEvents();
  }

  loadTemplateSelector() {
    this.templateSelector = new TemplateSelector(this.onTemplateSelect.bind(this));
  }

  bindEvents() {
    const exportBtn = document.getElementById('text2social-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', this.exportImage.bind(this));
    }
  }

  async onTemplateSelect(template) {
    this.currentTemplate = template;
    await this.loadTemplateContent(template);
  }

  async loadTemplateContent(template) {
    try {
      console.log('正在加载模板:', template.path);
      const response = await fetch(template.path);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      let htmlContent = await response.text();
      console.log('模板加载成功，内容长度:', htmlContent.length);
      
      // 获取文本数据并替换占位符
      const textData = await this.getTextData();
      if (textData) {
        htmlContent = this.replacePlaceholders(htmlContent, textData);
        console.log('占位符替换完成');
      }
      
      this.displayTemplate(htmlContent);
    } catch (error) {
      console.error('加载模板内容失败:', error);
      this.showError(`模板加载失败: ${error.message}`);
    }
  }

  async displayTemplate(htmlContent) {
    const previewContent = document.querySelector('.preview-content');
    if (!previewContent) return;

    console.log('开始显示模板，原始HTML长度:', htmlContent.length);

    // 显示生成中状态
    this.showLoadingState(previewContent);

    try {
      // 获取文本数据并替换占位符
      const textData = await this.getTextData();
      if (textData) {
        htmlContent = this.replacePlaceholders(htmlContent, textData);
        console.log('占位符替换完成，处理后HTML长度:', htmlContent.length);
      }

      // 创建临时iframe用于渲染（避免样式冲突）
      const tempIframe = document.createElement('iframe');
      tempIframe.style.position = 'absolute';
      tempIframe.style.left = '-9999px';
      tempIframe.style.width = '600px'; // 设置一个合理的初始宽度
      tempIframe.style.height = '400px'; // 设置一个合理的初始高度
      tempIframe.style.border = 'none';
      tempIframe.style.visibility = 'hidden';
      tempIframe.style.overflow = 'hidden';
      document.body.appendChild(tempIframe);

      // 等待iframe创建完成
      await new Promise(resolve => setTimeout(resolve, 100));

      // 写入模板内容到iframe
      const tempDoc = tempIframe.contentDocument;
      tempDoc.open();
      tempDoc.write(htmlContent);
      tempDoc.close();

      // 等待内容加载完成
      await new Promise(resolve => setTimeout(resolve, 500));

      // 获取iframe内部的实际内容尺寸
      const iframeBody = tempIframe.contentDocument.body;
      const iframeHtml = tempIframe.contentDocument.documentElement;
      
      // 清除默认样式
      iframeBody.style.margin = '0';
      iframeBody.style.padding = '0';
      iframeHtml.style.margin = '0';
      iframeHtml.style.padding = '0';

      // 直接使用模板中设置的body尺寸，而不是计算内容尺寸
      const computedStyle = tempIframe.contentWindow.getComputedStyle(iframeBody);
      const templateWidth = parseInt(computedStyle.width) || 500;
      const templateHeight = iframeBody.scrollHeight;

      console.log('模板尺寸:', { width: templateWidth, height: templateHeight });

      // 调整iframe尺寸以匹配模板尺寸
      tempIframe.style.width = templateWidth + 'px';
      tempIframe.style.height = templateHeight + 'px';

      // 等待尺寸调整完成
      await new Promise(resolve => setTimeout(resolve, 200));

      // 使用html2canvas渲染iframe内容
      console.log('开始使用html2canvas渲染...');
      const canvas = await html2canvas(iframeBody, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: templateWidth,
        height: templateHeight,
        windowWidth: templateWidth,
        windowHeight: templateHeight
      });

      console.log('html2canvas渲染完成，画布尺寸:', { width: canvas.width, height: canvas.height });

      // 清理临时iframe
      document.body.removeChild(tempIframe);

      // 将渲染结果显示在预览区域
      this.displayRenderedImage(previewContent, canvas);

    } catch (error) {
      console.error('渲染失败:', error);
      this.showError(previewContent, `渲染失败: ${error.message}`);
    }
  }

  showLoadingState(previewContent) {
    previewContent.innerHTML = `
      <div class="loading-state" style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 300px;
        color: #666666;
        font-size: 16px;
        border: 1px solid #E0E0E0;
        border-radius: 4px;
        background-color: transparent;
      ">
        <div style="text-align: center;">
          <div style="
            width: 32px;
            height: 32px;
            border: 3px solid #E0E0E0;
            border-top: 3px solid #4A90E2;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          "></div>
          生成中...
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
  }

  displayRenderedImage(previewContent, canvas) {
    // 将canvas转换为图片URL
    const imageUrl = canvas.toDataURL('image/png');
    
    // 获取预览内容区域的实际可用尺寸
    const contentRect = previewContent.getBoundingClientRect();
    const availableWidth = contentRect.width;
    const availableHeight = contentRect.height;

    // 创建图片元素
    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';
    img.style.border = '1px solid #E0E0E0';
    img.style.borderRadius = '4px';

    // 清空预览区域并添加图片
    previewContent.innerHTML = '';
    previewContent.appendChild(img);

    // 保存canvas引用供导出使用
    this.currentCanvas = canvas;
  }

  showError(message) {
    const previewContent = document.querySelector('.preview-content');
    if (!previewContent) return;

    previewContent.innerHTML = `
      <div class="error-message" style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 300px;
        color: #999999;
        font-size: 14px;
        border: 1px solid #E0E0E0;
        border-radius: 4px;
      ">
        ${message}
      </div>
    `;
  }

  async getTextData() {
    // 从background script获取文本数据
    return new Promise((resolve) => {
      if (chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({
          action: 'getTextData'
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('获取文本数据失败:', chrome.runtime.lastError);
            resolve(null);
          } else {
            resolve(response.success ? response.data : null);
          }
        });
      } else {
        resolve(null);
      }
    });
  }

  replacePlaceholders(template, data) {
    // 替换模板中的占位符
    let result = template;
    
    // 替换 {{title}} 占位符
    result = result.replace(/{{title}}/g, data.title || '无标题');
    
    // 替换 {{text}} 占位符，保留换行符
    const textContent = data.text || '请选择文本';
    // 将换行符转换为HTML <br> 标签以保持格式
    const formattedText = textContent.replace(/\n/g, '<br>');
    result = result.replace(/{{text}}/g, formattedText);
    
    return result;
  }

  async measureTemplateSize(htmlContent) {
    // 创建隐藏的临时iframe用于测量模板原始尺寸
    const tempIframe = document.createElement('iframe');
    tempIframe.style.position = 'absolute';
    tempIframe.style.left = '-9999px';
    tempIframe.style.width = '108px';
    tempIframe.style.height = '108px';
    tempIframe.style.border = 'none';
    tempIframe.style.visibility = 'hidden';
    tempIframe.style.backgroundColor = 'transparent';
    document.body.appendChild(tempIframe);

    try {
      // 写入模板内容
      const tempDoc = tempIframe.contentDocument || tempIframe.contentWindow.document;
      tempDoc.open();
      tempDoc.write(htmlContent);
      tempDoc.close();

      // 等待内容加载完成
      await new Promise(resolve => setTimeout(resolve, 200));

      // 获取内容的实际尺寸
      const body = tempIframe.contentDocument.body;
      const html = tempIframe.contentDocument.documentElement;
      
      const width = Math.max(
        body.scrollWidth,
        body.offsetWidth,
        html.clientWidth,
        html.scrollWidth,
        html.offsetWidth
      );
      
      const height = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );

      return { width, height };
    } finally {
      // 清理临时iframe
      if (document.body.contains(tempIframe)) {
        document.body.removeChild(tempIframe);
      }
    }
  }

  calculateBestFitScale(templateWidth, templateHeight, availableWidth, availableHeight) {
    // 基于宽度计算缩放比例，确保模板宽度填满预览区域
    const scale = availableWidth / templateWidth;
    
    // 检查缩放后的高度是否超出预览区域
    const scaledHeight = templateHeight * scale;
    if (scaledHeight > availableHeight) {
      // 如果高度超出，则基于高度重新计算
      return availableHeight / templateHeight;
    }
    
    return scale;
  }

  applyContentScaling(iframe, scale) {
    const iframeBody = iframe.contentDocument.body;
    const iframeHtml = iframe.contentDocument.documentElement;
    
    // 为iframe内容添加左右5%、上下1%的padding
    const iframeWidth = parseInt(iframe.style.width);
    const iframeHeight = parseInt(iframe.style.height);
    const horizontalPadding = iframeWidth * 0.05; // 5%的左右padding
    const verticalPadding = iframeHeight * 0.01; // 1%的上下padding
    
    iframeBody.style.paddingLeft = `${horizontalPadding}px`;
    iframeBody.style.paddingRight = `${horizontalPadding}px`;
    iframeBody.style.paddingTop = `${verticalPadding}px`;
    iframeBody.style.paddingBottom = `${verticalPadding}px`;
    
    // 应用缩放
    iframeBody.style.transform = `scale(${scale})`;
    iframeBody.style.transformOrigin = 'top left';
    iframeBody.style.width = `${100 / scale}%`;
    iframeBody.style.height = `${100 / scale}%`;
    
    // 确保无滚动条
    iframe.style.overflow = 'hidden';
    iframeBody.style.overflow = 'hidden';
    iframeHtml.style.overflow = 'hidden';
    
    // 设置body和html的margin为0，防止额外空间
    iframeBody.style.margin = '0';
    iframeHtml.style.margin = '0';
    iframeHtml.style.padding = '0';
    
    // 确保内容不会溢出
    iframeBody.style.boxSizing = 'border-box';
    iframeHtml.style.boxSizing = 'border-box';
  }

  async exportImage() {
    // 检查当前是否有渲染完成的图片
    if (!this.currentCanvas) {
      alert('请等待图片生成完成');
      return;
    }

    // 设置按钮为加载状态
    const exportBtn = document.getElementById('text2social-export-btn');
    const originalText = exportBtn.textContent;
    exportBtn.textContent = '复制中...';
    exportBtn.disabled = true;

    try {
      // 直接使用已渲染的canvas
      console.log('开始复制图片到剪贴板...');
      
      // 将canvas转换为blob并复制到剪贴板
      this.currentCanvas.toBlob(blob => {
        console.log('图片blob生成成功，大小:', blob.size);
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]).then(() => {
          alert('图片已复制到剪贴板！');
        }).catch(err => {
          console.error('复制失败:', err);
          alert('复制失败，请重试');
        }).finally(() => {
          // 恢复按钮状态
          exportBtn.textContent = originalText;
          exportBtn.disabled = false;
        });
      });

    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败: ' + error.message);
      // 恢复按钮状态
      exportBtn.textContent = originalText;
      exportBtn.disabled = false;
    }
  }
}

// 初始化预览窗口
document.addEventListener('DOMContentLoaded', () => {
  new PreviewWindow();
});