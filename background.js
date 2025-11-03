// Text2Social 扩展后台脚本
// 处理扩展的后台任务

class Text2SocialBackground {
  constructor() {
    this.init();
  }

  init() {
    // 初始化后台服务
    this.registerEventListeners();
  }

  registerEventListeners() {
    // 注册扩展事件监听器
    chrome.runtime.onInstalled.addListener(this.onExtensionInstalled.bind(this));
    chrome.action.onClicked.addListener(this.onActionButtonClick.bind(this));
  }

  onExtensionInstalled(details) {
    // 扩展安装/更新时的处理
    console.log('Text2Social extension installed/updated');
  }

  onActionButtonClick(tab) {
    // 点击扩展图标时的处理
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: this.injectContentScript
    });
  }

  injectContentScript() {
    // 在当前页面注入内容脚本的逻辑
  }

  sendMessageToTab(tabId, message) {
    // 向指定标签页发送消息
    chrome.tabs.sendMessage(tabId, message);
  }

  handleMessage(request, sender, sendResponse) {
    // 处理来自其他脚本的消息
    return true;
  }
}

// 初始化后台服务
const backgroundService = new Text2SocialBackground();