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
        color: this.getTemplateColor(index),
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
    // 模板文件列表（9个中文命名的模板，包括所有实际存在的文件）
    const knownTemplates = [
      { name: '标签分类.html', path: basePath + '标签分类.html' },
      { name: '复古终端.html', path: basePath + '复古终端.html' },
      { name: '极简主义.html', path: basePath + '极简主义.html' },
      { name: '渐变高亮.html', path: basePath + '渐变高亮.html' },
      { name: '文章摘录.html', path: basePath + '文章摘录.html' },
      { name: '社交媒体.html', path: basePath + '社交媒体.html' },
      { name: '深色模式.html', path: basePath + '深色模式.html' },
      { name: '艺术留白.html', path: basePath + '艺术留白.html' },
      { name: '优雅标题.html', path: basePath + '优雅标题.html' }
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

  getTemplateColor(index) {
    // 为不同模板分配不同的背景色
    const colors = [
      '#E0F0FF', // 浅蓝色
      '#FFF0E0', // 浅橙色
      '#F0E0FF', // 浅紫色
      '#E0FFE0', // 浅绿色
      '#FFE0F0', // 浅粉色
      '#F0FFE0', // 浅黄绿色
      '#E0FFFF', // 浅青色
      '#FFE8E0'  // 浅红色
    ];
    return colors[index % colors.length];
  }

  getDefaultTemplates() {
    // 默认模板配置（备用方案）- 9个中文模板
    const basePath = Text2SocialConstants.TEMPLATE_RELATIVE_PATH;
    return [
      {
        id: 'template1',
        name: '标签分类',
        color: '#E0F0FF',
        path: basePath + '标签分类.html'
      },
      {
        id: 'template2',
        name: '复古终端',
        color: '#FFF0E0',
        path: basePath + '复古终端.html'
      },
      {
        id: 'template3',
        name: '极简主义',
        color: '#F0E0FF',
        path: basePath + '极简主义.html'
      },
      {
        id: 'template4',
        name: '渐变高亮',
        color: '#E0FFE0',
        path: basePath + '渐变高亮.html'
      },
      {
        id: 'template5',
        name: '文章摘录',
        color: '#FFE0F0',
        path: basePath + '文章摘录.html'
      },
      {
        id: 'template6',
        name: '社交媒体',
        color: '#FFE8E0',
        path: basePath + '社交媒体.html'
      },
      {
        id: 'template7',
        name: '深色模式',
        color: '#F0FFE0',
        path: basePath + '深色模式.html'
      },
      {
        id: 'template8',
        name: '艺术留白',
        color: '#E0FFFF',
        path: basePath + '艺术留白.html'
      },
      {
        id: 'template9',
        name: '优雅标题',
        color: '#F0FFF0',
        path: basePath + '优雅标题.html'
      }
    ];
  }

  render() {
    const container = document.querySelector('.template-options');
    if (!container) return;

    let optionsHTML = '';
    this.templates.forEach((template, index) => {
      const isSelected = index === 0 ? 'selected' : '';
      const nameHTML = this.formatTemplateName(template.name);
      optionsHTML += `
        <div class="template-option ${isSelected}" data-template-id="${template.id}" style="background-color: ${template.color};">
          <div class="template-name">${nameHTML}</div>
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

  formatTemplateName(name) {
    // 如果是四个字的模板名称，拆分为两行显示
    if (name.length === 4) {
      const firstLine = name.substring(0, 2);
      const secondLine = name.substring(2, 4);
      return `<div class="two-line"><div class="line">${firstLine}</div><div class="line">${secondLine}</div></div>`;
    }
    return name;
  }
}