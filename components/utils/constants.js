// components/utils/constants.js
const Text2SocialConstants = {
  // 应用程序常量定义
  
  // 模板相关
  TEMPLATE_DIR: 'templates/',
  TEMPLATE_EXTENSIONS: ['.html', '.mustache', '.hbs'],
  TEMPLATE_RELATIVE_PATH: '../../../templates/', // 从preview-window组件相对路径
  
  // 样式相关
  DEFAULT_FONT_FAMILY: 'Arial, sans-serif',
  DEFAULT_FONT_SIZE: '16px',
  DEFAULT_LINE_HEIGHT: '1.5',
  
  // 图片导出相关
  DEFAULT_IMAGE_QUALITY: 0.92,
  DEFAULT_IMAGE_FORMAT: 'png', // 支持 'png', 'jpeg', 'webp'
  DEFAULT_PIXEL_RATIO: 2, // 高分辨率导出
  
  // DOM元素ID前缀
  ELEMENT_ID_PREFIX: 'text2social-',
  
  // 事件名称
  EVENTS: {
    TEXT_SELECTED: 'text2social:textSelected',
    TEMPLATE_SELECTED: 'text2social:templateSelected',
    EXPORT_STARTED: 'text2social:exportStarted',
    EXPORT_COMPLETED: 'text2social:exportCompleted',
    EXPORT_FAILED: 'text2social:exportFailed'
  },
  
  // 存储键名
  STORAGE_KEYS: {
    LAST_USED_TEMPLATE: 'text2social_last_template',
    USER_PREFERENCES: 'text2social_user_preferences',
    CUSTOM_TEMPLATES: 'text2social_custom_templates'
  },
  
  // CSS类名
  CSS_CLASSES: {
    ACTIVE: 'text2social-active',
    HIDDEN: 'text2social-hidden',
    LOADING: 'text2social-loading',
    ERROR: 'text2social-error',
    SUCCESS: 'text2social-success'
  },
  
  // 模板默认数据
  TEMPLATE_DEFAULT_DATA: {
    title: '示例标题',
    content: '这是示例内容',
    author: '作者',
    date: new Date().toISOString().split('T')[0],
    tags: ['标签1', '标签2']
  },
  
  // API端点（如果需要）
  API_ENDPOINTS: {
    SAVE_TEMPLATE: '/api/templates/save',
    GET_TEMPLATES: '/api/templates/list',
    UPLOAD_IMAGE: '/api/images/upload'
  },
  
  // 最大文本长度限制
  MAX_TEXT_LENGTH: 5000,
  
  // 最小文本长度限制
  MIN_TEXT_LENGTH: 1
};

// 导出常量
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Text2SocialConstants;
}