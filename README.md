# text2social

<div align="center">

![text2social Logo](assets/icons/icon128.png)

**将网页文字转换为精美社交图片的 Chrome 插件**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/your-username/text2social)

</div>

## ✨ 特性

- 🎯 **一键转换**：选中网页文字，一键生成精美图片
- 🎨 **多种模板**：预设多种风格的分享模板
- 📱 **社交优化**：完美适配各大社交媒体平台
- 🖼️ **智能提取**：自动获取网页标题、图标、二维码
- 💾 **本地处理**：所有操作本地完成，保护隐私
- 🚀 **即用即走**：无需注册登录，安装即用

## 🚀 快速开始

### 安装插件

1. **下载项目**
   ```bash
   git clone https://github.com/your-username/text2social.git
   cd text2social
   ```

2. **配置资源**
   - 按照 [开发计划.md](./开发计划.md) 下载第三方库和字体文件
   - 创建插件图标文件

3. **加载插件**
   - 打开 Chrome 浏览器
   - 访问 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 text2social 项目目录

### 使用方法

1. **选中文字**：在任意网页上选中您想要分享的文字
2. **点击按钮**：点击出现的 📸 浮动按钮
3. **预览图片**：在右上角预览生成的图片
4. **保存分享**：下载图片或复制到剪贴板

## 📸 使用演示

```
选中文字 → 点击📸按钮 → 预览效果 → 下载分享
```

## 🛠️ 技术栈

- **平台**: Chrome Extension (Manifest V3)
- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **图片生成**: Canvas API + html2canvas.js
- **二维码**: qrcode.js
- **字体**: Google Fonts + 本地字体

## 📁 项目结构

```
text2social/
├── manifest.json          # 插件配置
├── 产品规格.md             # 产品详细规格
├── 开发计划.md             # 开发计划和配置
├── content/               # 内容脚本
├── assets/                # 资源文件
├── templates/             # 模板文件
├── popup/                 # 弹窗界面
└── background/            # 后台脚本
```

## 🎨 支持的字体

- **站酷快乐体** - 活泼可爱风格
- **站酷文艺体** - 优雅文艺风格
- **马善政楷体** - 传统书法风格
- **系统字体** - 兜底方案

## 🔧 配置要求

- **浏览器**: Chrome 88+ / Edge 90+
- **操作系统**: Windows 10+ / macOS 10.15+ / Linux
- **内存**: 建议 4GB 以上
- **网络**: 不需要（本地处理）

## 📋 开发计划

- [x] **第一阶段**: 基础架构搭建
- [x] **第二阶段**: 资源配置和环境
- [ ] **第三阶段**: 功能完善
- [ ] **第四阶段**: 用户体验优化
- [ ] **第五阶段**: 测试和发布

详细开发计划请查看 [开发计划.md](./开发计划.md)

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📝 更新日志

### v1.0.0 (开发中)
- ✅ 基础插件架构
- ✅ 文字选择监听
- ✅ 图片生成功能
- ✅ 模板系统
- ⏳ 用户界面优化
- ⏳ 性能优化

## 🐛 常见问题

**Q: 插件无法加载怎么办？**
A: 检查 manifest.json 语法，确保所有文件路径正确。

**Q: 字体显示异常？**
A: 确保字体文件已正确下载到 fonts/ 目录。

**Q: 图片生成失败？**
A: 检查控制台错误信息，确保第三方库正确加载。

更多问题请查看 [开发计划.md](./开发计划.md#常见问题)

## 📄 许可证

本项目基于 [MIT 许可证](./LICENSE) 开源。

## 🙏 致谢

- [Google Fonts](https://fonts.google.com/) - 提供免费字体
- [qrcode.js](https://github.com/davidshimjs/qrcodejs) - 二维码生成
- [html2canvas](https://html2canvas.hertzen.com/) - HTML转图片
- [站酷字体系列](https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe) - 美观的中文字体

---

<div align="center">

**如果这个项目对您有帮助，请给个 ⭐️ 支持一下！**

Made with ❤️ by [Your Name](https://github.com/your-username)

</div>