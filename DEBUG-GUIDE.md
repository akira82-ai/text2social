# text2social 调试指南

## 🔧 问题：选中文字后没有出现📸按钮

现在我已经创建了一个调试版本的内容脚本，它会输出详细的调试信息。

## 🧪 调试步骤

### 1. 重新加载插件
1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 找到text2social插件
4. 点击刷新按钮重新加载插件

### 2. 打开开发者工具
1. 在任意网页上右键点击
2. 选择"检查"或"审查元素"
3. 打开开发者工具

### 3. 查看控制台日志
在控制台（Console）标签页中，您应该能看到以下日志：

```
🚀 text2social content script loaded
🔧 Starting text2social initialization...
📄 DOM content loaded
🔧 Initializing text2social...
🔧 Creating floating button...
✅ Floating button created
🔧 Creating preview window...
✅ Preview window created
🔧 Binding events...
✅ All events bound
✅ text2social initialized successfully
```

### 4. 测试文字选择功能
1. 在网页上选中任意文字
2. 查看控制台是否有新的日志输出

应该看到类似这样的日志：
```
🖱️ Mouse up event detected
📝 Selected text: [您选中的文字]
📏 Text length: [文字长度]
✅ Text selected, showing button at: [坐标位置]
📍 Showing button at position: [x, y]
🔍 Button visibility check: {
  display: flex,
  position: { x: [x坐标], y: [y坐标] },
  size: { width: 40, height: 40 },
  visible: true
}
```

## 🔍 可能的问题和解决方案

### 问题1: 没有看到任何日志
**原因**: Content script没有正确加载
**解决方案**:
1. 检查 manifest.json中的content_scripts配置
2. 确认文件路径正确
3. 重新加载插件

### 问题2: 看到日志但没有按钮显示
**原因**: CSS样式冲突或按钮位置问题
**解决方案**:
1. 检查z-index是否足够高
2. 查看按钮的位置坐标
3. 检查是否有其他CSS覆盖

### 问题3: 鼠标事件没有触发
**原因**: 事件监听器没有正确绑定
**解决方案**:
1. 检查事件监听器是否正确添加
2. 尝试手动触发事件

### 问题4: 选中文字后没有触发
**原因**: 文字选择逻辑有问题
**解决方案**:
1. 检查选中的文字是否为空
2. 检查trim()函数是否正常工作

## 🛠️ 手动测试

### 手动检查按钮是否创建
在控制台中运行以下代码：
```javascript
// 检查按钮是否存在
const button = document.getElementById('text2social-button');
console.log('Button element:', button);

// 如果存在，检查样式
if (button) {
  console.log('Button styles:', button.style.cssText);
  console.log('Button visibility:', getComputedStyle(button).display);
}
```

### 手动测试文字选择
在控制台中运行以下代码：
```javascript
// 模拟文字选择
const selection = window.getSelection();
const text = "这是一个测试文字";
const range = document.createRange();
range.selectNodeContents(document.body);
selection.removeAllRanges();
selection.addRange(range);

// 检查选中的文字
console.log('Selected text:', selection.toString());
```

## 📋 调试检查清单

### ✅ 基础检查
- [ ] 插件已成功加载
- [ ] Content script已注入
- [ ] 没有JavaScript错误
- [ ] 控制台可以看到调试日志

### ✅ 功能检查
- [ ] 鼠标事件正常触发
- [ ] 文字选择检测正常
- [ ] 按钮创建成功
- [ ] 按钮显示在正确位置
- [ ] 按钮样式正确

### ✅ 交互检查
- [ ] 点击按钮有反应
- [ ] 预览窗口正常打开
- [ ] 图片生成功能正常

## 🐛 常见CSS问题

### z-index问题
如果按钮被其他元素遮挡，可以尝试：
```javascript
// 在控制台中临时增加z-index
const button = document.getElementById('text2social-button');
if (button) {
  button.style.zIndex = '999999';
}
```

### 位置问题
如果按钮位置不正确，可以尝试：
```javascript
// 在控制台中调整位置
const button = document.getElementById('text2social-button');
if (button) {
  button.style.position = 'fixed';
  button.style.top = '100px';
  button.style.left = '100px';
}
```

## 📞 获取帮助

如果以上调试步骤都无法解决问题，请：

1. **记录详细的错误信息**：
   - 控制台中的所有日志
   - 具体的错误信息
   - 使用的浏览器版本

2. **提供测试环境信息**：
   - 测试的网站URL
   - 选择的文字内容
   - 操作步骤

3. **截图**：
   - 控制台日志截图
   - 网页状态截图
   - 选中文字的截图

这样我就能更准确地帮您定位和解决问题！