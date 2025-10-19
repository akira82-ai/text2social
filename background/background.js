/**
 * text2social - Background Script
 * 处理插件后台逻辑
 */

// 等待Chrome扩展API加载完成
(function() {
  'use strict';

  // 检查Chrome API是否可用
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    console.error('❌ Chrome extension API not available');
    return;
  }

  console.log('🚀 text2social background script loaded');

  // 插件安装监听器
  try {
    chrome.runtime.onInstalled.addListener(() => {
      console.log('✅ text2social 插件已安装');
    });
  } catch (error) {
    console.error('❌ Error installing onInstalled listener:', error);
  }

  // 处理来自content script的消息
  try {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('📨 Background message received:', request.action);

      switch (request.action) {
        case 'generateImage':
          // 处理图片生成请求
          handleImageGeneration(request.data, sender.tab)
            .then(result => {
              console.log('✅ Image generation completed');
              sendResponse({ success: true, data: result });
            })
            .catch(error => {
              console.error('❌ Image generation failed:', error);
              sendResponse({ success: false, error: error.message });
            });
          return true; // 保持消息通道开放

        case 'log':
          // 处理日志消息
          console.log('📝 Content script log:', request.data);
          break;

        default:
          console.warn('⚠️ Unknown action:', request.action);
          break;
      }
    });
  } catch (error) {
    console.error('❌ Error installing message listener:', error);
  }

  // 处理图片生成的异步函数
  async function handleImageGeneration(data, tab) {
    console.log('🎨 Processing image generation request:', data);

    try {
      // 这里可以实现更复杂的图片生成逻辑
      // 例如：调用外部API、处理复杂模板等
      const result = {
        generatedAt: new Date().toISOString(),
        tabId: tab ? tab.id : null,
        success: true
      };

      console.log('✅ Image generation result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in handleImageGeneration:', error);
      throw error;
    }
  }

  console.log('✅ text2social background script initialized');
})();