// preview-window/template-selector/selector.js
class TemplateSelector {
  constructor(onSelect) {
    this.templates = [];
    this.selectedTemplate = null;
    this.onSelect = onSelect || (() => {});
    this.init();
  }

  async init() {
    console.log('初始化模板选择器...');
    await this.loadTemplates();
    console.log('已加载模板数量:', this.templates.length);
    this.render();
    this.bindEvents();
    
    // 默认选中第一个模板
    if (this.templates.length > 0) {
      this.selectTemplate(this.templates[0].id);
    } else {
      console.warn('没有找到可用的模板');
    }
  }

  async loadTemplates() {
    try {
      // 动态扫描templates目录下的所有HTML文件
      const basePath = Text2SocialConstants.TEMPLATE_RELATIVE_PATH;
      const existingTemplates = await this.scanTemplateDirectory(basePath);
      
      this.templates = existingTemplates.map((file, index) => ({
        id: `template${index + 1}`,
        name: file.name.replace('.html', ''),
        icon: this.getTemplateIcon(index),
        path: file.path
      }));
      
      console.log(`实际找到 ${this.templates.length} 个模板文件`);
    } catch (error) {
      console.error('加载模板失败:', error);
      // 如果动态扫描失败，使用默认模板作为备用
      this.templates = this.getDefaultTemplates();
    }
  }

  async scanTemplateDirectory(basePath) {
    // 模板文件列表（由于浏览器安全限制，这里使用预定义的模板配置）
    const knownTemplates = [
      { name: '模板 1.html', path: basePath + '模板 1.html' },
      { name: '模板 2.html', path: basePath + '模板 2.html' }
    ];

    // 尝试检查每个模板文件是否存在
    const existingTemplates = [];
    for (const template of knownTemplates) {
      try {
        const response = await fetch(template.path, { method: 'HEAD' });
        if (response.ok) {
          existingTemplates.push(template);
        }
      } catch (error) {
        console.warn(`模板文件不存在: ${template.path}`);
      }
    }

    return existingTemplates;
  }

  getTemplateIcon(index) {
    // 为不同模板分配不同的图标
    const icons = ['✏️', '📱', '🎨', '💡', '📷', '🌟', '🎯', '🔥'];
    return icons[index % icons.length];
  }

  getDefaultTemplates() {
    // 默认模板配置（备用方案）
    const basePath = Text2SocialConstants.TEMPLATE_RELATIVE_PATH;
    return [
      {
        id: 'template1',
        name: '模板 1',
        icon: '✏️',
        path: basePath + '模板 1.html'
      },
      {
        id: 'template2',
        name: '模板 2',
        icon: '📱',
        path: basePath + '模板 2.html'
      }
    ];
  }

  render() {
    const container = document.querySelector('.template-options');
    if (!container) return;

    let optionsHTML = '';
    this.templates.forEach((template, index) => {
      const isSelected = index === 0 ? 'selected' : '';
      optionsHTML += `
        <div class="template-option ${isSelected}" data-template-id="${template.id}">
          <div class="template-icon">
            ${template.icon}
          </div>
          <div class="template-name">${template.name}</div>
        </div>
      `;
    });

    container.innerHTML = optionsHTML;
  }

  bindEvents() {
    document.querySelectorAll('.template-option').forEach(option => {
      option.addEventListener('click', (e) => {
        this.selectTemplate(e.currentTarget.dataset.templateId);
      });
    });
  }

  selectTemplate(templateId) {
    // 清除所有选中状态
    document.querySelectorAll('.template-option').forEach(option => {
      option.classList.remove('selected');
    });

    // 设置新的选中状态
    const selectedOption = document.querySelector(`[data-template-id="${templateId}"]`);
    if (selectedOption) {
      selectedOption.classList.add('selected');
      this.selectedTemplate = this.templates.find(t => t.id === templateId);
      this.onSelect(this.selectedTemplate);
    }
  }

  getSelectedTemplate() {
    return this.selectedTemplate;
  }
}