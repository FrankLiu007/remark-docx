<script>
  import { onMount } from 'svelte';
  import { unified } from 'unified';
  import remarkParse from 'remark-parse';
  import remarkMath from 'remark-math';
  import remarkGfm from 'remark-gfm';
  import { remarkDocx, preprocessMathFormulas } from 'remark-docx';
  
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



  // 调试 w:oMath 重复包装问题
  async function debugOMathWrapping() {
    if (!markdownInput.trim()) {
      showResult('❌ 请输入 Markdown 内容', 'error');
      return;
    }

    try {
      isLoading = true;
      showResult('🔍 开始调试 w:oMath 重复包装问题...', 'loading');

      // 1. 预处理数学公式
      console.log('=== 步骤 1: 预处理数学公式 ===');
      const preprocessedContent = preprocessMathFormulas(markdownInput);
      console.log('预处理后的内容:', preprocessedContent);

      // 2. 提取数学公式并转换为 MathML
      console.log('=== 步骤 2: 提取数学公式 ===');
      const mathMatches = preprocessedContent.match(/\$([^$]+)\$/g);
      const blockMathMatches = preprocessedContent.match(/\$\$([\s\S]*?)\$\$/g);
      
      let allMathFormulas = [];
      if (mathMatches) {
        allMathFormulas = allMathFormulas.concat(mathMatches.map(match => match.slice(1, -1)));
      }
      if (blockMathMatches) {
        allMathFormulas = allMathFormulas.concat(blockMathMatches.map(match => match.slice(2, -2)));
      }
      
      console.log('发现的数学公式:', allMathFormulas);

      // 3. 使用 KaTeX 转换为 MathML
      console.log('=== 步骤 3: KaTeX → MathML 转换 ===');
      const katex = await import('katex');
      const mathmlResults = [];
      
      for (let i = 0; i < allMathFormulas.length; i++) {
        const latex = allMathFormulas[i];
        console.log(`转换公式 ${i + 1}: ${latex}`);
        
        const mathml = katex.default.renderToString(latex, {
          throwOnError: false,
          output: 'mathml'
        });
        
        const mathmlMatch = mathml.match(/<math[\s\S]*?<\/math>/i);
        if (mathmlMatch) {
          const mathmlContent = mathmlMatch[0];
          console.log(`MathML ${i + 1}:`, mathmlContent);
          mathmlResults.push({ latex, mathml: mathmlContent });
        }
      }

      // 4. 创建处理器并处理
      console.log('=== 步骤 4: 创建处理器 ===');
      const processor = unified()
        .use(remarkParse)
        .use(remarkMath)
        .use(remarkGfm)
        .use(remarkDocx, {
          output: 'blob',
          useOMML: true,
          useBrowserXSL: true,
          debugMode: true,
          imageResolver: async (url) => {
            return {
              data: new Uint8Array(0),
              width: 100,
              height: 100
            };
          }
        });

      // 5. 处理 markdown
      console.log('=== 步骤 5: 处理 markdown ===');
      const processedResult = await processor.process(preprocessedContent);
      const docxBlob = await processedResult.result;

      // 6. 分析 DOCX 结构
      console.log('=== 步骤 6: 分析 DOCX 结构 ===');
      const analysisResult = await analyzeDocxStructure(docxBlob);
      
      // 7. 生成详细的调试报告
      let debugReport = `🔍 w:oMath 重复包装详细调试报告\n\n`;
      debugReport += `📝 原始 Markdown 长度: ${markdownInput.length} 字符\n`;
      debugReport += `🔧 预处理后长度: ${preprocessedContent.length} 字符\n`;
      debugReport += `🧮 发现数学公式数量: ${allMathFormulas.length}\n`;
      debugReport += `📄 生成的 DOCX 大小: ${(docxBlob.size / 1024).toFixed(2)} KB\n\n`;
      
      // 显示每个数学公式的转换过程
      debugReport += `📋 数学公式转换过程:\n`;
      mathmlResults.forEach((result, index) => {
        debugReport += `  ${index + 1}. LaTeX: ${result.latex}\n`;
        debugReport += `     MathML 长度: ${result.mathml.length} 字符\n`;
      });
      debugReport += `\n`;
      
      if (analysisResult) {
        debugReport += `🧮 w:oMath 元素分析:\n`;
        debugReport += `  • 总数量: ${analysisResult.totalOMathElements}\n`;
        debugReport += `  • 是否有嵌套: ${analysisResult.hasNestedOMath ? '❌ 是' : '✅ 否'}\n\n`;
        
        if (analysisResult.hasNestedOMath) {
          debugReport += `⚠️ 发现问题: 存在嵌套的 w:oMath 元素!\n`;
          debugReport += `📋 可能的原因:\n`;
          debugReport += `  1. MathML → OMML 转换时重复包装\n`;
          debugReport += `  2. OMML 嵌入 DOCX 时再次包装\n`;
          debugReport += `  3. 模板或样式重复应用\n\n`;
          
          debugReport += `🔍 建议检查点:\n`;
          debugReport += `  • remark-docx 中的 MathML 处理逻辑\n`;
          debugReport += `  • XSL 转换模板\n`;
          debugReport += `  • DOCX 文档结构生成\n\n`;
        } else {
          debugReport += `✅ 未发现 w:oMath 嵌套问题\n`;
          debugReport += `💡 问题可能在其他地方，请检查生成的 DOCX 文件\n\n`;
        }
        
        debugReport += `📊 详细信息已输出到浏览器控制台\n`;
        debugReport += `💡 请打开开发者工具查看完整的调试信息`;
      } else {
        debugReport += `❌ 无法分析 DOCX 结构\n`;
        debugReport += `📊 请检查浏览器控制台获取更多信息`;
      }

      showResult(debugReport, analysisResult?.hasNestedOMath ? 'error' : 'success');

    } catch (err) {
      console.error('调试过程中出错:', err);
      showResult(`❌ 调试失败: ${err.message}\n\n错误详情:\n${err.stack || err.toString()}`, 'error');
    } finally {
      isLoading = false;
    }
  }

  // 分析 DOCX 结构的辅助函数
  async function analyzeDocxStructure(blob) {
    try {
      // 使用 JSZip 解压 DOCX 文件
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(blob);
      
      // 读取 document.xml
      const documentXml = await zipContent.file('word/document.xml')?.async('text');
      if (documentXml) {
        console.log('=== DOCX document.xml 内容 ===');
        console.log(documentXml);
        
        // 分析 w:oMath 元素
        const omathMatches = documentXml.match(/<w:oMath[\s\S]*?<\/w:oMath>/g);
        if (omathMatches) {
          console.log('=== 发现的 w:oMath 元素 ===');
          omathMatches.forEach((match, index) => {
            console.log(`w:oMath ${index + 1}:`, match);
            
            // 检查是否有嵌套的 w:oMath
            const nestedOMath = match.match(/<w:oMath[\s\S]*?<w:oMath/);
            if (nestedOMath) {
              console.log('⚠️ 发现嵌套的 w:oMath 元素!');
              console.log('嵌套位置:', nestedOMath);
              
              // 进一步分析嵌套结构
              const nestedCount = (match.match(/<w:oMath/g) || []).length;
              console.log(`嵌套层级: ${nestedCount} 层`);
            }
          });
          
          return {
            totalOMathElements: omathMatches.length,
            hasNestedOMath: omathMatches.some(match => match.match(/<w:oMath[\s\S]*?<w:oMath/)),
            omathElements: omathMatches,
            nestedCounts: omathMatches.map(match => (match.match(/<w:oMath/g) || []).length)
          };
        } else {
          console.log('未发现 w:oMath 元素');
          return { totalOMathElements: 0, hasNestedOMath: false, omathElements: [], nestedCounts: [] };
        }
      } else {
        console.log('无法读取 document.xml');
        return null;
      }
    } catch (error) {
      console.error('分析 DOCX 结构时出错:', error);
      return null;
    }
  }

  // 测试单个数学公式的转换过程
  async function testSingleFormula() {
    if (!markdownInput.trim()) {
      showResult('❌ 请输入 Markdown 内容', 'error');
      return;
    }

    try {
      isLoading = true;
      showResult('🧪 开始测试单个数学公式转换过程...', 'loading');

      // 1. 提取第一个数学公式
      const mathMatch = markdownInput.match(/\$([^$]+)\$/);
      if (!mathMatch) {
        showResult('❌ 未找到行内数学公式 ($...$)，请确保输入包含数学公式', 'error');
        return;
      }

      const latex = mathMatch[1];
      console.log('=== 测试公式 ===');
      console.log('LaTeX:', latex);

      // 2. 创建简单的测试 Markdown
      const testMarkdown = `# 测试文档\n\n这是一个测试公式：$${latex}$\n\n结束。`;
      console.log('测试 Markdown:', testMarkdown);

      // 3. 预处理
      const preprocessedContent = preprocessMathFormulas(testMarkdown);
      console.log('预处理后:', preprocessedContent);

      // 4. 使用 KaTeX 转换为 MathML
      const katex = await import('katex');
      const mathml = katex.default.renderToString(latex, {
        throwOnError: false,
        output: 'mathml'
      });
      
      const mathmlMatch = mathml.match(/<math[\s\S]*?<\/math>/i);
      const mathmlContent = mathmlMatch ? mathmlMatch[0] : '';
      console.log('=== MathML 转换结果 ===');
      console.log('完整输出:', mathml);
      console.log('提取的 MathML:', mathmlContent);

      // 5. 创建处理器并处理
      const processor = unified()
        .use(remarkParse)
        .use(remarkMath)
        .use(remarkGfm)
        .use(remarkDocx, {
          output: 'blob',
          useOMML: true,
          useBrowserXSL: true,
          debugMode: true,
          imageResolver: async (url) => {
            return {
              data: new Uint8Array(0),
              width: 100,
              height: 100
            };
          }
        });

      console.log('=== 开始处理 Markdown ===');
      const processedResult = await processor.process(preprocessedContent);
      const docxBlob = await processedResult.result;

      // 6. 分析结果
      console.log('=== 分析生成的 DOCX ===');
      const analysisResult = await analyzeDocxStructure(docxBlob);

      // 7. 生成测试报告
      let testReport = `🧪 单个公式转换测试报告\n\n`;
      testReport += `📝 测试公式: ${latex}\n`;
      testReport += `📏 MathML 长度: ${mathmlContent.length} 字符\n`;
      testReport += `📄 生成的 DOCX 大小: ${(docxBlob.size / 1024).toFixed(2)} KB\n\n`;
      
      if (analysisResult) {
        testReport += `🔍 分析结果:\n`;
        testReport += `  • w:oMath 元素数量: ${analysisResult.totalOMathElements}\n`;
        testReport += `  • 是否有嵌套: ${analysisResult.hasNestedOMath ? '❌ 是' : '✅ 否'}\n\n`;
        
        if (analysisResult.hasNestedOMath) {
          testReport += `⚠️ 发现嵌套问题!\n`;
          testReport += `📊 嵌套层级统计:\n`;
          analysisResult.nestedCounts.forEach((count, index) => {
            testReport += `  • 元素 ${index + 1}: ${count} 层嵌套\n`;
          });
          testReport += `\n`;
          
          testReport += `🔍 第一个嵌套元素预览:\n`;
          const firstNested = analysisResult.omathElements.find(match => 
            match.match(/<w:oMath[\s\S]*?<w:oMath/)
          );
          if (firstNested) {
            testReport += `\`\`\`xml\n${firstNested.substring(0, 500)}...\n\`\`\`\n\n`;
          }
        } else {
          testReport += `✅ 未发现嵌套问题\n\n`;
        }
        
        testReport += `📋 所有 w:oMath 元素:\n`;
        analysisResult.omathElements.forEach((element, index) => {
          testReport += `  ${index + 1}. 长度: ${element.length} 字符\n`;
        });
      } else {
        testReport += `❌ 无法分析 DOCX 结构\n`;
      }

      testReport += `\n📊 详细信息已输出到浏览器控制台\n`;
      testReport += `💡 请打开开发者工具查看完整的调试信息`;

      showResult(testReport, analysisResult?.hasNestedOMath ? 'error' : 'success');

    } catch (err) {
      console.error('测试过程中出错:', err);
      showResult(`❌ 测试失败: ${err.message}\n\n错误详情:\n${err.stack || err.toString()}`, 'error');
    } finally {
      isLoading = false;
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
            on:click={debugOMathWrapping}
            disabled={isLoading}
            class="comparison-btn debug-omath"
          >
            🔍 调试 w:oMath 包装
          </button>
          
          <button 
            on:click={testSingleFormula}
            disabled={isLoading}
            class="comparison-btn test-single"
          >
            🧪 测试单个公式
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
  
  .comparison-btn.debug-omath {
    background-color: #607D8B;
    color: white;
  }
  
  .comparison-btn.debug-omath:hover:not(:disabled) {
    background-color: #455A64;
    transform: translateY(-1px);
  }
  
  .comparison-btn.test-single {
    background-color: #795548;
    color: white;
  }
  
  .comparison-btn.test-single:hover:not(:disabled) {
    background-color: #5D4037;
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
