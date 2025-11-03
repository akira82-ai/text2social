// components/utils/image-exporter.js
class ImageExporter {
  constructor() {
    // 图片导出器构造函数
  }

  static async exportToImage(element, options = {}) {
    // 将DOM元素导出为图片
    try {
      // 默认选项
      const defaultOptions = {
        filename: 'text2social-output.png',
        pixelRatio: 2, // 高分辨率
        ...options
      };

      // 使用html2canvas库将元素转换为canvas
      const canvas = await this.toCanvas(element, defaultOptions);
      const imageBlob = await this.canvasToBlob(canvas);

      // 保存图片
      this.downloadImage(imageBlob, defaultOptions.filename);
      
      return {
        success: true,
        canvas,
        blob: imageBlob,
        filename: defaultOptions.filename
      };
    } catch (error) {
      console.error('图片导出失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async toCanvas(element, options) {
    // 将DOM元素转换为canvas
    if (typeof html2canvas !== 'undefined') {
      return await html2canvas(element, {
        scale: options.pixelRatio,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null // 保持透明背景
      });
    } else {
      throw new Error('html2canvas库未加载');
    }
  }

  static async canvasToBlob(canvas) {
    // 将canvas转换为blob
    return new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png');
    });
  }

  static downloadImage(blob, filename) {
    // 下载图片
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async exportToDataUrl(element, options = {}) {
    // 将DOM元素导出为Data URL
    try {
      const canvas = await this.toCanvas(element, options);
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('生成Data URL失败:', error);
      return null;
    }
  }

  static async exportToBase64(element, options = {}) {
    // 将DOM元素导出为Base64字符串
    const dataUrl = await this.exportToDataUrl(element, options);
    if (dataUrl) {
      return dataUrl.split(',')[1]; // 移除data:image/png;base64,前缀
    }
    return null;
  }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageExporter;
}