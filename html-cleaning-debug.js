/**
 * text2social HTML清理功能调试脚本
 * 在浏览器控制台中运行此脚本来测试HTML清理功能
 */

// 从content.js复制的HTML清理函数
function cleanHtmlContent(html) {
  if (!html) return '';

  console.log('🧹 Original HTML:', html);

  let cleaned = html;

  // 1. 移除样式相关标签，但保留内容
  const styleTags = [
    /<strong[^>]*>(.*?)<\/strong>/gi,
    /<b[^>]*>(.*?)<\/b>/gi,
    /<em[^>]*>(.*?)<\/em>/gi,
    /<i[^>]*>(.*?)<\/i>/gi,
    /<u[^>]*>(.*?)<\/u>/gi,
    /<s[^>]*>(.*?)<\/s>/gi,
    /<del[^>]*>(.*?)<\/del>/gi,
    /<ins[^>]*>(.*?)<\/ins>/gi,
    /<small[^>]*>(.*?)<\/small>/gi,
    /<big[^>]*>(.*?)<\/big>/gi,
    /<sub[^>]*>(.*?)<\/sub>/gi,
    /<sup[^>]*>(.*?)<\/sup>/gi,
    /<code[^>]*>(.*?)<\/code>/gi,
    /<kbd[^>]*>(.*?)<\/kbd>/gi,
    /<samp[^>]*>(.*?)<\/samp>/gi,
    /<var[^>]*>(.*?)<\/var>/gi,
    /<mark[^>]*>(.*?)<\/mark>/gi,
    /<abbr[^>]*>(.*?)<\/abbr>/gi,
    /<cite[^>]*>(.*?)<\/cite>/gi,
    /<dfn[^>]*>(.*?)<\/dfn>/gi,
    /<q[^>]*>(.*?)<\/q>/gi,
    /<time[^>]*>(.*?)<\/time>/gi,
    /<span[^>]*>(.*?)<\/span>/gi,
    /<font[^>]*>(.*?)<\/font>/gi
  ];

  styleTags.forEach(regex => {
    cleaned = cleaned.replace(regex, '$1');
  });

  // 保留br但移除属性
  cleaned = cleaned.replace(/<br[^>]*>/gi, '<br>');
  // 保留hr但移除属性
  cleaned = cleaned.replace(/<hr[^>]*>/gi, '<hr>');

  // 移除所有标签的属性
  cleaned = cleaned.replace(/<([a-zA-Z0-9]+)([^>]*)>/gi, function(match, tagName, attributes) {
    return '<' + tagName.toLowerCase() + '>';
  });

  // 处理HTML实体
  cleaned = cleaned.replace(/&nbsp;/g, ' ')
                   .replace(/&amp;/g, '&')
                   .replace(/&lt;/g, '<')
                   .replace(/&gt;/g, '>')
                   .replace(/&quot;/g, '"')
                   .replace(/&#39;/g, "'")
                   .replace(/&apos;/g, "'")
                   .replace(/&\d+;/g, '') // 移除其他数字实体
                   .replace(/&[a-zA-Z]+;/g, ''); // 移除其他命名实体

  // 清理多余的空白字符
  cleaned = cleaned.replace(/\s+/g, ' ') // 多个空白字符合并为一个
                   .replace(/>\s+</g, '><') // 移除标签间的空白
                   .replace(/^\s+|\s+$/g, ''); // 移除首尾空白

  // 确保标签是正确的格式
  cleaned = cleaned.replace(/<([a-zA-Z0-9]+)>/g, '<$1>'); // 标签名小写

  console.log('✨ Cleaned HTML:', cleaned);
  return cleaned;
}

// 测试HTML清理功能
function testHtmlCleaning() {
  console.log('🧪 开始测试HTML清理功能...');

  const testCases = [
    {
      name: '基本样式标签移除',
      input: '<div><strong>粗体</strong><em>斜体</em><u>下划线</u></div>',
      expected: '<div>粗体斜体下划线</div>'
    },
    {
      name: '属性移除',
      input: '<p style="color:red; font-size:16px;" class="title" id="main">内容</p>',
      expected: '<p>内容</p>'
    },
    {
      name: '复杂HTML结构',
      input: '<div style="background:#f0f0f0;"><h1><strong>标题</strong></h1><p><em>段落</em>内容</p><ul><li><b>项目1</b></li><li><i>项目2</i></li></ul></div>',
      expected: '<div><h1>标题</h1><p>段落内容</p><ul><li>项目1</li><li>项目2</li></ul></div>'
    },
    {
      name: 'HTML实体处理',
      input: '<div>&lt;script&gt;&amp;nbsp;&quot;引号&quot;&#39;单引号&#39;</div>',
      expected: '<div><script> "引号"\'单引号\'</div>'
    },
    {
      name: '表格结构',
      input: '<table style="width:100%; border:1px solid black;"><tr style="background:#f0f0f0;"><th><strong>标题1</strong></th><th><em>标题2</em></th></tr><tr><td>内容1</td><td>内容2</td></tr></table>',
      expected: '<table><tr><th>标题1</th><th>标题2</th></tr><tr><td>内容1</td><td>内容2</td></tr></table>'
    }
  ];

  testCases.forEach((testCase, index) => {
    console.log(`\n--- 测试${index + 1}: ${testCase.name} ---`);
    console.log('输入:', testCase.input);
    console.log('期望:', testCase.expected);

    const result = cleanHtmlContent(testCase.input);
    console.log('结果:', result);

    const passed = result === testCase.expected;
    console.log(passed ? '✅ 通过' : '❌ 失败');

    if (!passed) {
      console.log('差异分析:');
      console.log('期望长度:', testCase.expected.length);
      console.log('结果长度:', result.length);
    }
  });
}

// 创建可视化测试
function createVisualTest() {
  console.log('🎨 创建可视化测试...');

  const testHtml = `
    <div style="background: #f0f0f0; padding: 20px; border: 2px solid red;">
      <h1><strong style="color: blue;">主标题</strong></h1>
      <p><em style="font-size: 18px;">这是斜体段落</em></p>
      <ul style="list-style-type: square;">
        <li><b>粗体项目1</b></li>
        <li><i style="color: green;">斜体项目2</i></li>
        <li><u>下划线项目3</u></li>
      </ul>
      <blockquote style="border-left: 4px solid #ccc; padding: 10px;">
        <span style="background: yellow;">这是引用内容</span>
      </blockquote>
    </div>
  `;

  const cleanedHtml = cleanHtmlContent(testHtml);

  // 创建测试容器
  const testContainer = document.createElement('div');
  testContainer.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    width: 400px;
    max-height: 80vh;
    background: white;
    border: 2px solid #333;
    border-radius: 8px;
    padding: 20px;
    overflow-y: auto;
    z-index: 10000;
    font-family: Arial, sans-serif;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  `;

  testContainer.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: #333;">HTML清理测试</h3>
    <div style="margin-bottom: 15px;">
      <strong>原始HTML:</strong>
      <div style="background: #ffe6e6; padding: 10px; margin: 5px 0; border-radius: 4px; font-size: 12px; word-break: break-all;">
        ${testHtml.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </div>
    </div>
    <div style="margin-bottom: 15px;">
      <strong>清理后HTML:</strong>
      <div style="background: #e6ffe6; padding: 10px; margin: 5px 0; border-radius: 4px; font-size: 12px; word-break: break-all;">
        ${cleanedHtml.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </div>
    </div>
    <div style="margin-bottom: 15px;">
      <strong>渲染效果:</strong>
      <div style="background: #e6f3ff; padding: 10px; margin: 5px 0; border-radius: 4px; border: 1px solid #0066cc;">
        ${cleanedHtml}
      </div>
    </div>
    <button onclick="this.parentElement.remove()" style="background: #ff4444; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">关闭</button>
  `;

  document.body.appendChild(testContainer);
  console.log('✅ 可视化测试已创建，请查看页面右上角');
}

// 检查扩展状态
function checkExtensionStatus() {
  console.log('🔍 检查text2social扩展状态...');

  if (typeof window.text2socialDebug !== 'undefined') {
    console.log('✅ text2social扩展已加载');
    console.log('扩展状态:', window.text2socialDebug.getStatus());
  } else {
    console.log('❌ text2social扩展未检测到');
    console.log('请确保扩展已正确安装和启用');
  }
}

// 运行所有测试
function runAllHtmlTests() {
  console.log('🚀 开始运行HTML清理测试...');

  testHtmlCleaning();
  checkExtensionStatus();

  console.log('\n📝 要创建可视化测试，请运行: createVisualTest()');
  console.log('📝 要在网页中测试实际选择功能，请选择包含HTML格式的文本并点击📸按钮');
}

// 导出函数到全局
window.testHtmlCleaning = testHtmlCleaning;
window.cleanHtmlContent = cleanHtmlContent;
window.createVisualTest = createVisualTest;
window.checkExtensionStatus = checkExtensionStatus;
window.runAllHtmlTests = runAllHtmlTests;

console.log('📋 text2social HTML清理调试脚本已加载');
console.log('💡 运行 runAllHtmlTests() 来执行所有测试');
console.log('💡 运行 createVisualTest() 来创建可视化测试');
console.log('💡 运行 testHtmlCleaning() 来测试HTML清理功能');