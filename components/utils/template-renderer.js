// components/utils/template-renderer.js
class TemplateRenderer {
  constructor() {
    // 模板渲染器构造函数
  }

  static async render(templatePath, data) {
    // 渲染模板的主要方法
    try {
      // 加载模板内容
      const templateContent = await this.loadTemplate(templatePath);
      
      if (!templateContent) {
        throw new Error(`模板加载失败: ${templatePath}`);
      }
      
      // 使用mustache或其他模板引擎渲染
      return this.processTemplate(templateContent, data);
    } catch (error) {
      console.error(`模板渲染失败: ${templatePath}`, error);
      return null;
    }
  }

  static async loadTemplate(path) {
    // 从指定路径加载模板
    try {
      const response = await fetch(path);
      return await response.text();
    } catch (error) {
      console.error(`加载模板失败: ${path}`, error);
      return null;
    }
  }

  static processTemplate(template, data) {
    // 处理模板和数据
    // 这里可以使用mustache.js或其他模板引擎
    if (typeof Mustache !== 'undefined') {
      // 如果存在Mustache模板引擎，则使用它
      return Mustache.render(template, data);
    } else {
      // 简单的字符串替换实现
      return this.simpleReplace(template, data);
    }
  }

  static simpleReplace(template, data) {
    // 简单的模板替换实现
    let result = template;
    
    for (const [key, value] of Object.entries(data)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(placeholder, value || '');
    }
    
    return result;
  }

  static validateTemplate(template) {
    // 验证模板格式
    return typeof template === 'string' && template.length > 0;
  }

  static sanitizeOutput(html) {
    // 使用dompurify.js清理HTML输出
    if (typeof DOMPurify !== 'undefined') {
      return DOMPurify.sanitize(html);
    }
    // 如果没有dompurify，则返回原文本（注意安全风险）
    return html;
  }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TemplateRenderer;
}