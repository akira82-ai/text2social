/**
 * text2social - Background Script
 * 处理插件后台逻辑
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('text2social 插件已安装');
});

// 处理来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'generateImage':
      // 处理图片生成请求
      handleImageGeneration(request.data, sender.tab)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // 保持消息通道开放

    default:
      break;
  }
});

// 处理图片生成的异步函数
async function handleImageGeneration(data, tab) {
  // 这里可以实现更复杂的图片生成逻辑
  // 例如：调用外部API、处理复杂模板等
  return {
    generatedAt: new Date().toISOString(),
    tabId: tab.id
  };
}