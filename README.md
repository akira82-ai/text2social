# Text2Social - 🎨 文字转社交图片浏览器插件

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green?logo=google-chrome)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/version-1.17.0-blue.svg)](https://github.com/akira82-ai/text2social)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 📋 简介

Text2Social 是一个优雅的浏览器插件，让您能够轻松选中网页上的文字，一键转换为精美的社交媒体分享图片。支持多种设计模板，实时预览，并提供流畅的微交互动画体验。

## 🆕 最近更新

### v1.27.0 (2025-11-12)
- 🎨 **模板系统升级**: 实现模板配置化，支持从文件动态读取模板列表
- 📱 **二维码功能**: 新增页面URL二维码生成功能，方便分享来源
- ✂️ **URL截断**: 实现智能URL截断功能，优化长链接显示效果
- 🏷️ **占位符支持**: 新增{{url}}占位符，可在模板中插入当前页面链接
- 🔄 **模板优化**: 更新多个设计模板，提升视觉效果和用户体验

### v1.17.0 (2025-11-06)
- ✨ 实现优雅的微交互动画系统
- 🎯 添加按钮加载、成功、失败状态动画
- 🚫 移除所有alert弹窗，改用内嵌状态反馈
- ⚡ 优化动画性能和用户体验

## ✨ 核心特性

- 🎯 **一键转换**: 选中文字，点击插件图标，即可生成精美图片
- 🎨 **丰富模板**: 内置8种专业设计模板，涵盖各种使用场景
- ⚡ **实时预览**: 即时查看效果，所见即所得
- 📋 **剪贴板支持**: 一键复制到剪贴板，方便分享
- 🌈 **微交互动画**: 优雅的加载、成功、失败状态反馈
- 📱 **响应式设计**: 完美适配各种屏幕尺寸
- 🚀 **高性能**: 基于原生JavaScript，轻量快速

## 🎨 模板展示

| 模板名称 | 适用场景 | 风格特点 |
|---------|---------|---------|
| 极简主义 | 日常分享 | 简洁大方，突出内容 |
| 社交媒体 | 社交平台 | 现代设计，吸引眼球 |
| 深色模式 | 技术内容 | 护眼舒适，专业感强 |
| 复古终端 | 程序员风 | 怀旧风格，个性十足 |
| 渐变高亮 | 重点强调 | 色彩鲜明，视觉冲击 |
| 文章摘录 | 长文分享 | 书卷气息，优雅排版 |
| 艺术留白 | 设计展示 | 留白艺术，意境深远 |
| 标签分类 | 知识整理 | 清晰分类，一目了然 |

## 🚀 安装方法

### 从Edge Extension Store安装
（待审核）

### 开发版安装
1. 克隆本仓库：
   ```bash
   git clone https://github.com/akira82-ai/text2social.git
   ```
2. 打开Chrome浏览器，进入扩展管理页面：`chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目根目录

## 📖 使用方法

1. **选择文字**: 在任意网页上选中您想要分享的文字
2. **打开插件**: 点击浏览器工具栏中的Text2Social图标
3. **选择模板**: 从9种模板中选择您喜欢的设计
4. **预览调整**: 实时查看效果，满意后点击"复制为图片"
5. **分享使用**: 图片已复制到剪贴板，可直接粘贴使用

## 🏗️ 技术架构

```
text2social/
├── manifest.json              # Chrome插件配置
├── content.js                 # 内容脚本
├── background.js              # 后台服务
├── components/                # 组件化模块
│   ├── preview-window/        # 预览窗口
│   │   ├── preview.js         # 主逻辑
│   │   ├── preview.html       # HTML结构
│   │   ├── preview.css        # 样式文件
│   │   └── template-selector/ # 模板选择器
│   └── utils/                 # 工具函数
├── templates/                 # 设计模板
├── styles/                    # 全局样式
├── lib/                       # 第三方库
└── icons/                     # 图标资源
```

## 🛠️ 技术栈

- **前端框架**: 原生JavaScript ES6+
- **样式方案**: CSS3 + CSS Variables
- **模板引擎**: Mustache.js
- **图片生成**: html2canvas
- **安全处理**: DOMPurify
- **构建工具**: 无需构建，直接运行

## 🌟 更新日志

### v1.17.0 (2025-11-06)
- ✨ 实现优雅的微交互动画系统
- 🎯 添加按钮加载、成功、失败状态动画
- 🚫 移除所有alert弹窗，改用内嵌状态反馈
- ⚡ 优化动画性能和用户体验

### v1.16.0 (2025-11-06)
- 🐛 修复生成中状态的边框显示问题

### v1.15.0 (2025-11-06)
- 🔧 修复模板文件名不匹配问题
- ✅ 确保所有9个模板正确加载


## 📝 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

- [html2canvas](https://html2canvas.hertzen.com/) - 强大的HTML转图片库
- [Mustache.js](https://mustache.github.io/) - 轻量级模板引擎
- [DOMPurify](https://github.com/cure53/DOMPurify) - HTML安全清理工具

## 📞 联系我

- 📧 Email: [akira82@qq.com](mailto:akira82@qq.com)
- 💬 微信: data_growth
- 🐦 Twitter: [@AgiRay1015](https://x.com/AgiRay1015)

---

<div align="center">
  <p>如果这个项目对您有帮助，请给我们一个 ⭐️</p>
  <p>Made with ❤️ by Text2Social Team</p>
</div>