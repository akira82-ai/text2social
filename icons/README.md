# text2social 插件图标

## 文件说明

### SVG 文件（已创建）
- `icon16.svg` - 16x16 图标
- `icon32.svg` - 32x32 图标
- `icon48.svg` - 48x48 图标
- `icon128.svg` - 128x128 图标

### 图标生成工具
- `../icon-generator.html` - 完整版图标生成器
- `../icon-generator-simple.html` - 简化版图标生成器
- `../create-placeholder-icons.js` - Node.js 脚本

## 使用方法

### 方法1：使用在线图标生成器（推荐）
1. 在浏览器中打开 `assets/icon-generator.html`
2. 选择喜欢的图标样式和配色方案
3. 点击"生成图标"预览效果
4. 点击下载按钮保存所有尺寸的 PNG 文件
5. 将下载的文件重命名为：
   - `icon16.png`
   - `icon32.png`
   - `icon48.png`
   - `icon128.png`

### 方法2：转换现有SVG文件
1. 使用在线工具（如 CloudConvert）将 SVG 转换为 PNG
2. 或者使用 Adobe Illustrator、Inkscape 等工具
3. 确保文件名正确：`icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`

### 方法3：使用系统工具
```bash
# macOS 使用 sips 命令
sips -s format png icon16.svg --out icon16.png
sips -s format png icon32.svg --out icon32.png
sips -s format png icon48.svg --out icon48.png
sips -s format png icon128.svg --out icon128.png
```

## 图标设计规范

### Chrome 插件图标要求
- **16x16**: 浏览器工具栏小图标
- **32x32**: Windows 等系统的扩展页面
- **48x48**: 扩展管理页面
- **128x128**: Chrome Web Store 和安装过程

### 设计建议
- 使用简洁明了的设计
- 确保在小尺寸下仍然清晰可辨
- 使用品牌色彩（#667eea 渐变到 #764ba2）
- 避免过多细节，确保可读性

### 当前设计
- **主色调**: 渐变蓝紫色 (#667eea → #764ba2)
- **图形**: 相机图标 📸（象征拍照转换）
- **文字**: "T2S"（text2social 缩写）
- **风格**: 现代简约，圆角设计

## 验证图标

完成图标创建后，检查以下内容：
```
assets/icons/
├── icon16.png   ✅
├── icon32.png   ✅
├── icon48.png   ✅
└── icon128.png  ✅
```

## 注意事项

1. **文件格式**: 必须是 PNG 格式
2. **文件名**: 必须严格遵循命名规范
3. **透明背景**: 建议使用透明背景
4. **尺寸准确**: 确保文件尺寸正确
5. **颜色配置**: 确保在深色和浅色背景下都清晰可见

完成图标设置后，插件就可以正常加载和显示图标了！