// TemplateSelector类定义
class TemplateSelector {
  constructor(options = {}) {
    this.containerId = options.containerId || 'text2social-template-selector-container';
    this.onSelect = options.onSelect || (() => {});
    this.templates = [];
    this.selectedTemplate = null;
    this.container = null;
    // 不在构造函数中调用init，让它由外部调用
  }

  async init() {
    // 初始化模板选择器
    await this.loadTemplates();
    this.render();
    this.bindEvents();
    // 默认选中第一个模板
    if (this.templates.length > 0) {
      this.selectTemplate(this.templates[0].id);
    }
  }

  async loadTemplates() {
    // 加载可用的模板列表
    // 从templates目录读取可用模板
    this.templates = [
      {
        id: 'template1',
        name: '简约风格',
        icon: '📝',
        path: '../../../templates/模板 1.html',
        description: '简洁清爽的文字卡片模板'
      },
      {
        id: 'template2',
        name: '社交媒体分享',
        icon: '📱',
        path: '../../../templates/模板 2.html',
        description: '适合社交媒体分享的精美卡片'
      }
    ];
  }

  render() {
    // 渲染模板选择器UI
    this.container = document.getElementById(this.containerId);
    if (this.container) {
      this.container.innerHTML = this.getHTML();
    }
  }

  getHTML() {
    // 获取模板选择器HTML
    let optionsHTML = '';
    this.templates.forEach((template, index) => {
      const isSelected = index === 0 ? 'selected' : '';
      const selectedDot = index === 0 ? '<div class="selected-dot"></div>' : '';
      optionsHTML += `
        <div class="template-option ${isSelected}" data-template-id="${template.id}" title="${template.description || template.name}">
          ${selectedDot}
          <div class="template-icon">${template.icon}</div>
          <div class="template-name">${template.name}</div>
        </div>
      `;
    });

    return `
      <div id="text2social-template-selector" class="template-selector">
        <div class="template-options">
          ${optionsHTML}
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 绑定事件
    this.container.querySelectorAll('.template-option').forEach(option => {
      option.addEventListener('click', (e) => {
        this.selectTemplate(e.target.dataset.templateId);
      });
    });
  }

  selectTemplate(templateId) {
    // 选择模板
    this.clearSelection();

    const selectedOption = this.container.querySelector(`[data-template-id="${templateId}"]`);
    if (selectedOption) {
      selectedOption.classList.add('selected');
      this.selectedTemplate = this.templates.find(t => t.id === templateId);
      this.onSelect(this.selectedTemplate);
    }
  }

  clearSelection() {
    // 清除现有选择
    this.container.querySelectorAll('.template-option').forEach(option => {
      option.classList.remove('selected');
    });
  }

  getSelectedTemplate() {
    // 获取当前选中的模板
    return this.selectedTemplate;
  }

  destroy() {
    // 销毁模板选择器实例
    this.container.innerHTML = '';
  }
}

// PreviewWindow类定义
class PreviewWindow {
  constructor() {
    this.container = null;
    this.contentElement = null;
    this.templateSelector = null;
    this.selectedTemplate = null;
    this.selectedText = '';
    // 延迟初始化，等DOM加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      setTimeout(() => this.init(), 0);
    }
  }

  async init() {
    // 初始化预览窗口
    this.cacheElements();
    this.bindEvents();
    await this.loadTemplateSelector();
  }

  cacheElements() {
    // 缓存DOM元素
    this.container = document.getElementById('text2social-preview-container');
    this.contentElement = document.getElementById('text2social-preview-content');
  }

  bindEvents() {
    // 绑定事件
    const exportBtn = document.getElementById('text2social-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', this.exportImage.bind(this));
    }
  }

  async loadTemplateSelector() {
    // 加载模板选择器组件
    this.templateSelector = new TemplateSelector({
      containerId: 'text2social-template-selector-container',
      onSelect: this.onTemplateSelect.bind(this)
    });
    await this.templateSelector.init();
  }

  onTemplateSelect(template) {
    // 模板选择回调
    this.selectedTemplate = template;
    this.renderPreview();
  }

  renderPreview() {
    // 渲染预览内容
    if (this.selectedTemplate && this.selectedText) {
      // 使用模板渲染预览内容
      this.contentElement.innerHTML = this.generatePreviewHTML();
    }
  }

  generatePreviewHTML() {
    // 生成预览HTML
    return `
      <div class="generated-preview">
        <h3>预览内容</h3>
        <p>${this.selectedText}</p>
      </div>
    `;
  }

  setText(text) {
    // 设置要预览的文本
    this.selectedText = text;
    this.renderPreview();
  }

  close() {
    // 关闭预览窗口
    window.close();
  }

  exportImage() {
    // 复制为图片功能
    // 调用工具函数库中的图片导出功能
    if (typeof html2canvas !== 'undefined') {
      const previewContent = document.getElementById('text2social-preview-content');
      html2canvas(previewContent, {
        backgroundColor: '#ffffff',
        scale: 2
      }).then(canvas => {
        // 将canvas转换为图片并复制到剪贴板
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

  destroy() {
    // 销毁预览窗口实例
    if (this.templateSelector) {
      this.templateSelector.destroy();
    }
  }
}

// 初始化预览窗口
const previewWindow = new PreviewWindow();