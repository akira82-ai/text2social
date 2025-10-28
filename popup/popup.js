document.addEventListener('DOMContentLoaded', function() {
  const templateOptions = document.querySelectorAll('.template-option');
  const previewContainer = document.getElementById('preview');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  
  // 获取所有模板
  const templates = {
    '纯文本': '/templates/纯文本.html',
    '新模板': '/templates/新模板.html'
  };
  
  let currentTemplate = '纯文本';
  
  // 模板选择事件
  templateOptions.forEach(option => {
    option.addEventListener('click', function() {
      // 移除所有选中状态
      templateOptions.forEach(opt => opt.classList.remove('selected'));
      // 添加选中状态到当前选项
      this.classList.add('selected');
      // 更新当前模板
      currentTemplate = this.getAttribute('data-template');
      // 更新预览
      updatePreview();
    });
  });
  
  // 更新预览
  function updatePreview() {
    // 从存储中获取选中的文本
    chrome.storage.local.get(['selectedText'], function(result) {
      if (result.selectedText) {
        // 使用选中的文本渲染模板
        loadTemplate(currentTemplate, result.selectedText);
      } else {
        // 如果没有选中文本，则显示提示信息
        previewContainer.innerHTML = '<p>请选择网页上的文本以开始</p>';
      }
    });
  }
  
  // 加载并渲染模板
  async function loadTemplate(templateName, text) {
    try {
      const response = await fetch(templates[templateName]);
      let templateHtml = await response.text();
      
      // 替换模板中的占位符
      templateHtml = templateHtml.replace('{{text}}', text).replace('{{title}}', '预览标题');
      
      // 清空预览容器
      previewContainer.innerHTML = '';
      
      // 创建一个容器来包含处理后的内容
      const contentContainer = document.createElement('div');
      contentContainer.classList.add('scaled-content');
      
      // 创建一个shadow DOM来完全隔离样式
      const shadow = contentContainer.attachShadow({ mode: 'closed' });
      
      // 解析模板HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(templateHtml, 'text/html');
      
      // 获取模板中的所有样式并添加到shadow DOM
      const styles = doc.querySelectorAll('style');
      const bodyContent = doc.querySelector('body');
      
      // 将样式添加到shadow DOM
      styles.forEach(style => {
        const newStyle = document.createElement('style');
        newStyle.textContent = style.textContent;
        shadow.appendChild(newStyle);
      });
      
      // 将模板内容添加到shadow DOM
      if (bodyContent) {
        shadow.appendChild(bodyContent.cloneNode(true));
      } else {
        // 如果没有body标签，则使用整个HTML内容
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = templateHtml;
        shadow.appendChild(tempDiv);
      }
      
      // 添加内容容器到预览容器
      previewContainer.appendChild(contentContainer);
      
      // 设置容器的缩放以适应预览区域
      setTimeout(() => {
        adjustScale(contentContainer);
      }, 10);
    } catch (error) {
      console.error('加载模板失败:', error);
      previewContainer.innerHTML = '<p>模板加载失败</p>';
    }
  }
  
  // 处理CSS，将所有选择器限制在预览容器内
  function processCSSForScope(cssText) {
    // 使用正则表达式处理CSS，为所有选择器添加.scaled-content作用域
    // 这会处理各种类型的选择器，包括组合选择器
    let result = cssText;
    
    // 处理各种复杂的选择器，将其限制在 .scaled-content 内
    // 为顶层选择器添加 .scaled-content 前缀
    result = result.replace(/(^|\})([^{]*)\{([^}]*)\}/g, function(match, before, selectors, rules) {
      // 分割多个选择器（由逗号分隔）
      const selectorArray = selectors.split(',');
      
      // 为每个选择器添加作用域，但避免重复添加
      const scopedSelectors = selectorArray.map(selector => {
        selector = selector.trim();
        
        // 跳过一些特殊规则如 @media, @keyframes 等
        if (selector.startsWith('@')) {
          return selector; // 保持 @ 规则不变
        }
        
        // 检查是否已包含 .scaled-content，避免重复
        if (selector.includes('.scaled-content')) {
          return selector;
        }
        
        // 处理不同类型的顶层选择器
        if (selector.startsWith(':')) {
          // 伪类/伪元素选择器，应用到容器自身，如 :hover, ::before
          return '.scaled-content' + selector;
        } else if (selector.startsWith('*')) {
          // 通配符选择器
          return '.scaled-content *';
        } else if (selector === 'body' || selector === 'html' || 
                  selector.startsWith('body ') || selector.startsWith('html ')) {
          // body/html 选择器替换为 .scaled-content
          return '.scaled-content';
        } else if (selector.startsWith('body.') || selector.startsWith('html.')) {
          // body.className 或 body#id 这类选择器
          return '.scaled-content' + selector.substring(4); // 移除 'body' 并替换为 '.scaled-content'
        } else if (selector.startsWith('body#') || selector.startsWith('body[')) {
          // body#id 或 body[attr] 这类选择器
          return '.scaled-content' + selector.substring(4); // 移除 'body' 并替换为 '.scaled-content'
        } else {
          // 其他选择器添加 .scaled-content 前缀
          return '.scaled-content ' + selector;
        }
      });
      
      return before + scopedSelectors.join(', ') + '{' + rules + '}';
    });
    
    return result;
  }
  
  // 调整内容缩放以适应容器
  function adjustScale(contentContainer) {
    // 获取预览容器在主文档中的尺寸
    const hostElement = previewContainer;
    // 减去一些边距和填充
    const containerWidth = hostElement.clientWidth - 20; 
    const containerHeight = hostElement.clientHeight - 20; 
    
    // 模板内容原始设计尺寸
    const originalWidth = 400;
    const originalHeight = 533; // 保持3:4的比例
    
    // 计算缩放比例，确保内容完全适应容器
    const scaleX = containerWidth / originalWidth;
    const scaleY = containerHeight / originalHeight;
    const scale = Math.min(scaleX, scaleY, 1); // 保持比例，且不放大超过原始尺寸
    
    // 应用缩放
    contentContainer.style.transform = `scale(${scale})`;
    
    // 通过调整容器的宽高来确保居中
    contentContainer.style.width = `${originalWidth * scale}px`;
    contentContainer.style.height = `${originalHeight * scale}px`;
  }
  
  // 初始化预览
  updatePreview();
  
  // 复制图片按钮点击事件
  copyBtn.addEventListener('click', async function() {
    try {
      // 获取预览容器中的内容元素
      const contentElement = previewContainer.querySelector('.scaled-content');
      if (contentElement) {
        // 创建一个临时容器来放置内容用于截图，保持原始尺寸
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
          position: absolute;
          left: -9999px;
          top: -9999px;
          width: 400px;
          height: 533px;
          overflow: visible;
          background: white;
        `;
        
        // 使用HTML模板来重建内容，因为html2canvas无法处理shadow DOM
        const shadowRoot = contentElement.shadowRoot;
        if (shadowRoot) {
          // 提取shadow DOM中的样式和内容
          const allStyles = Array.from(shadowRoot.querySelectorAll('style'));
          const stylesContent = allStyles.map(style => style.textContent).join('\n');
          
          // 获取shadow DOM中的内容元素
          const contentElements = Array.from(shadowRoot.children).filter(el => el.tagName !== 'STYLE');
          
          // 创建一个临时元素来包含样式和内容
          const tempContent = document.createElement('div');
          tempContent.style.width = '400px';
          tempContent.style.height = '533px';
          tempContent.style.overflow = 'hidden';
          
          // 添加样式
          const styleElement = document.createElement('style');
          styleElement.textContent = stylesContent;
          tempContent.appendChild(styleElement);
          
          // 添加内容元素
          contentElements.forEach(el => {
            tempContent.appendChild(el.cloneNode(true));
          });
          
          tempContainer.appendChild(tempContent);
        } else {
          // 克隆内容元素，但要移除缩放变换，以原始尺寸渲染
          const clonedContent = contentElement.cloneNode(true);
          clonedContent.style.transform = 'scale(1)'; // 移除缩放效果
          tempContainer.appendChild(clonedContent);
        }
        
        document.body.appendChild(tempContainer);
        
        // 使用 html2canvas 对临时容器截图
        const canvas = await html2canvas(tempContainer, { scale: 2 }); // 使用更高分辨率
        canvas.toBlob(function(blob) {
          const clipboardItem = new ClipboardItem({'image/png': blob});
          navigator.clipboard.write([clipboardItem]).then(function() {
            alert('图片已复制到剪贴板');
          }).catch(function(err) {
            console.error('复制图片失败:', err);
          });
          
          // 移除临时容器
          document.body.removeChild(tempContainer);
        }, { scale: 2 }); // 使用更高分辨率
      } else {
        // 如果没有找到内容元素，使用原始方式
        const canvas = await html2canvas(previewContainer);
        canvas.toBlob(function(blob) {
          const clipboardItem = new ClipboardItem({'image/png': blob});
          navigator.clipboard.write([clipboardItem]).then(function() {
            alert('图片已复制到剪贴板');
          }).catch(function(err) {
            console.error('复制图片失败:', err);
          });
        });
      }
    } catch (error) {
      console.error('复制图片失败:', error);
      if (typeof html2canvas === 'undefined') {
        alert('缺少 html2canvas 库，请确保已引入');
      }
    }
  });
  
  // 下载图片按钮点击事件
  downloadBtn.addEventListener('click', async function() {
    try {
      // 获取预览容器中的内容元素
      const contentElement = previewContainer.querySelector('.scaled-content');
      if (contentElement) {
        // 创建一个临时容器来放置内容用于截图，保持原始尺寸
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
          position: absolute;
          left: -9999px;
          top: -9999px;
          width: 400px;
          height: 533px;
          overflow: visible;
          background: white;
        `;
        
        // 使用HTML模板来重建内容，因为html2canvas无法处理shadow DOM
        const shadowRoot = contentElement.shadowRoot;
        if (shadowRoot) {
          // 提取shadow DOM中的样式和内容
          const allStyles = Array.from(shadowRoot.querySelectorAll('style'));
          const stylesContent = allStyles.map(style => style.textContent).join('\n');
          
          // 获取shadow DOM中的内容元素
          const contentElements = Array.from(shadowRoot.children).filter(el => el.tagName !== 'STYLE');
          
          // 创建一个临时元素来包含样式和内容
          const tempContent = document.createElement('div');
          tempContent.style.width = '400px';
          tempContent.style.height = '533px';
          tempContent.style.overflow = 'hidden';
          
          // 添加样式
          const styleElement = document.createElement('style');
          styleElement.textContent = stylesContent;
          tempContent.appendChild(styleElement);
          
          // 添加内容元素
          contentElements.forEach(el => {
            tempContent.appendChild(el.cloneNode(true));
          });
          
          tempContainer.appendChild(tempContent);
        } else {
          // 克隆内容元素，但要移除缩放变换，以原始尺寸渲染
          const clonedContent = contentElement.cloneNode(true);
          clonedContent.style.transform = 'scale(1)'; // 移除缩放效果
          tempContainer.appendChild(clonedContent);
        }
        
        document.body.appendChild(tempContainer);
        
        // 使用 html2canvas 对临时容器截图
        const canvas = await html2canvas(tempContainer, { scale: 2 }); // 使用更高分辨率
        // 创建下载链接
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `text2social-${currentTemplate}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // 移除临时容器
        document.body.removeChild(tempContainer);
      } else {
        // 如果没有找到内容元素，使用原始方式
        const canvas = await html2canvas(previewContainer);
        // 创建下载链接
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `text2social-${currentTemplate}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('下载图片失败:', error);
      if (typeof html2canvas === 'undefined') {
        alert('缺少 html2canvas 库，请确保已引入');
      }
    }
  });
});