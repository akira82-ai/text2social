// floating-button/button.js
class FloatingButton {
  constructor() {
    this.element = null;
    this.isVisible = false;
    this.init();
  }

  init() {
    // 初始化浮动按钮
    this.createButton();
    this.bindEvents();
  }

  createButton() {
    // 创建按钮DOM元素
    const container = document.createElement('div');
    container.innerHTML = this.getButtonHTML();
    document.body.appendChild(container);
    
    this.element = document.getElementById('text2social-floating-btn');
  }

  getButtonHTML() {
    // 获取按钮HTML结构
    return `
      <button id="text2social-btn-trigger" class="text2social-trigger">
        <img src="../../icons/camera-icon.png" alt="Text2Social" class="text2social-icon" />
      </button>
    `;
  }

  bindEvents() {
    // 绑定按钮事件
    if (this.element) {
      document.getElementById('text2social-btn-trigger')
        .addEventListener('click', this.handleClick.bind(this));
    }
  }

  handleClick() {
    // 处理按钮点击事件
    this.hide();
    // 触发预览窗口显示
    this.showPreviewWindow();
  }

  showPreviewWindow() {
    // 显示预览窗口
    // 具体实现在preview-window组件中
  }

  show(x, y) {
    // 显示按钮并定位
    if (this.element) {
      this.element.classList.remove('hidden');
      this.element.style.left = `${x}px`;
      this.element.style.top = `${y}px`;
      this.isVisible = true;
    }
  }

  hide() {
    // 隐藏按钮
    if (this.element) {
      this.element.classList.add('hidden');
      this.isVisible = false;
    }
  }

  destroy() {
    // 销毁按钮实例
    if (this.element) {
      this.element.remove();
    }
  }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FloatingButton;
}