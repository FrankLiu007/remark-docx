<script>
  import { onMount } from 'svelte';
  import { createRemarkDocxProcessor, preprocessMathFormulas } from 'remark-docx';
  
  // 响应式状态
  let markdownInput = '';
  let result = '';
  let resultType = '';
  let isLoading = false;
  let error = '';
  
  // 测试用的 Markdown 内容
  const testMarkdown = `# Remark-Docx 高度封装测试

这是一个使用高度封装 API 的测试文档，简化了转换流程。

## 数学公式测试

### 行内数学公式
爱因斯坦质能方程：$E = mc^2$

极限公式：$\\lim_{x \\to 0} \\frac{\\sin x}{x}$

### 块级数学公式
高斯积分：
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

泰勒级数：
$$
f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n
$$

薛定谔方程：
$$
i\\hbar\\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi
$$

## 文本格式

**粗体文本** 和 *斜体文本*

## 列表

### 有序列表
1. 第一项
2. 第二项
3. 第三项

### 无序列表
- 项目 A
- 项目 B
  - 子项目 1
  - 子项目 2

## 代码

行内代码：\`console.log("Hello")\`

代码块：
\`\`\`javascript
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
\`\`\`

## 引用

> 这是一个引用块
> 
> 可以包含多行内容

## 链接

[Remark-Docx GitHub](https://github.com/your-repo/remark-docx)

---

*文档生成时间：${new Date().toLocaleString()}*`;

  // 初始化
  onMount(() => {
    markdownInput = testMarkdown;
    showResult('✅ 高度封装测试环境已准备就绪，点击"转换"按钮开始测试', 'success');
  });

  // 显示结果
  function showResult(message, type = '') {
    result = message;
    resultType = type;
    error = '';
  }

  // 高度封装的转换函数 - 使用 createRemarkDocxProcessor
  async function convertWithHighLevelAPI() {
    if (!markdownInput.trim()) {
      showResult('❌ 请输入 Markdown 内容', 'error');
      return;
    }

    try {
      isLoading = true;
      showResult('🔄 使用高度封装 API 转换中...', 'loading');

      // 预处理数学公式
      const preprocessedContent = preprocessMathFormulas(markdownInput);
      console.log('预处理后的内容:', preprocessedContent);

      // 构建完整的 Markdown 文档
      const markdownContent = `# 消息内容\n\n导出时间: ${new Date().toLocaleString('zh-CN')}\n\n---\n\n${preprocessedContent}`;

      // 使用高度封装的 API
      const processor = createRemarkDocxProcessor({ 
        output: 'blob',
        useOMML: true, // 启用 OMML 解析器
        useBrowserXSL: false,
        imageResolver: async (_url) => {
          return {
            data: new Uint8Array(0),
            width: 100,
            height: 100
          };
        }
      });

      console.log('处理器创建成功，开始处理...');

      // 处理 markdown
      const processedResult = await processor.process(markdownContent);
      console.log('处理结果:', processedResult);

      // 检查 result 是否是 Promise
      let docxResult = processedResult.result;
      if (docxResult && typeof docxResult.then === 'function') {
        console.log('Result is a Promise, awaiting...');
        docxResult = await docxResult;
      }

      if (!docxResult) {
        throw new Error('处理结果为空');
      }

      // 确保结果是 Blob
      let blob;
      if (docxResult instanceof Blob) {
        blob = docxResult;
      } else if (typeof docxResult === 'string') {
        blob = new Blob([docxResult], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      } else if (docxResult instanceof ArrayBuffer) {
        blob = new Blob([docxResult], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      } else {
        throw new Error(`意外的结果类型: ${typeof docxResult}`);
      }

      // 下载文件
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `remark-docx-high-level-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // 统计信息
      const lines = preprocessedContent.split('\n').length;
      const mathBlocks = (preprocessedContent.match(/\$\$[\s\S]*?\$\$/g) || []).length;
      const inlineMath = (preprocessedContent.match(/\$[^$]+\$/g) || []).length;
      const fileSize = (blob.size / 1024).toFixed(2);

      showResult(`✅ 高度封装 API 转换成功！

📄 DOCX 文件已下载: ${a.download}

📊 统计信息:
- 总行数: ${lines}
- 数学块 ($$): ${mathBlocks}
- 行内数学 ($): ${inlineMath}
- 文件大小: ${fileSize} KB

✨ 使用了 createRemarkDocxProcessor 高度封装 API
🎯 简化了复杂的 unified 配置流程`, 'success');

    } catch (err) {
      console.error('转换错误:', err);
      showResult(`❌ 转换失败: ${err.message}

错误详情:
${err.stack || err.toString()}`, 'error');
    } finally {
      isLoading = false;
    }
  }

  // 对比：使用传统 unified 方式
  async function convertWithTraditionalAPI() {
    if (!markdownInput.trim()) {
      showResult('❌ 请输入 Markdown 内容', 'error');
      return;
    }

    try {
      isLoading = true;
      showResult('🔄 使用传统 unified API 转换中...', 'loading');

      // 预处理数学公式
      const preprocessedContent = preprocessMathFormulas(markdownInput);

      // 动态导入 unified 和相关插件
      const { unified } = await import('unified');
      const remarkParse = (await import('remark-parse')).default;
      const remarkMath = (await import('remark-math')).default;
      const remarkGfm = (await import('remark-gfm')).default;
      const { remarkDocx } = await import('remark-docx');

      // 创建处理器 - 传统方式
      const processor = unified()
        .use(remarkParse)
        .use(remarkMath)
        .use(remarkGfm)
        .use(remarkDocx, {
          output: 'blob',
          useOMML: true,
          useBrowserXSL: false,
          imageResolver: async (url) => {
            return {
              data: new Uint8Array(0),
              width: 100,
              height: 100
            };
          }
        });

      const processedResult = await processor.process(preprocessedContent);
      const docxBlob = await processedResult.result;

      if (!docxBlob) {
        throw new Error('处理结果为空');
      }

      // 下载文件
      const url = URL.createObjectURL(docxBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `remark-docx-traditional-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const fileSize = (docxBlob.size / 1024).toFixed(2);

      showResult(`✅ 传统 unified API 转换成功！

📄 DOCX 文件已下载: ${a.download}
📊 文件大小: ${fileSize} KB

📋 传统方式需要手动配置:
- unified() 处理器
- remarkParse 插件
- remarkMath 插件  
- remarkGfm 插件
- remarkDocx 插件

⚖️ 与高度封装 API 对比:
- 代码量: 更多
- 配置: 更复杂
- 维护: 更困难`, 'success');

    } catch (err) {
      console.error('传统转换错误:', err);
      showResult(`❌ 传统转换失败: ${err.message}`, 'error');
    } finally {
      isLoading = false;
    }
  }

  // 测试预处理功能
  function testPreprocessing() {
    if (!markdownInput.trim()) {
      showResult('❌ 请输入 Markdown 内容', 'error');
      return;
    }

    try {
      const preprocessed = preprocessMathFormulas(markdownInput);
      const originalLength = markdownInput.length;
      const processedLength = preprocessed.length;
      const mathFormulas = (markdownInput.match(/\$\$[\s\S]*?\$\$/g) || []).length + 
                           (markdownInput.match(/\$[^$]+\$/g) || []).length;

      showResult(`✅ 预处理测试成功！

📝 原始长度: ${originalLength} 字符
📝 处理后长度: ${processedLength} 字符
🔢 数学公式数量: ${mathFormulas}

预处理后的内容:
${preprocessed}`, 'success');

    } catch (err) {
      console.error('预处理错误:', err);
      showResult(`❌ 预处理失败: ${err.message}`, 'error');
    }
  }

  // 加载测试内容
  function loadTestContent() {
    markdownInput = testMarkdown;
    showResult('✅ 测试内容已加载', 'success');
  }

  // 清空输入
  function clearInput() {
    markdownInput = '';
    showResult('✅ 输入已清空', 'success');
  }
</script>

<div class="grid">
  <!-- 输入面板 -->
  <div class="panel">
    <div class="panel-header">
      📝 Markdown 输入 (高度封装版本)
    </div>
    <div class="panel-content">
      <textarea 
        bind:value={markdownInput} 
        placeholder="输入 Markdown 内容..."
        disabled={isLoading}
      ></textarea>
      
      <div style="margin-top: 15px;">
        <div class="button-group">
          <h4>🚀 转换方法对比</h4>
          <button 
            on:click={convertWithHighLevelAPI} 
            disabled={isLoading}
            class="high-level-btn"
          >
            {isLoading ? '🔄 转换中...' : '✨ 高度封装 API'}
          </button>
          
          <button 
            on:click={convertWithTraditionalAPI} 
            disabled={isLoading}
            class="traditional-btn"
          >
            {isLoading ? '🔄 转换中...' : '📋 传统 unified API'}
          </button>
        </div>
        
        <div class="button-group">
          <h4>🛠️ 其他功能</h4>
          <button 
            on:click={testPreprocessing}
            disabled={isLoading}
          >
            🔧 测试预处理
          </button>
          
          <button 
            on:click={loadTestContent}
            disabled={isLoading}
          >
            📖 加载测试内容
          </button>
          
          <button 
            on:click={clearInput}
            disabled={isLoading}
          >
            🗑️ 清空输入
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 输出面板 -->
  <div class="panel">
    <div class="panel-header">
      📤 输出结果
    </div>
    <div class="panel-content">
      <div class="result {resultType}">
        {result || '等待操作...'}
      </div>
    </div>
  </div>
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    height: 100vh;
    padding: 20px;
  }

  .panel {
    display: flex;
    flex-direction: column;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
  }

  .panel-header {
    background-color: #f5f5f5;
    padding: 15px;
    font-weight: bold;
    border-bottom: 1px solid #ddd;
  }

  .panel-content {
    flex: 1;
    padding: 15px;
    overflow-y: auto;
  }

  textarea {
    width: 100%;
    height: 300px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    resize: vertical;
  }

  .result {
    padding: 15px;
    border-radius: 6px;
    white-space: pre-wrap;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.5;
  }

  .result.success {
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
  }

  .result.error {
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
  }

  .result.loading {
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    color: #856404;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .button-group {
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #f9f9f9;
  }

  .button-group h4 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 14px;
    font-weight: 600;
  }

  .high-level-btn {
    background-color: #28a745;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    margin: 5px;
    transition: all 0.2s ease;
  }

  .high-level-btn:hover:not(:disabled) {
    background-color: #218838;
    transform: translateY(-1px);
  }

  .traditional-btn {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    margin: 5px;
    transition: all 0.2s ease;
  }

  .traditional-btn:hover:not(:disabled) {
    background-color: #0056b3;
    transform: translateY(-1px);
  }

  button {
    margin: 5px;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background-color: #fff;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s ease;
  }

  button:hover:not(:disabled) {
    background-color: #f0f0f0;
    transform: translateY(-1px);
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .grid {
      grid-template-columns: 1fr;
      height: auto;
    }
  }
</style>
