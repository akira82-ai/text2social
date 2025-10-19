# 字体资源说明

## 问题描述
由于Google Fonts API的限制，直接下载的字体文件可能不是真正的字体格式。

## 解决方案

### 方案1：使用Google Fonts CDN（推荐）
在模板中直接引用Google Fonts CDN：

```html
<link href="https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&family=ZCOOL+XiaoWei&family=Ma+Shan+Zheng&display=swap" rel="stylesheet">
```

### 方案2：手动下载字体文件
访问以下链接手动下载字体文件：

1. **站酷快乐体**: https://fonts.google.com/specimen/ZCOOL+KuaiLe
2. **站酷文艺体**: https://fonts.google.com/specimen/ZCOOL+XiaoWei
3. **马善政楷体**: https://fonts.google.com/specimen/Ma+Shan+Zheng

下载步骤：
1. 访问上述链接
2. 点击"Download family"
3. 解压下载的zip文件
4. 将`.woff2`文件复制到此目录

### 方案3：使用系统字体降级
如果网络访问有问题，插件会自动降级到系统字体：
- Windows: Microsoft YaHei
- macOS: PingFang SC
- Linux: WenQuanYi Micro Hei

## 字体样式类

```css
.font-zcool-kuaile {
  font-family: 'ZCOOL KuaiLe', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.font-zcool-xiaowei {
  font-family: 'ZCOOL XiaoWei', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.font-ma-shan-zheng {
  font-family: 'Ma Shan Zheng', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
```

## 文件大小参考
- 站酷快乐体: ~1.6MB (完整字符集)
- 站酷文艺体: ~1.6MB (完整字符集)
- 马善政楷体: ~1.6MB (完整字符集)

建议使用字体子集化工具减小文件大小。