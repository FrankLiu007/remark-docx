<script>
  import { onMount } from 'svelte';
  import { unified } from 'unified';
  import remarkParse from 'remark-parse';
  import remarkMath from 'remark-math';
  import remarkGfm from 'remark-gfm';
  import remarkDocx, { preprocessMathFormulas } from 'remark-docx';
  
  // 响应式状态
  let markdownInput = '';
  let result = '';
  let resultType = '';
  let isLoading = false;
  let error = '';
  let comparisonResults = {
    browserNative: null,
    mathml2omml: null
  };
  
  // 比较结果显示
  let comparisonData = {
    xslResult: '',
    libraryResult: '',
    testFormula: '',
    mathmlContent: ''
  };
  
  // 测试用的 Markdown 内容
  const testMarkdown = `# Remark-Docx 测试文档

这是一个基于 Svelte 的测试文档，用于验证 remark-docx 库的功能。

## 数学公式测试

### 行内数学公式
爱因斯坦质能方程：$E = mc^2$

极限公式：
$$\\lim_{x \\to 0} \\frac{\\sin x}{x}$$

矩阵：
$$\\begin{vmatrix}
x + y & 2x \\\\
-2x + y & -ax + ya
\\end{vmatrix}
= (x + y)(-ax + ya) - (2x)(-2x + y)$$

### 块级数学公式
高斯积分：
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

泰勒级数：
$$
f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n
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
    showResult('✅ 测试环境已准备就绪，点击"转换"按钮开始测试', 'success');
  });

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

  // 显示结果
  function showResult(message, type = '') {
    result = message;
    resultType = type;
    error = '';
  }

  // 主要的转换函数
  async function convertMarkdownToDocx() {
    if (!markdownInput.trim()) {
      showResult('❌ 请输入 Markdown 内容', 'error');
      return;
    }

    try {
      isLoading = true;
      showResult('🔄 开始转换 Markdown → DOCX...', 'loading');

      // 预处理数学公式
      const preprocessedContent = preprocessMathFormulas(markdownInput);
      console.log('预处理后的内容:', preprocessedContent);

      // 创建处理器
      const processor = unified()
        .use(remarkParse)
        .use(remarkMath)
        .use(remarkGfm)
        .use(remarkDocx, {
          output: 'blob',
          useOMML: true,
          imageResolver: async (url) => {
            // 简单的图片解析器
            return {
              data: new Uint8Array(0),
              width: 100,
              height: 100
            };
          }
        });

      console.log('处理器创建成功，开始处理...');

      // 处理 markdown
      const processedResult = await processor.process(preprocessedContent);
      console.log('处理结果:', processedResult);

      const docxBlob = await processedResult.result;

      if (!docxBlob) {
        throw new Error('处理结果为空');
      }

      // 下载文件
      const url = URL.createObjectURL(docxBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `remark-docx-test-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // 统计信息
      const lines = preprocessedContent.split('\n').length;
      const mathBlocks = (preprocessedContent.match(/\$\$[\s\S]*?\$\$/g) || []).length;
      const inlineMath = (preprocessedContent.match(/\$[^$]+\$/g) || []).length;
      const fileSize = (docxBlob.size / 1024).toFixed(2);

      showResult(`✅ 转换成功！

📄 DOCX 文件已下载: ${a.download}

📊 统计信息:
- 总行数: ${lines}
- 数学块 ($$): ${mathBlocks}
- 行内数学 ($): ${inlineMath}
- 文件大小: ${fileSize} KB

✨ 使用了完整的 remark-docx 处理流程`, 'success');

    } catch (err) {
      console.error('转换错误:', err);
      showResult(`❌ 转换失败: ${err.message}

错误详情:
${err.stack || err.toString()}`, 'error');
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

  // 使用浏览器原生 XSL 转换
  async function convertWithBrowserNative() {
    if (!markdownInput.trim()) {
      showResult('❌ 请输入 Markdown 内容', 'error');
      return;
    }

    try {
      isLoading = true;
      const startTime = performance.now();
      showResult('🔄 使用浏览器原生 XSL 转换中...', 'loading');

      // 预处理数学公式
      const preprocessedContent = preprocessMathFormulas(markdownInput);

      // 创建处理器 - 使用浏览器原生 XSL
      const processor = unified()
        .use(remarkParse)
        .use(remarkMath)
        .use(remarkGfm)
        .use(remarkDocx, {
          output: 'blob',
          useOMML: true,
          useBrowserXSL: true, // 使用浏览器原生 XSL
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
      const endTime = performance.now();
      const conversionTime = (endTime - startTime).toFixed(2);

      if (!docxBlob) {
        throw new Error('处理结果为空');
      }

      // 下载文件
      const url = URL.createObjectURL(docxBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `browser-native-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // 保存结果用于比较
      comparisonResults.browserNative = {
        fileName: a.download,
        fileSize: (docxBlob.size / 1024).toFixed(2),
        conversionTime: conversionTime,
        method: '浏览器原生 XSL'
      };

      showResult(`✅ 浏览器原生 XSL 转换成功！

📄 文件: ${a.download}
📊 文件大小: ${comparisonResults.browserNative.fileSize} KB
⏱️ 转换时间: ${conversionTime} ms
🌐 方法: 浏览器原生 XSL 转换

${comparisonResults.mathml2omml ? '📈 比较结果已更新，可以查看差异' : '💡 现在可以测试 mathml2omml 库进行对比'}`, 'success');

    } catch (err) {
      console.error('浏览器原生转换错误:', err);
      showResult(`❌ 浏览器原生转换失败: ${err.message}`, 'error');
    } finally {
      isLoading = false;
    }
  }

  // 使用 mathml2omml 库转换
  async function convertWithMathml2omml() {
    if (!markdownInput.trim()) {
      showResult('❌ 请输入 Markdown 内容', 'error');
      return;
    }

    try {
      isLoading = true;
      const startTime = performance.now();
      showResult('🔄 使用 mathml2omml 库转换中...', 'loading');

      // 预处理数学公式
      const preprocessedContent = preprocessMathFormulas(markdownInput);

      // 创建处理器 - 使用 mathml2omml 库
      const processor = unified()
        .use(remarkParse)
        .use(remarkMath)
        .use(remarkGfm)
        .use(remarkDocx, {
          output: 'blob',
          useOMML: true,
          useBrowserXSL: false, // 使用 mathml2omml 库
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
      const endTime = performance.now();
      const conversionTime = (endTime - startTime).toFixed(2);

      if (!docxBlob) {
        throw new Error('处理结果为空');
      }

      // 下载文件
      const url = URL.createObjectURL(docxBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mathml2omml-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // 保存结果用于比较
      comparisonResults.mathml2omml = {
        fileName: a.download,
        fileSize: (docxBlob.size / 1024).toFixed(2),
        conversionTime: conversionTime,
        method: 'mathml2omml 库'
      };

      showResult(`✅ mathml2omml 库转换成功！

📄 文件: ${a.download}
📊 文件大小: ${comparisonResults.mathml2omml.fileSize} KB
⏱️ 转换时间: ${conversionTime} ms
📚 方法: mathml2omml 库转换

${comparisonResults.browserNative ? '📈 比较结果已更新，可以查看差异' : '💡 现在可以测试浏览器原生进行对比'}`, 'success');

    } catch (err) {
      console.error('mathml2omml 转换错误:', err);
      showResult(`❌ mathml2omml 转换失败: ${err.message}`, 'error');
    } finally {
      isLoading = false;
    }
  }

  // 显示比较结果
  function showComparison() {
    if (!comparisonResults.browserNative && !comparisonResults.mathml2omml) {
      showResult('❌ 请先进行至少一种转换方法测试', 'error');
      return;
    }

    let comparisonText = '📊 转换方法比较结果\n\n';
    
    if (comparisonResults.browserNative) {
      comparisonText += `🌐 浏览器原生 XSL:\n`;
      comparisonText += `  📄 文件: ${comparisonResults.browserNative.fileName}\n`;
      comparisonText += `  📊 大小: ${comparisonResults.browserNative.fileSize} KB\n`;
      comparisonText += `  ⏱️ 时间: ${comparisonResults.browserNative.conversionTime} ms\n\n`;
    }
    
    if (comparisonResults.mathml2omml) {
      comparisonText += `📚 mathml2omml 库:\n`;
      comparisonText += `  📄 文件: ${comparisonResults.mathml2omml.fileName}\n`;
      comparisonText += `  📊 大小: ${comparisonResults.mathml2omml.fileSize} KB\n`;
      comparisonText += `  ⏱️ 时间: ${comparisonResults.mathml2omml.conversionTime} ms\n\n`;
    }

    if (comparisonResults.browserNative && comparisonResults.mathml2omml) {
      const sizeDiff = (parseFloat(comparisonResults.mathml2omml.fileSize) - parseFloat(comparisonResults.browserNative.fileSize)).toFixed(2);
      const timeDiff = (parseFloat(comparisonResults.mathml2omml.conversionTime) - parseFloat(comparisonResults.browserNative.conversionTime)).toFixed(2);
      
      comparisonText += `📈 差异分析:\n`;
      comparisonText += `  📊 文件大小差异: ${sizeDiff > 0 ? '+' : ''}${sizeDiff} KB\n`;
      comparisonText += `  ⏱️ 转换时间差异: ${timeDiff > 0 ? '+' : ''}${timeDiff} ms\n\n`;
      
      comparisonText += `💡 建议:\n`;
      if (Math.abs(parseFloat(sizeDiff)) < 1) {
        comparisonText += `  - 文件大小基本相同\n`;
      } else {
        comparisonText += `  - ${parseFloat(sizeDiff) > 0 ? 'mathml2omml' : '浏览器原生'} 生成的文件更小\n`;
      }
      
      if (Math.abs(parseFloat(timeDiff)) < 100) {
        comparisonText += `  - 转换时间基本相同\n`;
      } else {
        comparisonText += `  - ${parseFloat(timeDiff) > 0 ? '浏览器原生' : 'mathml2omml'} 转换更快\n`;
      }
    }

    showResult(comparisonText, 'success');
  }

  // 清空比较结果
  function clearComparison() {
    comparisonResults = {
      browserNative: null,
      mathml2omml: null
    };
    showResult('✅ 比较结果已清空', 'success');
  }

  // 测试 XSL 缓存功能
  function testXSLCache() {
    try {
      // 导入 clearXSLContentCache 函数
      import('remark-docx').then((module) => {
        if (module.clearXSLContentCache) {
          module.clearXSLContentCache();
          showResult('✅ XSL 缓存已清除，下次转换将重新读取 XSL 内容', 'success');
        } else {
          showResult('❌ clearXSLContentCache 函数不可用', 'error');
        }
      }).catch((error) => {
        showResult(`❌ 导入 clearXSLContentCache 失败: ${error.message}`, 'error');
      });
    } catch (error) {
      showResult(`❌ 测试 XSL 缓存失败: ${error.message}`, 'error');
    }
  }

  // 比较两种转换方法
  function compareMethods() {
    if (!markdownInput.trim()) {
      showResult('❌ 请输入 Markdown 内容', 'error');
      return;
    }

    try {
      // 预处理数学公式
      const preprocessedContent = preprocessMathFormulas(markdownInput);
      
      // 提取第一个数学公式进行测试
      const mathMatch = preprocessedContent.match(/\$([^$]+)\$/);
      if (!mathMatch) {
        showResult('❌ 未找到数学公式，请确保输入包含 $...$ 格式的数学公式', 'error');
        return;
      }

      const latex = mathMatch[1];
      showResult(`🔍 正在比较转换方法，测试公式: ${latex}`, 'loading');

      // 使用 KaTeX 转换为 MathML
      import('katex').then((katex) => {
        const mathml = katex.default.renderToString(latex, {
          throwOnError: false,
          output: 'mathml'
        });
        
        // 提取 MathML 内容
        const mathmlMatch = mathml.match(/<math[\s\S]*?<\/math>/i);
        if (!mathmlMatch) {
          showResult('❌ 无法提取 MathML 内容', 'error');
          return;
        }

        const mathmlContent = mathmlMatch[0];
        
        // 导入比较函数
        import('remark-docx').then((module) => {
          if (module.compareConversionMethods) {
            const comparison = module.compareConversionMethods(mathmlContent);
            
            // 保存比较结果到状态
            comparisonData = {
              xslResult: comparison.xslResult || '',
              libraryResult: comparison.libraryResult || '',
              testFormula: latex,
              mathmlContent: mathmlContent
            };
            
            let resultText = `📊 转换方法比较结果\n\n`;
            resultText += `🧮 测试公式: ${latex}\n`;
            resultText += `📝 MathML 长度: ${mathmlContent.length}\n\n`;
            
            resultText += `🌐 浏览器原生 XSL:\n`;
            resultText += `  ✅ 转换: ${comparison.xslResult ? '成功' : '失败'}\n`;
            if (comparison.xslResult) {
              resultText += `  📏 长度: ${comparison.xslResult.length}\n`;
            }
            
            resultText += `\n📚 mathml2omml 库:\n`;
            resultText += `  ✅ 转换: ${comparison.libraryResult ? '成功' : '失败'}\n`;
            if (comparison.libraryResult) {
              resultText += `  📏 长度: ${comparison.libraryResult.length}\n`;
            }
            
            resultText += `\n🔍 比较结果:\n`;
            resultText += `  ${comparison.areSame ? '✅ 结果相同' : '❌ 结果不同'}\n`;
            comparison.differences.forEach(diff => {
              resultText += `  • ${diff}\n`;
            });
            
            resultText += `\n📋 详细结果已显示在下方文本框中：`;
            resultText += `\n  • MathML 中间结果（橙色边框）`;
            resultText += `\n  • XSL 转换结果（绿色边框）`;
            resultText += `\n  • mathml2omml 库结果（蓝色边框）`;
            resultText += `\n\n💡 可以复制各阶段结果进行详细对比分析`;

            showResult(resultText, 'success');
          } else {
            showResult('❌ compareConversionMethods 函数不可用', 'error');
          }
        }).catch((error) => {
          showResult(`❌ 导入比较函数失败: ${error.message}`, 'error');
        });
      }).catch((error) => {
        showResult(`❌ KaTeX 转换失败: ${error.message}`, 'error');
      });
    } catch (error) {
      showResult(`❌ 比较转换方法失败: ${error.message}`, 'error');
    }
  }
</script>

<div class="grid">
  <!-- 输入面板 -->
  <div class="panel">
    <div class="panel-header">
      📝 Markdown 输入
    </div>
    <div class="panel-content">
      <textarea 
        bind:value={markdownInput} 
        placeholder="输入 Markdown 内容..."
        disabled={isLoading}
      ></textarea>
      
      <div style="margin-top: 15px;">
        <div class="button-group">
          <h4>🔄 转换方法比较</h4>
          <button 
            on:click={convertWithBrowserNative} 
            disabled={isLoading}
            class="comparison-btn browser-native"
          >
            {isLoading ? '🔄 转换中...' : '🌐 浏览器原生 XSL'}
          </button>
          
          <button 
            on:click={convertWithMathml2omml} 
            disabled={isLoading}
            class="comparison-btn mathml2omml"
          >
            {isLoading ? '🔄 转换中...' : '📚 mathml2omml 库'}
          </button>
          
          <button 
            on:click={showComparison}
            disabled={isLoading}
            class="comparison-btn compare"
          >
            📊 查看比较结果
          </button>
          
          <button 
            on:click={clearComparison}
            disabled={isLoading}
            class="comparison-btn clear"
          >
            🗑️ 清空比较
          </button>
          
          <button 
            on:click={testXSLCache}
            disabled={isLoading}
            class="comparison-btn cache"
          >
            🔄 测试 XSL 缓存
          </button>
          
          <button 
            on:click={compareMethods}
            disabled={isLoading}
            class="comparison-btn compare-methods"
          >
            🔬 比较转换方法
          </button>
        </div>
        
        <div class="button-group">
          <h4>🛠️ 其他功能</h4>
          <button 
            on:click={convertMarkdownToDocx} 
            disabled={isLoading}
          >
            {isLoading ? '🔄 转换中...' : '🚀 标准转换'}
          </button>
          
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
      
      <!-- 比较结果显示区域 -->
      {#if comparisonData.testFormula}
        <div class="comparison-section">
          <h4>🔬 转换方法比较详情</h4>
          <div class="comparison-info">
            <p><strong>测试公式:</strong> {comparisonData.testFormula}</p>
            <p><strong>MathML 长度:</strong> {comparisonData.mathmlContent.length} 字符</p>
          </div>
          
          <!-- MathML 显示区域 -->
          <div class="mathml-section">
            <h5>📝 MathML 中间结果:</h5>
            <div class="mathml-container">
              <textarea 
                id="mathml-content"
                readonly 
                value={comparisonData.mathmlContent}
                placeholder="MathML 内容将显示在这里..."
                class="mathml-textarea"
              ></textarea>
              <div class="mathml-info">
                长度: {comparisonData.mathmlContent.length} 字符
                <button 
                  on:click={() => {
                    if (comparisonData.mathmlContent) {
                      navigator.clipboard.writeText(comparisonData.mathmlContent);
                      showResult('✅ MathML 内容已复制到剪贴板', 'success');
                    }
                  }}
                  class="copy-mathml-btn"
                  disabled={!comparisonData.mathmlContent}
                >
                  📋 复制 MathML
                </button>
              </div>
            </div>
          </div>
          
          <div class="comparison-textareas">
            <div class="textarea-group">
              <label for="xsl-result">🌐 浏览器原生 XSL 结果:</label>
              <textarea 
                id="xsl-result"
                readonly 
                value={comparisonData.xslResult}
                placeholder="XSL 转换结果将显示在这里..."
                class="omml-textarea xsl-result"
              ></textarea>
              <div class="textarea-info">
                长度: {comparisonData.xslResult.length} 字符
              </div>
            </div>
            
            <div class="textarea-group">
              <label for="library-result">📚 mathml2omml 库结果:</label>
              <textarea 
                id="library-result"
                readonly 
                value={comparisonData.libraryResult}
                placeholder="mathml2omml 库转换结果将显示在这里..."
                class="omml-textarea library-result"
              ></textarea>
              <div class="textarea-info">
                长度: {comparisonData.libraryResult.length} 字符
              </div>
            </div>
          </div>
          
          <div class="comparison-actions">
            <button 
              on:click={() => {
                if (comparisonData.xslResult) {
                  navigator.clipboard.writeText(comparisonData.xslResult);
                  showResult('✅ XSL 结果已复制到剪贴板', 'success');
                }
              }}
              class="copy-btn"
              disabled={!comparisonData.xslResult}
            >
              📋 复制 XSL 结果
            </button>
            
            <button 
              on:click={() => {
                if (comparisonData.libraryResult) {
                  navigator.clipboard.writeText(comparisonData.libraryResult);
                  showResult('✅ mathml2omml 结果已复制到剪贴板', 'success');
                }
              }}
              class="copy-btn"
              disabled={!comparisonData.libraryResult}
            >
              📋 复制库结果
            </button>
            
            <button 
              on:click={() => {
                comparisonData = {
                  xslResult: '',
                  libraryResult: '',
                  testFormula: '',
                  mathmlContent: ''
                };
                showResult('✅ 比较结果已清空', 'success');
              }}
              class="clear-btn"
            >
              🗑️ 清空比较
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .result {
    transition: all 0.3s ease;
  }
  
  .loading {
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
  
  .comparison-btn {
    margin: 5px;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .comparison-btn.browser-native {
    background-color: #4CAF50;
    color: white;
  }
  
  .comparison-btn.browser-native:hover:not(:disabled) {
    background-color: #45a049;
    transform: translateY(-1px);
  }
  
  .comparison-btn.mathml2omml {
    background-color: #2196F3;
    color: white;
  }
  
  .comparison-btn.mathml2omml:hover:not(:disabled) {
    background-color: #1976D2;
    transform: translateY(-1px);
  }
  
  .comparison-btn.compare {
    background-color: #FF9800;
    color: white;
  }
  
  .comparison-btn.compare:hover:not(:disabled) {
    background-color: #F57C00;
    transform: translateY(-1px);
  }
  
  .comparison-btn.clear {
    background-color: #f44336;
    color: white;
  }
  
  .comparison-btn.clear:hover:not(:disabled) {
    background-color: #d32f2f;
    transform: translateY(-1px);
  }
  
  .comparison-btn.cache {
    background-color: #9C27B0;
    color: white;
  }
  
  .comparison-btn.cache:hover:not(:disabled) {
    background-color: #7B1FA2;
    transform: translateY(-1px);
  }
  
  .comparison-btn.compare-methods {
    background-color: #FF5722;
    color: white;
  }
  
  .comparison-btn.compare-methods:hover:not(:disabled) {
    background-color: #E64A19;
    transform: translateY(-1px);
  }
  
  .comparison-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
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
  
  /* 比较结果显示样式 */
  .comparison-section {
    margin-top: 20px;
    padding: 15px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #f9f9f9;
  }
  
  .comparison-section h4 {
    margin: 0 0 15px 0;
    color: #333;
    font-size: 16px;
  }
  
  .comparison-info {
    margin-bottom: 15px;
    padding: 10px;
    background-color: #fff;
    border-radius: 6px;
    border: 1px solid #ddd;
  }
  
  .comparison-info p {
    margin: 5px 0;
    font-size: 14px;
  }
  
  /* MathML 显示区域样式 */
  .mathml-section {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #fff;
    border-radius: 6px;
    border: 1px solid #ddd;
  }
  
  .mathml-section h5 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 14px;
    font-weight: 600;
  }
  
  .mathml-container {
    position: relative;
  }
  
  .mathml-textarea {
    width: 100%;
    height: 150px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.4;
    resize: vertical;
    background-color: #f8f9fa;
    border-left: 4px solid #FF9800;
  }
  
  .mathml-info {
    margin-top: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #666;
  }
  
  .copy-mathml-btn {
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    background-color: #FF9800;
    color: white;
    cursor: pointer;
    font-size: 11px;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .copy-mathml-btn:hover:not(:disabled) {
    background-color: #F57C00;
    transform: translateY(-1px);
  }
  
  .copy-mathml-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  .comparison-textareas {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 15px;
  }
  
  .textarea-group {
    display: flex;
    flex-direction: column;
  }
  
  .textarea-group label {
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
    font-size: 14px;
  }
  
  .omml-textarea {
    width: 100%;
    height: 200px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.4;
    resize: vertical;
    background-color: #fff;
  }
  
  .omml-textarea.xsl-result {
    border-left: 4px solid #4CAF50;
  }
  
  .omml-textarea.library-result {
    border-left: 4px solid #2196F3;
  }
  
  .textarea-info {
    margin-top: 5px;
    font-size: 12px;
    color: #666;
    text-align: right;
  }
  
  .comparison-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  
  .copy-btn, .clear-btn {
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .copy-btn {
    background-color: #4CAF50;
    color: white;
  }
  
  .copy-btn:hover:not(:disabled) {
    background-color: #45a049;
    transform: translateY(-1px);
  }
  
  .clear-btn {
    background-color: #f44336;
    color: white;
  }
  
  .clear-btn:hover {
    background-color: #d32f2f;
    transform: translateY(-1px);
  }
  
  .copy-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .comparison-textareas {
      grid-template-columns: 1fr;
    }
    
    .comparison-actions {
      justify-content: center;
    }
  }
</style>
