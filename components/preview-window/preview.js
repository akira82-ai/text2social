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

  displayTemplate(htmlContent) {
    const previewContent = document.querySelector('.preview-content');
    if (!previewContent) return;

    // 创建iframe来显示模板内容
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '300px';
    iframe.style.border = '1px solid #E0E0E0';
    iframe.style.borderRadius = '4px';

    // 替换预览区域的内容
    previewContent.innerHTML = '';
    previewContent.appendChild(iframe);

    // 将HTML内容写入iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();
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
    
    // 替换 {{text}} 占位符
    result = result.replace(/{{text}}/g, data.text || '请选择文本');
    
    return result;
  }

  async exportImage() {
    // 检查当前是否有加载的模板
    if (!this.currentTemplate) {
      alert('模板加载中，请稍后再试');
      return;
    }

    // 获取预览iframe
    const previewIframe = document.querySelector('.preview-content iframe');
    if (!previewIframe) {
      alert('请等待模板加载完成');
      return;
    }

    // 设置按钮为加载状态
    const exportBtn = document.getElementById('text2social-export-btn');
    const originalText = exportBtn.textContent;
    exportBtn.textContent = '导出中...';
    exportBtn.disabled = true;

    try {
      // 创建临时iframe用于导出
      const tempIframe = document.createElement('iframe');
      tempIframe.style.position = 'absolute';
      tempIframe.style.left = '-9999px';
      tempIframe.style.width = '1080px';
      tempIframe.style.height = '1080px';
      tempIframe.style.border = 'none';
      tempIframe.style.backgroundColor = '#ffffff';
      document.body.appendChild(tempIframe);

      // 等待iframe创建完成
      await new Promise(resolve => setTimeout(resolve, 100));

      // 获取处理后的模板内容
      const textData = await this.getTextData();
      if (!textData) {
        throw new Error('无法获取文本数据');
      }

      // 重新加载模板内容并替换占位符
      const response = await fetch(this.currentTemplate.path);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      let htmlContent = await response.text();
      htmlContent = this.replacePlaceholders(htmlContent, textData);

      // 写入模板内容到临时iframe
      const tempDoc = tempIframe.contentDocument;
      tempDoc.open();
      tempDoc.write(htmlContent);
      tempDoc.close();

      // 等待内容加载完成
      await new Promise(resolve => setTimeout(resolve, 500));

      // 获取内容的实际高度
      const body = tempIframe.contentDocument.body;
      const html = tempIframe.contentDocument.documentElement;
      const contentHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );

      // 设置iframe高度以适应内容
      tempIframe.style.height = contentHeight + 'px';

      // 等待iframe调整高度
      await new Promise(resolve => setTimeout(resolve, 200));

      // 使用html2canvas截图
      const canvas = await html2canvas(tempIframe.contentDocument.body, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: 1080,
        height: contentHeight,
        windowWidth: 1080,
        windowHeight: contentHeight
      });

      // 复制到剪贴板
      canvas.toBlob(blob => {
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
          // 清理临时iframe
          document.body.removeChild(tempIframe);
        });
      });

    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
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