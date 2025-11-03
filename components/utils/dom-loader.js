// components/utils/dom-loader.js
class DOMLoader {
  constructor() {
    // DOM加载器构造函数
  }

  static async loadHTML(url) {
    // 加载HTML内容
    try {
      const response = await fetch(url);
      return await response.text();
    } catch (error) {
      console.error(`加载HTML失败: ${url}`, error);
      return null;
    }
  }

  static async loadCSS(url) {
    // 动态加载CSS
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = url;
      
      link.onload = () => resolve(link);
      link.onerror = (error) => reject(error);
      
      document.head.appendChild(link);
    });
  }

  static async loadJS(url) {
    // 动态加载JS
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      
      script.onload = () => resolve(script);
      script.onerror = (error) => reject(error);
      
      document.head.appendChild(script);
    });
  }

  static injectCSS(cssText, id) {
    // 注入CSS文本
    if (id && document.getElementById(id)) {
      // 如果已存在相同ID的样式，先移除
      document.getElementById(id).remove();
    }
    
    const style = document.createElement('style');
    if (id) {
      style.id = id;
    }
    style.textContent = cssText;
    
    document.head.appendChild(style);
    return style;
  }

  static createElementFromHTML(htmlString) {
    // 从HTML字符串创建DOM元素
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstElementChild;
  }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DOMLoader;
}