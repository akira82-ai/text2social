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
      
      const htmlContent = await response.text();
      console.log('模板加载成功，内容长度:', htmlContent.length);
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

  exportImage() {
    if (typeof html2canvas !== 'undefined') {
      const previewContent = document.querySelector('.preview-content iframe');
      if (!previewContent) {
        alert('请先选择一个模板');
        return;
      }

      html2canvas(previewContent, {
        backgroundColor: '#ffffff',
        scale: 2
      }).then(canvas => {
        canvas.toBlob(blob => {
          const item = new ClipboardItem({ 'image/png': blob });
          navigator.clipboard.write([item]).then(() => {
            alert('图片已复制到剪贴板！');
          }).catch(err => {
            console.error('复制失败:', err);
            alert('复制失败，请重试');
          });
        });
      });
    } else {
      alert('图片导出功能暂不可用');
    }
  }
}

// 初始化预览窗口
document.addEventListener('DOMContentLoaded', () => {
  new PreviewWindow();
});