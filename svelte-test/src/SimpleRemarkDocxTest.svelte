<script>
  import { onMount } from 'svelte';
  import { createRemarkDocxProcessor, preprocessMathFormulas } from 'remark-docx';
  
  // 响应式状态
  let markdownInput = '';
  let result = '';
  let isLoading = false;
  
  // 测试用的 Markdown 内容
  const testMarkdown = `# 高度封装 API 测试文档

## 数学公式测试

### 行内公式
质能方程：$E = mc^2$

极限：$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$

### 块级公式
高斯积分：
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

薛定谔方程：
$$
i\\hbar\\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi
$$

## 文本格式

**粗体** 和 *斜体*

## 列表

1. 有序列表项 1
2. 有序列表项 2

- 无序列表项 A
- 无序列表项 B

## 代码

行内代码：\`console.log("Hello")\`

\`\`\`javascript
function fibonacci(n) {
    return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2);
}
\`\`\`

## 引用

> 这是一个引用块
> 可以包含多行内容

---

*生成时间：${new Date().toLocaleString()}*`;

  // 初始化
  onMount(() => {
    markdownInput = testMarkdown;
    result = '✅ 高度封装测试环境已准备就绪';
  });

  // 显示结果
  function showResult(message, isError = false) {
    result = message;
    if (isError) {
      console.error(message);
    } else {
      console.log(message);
    }
  }

  // 高度封装的转换函数
  async function convertToDocx() {
    if (!markdownInput.trim()) {
      showResult('❌ 请输入 Markdown 内容', true);
      return;
    }

    try {
      isLoading = true;
      showResult('🔄 使用高度封装 API 转换中...');

      // 1. 预处理数学公式
      const processedContent = preprocessMathFormulas(markdownInput);
      
      // 2. 构建完整的 Markdown 文档
      const markdownContent = `# 消息内容\n\n导出时间: ${new Date().toLocaleString('zh-CN')}\n\n---\n\n${markdownInput}`;

      // 3. 使用高度封装的 API 创建处理器
      const processor = createRemarkDocxProcessor({ 
        output: 'blob',
        useOMML: true,
        useBrowserXSL: false,
        imageResolver: async (_url) => ({
          data: new Uint8Array(0),
          width: 100,
          height: 100
        })
      });

      // 4. 处理并生成 DOCX
      const doc = await processor.process(markdownContent);
      
      // 5. 处理结果（可能是 Promise）
      let docxResult = doc.result;
      if (docxResult && typeof docxResult.then === 'function') {
        docxResult = await docxResult;
      }

      if (!docxResult) {
        throw new Error('处理结果为空');
      }

      // 6. 确保结果是 Blob
      let blob;
      if (docxResult instanceof Blob) {
        blob = docxResult;
      } else if (typeof docxResult === 'string') {
        blob = new Blob([docxResult], { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
      } else if (docxResult instanceof ArrayBuffer) {
        blob = new Blob([docxResult], { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
      } else {
        throw new Error(`意外的结果类型: ${typeof docxResult}`);
      }

      // 7. 下载文件
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `remark-docx-simple-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // 8. 显示成功信息
      const stats = {
        lines: processedContent.split('\n').length,
        mathBlocks: (processedContent.match(/\$\$[\s\S]*?\$\$/g) || []).length,
        inlineMath: (processedContent.match(/\$[^$]+\$/g) || []).length,
        fileSize: (blob.size / 1024).toFixed(2)
      };

      showResult(`✅ 转换成功！

📄 文件: ${a.download}
📊 统计:
- 行数: ${stats.lines}
- 块级公式: ${stats.mathBlocks}
- 行内公式: ${stats.inlineMath}
- 大小: ${stats.fileSize} KB

✨ 使用了 createRemarkDocxProcessor 高度封装 API
🎯 代码简洁，配置简单！`);

    } catch (error) {
      showResult(`❌ 转换失败: ${error.message}\n\n详情: ${error.stack}`, true);
    } finally {
      isLoading = false;
    }
  }

  // 测试预处理
  function testPreprocessing() {
    if (!markdownInput.trim()) {
      showResult('❌ 请输入 Markdown 内容', true);
      return;
    }

    try {
      const processed = preprocessMathFormulas(markdownInput);
      const mathCount = (markdownInput.match(/\$\$[\s\S]*?\$\$/g) || []).length + 
                       (markdownInput.match(/\$[^$]+\$/g) || []).length;

      showResult(`✅ 预处理测试成功！

📝 原始: ${markdownInput.length} 字符
📝 处理后: ${processed.length} 字符
🔢 公式数量: ${mathCount}

处理后内容:
${processed}`);
    } catch (error) {
      showResult(`❌ 预处理失败: ${error.message}`, true);
    }
  }

  // 加载测试内容
  function loadTestContent() {
    markdownInput = testMarkdown;
    showResult('✅ 测试内容已加载');
  }

  // 清空输入
  function clearInput() {
    markdownInput = '';
    showResult('✅ 输入已清空');
  }
</script>

<div class="container">
  <div class="input-section">
    <h3>📝 Markdown 输入</h3>
    <textarea 
      bind:value={markdownInput} 
      placeholder="输入 Markdown 内容..."
      disabled={isLoading}
    ></textarea>
    
    <div class="buttons">
      <button 
        on:click={convertToDocx} 
        disabled={isLoading}
        class="primary"
      >
        {isLoading ? '🔄 转换中...' : '🚀 转换为 DOCX'}
      </button>
      
      <div class="secondary-buttons">
        <button on:click={testPreprocessing} disabled={isLoading}>
          🔧 预处理
        </button>
        
        <button on:click={loadTestContent} disabled={isLoading}>
          📖 测试内容
        </button>
        
        <button on:click={clearInput} disabled={isLoading}>
          🗑️ 清空
        </button>
      </div>
    </div>
  </div>

  <div class="output-section">
    <h3>📤 输出结果</h3>
    <div class="result">
      {result || '等待操作...'}
    </div>
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    height: calc(100vh - 120px);
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .input-section, .output-section {
    display: flex;
    flex-direction: column;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    overflow: hidden;
  }

  h3 {
    margin: 0;
    padding: 15px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #e1e5e9;
    font-size: 16px;
    font-weight: 600;
  }

  textarea {
    height: 280px;
    padding: 15px;
    border: none;
    resize: vertical;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.5;
  }

  .buttons {
    padding: 12px;
    border-top: 1px solid #e1e5e9;
    background-color: #f8f9fa;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .secondary-buttons {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  button {
    padding: 6px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background-color: white;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  button:hover:not(:disabled) {
    background-color: #f3f4f6;
    border-color: #9ca3af;
    transform: translateY(-1px);
  }

  button.primary {
    background-color: #3b82f6;
    color: white;
    border-color: #3b82f6;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    width: 100%;
    margin-bottom: 5px;
  }

  button.primary:hover:not(:disabled) {
    background-color: #2563eb;
    border-color: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .result {
    height: 280px;
    padding: 15px;
    white-space: pre-wrap;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.5;
    overflow-y: auto;
    background-color: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e1e5e9;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .container {
      grid-template-columns: 1fr;
      height: auto;
    }
    
    .buttons {
      justify-content: center;
    }
  }
</style>
