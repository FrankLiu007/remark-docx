/**
 * 数学公式预处理器 - 将 LaTeX 格式转换为 remark-math 支持的格式
 * 使用 mathFormulaDetector.ts 来检测和处理 \( 和 \[ 格式的数学公式
 */

import { detectMathFormulas, splitTextWithMathFormulas, MathFormula, TextSegment } from './mathFormulaDetector';

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

  const formulas = detectMathFormulas(text);
  if (formulas.length === 0) {
    return text;
  }

  const segments = splitTextWithMathFormulas(text);
  let processedText = '';
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (!segment) continue;
    
    if (segment.type === 'text') {
      processedText += segment.content;
    } else if (segment.type === 'formula' && segment.formula) {
      const isInTable = isInTableContext(processedText, segments, i);
      processedText += formatFormula(segment.formula, isInTable, processedText);
    }
  }
  
  return processedText;
}

/**
 * 判断当前公式是否处于表格上下文中
 */
function isInTableContext(processedText: string, segments: TextSegment[], currentIndex: number): boolean {
  // 检查当前行是否包含表格分隔符
  const lastNewlineIndex = processedText.lastIndexOf('\n');
  const currentLinePart = lastNewlineIndex === -1 ? processedText : processedText.substring(lastNewlineIndex + 1);
  
  if (currentLinePart.includes('|')) return true;

  // 检查后继文本片段的第一行是否包含表格分隔符
  for (let j = currentIndex + 1; j < segments.length; j++) {
    const nextSeg = segments[j];
    if (nextSeg && nextSeg.type === 'text') {
      const firstLineOfNextText = nextSeg.content.split('\n')[0] || '';
      if (firstLineOfNextText.includes('|')) return true;
      break;
    }
  }

  return false;
}

/**
 * 格式化单个数学公式
 */
function formatFormula(formula: MathFormula, isInTable: boolean, prevText: string): string {
  const { fullMatch, latex } = formula;

  if (isInTable) {
    // 表格内强制压缩为单行 inline 格式，并移除多余空白
    const flatLatex = latex.replace(/\s+/g, ' ').trim();
    return `$${flatLatex}$`;
  }

  if (fullMatch.startsWith('\\(') && fullMatch.endsWith('\\)')) {
    // \(...\) -> $...$
    return `$${latex}$`;
  }

  if (fullMatch.startsWith('\\[') && fullMatch.endsWith('\\]')) {
    const trimmedLatex = latex.trim();
    // 跨行使用 display math，单行使用 inline math
    return trimmedLatex.includes('\n') 
      ? formatDisplayMath(trimmedLatex, prevText) 
      : `$${trimmedLatex}$`;
  }

  if (fullMatch.startsWith('$$') && fullMatch.endsWith('$$')) {
    // $$...$$ -> 统一使用 display math 处理
    return formatDisplayMath(latex.trim(), prevText);
  }

  // 默认保持原样 (如已经是 $...$ 格式)
  return fullMatch;
}

/**
 * 格式化块级数学公式 (Display Math)，确保前后有正确的换行符
 */
function formatDisplayMath(latex: string, prevText: string): string {
  let result = '';
  
  // 检查是否需要前置换行
  if (prevText.length > 0 && !prevText.endsWith('\n')) {
    result += '\n';
  }
  
  result += `$$\n${latex}\n$$`;
  
  // 块级公式后通常需要跟一个换行符
  result += '\n';
  
  return result;
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
