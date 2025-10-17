import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createRemarkDocxProcessor } from '../src/index.js';
import { preprocessMathFormulas } from '../src/mathPreprocessor.js';

async function testComprehensive() {
  try {
    console.log('🚀 开始综合测试 (高度封装 API + OMML)...');
    
    // 读取 test.md 文件
    const testMdPath = join(__dirname, 'test.md');
    console.log(`📖 读取测试文件: ${testMdPath}`);
    
    const markdownContent = readFileSync(testMdPath, 'utf-8');
    console.log(`✅ 成功读取文件，内容长度: ${markdownContent.length} 字符`);
    
    // 预处理数学公式
    console.log('🔧 预处理数学公式...');
    const preprocessedContent = preprocessMathFormulas(markdownContent);
    console.log(`✅ 数学公式预处理完成，内容长度: ${preprocessedContent.length} 字符`);
    
    // 显示预处理前后的差异
    if (preprocessedContent !== markdownContent) {
      console.log('📝 检测到数学公式转换:');
      const originalLines = markdownContent.split('\n');
      const processedLines = preprocessedContent.split('\n');
      
      for (let i = 0; i < Math.max(originalLines.length, processedLines.length); i++) {
        const original = originalLines[i] || '';
        const processed = processedLines[i] || '';
        if (original !== processed) {
          console.log(`  行 ${i + 1}:`);
          console.log(`    原始: ${original}`);
          console.log(`    处理后: ${processed}`);
        }
      }
    } else {
      console.log('ℹ️ 未检测到需要预处理的数学公式');
    }
    
    // 构建完整的 Markdown 文档
    const fullMarkdownContent = `# 综合测试文档\n\n生成时间: ${new Date().toLocaleString('zh-CN')}\n\n---\n\n${preprocessedContent}`;
    
    // 使用 createRemarkDocxProcessor 创建处理器
    console.log('🔄 使用 createRemarkDocxProcessor 创建处理器...');
    const processor = createRemarkDocxProcessor({
      output: 'blob',  // 关键：指定输出为 blob
      useOMML: true,   // 启用 OMML 选项
      useBrowserXSL: false,
      imageResolver: async (url: string) => {
        // 简单的图片解析器，返回空数据
        return {
          image: new Uint8Array(0),
          width: 100,
          height: 100
        };
      }
    });
    
    // 处理并生成 DOCX
    console.log('🔄 处理 Markdown 内容...');
    const doc = await processor.process(fullMarkdownContent);
    console.log('✅ 处理器处理完成');
    
    // 处理结果（可能是 Promise）
    let docxResult = doc.result;
    if (docxResult && typeof docxResult.then === 'function') {
      console.log('结果是一个 Promise，正在等待解析...');
      docxResult = await docxResult;
    }
    
    if (!docxResult) {
      throw new Error('处理结果为空');
    }
    
    // 确保结果是 Blob 并转换为 Buffer
    let docxBuffer: Buffer;
    if (docxResult instanceof Blob) {
      // 将 Blob 转换为 Buffer
      const arrayBuffer = await docxResult.arrayBuffer();
      docxBuffer = Buffer.from(arrayBuffer);
      console.log('✅ 成功将 Blob 转换为 Buffer');
    } else if (docxResult instanceof Buffer) {
      docxBuffer = docxResult;
      console.log('✅ 结果已经是 Buffer 类型');
    } else if (typeof docxResult === 'string') {
      // 如果是字符串，转换为 Buffer
      docxBuffer = Buffer.from(docxResult, 'utf-8');
      console.log('✅ 成功将字符串转换为 Buffer');
    } else {
      console.error('❌ 无法保存文件，结果类型不支持:', typeof docxResult);
      throw new Error(`意外的结果类型: ${typeof docxResult}`);
    }
    
    // 生成输出文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const outputPath = join(process.cwd(), `comprehensive-high-level-api-${timestamp}.docx`);
    
    console.log(`💾 保存 DOCX 文件: ${outputPath}`);
    
    // 保存为 DOCX 文件
    writeFileSync(outputPath, docxBuffer);
    
    console.log('🎉 createRemarkDocxProcessor 综合测试完成！');
    console.log(`📄 输出文件: ${outputPath}`);
    console.log('✨ 使用 createRemarkDocxProcessor 高度封装 API');
    console.log('🎯 简化了复杂的 unified 配置流程');
    
    // 显示一些统计信息
    const lines = preprocessedContent.split('\n').length;
    const mathBlocks = (preprocessedContent.match(/\$\$[\s\S]*?\$\$/g) || []).length;
    const inlineMath = (preprocessedContent.match(/\$[^$]+\$/g) || []).length;
    
    console.log('\n📊 统计信息:');
    console.log(`- 总行数: ${lines}`);
    console.log(`- 数学块 ($$): ${mathBlocks}`);
    console.log(`- 行内数学 ($): ${inlineMath}`);
    console.log(`- 文件大小: ${(docxBuffer.length / 1024).toFixed(2)} KB`);
    
    console.log('\n🚀 高度封装 API 优势:');
    console.log('- ✅ 代码更简洁：简化复杂的 unified 配置流程');
    console.log('- ✅ 配置更简单：自动处理预处理和配置');
    console.log('- ✅ 维护更容易：统一的 API 接口');
    console.log('- ✅ 错误处理更好：内置错误处理机制');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
testComprehensive();
