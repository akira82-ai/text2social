// Text2Social 扩展主入口脚本
// 监听页面上的文字选择事件

class Text2SocialContent {
  constructor() {
    this.selectedText = '';
    this.isInitialized = false;
    this.init();
  }

  init() {
    // 初始化内容脚本
    this.bindEvents();
    this.isInitialized = true;
  }

  bindEvents() {
    // 绑定文字选择事件
    document.addEventListener('mouseup', this.handleTextSelection.bind(this));
  }

  handleTextSelection() {
    // 处理文字选择逻辑
    this.selectedText = this.getSelectedText();
    
    if (this.selectedText) {
      // 文字选择完成，获取页面标题并发送数据
      const pageTitle = document.title || '无标题';
      console.log('选中的文字:', this.selectedText);
      console.log('页面标题:', pageTitle);
      
      // 发送数据到background script
      this.sendDataToBackground({
        text: this.selectedText,
        title: pageTitle
      });
    }
  }

  getSelectedText() {
    // 获取当前选择的文字，保留原有格式包括换行符
    return window.getSelection().toString();
  }

  sendDataToBackground(data) {
    // 发送数据到background script
    try {
      if (chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({
          action: 'updateTextData',
          data: data
        }, (response) => {
          if (chrome.runtime.lastError) {
            // 检查是否是扩展上下文失效错误
            if (chrome.runtime.lastError.message.includes('Extension context invalidated')) {
              console.warn('扩展上下文已失效，可能是扩展重新加载或更新');
            } else {
              console.error('发送消息失败:', chrome.runtime.lastError);
            }
          } else {
            console.log('数据发送成功:', response);
          }
        });
      } else {
        console.warn('Chrome runtime 不可用');
      }
    } catch (error) {
      if (error.message.includes('Extension context invalidated')) {
        console.warn('扩展上下文已失效，可能是扩展重新加载或更新');
      } else {
        console.error('发送消息时发生错误:', error);
      }
    }
  }

  
  destroy() {
    // 销毁内容脚本，清理事件监听器
    document.removeEventListener('mouseup', this.handleTextSelection);
    this.isInitialized = false;
  }
}

// 初始化扩展
const text2Social = new Text2SocialContent();