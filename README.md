# Text2Social - 文字转社交图片浏览器插件

## 📋 项目简介

Text2Social 是一个浏览器插件，允许用户选中网页文字，快速生成精美的社交分享图片，支持多种模板和实时预览。

## 🏗️ 项目架构

```
text2social/
├── manifest.json                           # Chrome插件配置文件
├── content.js                            # 主入口脚本
├── background.js                         # 后台脚本
│
├── components/                           # 组件化模块
│   ├── preview-window/                   # 预览窗口组件
│   │   ├── preview.js                    # 预览窗口主逻辑
│   │   ├── preview.html                  # 预览窗口HTML结构
│   │   ├── preview.css                   # 预览窗口样式
│   │   │
│   │   └── template-selector/            # 模板选择器子组件
│   │       ├── selector.js               # 选择器逻辑
│   │       ├── selector.html             # 选择器HTML结构
│   │       └── selector.css              # 选择器样式
│   │
│   └── utils/                            # 工具函数库
│       ├── constants.js                  # 常量定义
│       ├── dom-loader.js                 # HTML/CSS资源加载器
│       ├── template-renderer.js          # 模板渲染工具
│       └── image-exporter.js             # 图片导出工具
│
├── styles/                               # 全局样式文件
│   ├── variables.css                     # CSS变量定义
│   ├── reset.css                         # 样式重置
│   └── common.css                        # 通用样式类
│
├── lib/                                  # 第三方库文件
│   ├── mustache.min.js                   # 模板引擎（现有）
│   ├── html2canvas.min.js                # HTML转图片（现有）
│   └── dompurify.min.js                  # HTML安全清理（现有）
│
├── icons/                                # 插件图标文件（现有）
└── templates/                            # 预览模板文件（现有）
    ├── 模板 1.html                        # 模板1 - 简约风格
    └── 模板 2.html                        # 模板2 - 社交媒体卡片
```

## ✨ 核心特性

- ✅ **完全分离**: HTML、CSS、JS独立文件，易于维护
- ✅ **组件化**: 模块化设计，职责清晰
- ✅ **无动画设计**: 直接显示/隐藏，快速响应
- ✅ **Shadow DOM**: 样式隔离，避免污染
- ✅ **按需加载**: 动态加载组件资源
- ✅ **模板系统**: 支持多种预览模板
- ✅ **实时预览**: 即时查看效果
- ✅ **图片导出**: 支持复制到剪贴板和下载

## 🚀 技术栈

- **前端**: 原生JavaScript ES6+, CSS3, HTML5
- **模板引擎**: Mustache.js
- **图片生成**: html2canvas
- **安全清理**: DOMPurify
- **模块化**: ES6 Modules
- **样式架构**: CSS Variables + BEM命名

## 📦 组件说明

### 1. 预览窗口组件 (`preview-window/`)
- 使用Shadow DOM完全隔离样式
- 支持ESC键和点击遮罩关闭
- 包含编辑、预览、操作三个区域

### 3. 工具函数库 (`utils/`)
- **DOMLoader**: 统一的资源加载器
- **TemplateRenderer**: 模板渲染引擎
- **ImageExporter**: 图片导出工具
- **Constants**: 配置常量管理

## 🎨 样式系统

### CSS变量系统
```css
:root {
  --t2s-primary-color: #4a90e2;
  --t2s-font-family: -apple-system, BlinkMacSystemFont, ...;
  --t2s-border-radius: 4px;
  /* 更多变量... */
}
```

### BEM命名规范
- `.text2social-button` - 块
- `.text2social-button__icon` - 元素
- `.text2social-button--small` - 修饰符

## 🔧 开发指南

### 添加新模板
1. 在 `templates/` 目录添加HTML文件
2. 在 `constants.js` 中定义模板配置
3. 支持Mustache语法：`{{title}}`, `{{text}}`

### 添加新组件
1. 创建组件目录：`components/new-component/`
2. 创建三个文件：`component.js`, `component.html`, `component.css`
3. 使用DOMLoader加载资源
4. 遵循现有的事件命名规范

### 样式开发
- 使用CSS变量而非硬编码值
- 遵循BEM命名规范
- 考虑深色模式和高对比度模式

## 🚀 安装和调试

### 开发模式安装
1. 打开Chrome扩展管理页面
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目根目录

### 调试技巧
- 使用 `console.log` 查看日志
- 利用Chrome开发者工具调试content script
- 检查Shadow DOM使用 `chrome://inspect`

## 📱 兼容性

- Chrome 88+
- 支持桌面和移动端
- 兼容现代浏览器的ES6+特性

## 🛡️ 安全性

- 使用DOMPurify清理用户输入
- Shadow DOM隔离样式
- CSP友好的资源加载方式
- 最小权限原则

## 📄 许可证

本项目采用 MIT 许可证。

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支
3. 提交更改
4. 发起 Pull Request

---

**注意**: 这是项目框架，业务逻辑需要根据实际需求进一步完善。