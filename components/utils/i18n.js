// Text2Social i18n 国际化工具
class Text2SocialI18n {
  constructor() {
    this.currentLanguage = 'zh-CN';
    this.translations = {};
    this.init();
  }

  async init() {
    // 检测浏览器语言
    this.detectLanguage();
    
    // 加载语言资源
    await this.loadTranslations();
    
    // 应用翻译到页面
    this.applyTranslations();
  }

  detectLanguage() {
    // 从localStorage获取用户设置的语言
    const savedLanguage = localStorage.getItem('text2social_language');
    if (savedLanguage) {
      this.currentLanguage = savedLanguage;
      return;
    }

    // 根据浏览器语言自动检测
    const browserLanguage = navigator.language || navigator.userLanguage;
    if (browserLanguage.startsWith('en')) {
      this.currentLanguage = 'en-US';
    } else if (browserLanguage.startsWith('ja')) {
      this.currentLanguage = 'ja-JP';
    } else {
      this.currentLanguage = 'zh-CN';
    }
  }

  async loadTranslations() {
    try {
      const response = await fetch('../../locales/i18n.txt');
      const text = await response.text();
      this.parseTranslations(text);
    } catch (error) {
      console.error('加载语言资源失败:', error);
    }
  }

  parseTranslations(text) {
    const lines = text.split('\n');
    this.translations = {};

    lines.forEach(line => {
      line = line.trim();
      
      // 跳过注释和空行
      if (!line || line.startsWith('#')) {
        return;
      }

      // 解析键值对
      const match = line.match(/^([^=]+)=(.+)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        this.translations[key] = value;
      }
    });
  }

  t(key) {
    const fullKey = `${this.currentLanguage}.${key}`;
    return this.translations[fullKey] || key;
  }

  setLanguage(language) {
    if (language !== this.currentLanguage) {
      this.currentLanguage = language;
      localStorage.setItem('text2social_language', language);
      this.applyTranslations();
    }
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  applyTranslations() {
    // 查找所有带有data-i18n属性的元素
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      if (element.tagName === 'INPUT' && element.type === 'button') {
        element.value = translation;
      } else {
        element.textContent = translation;
      }
    });
  }

  // 获取可用语言列表
  getAvailableLanguages() {
    return [
      { code: 'zh-CN', name: this.t('chinese') },
      { code: 'en-US', name: this.t('english') },
      { code: 'ja-JP', name: this.t('japanese') }
    ];
  }
}

// 创建全局i18n实例
window.text2socialI18n = new Text2SocialI18n();