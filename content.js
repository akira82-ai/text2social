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
      // 可以触发浮窗显示或其他操作
      this.showFloatingButton();
    }
  }

  getSelectedText() {
    // 获取当前选择的文字
    return window.getSelection().toString().trim();
  }

  showFloatingButton() {
    // 显示浮动按钮的逻辑
    // 将在floating-button组件中具体实现
  }

  destroy() {
    // 销毁内容脚本，清理事件监听器
    document.removeEventListener('mouseup', this.handleTextSelection);
    this.isInitialized = false;
  }
}

// 初始化扩展
const text2Social = new Text2SocialContent();