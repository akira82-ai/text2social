/**
 * text2social - Popup Script
 * 处理弹窗界面的交互逻辑
 */

document.addEventListener('DOMContentLoaded', () => {
  initializePopup();
});

function initializePopup() {
  // 加载统计数据
  loadStatistics();

  // 绑定事件
  bindEvents();
}

// 加载统计信息
async function loadStatistics() {
  try {
    const result = await chrome.storage.local.get(['generatedCount']);
    const count = result.generatedCount || 0;
    document.getElementById('generated-count').textContent = count;
  } catch (error) {
    console.error('加载统计信息失败:', error);
  }
}

// 绑定事件
function bindEvents() {
  // 重置设置按钮
  document.getElementById('reset-settings').addEventListener('click', () => {
    if (confirm('确定要重置所有设置吗？')) {
      resetSettings();
    }
  });

  // 意见反馈按钮
  document.getElementById('feedback').addEventListener('click', () => {
    openFeedback();
  });
}

// 重置设置
async function resetSettings() {
  try {
    await chrome.storage.local.clear();
    document.getElementById('generated-count').textContent = '0';
    showMessage('设置已重置');
  } catch (error) {
    console.error('重置设置失败:', error);
    showMessage('重置失败', 'error');
  }
}

// 打开意见反馈
function openFeedback() {
  const email = 'feedback@text2social.com';
  const subject = 'text2social 插件意见反馈';
  const body = `请在这里描述您的意见或建议：

插件版本：${chrome.runtime.getManifest().version}
浏览器：${navigator.userAgent}
问题描述：`;

  const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl);
}

// 显示消息提示
function showMessage(message, type = 'success') {
  // 创建消息元素
  const messageEl = document.createElement('div');
  messageEl.textContent = message;
  messageEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px 15px;
    background: ${type === 'success' ? '#4CAF50' : '#f44336'};
    color: white;
    border-radius: 4px;
    font-size: 14px;
    z-index: 1000;
  `;

  document.body.appendChild(messageEl);

  // 3秒后自动消失
  setTimeout(() => {
    if (messageEl.parentNode) {
      messageEl.parentNode.removeChild(messageEl);
    }
  }, 3000);
}

// 更新生成计数
async function updateGeneratedCount() {
  try {
    const result = await chrome.storage.local.get(['generatedCount']);
    const count = (result.generatedCount || 0) + 1;
    await chrome.storage.local.set({ generatedCount: count });
    document.getElementById('generated-count').textContent = count;
  } catch (error) {
    console.error('更新计数失败:', error);
  }
}