/**
 * 数学公式预处理器 - 将 LaTeX 格式转换为 remark-math 支持的格式
 * 使用 mathFormulaDetector.ts 来检测和处理 \( 和 \[ 格式的数学公式
 */

import { detectMathFormulas, splitTextWithMathFormulas} from './mathFormulaDetector';

/**
 * 预处理文本，将 LaTeX 格式的数学公式转换为 remark-math 支持的格式
 * - \(...\) → $...$
 * - \[...\] → $$...$$
 * 
 * @param text 原始文本
 * @returns 预处理后的文本
 */
export function preprocessMathFormulas(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // 使用 mathFormulaDetector 检测所有数学公式
  const formulas = detectMathFormulas(text);
  
  if (formulas.length === 0) {
    // 没有检测到数学公式，直接返回原文本
    return text;
  }

  // 分割文本为公式和非公式部分 - 这种方法更清晰易懂
  const segments = splitTextWithMathFormulas(text);
  
  // 构建预处理后的文本
  let processedText = '';
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    
    if (!segment) continue;
    
    if (segment.type === 'text') {
      // 普通文本，直接添加
      processedText += segment.content;
    } else if (segment.type === 'formula' && segment.formula) {
      // 数学公式，根据类型转换为对应的格式
      const formula = segment.formula;
      
      if (formula.fullMatch.startsWith('\\(') && formula.fullMatch.endsWith('\\)')) {
        // LaTeX 行内公式 \(...\) → $...$
        processedText += `$${formula.latex}$`;
      } else if (formula.fullMatch.startsWith('\\[') && formula.fullMatch.endsWith('\\]')) {
        // LaTeX 块级公式 \[...\] → 根据内容决定使用 $ 还是 $$
        const trimmedLatex = formula.latex.trim();
        
        // 检查是否包含换行符，如果有则使用 $$ 格式，否则使用 $ 格式
        if (trimmedLatex.includes('\n')) {
          // 跨行公式，使用 $$ 格式
          // 检查前面是否需要添加空行
          const needsLeadingNewline = processedText.length > 0 && 
            !processedText.endsWith('\n');
          
          // 添加前置空行
          if (needsLeadingNewline) {
            processedText += '\n';
          }
          
          processedText += `$$\n${trimmedLatex}\n$$`;
          
          // 添加后置空行（确保公式后有空行）
          processedText += '\n';
        } else {
          // 单行公式，使用 $ 格式
          processedText += `$${trimmedLatex}$`;
        }
      } else if (formula.fullMatch.startsWith('$$') && formula.fullMatch.endsWith('$$')) {
        // 处理 $$...$$ 格式，根据内容决定使用 $ 还是 $$
        const trimmedLatex = formula.latex.trim();
        
        // 检查是否包含换行符，如果有则使用 $$ 格式，否则使用 $ 格式
        if (trimmedLatex.includes('\n')) {
          // 跨行公式，使用 $$ 格式
          // 检查前面是否需要添加空行
          const needsLeadingNewline = processedText.length > 0 && 
            !processedText.endsWith('\n');
          
          // 添加前置空行
          if (needsLeadingNewline) {
            processedText += '\n';
          }
          
          processedText += `$$\n${trimmedLatex}\n$$`;
          
          // 添加后置空行（确保公式后有空行）
          processedText += '\n';
        } else {
          // 单行公式，使用 $ 格式
          processedText += `$${trimmedLatex}$`;
        }
      }
      else {
        // 其他格式，检查是否需要格式化
        // $...$ 格式，保持原样
        processedText += segment.content;        
      }
    }
  }
  
  return processedText;
}

/**
 * 批量预处理多个文本段落
 * @param texts 文本数组
 * @returns 预处理后的文本数组
 */
export function preprocessMathFormulasBatch(texts: string[]): string[] {
  return texts.map(text => preprocessMathFormulas(text));
}

/**
 * 测试预处理功能
 */
export function testMathPreprocessor(): void {
  const testCases = [
    '这是一个行内公式 \\(x^2 + y^2 = z^2\\) 的示例',
    '这是一个块级公式：\\[\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}\\]',
    '混合格式：$x^2$ 和 \\(y^2\\) 以及 \\[z^2\\]',
    '复杂公式：\\(x = 1 \\quad \\text{和} \\quad x = \\frac{1}{2}\\)',
    '多个公式：\\(a^2 + b^2 = c^2\\) 和 \\[E = mc^2\\]',
    '没有公式的普通文本',
    '空字符串：',
    '只有公式：\\(x = 1\\)',
    '嵌套文本：这里有 \\(\\alpha + \\beta = \\gamma\\) 和一些文本，然后是 \\[\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}\\]'
  ];

  // 测试用例已移除 console.log 输出
  testCases.forEach((testCase) => {
    preprocessMathFormulas(testCase);
    // 静默测试，不输出到控制台
  });
}

/**
 * 验证预处理结果的正确性
 * @param original 原始文本
 * @param processed 预处理后的文本
 * @returns 验证结果
 */
export function validatePreprocessing(original: string, processed: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // 检查是否保留了所有非公式内容
  const originalFormulas = detectMathFormulas(original);
  const originalSegments = splitTextWithMathFormulas(original);
  
  // 提取原始文本中的非公式部分
  const originalTextParts = originalSegments
    .filter(seg => seg.type === 'text')
    .map(seg => seg.content);
  
  // 检查预处理后的文本是否包含所有原始文本部分
  for (const textPart of originalTextParts) {
    if (textPart.trim() && !processed.includes(textPart)) {
      issues.push(`丢失文本片段: "${textPart}"`);
    }
  }
  
  // 检查公式转换是否正确
  for (const formula of originalFormulas) {
    if (formula.fullMatch.startsWith('\\(') || formula.fullMatch.startsWith('\\[')) {
      // 检查是否被正确转换
      const expectedConversion = formula.fullMatch.startsWith('\\(') 
        ? `$${formula.latex}$` 
        : `$$${formula.latex}$$`;
      
      if (!processed.includes(expectedConversion)) {
        issues.push(`公式转换失败: "${formula.fullMatch}" 应转换为 "${expectedConversion}"`);
      }
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}
