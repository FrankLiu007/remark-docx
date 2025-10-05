import { unified } from 'unified';
import markdown from 'remark-parse';
import gfm from 'remark-gfm';
import frontmatter from 'remark-frontmatter';
import math from 'remark-math';
import docx from './src/plugin';

// 测试用的 markdown 内容
const testMarkdown = `
# 数学公式测试

## 行内公式
这是一个行内公式：$E = mc^2$，还有另一个：$\\alpha + \\beta = \\gamma$

## 块级公式
这是一个块级公式：

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

还有另一个块级公式：

$$
\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}
$$

## 复杂公式
分数和根号：

$$
\\frac{a}{b} + \\sqrt{x^2 + y^2} = \\frac{\\sqrt{a^2 + b^2}}{\\sqrt{x^2 + y^2}}
$$

矩阵：

$$
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
$$
`;

async function testOMMLParser() {
  console.log('测试 OMML 解析器...');
  
  // 创建使用 OMML 解析器的处理器
  const processor = unified()
    .use(markdown)
    .use(gfm)
    .use(frontmatter)
    .use(math)
    .use(docx as any, {
      output: "blob",
      useOMML: true, // 启用 OMML 解析器
      imageResolver: async (_url: string) => {
        // 简单的图片解析器，用于测试
        return {
          data: new Uint8Array(0),
          width: 100,
          height: 100
        };
      }
    });

  try {
    const result = await processor.process(testMarkdown);
    console.log('✅ OMML 解析器测试成功！');
    console.log('结果类型:', typeof result.result);
    console.log('结果构造函数:', result.result?.constructor?.name);
    
    // 等待 Promise 解析
    const actualResult = await result.result;
    console.log('解析后结果类型:', typeof actualResult);
    console.log('解析后结果构造函数:', actualResult?.constructor?.name);
    console.log('结果大小:', actualResult instanceof Blob ? actualResult.size : 'N/A');
    
    // 保存测试结果
    const fs = await import('fs');
    const path = await import('path');
    
    if (actualResult instanceof Blob) {
      const buffer = Buffer.from(await actualResult.arrayBuffer());
      const filename = `omml-test-${new Date().toISOString().replace(/[:.]/g, '-')}.docx`;
      const filepath = path.join(process.cwd(), filename);
      fs.writeFileSync(filepath, buffer);
      console.log('📄 OMML 测试文件已保存:', filepath);
    } else if (actualResult instanceof Buffer) {
      const filename = `omml-test-${new Date().toISOString().replace(/[:.]/g, '-')}.docx`;
      const filepath = path.join(process.cwd(), filename);
      fs.writeFileSync(filepath, actualResult);
      console.log('📄 OMML 测试文件已保存:', filepath);
    } else {
      console.log('❌ 无法保存文件，结果类型不支持:', typeof actualResult);
    }
  } catch (error) {
    console.error('❌ OMML 解析器测试失败:', error);
  }
}



// 运行测试
async function runTests() {
  await testOMMLParser();

}

runTests().catch(console.error);
