// preview-window/template-selector/selector.js
class TemplateSelector {
  constructor(onSelect) {
    this.templates = [];
    this.selectedTemplate = null;
    this.onSelect = onSelect || (() => {});
    this.init();
  }

  async init() {
    const initMessage = window.text2socialI18n ? window.text2socialI18n.t('initializing_selector') : '初始化模板选择器...';
    console.log(initMessage);
    await this.loadTemplates();
    const loadedMessage = window.text2socialI18n ? window.text2socialI18n.t('templates_loaded') : '已加载模板数量:';
    console.log(loadedMessage, this.templates.length);
    this.render();
    this.bindEvents();
    
    // 默认选中第一个模板
    if (this.templates.length > 0) {
      this.selectTemplate(this.templates[0].id);
    } else {
      const noTemplatesMessage = window.text2socialI18n ? window.text2socialI18n.t('no_templates_found') : '没有找到可用的模板';
      console.warn(noTemplatesMessage);
    }
  }

  async loadTemplates() {
    try {
      // 尝试从templates.txt文件加载模板列表
      const response = await fetch('../../../templates.txt');
      if (!response.ok) {
        throw new Error('无法加载模板配置文件');
      }
      
      const text = await response.text();
      const templateFiles = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.endsWith('.html'));
      
      if (templateFiles.length === 0) {
        throw new Error('模板配置文件为空');
      }
      
      // 根据文件列表生成模板对象
      const basePath = Text2SocialConstants.TEMPLATE_RELATIVE_PATH;
      this.templates = templateFiles.map((fileName, index) => {
        const name = fileName.replace('.html', '');
        return {
          id: `template${index + 1}`,
          name: name,
          color: this.getTemplateColor(index),
          path: basePath + fileName
        };
      });
      
      console.log(`从配置文件加载了 ${this.templates.length} 个模板`);
    } catch (error) {
      console.error('从配置文件加载模板失败:', error);
      // 如果加载失败，使用默认模板列表
      this.templates = this.getDefaultTemplates();
      console.log(`使用默认模板列表，共 ${this.templates.length} 个模板`);
    }
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
    // 默认模板配置（备用方案）- 8个中文模板
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
        <div class="template-option ${isSelected}" data-template-id="${template.id}">
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