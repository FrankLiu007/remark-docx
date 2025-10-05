import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkDocx from '../src/index.js';
import { preprocessMathFormulas } from '../src/mathPreprocessor.js';

async function testComprehensive() {
  try {
    console.log('🚀 开始综合测试 (启用 OMML)...');
    
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
    
    // 使用 unified 处理 markdown
    console.log('🔄 使用 unified 处理 markdown...');
    const processor = unified()
      .use(remarkParse)
      .use(remarkMath)
      .use(remarkGfm)
      .use(remarkDocx, {
        output: 'blob',  // 关键：指定输出为 blob
        useOMML: true,   // 启用 OMML 选项
        imageResolver: async (url: string) => {
          // 简单的图片解析器，返回空数据
          return {
            data: new Uint8Array(0),
            width: 100,
            height: 100
          };
        }
      });
    const result = await processor.process(preprocessedContent);
    
    console.log('✅ remark 处理完成');
    console.log('结果类型:', typeof result.result);
    console.log('结果构造函数:', result.result?.constructor?.name);
    
    // 等待 Promise 解析
    const actualResult = await result.result;
    console.log('解析后结果类型:', typeof actualResult);
    console.log('解析后结果构造函数:', actualResult?.constructor?.name);
    
    // 检查结果是否为 Blob
    if (!actualResult) {
      throw new Error('Processor returned no result');
    }
    
    let docxBuffer: Buffer;
    if (actualResult instanceof Blob) {
      // 将 Blob 转换为 Buffer
      const arrayBuffer = await actualResult.arrayBuffer();
      docxBuffer = Buffer.from(arrayBuffer);
    } else if (actualResult instanceof Buffer) {
      docxBuffer = actualResult;
    } else {
      console.error('❌ 无法保存文件，结果类型不支持:', typeof actualResult);
      throw new Error(`Unexpected result type: ${typeof actualResult}`);
    }
    
    // 生成输出文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const outputPath = join(process.cwd(), `comprehensive-omml-test-${timestamp}.docx`);
    
    console.log(`💾 保存 DOCX 文件: ${outputPath}`);
    
    // 保存为 DOCX 文件
    writeFileSync(outputPath, docxBuffer);
    
    console.log('🎉 综合测试完成！');
    console.log(`📄 输出文件: ${outputPath}`);
    console.log('✨ 使用 OMML 格式处理数学公式');
    
    // 显示一些统计信息
    const lines = preprocessedContent.split('\n').length;
    const mathBlocks = (preprocessedContent.match(/\$\$[\s\S]*?\$\$/g) || []).length;
    const inlineMath = (preprocessedContent.match(/\$[^$]+\$/g) || []).length;
    
    console.log('\n📊 统计信息:');
    console.log(`- 总行数: ${lines}`);
    console.log(`- 数学块 ($$): ${mathBlocks}`);
    console.log(`- 行内数学 ($): ${inlineMath}`);
    console.log(`- 文件大小: ${(docxBuffer.length / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
testComprehensive();
