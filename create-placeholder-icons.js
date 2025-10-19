/**
 * 创建占位图标的Node.js脚本
 * 运行方法：node create-placeholder-icons.js
 */

const fs = require('fs');
const path = require('path');

// 创建简单的SVG图标
function createSVGIcon(size, color, text) {
  return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${color}" rx="${size/8}"/>
  <text x="${size/2}" y="${size/2}"
        font-family="Arial, sans-serif"
        font-size="${size/3}"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        dominant-baseline="central">${text}</text>
</svg>`;
}

// 创建HTML文件来生成PNG图标
function createIconGeneratorHTML() {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Icon Generator</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .icon-container { margin: 20px 0; }
        canvas { border: 1px solid #ccc; margin: 10px; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>text2social Icon Generator</h1>

    <div class="icon-container">
        <h3>16x16 Icon</h3>
        <canvas id="canvas16" width="16" height="16"></canvas>
        <button onclick="downloadIcon(16)">Download 16x16</button>
    </div>

    <div class="icon-container">
        <h3>32x32 Icon</h3>
        <canvas id="canvas32" width="32" height="32"></canvas>
        <button onclick="downloadIcon(32)">Download 32x32</button>
    </div>

    <div class="icon-container">
        <h3>48x48 Icon</h3>
        <canvas id="canvas48" width="48" height="48"></canvas>
        <button onclick="downloadIcon(48)">Download 48x48</button>
    </div>

    <div class="icon-container">
        <h3>128x128 Icon</h3>
        <canvas id="canvas128" width="128" height="128"></canvas>
        <button onclick="downloadIcon(128)">Download 128x128</button>
    </div>

    <script>
        function drawIcon(size, canvasId) {
            const canvas = document.getElementById(canvasId);
            const ctx = canvas.getContext('2d');

            // 清空画布
            ctx.clearRect(0, 0, size, size);

            // 绘制渐变背景
            const gradient = ctx.createLinearGradient(0, 0, size, size);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);

            // 绘制圆角矩形边框
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = Math.max(1, size / 32);
            ctx.strokeRect(size/8, size/8, size*3/4, size*3/4);

            // 绘制相机图标
            ctx.fillStyle = 'white';
            ctx.font = \`\${size/2}px Arial\`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('📸', size/2, size/2);
        }

        function downloadIcon(size) {
            const canvas = document.getElementById('canvas' + size);
            const link = document.createElement('a');
            link.download = 'icon' + size + '.png';
            link.href = canvas.toDataURL();
            link.click();
        }

        // 生成所有图标
        [16, 32, 48, 128].forEach(size => {
            drawIcon(size, 'canvas' + size);
        });
    </script>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, 'icon-generator-simple.html'), html);
  console.log('✅ 创建了简化版图标生成器：icon-generator-simple.html');
}

// 生成图标文件
function generateIcons() {
  const sizes = [16, 32, 48, 128];
  const iconsDir = path.join(__dirname, 'icons');

  // 创建icons目录
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
  }

  sizes.forEach(size => {
    const svg = createSVGIcon(size, '#667eea', 'T2S');
    const filename = path.join(iconsDir, `icon${size}.svg`);
    fs.writeFileSync(filename, svg);
    console.log(`✅ 创建了 SVG 图标：icon${size}.svg`);
  });

  console.log('\\n📝 图标使用说明：');
  console.log('1. SVG 文件已创建在 assets/icons/ 目录中');
  console.log('2. 可以直接在浏览器中打开 icon-generator.html 生成 PNG 文件');
  console.log('3. 或者使用在线工具将 SVG 转换为 PNG');
  console.log('4. 最终需要的文件：icon16.png, icon32.png, icon48.png, icon128.png');
}

// 主函数
function main() {
  console.log('🎨 开始创建 text2social 插件图标...');

  try {
    createIconGeneratorHTML();
    generateIcons();
    console.log('\\n✅ 图标创建完成！');
    console.log('\\n🚀 下一步：');
    console.log('1. 在浏览器中打开 assets/icon-generator.html');
    console.log('2. 选择喜欢的样式和配色');
    console.log('3. 下载所有尺寸的 PNG 图标');
    console.log('4. 将 PNG 文件保存到 assets/icons/ 目录');
  } catch (error) {
    console.error('❌ 创建图标时出错：', error.message);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { createSVGIcon, generateIcons };