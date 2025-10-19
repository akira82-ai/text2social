/**
 * text2social 调试测试脚本
 * 在浏览器控制台中运行此脚本来测试换行符功能
 */

// 模拟选择文本的功能
function testTextSelection() {
  console.log('🧪 开始测试文本选择功能...');

  // 测试用例1: 包含换行符的HTML
  const testHtml1 = '<p>第一行</p><div>第二行</div><p>第三行</p>';
  console.log('测试1 - HTML:', testHtml1);

  // 创建临时元素来模拟选择
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = testHtml1;
  document.body.appendChild(tempDiv);

  // 模拟选择过程
  const range = document.createRange();
  range.selectNodeContents(tempDiv);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  console.log('✅ 测试1完成 - 请检查控制台输出');

  // 清理
  document.body.removeChild(tempDiv);
  selection.removeAllRanges();
}

// 测试文本清理函数
function testCleanSelectedText() {
  console.log('🧪 测试文本清理函数...');

  // 从content.js复制的函数
  function cleanSelectedText(text) {
    if (!text) return '';

    console.log('🧹 Original text:', text);

    // 1. 首先将HTML换行标签转换为换行符
    let cleaned = text.replace(/<br\s*\/?>/gi, '\n')
                     .replace(/<\/p>/gi, '\n')
                     .replace(/<\/div>/gi, '\n')
                     .replace(/<\/li>/gi, '\n')
                     .replace(/<\/h[1-6]>/gi, '\n') // 标题标签
                     .replace(/<\/tr>/gi, '\n') // 表格行
                     .replace(/<\/td>/gi, ' | ') // 表格单元格
                     .replace(/<\/th>/gi, ' | '); // 表格标题

    // 2. 处理HTML实体（在移除标签之前）
    cleaned = cleaned.replace(/&nbsp;/g, ' ')
                     .replace(/&amp;/g, '&')
                     .replace(/&lt;/g, '<')
                     .replace(/&gt;/g, '>')
                     .replace(/&quot;/g, '"')
                     .replace(/&#39;/g, "'")
                     .replace(/&apos;/g, "'")
                     .replace(/&\d+;/g, '') // 移除其他数字实体
                     .replace(/&[a-zA-Z]+;/g, ''); // 移除其他命名实体

    // 3. 移除所有剩余的HTML标签，但要小心处理换行
    cleaned = cleaned.replace(/<[^>]*>/g, '');

    // 4. 规范化换行符和空白字符
    cleaned = cleaned.replace(/\r\n/g, '\n') // Windows换行符
                     .replace(/\r/g, '\n')   // Mac换行符
                     .replace(/\n\s*\n\s*\n/g, '\n\n') // 最多保留两个连续换行
                     .replace(/[ \t]+/g, ' ') // 多个空格合并为一个
                     .replace(/^\s+|\s+$/gm, ''); // 移除每行首尾空格

    // 5. 分割成行并处理每行
    let lines = cleaned.split('\n');
    lines = lines.map(line => {
      // 移除行首行尾的标点符号
      return line.replace(/^[，。！？；：""''（）《》【】、\s]+|[，。！？；：""''（）《》【】、\s]+$/g, '').trim();
    }).filter(line => line.length > 0); // 移除空行

    // 6. 重新组合，保留换行结构
    cleaned = lines.join('\n');

    console.log('✨ Cleaned text:', cleaned);
    console.log('📏 Line count:', lines.length);
    return cleaned;
  }

  // 测试用例
  const testCases = [
    {
      name: 'HTML段落',
      html: '<p>第一段</p><div>第二段</div><p>第三段</p>'
    },
    {
      name: '混合标签',
      html: '<strong>粗体</strong><br>换行<em>斜体</em><p>段落</p>'
    },
    {
      name: '列表',
      html: '<ul><li>项目1</li><li>项目2</li></ul>'
    },
    {
      name: '复杂混合',
      html: '<div><p>这是<strong>第一段</strong></p><br><div>第二段&amp;实体</div></div>'
    }
  ];

  testCases.forEach((testCase, index) => {
    console.log(`\n--- 测试${index + 1}: ${testCase.name} ---`);
    console.log('输入HTML:', testCase.html);
    const result = cleanSelectedText(testCase.html);
    console.log('输出结果:', JSON.stringify(result));
    console.log('行数:', result.split('\n').length);
  });
}

// 检查当前页面是否有text2social扩展
function checkExtension() {
  if (typeof window.text2socialDebug !== 'undefined') {
    console.log('✅ text2social扩展已加载');
    console.log('扩展状态:', window.text2socialDebug.getStatus());

    // 测试预览功能
    console.log('测试预览功能...');
    window.text2socialDebug.testPreview();
  } else {
    console.log('❌ text2social扩展未检测到');
    console.log('请确保扩展已正确安装和启用');
  }
}

// 运行所有测试
function runAllTests() {
  console.log('🚀 开始运行所有测试...');

  testCleanSelectedText();
  checkExtension();

  console.log('\n🎯 要测试实际的选择功能，请在网页上选择一些包含HTML格式的文本，然后点击📸按钮');
  console.log('📝 检查浏览器控制台的输出，查看文本清理过程');
}

// 导出函数到全局
window.testTextSelection = testTextSelection;
window.testCleanSelectedText = testCleanSelectedText;
window.checkExtension = checkExtension;
window.runAllTests = runAllTests;

console.log('📋 text2social 调试脚本已加载');
console.log('💡 运行 runAllTests() 来执行所有测试');
console.log('💡 或者单独运行 testCleanSelectedText() 来测试文本清理功能');