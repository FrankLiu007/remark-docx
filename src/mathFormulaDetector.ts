/**
 * 数学公式检测器 - 使用状态机方式检测文本中的数学公式
 * 支持多种格式：$...$、$$...$$、\(...\)、\[...\]
 */

export interface MathFormula {
  fullMatch: string;    // 完整的匹配文本，如 "$x^2$"
  latex: string;        // LaTeX 内容，如 "x^2"
  startIndex: number;   // 在原文中的开始位置
  endIndex: number;     // 在原文中的结束位置
  type: 'inline' | 'display'; // 公式类型
}

export interface TextSegment {
  type: 'text' | 'formula';
  content: string;
  startIndex: number;
  endIndex: number;
  formula?: MathFormula; // 如果是公式类型，包含公式信息
}

/**
 * 使用状态机检测文本中的数学公式
 * @param text 要检测的文本
 * @returns 检测到的数学公式数组
 */
export function detectMathFormulas(text: string): MathFormula[] {
  const formulas: MathFormula[] = [];
  let i = 0;
  
  while (i < text.length) {
    const result = findNextMathFormula(text, i);
    if (result) {
      formulas.push(result);
      i = result.endIndex;
    } else {
      i++;
    }
  }
  
  return formulas;
}

/**
 * 从指定位置开始查找下一个数学公式
 * @param text 文本
 * @param startPos 开始位置
 * @returns 找到的数学公式或 null
 */
function findNextMathFormula(text: string, startPos: number): MathFormula | null {
  let i = startPos;
  
  while (i < text.length) {
    const char = text[i];
    
    // 优先检测块级公式 $$...$$，避免被行内 $...$ 误抢匹配
    if (char === '$' && i + 1 < text.length && text[i + 1] === '$') {
      const result = detectDisplayMath(text, i);
      if (result) return result;
    }
    
    // 检测行内公式 $...$
    if (char === '$') {
      const result = detectInlineMath(text, i);
      if (result) return result;
    }
    
    // 检测 LaTeX 行内公式 \(...\)
    if (char === '\\' && i + 1 < text.length && text[i + 1] === '(') {
      const result = detectLatexInlineMath(text, i);
      if (result) return result;
    }
    
    // 检测 LaTeX 块级公式 \[...\]
    if (char === '\\' && i + 1 < text.length && text[i + 1] === '[') {
      const result = detectLatexDisplayMath(text, i);
      if (result) return result;
    }
    
    i++;
  }
  
  return null;
}

/**
 * 检测行内数学公式 $...$
 */
function detectInlineMath(text: string, startPos: number): MathFormula | null {
  let i = startPos + 1; // 跳过开始的 $
  let latex = '';
  
  while (i < text.length) {
    const char = text[i];
    
    if (char === '$') {
      // 找到结束的 $
      if (latex.trim()) {
        return {
          fullMatch: text.substring(startPos, i + 1),
          latex: latex.trim(),
          startIndex: startPos,
          endIndex: i + 1,
          type: 'inline'
        };
      }
      return null; // 空的 $...$ 不算有效公式
    }
    
    latex += char;
    i++;
  }
  
  return null; // 没有找到结束的 $
}

/**
 * 检测块级数学公式 $$...$$ (转换为行内格式)
 */
function detectDisplayMath(text: string, startPos: number): MathFormula | null {
  let i = startPos + 2; // 跳过开始的 $$
  let latex = '';
  
  while (i < text.length) {
    const char = text[i];
    
    if (char === '$' && i + 1 < text.length && text[i + 1] === '$') {
      // 找到结束的 $$
      if (latex.trim()) {
        return {
          fullMatch: text.substring(startPos, i + 2),
          latex: latex.trim(),
          startIndex: startPos,
          endIndex: i + 2,
          type: 'inline' // 统一使用 inline 类型
        };
      }
      return null; // 空的 $$...$$ 不算有效公式
    }
    
    latex += char;
    i++;
  }
  
  return null; // 没有找到结束的 $$
}

/**
 * 检测 LaTeX 行内公式 \(...\)
 */
function detectLatexInlineMath(text: string, startPos: number): MathFormula | null {
  let i = startPos + 2; // 跳过开始的 \(
  let latex = '';
  
  while (i < text.length) {
    const char = text[i];
    
    if (char === '\\' && i + 1 < text.length && text[i + 1] === ')') {
      // 找到结束的 \)
      if (latex.trim()) {
        return {
          fullMatch: text.substring(startPos, i + 2),
          latex: latex.trim(),
          startIndex: startPos,
          endIndex: i + 2,
          type: 'inline'
        };
      }
      return null; // 空的 \(...\) 不算有效公式
    }
    
    latex += char;
    i++;
  }
  
  return null; // 没有找到结束的 \)
}

/**
 * 检测 LaTeX 块级公式 \[...\] (转换为行内格式)
 */
function detectLatexDisplayMath(text: string, startPos: number): MathFormula | null {
  let i = startPos + 2; // 跳过开始的 \[
  let latex = '';
  
  while (i < text.length) {
    const char = text[i];
    
    if (char === '\\' && i + 1 < text.length && text[i + 1] === ']') {
      // 找到结束的 \]
      if (latex.trim()) {
        return {
          fullMatch: text.substring(startPos, i + 2),
          latex: latex, // 保持原始格式，不移除换行符
          startIndex: startPos,
          endIndex: i + 2,
          type: 'inline' // 统一使用 inline 类型
        };
      }
      return null; // 空的 \[...\] 不算有效公式
    }
    
    latex += char;
    i++;
  }
  
  return null; // 没有找到结束的 \]
}

/**
 * 将文本分割为公式和非公式部分
 * @param text 原始文本
 * @returns 文本片段数组
 */
export function splitTextWithMathFormulas(text: string): TextSegment[] {
  const formulas = detectMathFormulas(text);
  const segments: TextSegment[] = [];
  
  if (formulas.length === 0) {
    // 没有公式，整个文本都是普通文本
    return [{
      type: 'text',
      content: text,
      startIndex: 0,
      endIndex: text.length
    }];
  }
  
  let currentIndex = 0;
  
  // 按开始位置排序
  const sortedFormulas = [...formulas].sort((a, b) => a.startIndex - b.startIndex);
  
  sortedFormulas.forEach((formula) => {
    // 添加公式前的文本片段
    if (currentIndex < formula.startIndex) {
      const textContent = text.substring(currentIndex, formula.startIndex);
      // 不要使用 trim()，保留所有空白字符以维持文本顺序
      segments.push({
        type: 'text',
        content: textContent,
        startIndex: currentIndex,
        endIndex: formula.startIndex
      });
    }
    
    // 添加公式片段
    segments.push({
      type: 'formula',
      content: formula.fullMatch,
      startIndex: formula.startIndex,
      endIndex: formula.endIndex,
      formula: formula
    });
    
    currentIndex = formula.endIndex;
  });
  
  // 添加最后一个公式后的文本片段
  if (currentIndex < text.length) {
    const textContent = text.substring(currentIndex);
    // 不要使用 trim()，保留所有空白字符以维持文本顺序
    segments.push({
      type: 'text',
      content: textContent,
      startIndex: currentIndex,
      endIndex: text.length
    });
  }
  
  return segments;
}

/**
 * 测试函数 - 验证数学公式检测和分割功能
 */
export function testMathFormulaDetector() {
  const testCases = [
    '这是一个公式 $x^2 + y^2 = z^2$ 的示例',
    '多个公式：$a^2 + b^2 = c^2$ 和 $E = mc^2$',
    '块级公式：$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$',
    'LaTeX 格式：\\(x = 1\\) 和 \\[y = 2\\]',
    '混合格式：$x^2$ 和 $$y^2$$ 以及 \\(z^2\\)',
    '空公式：$$$$ 和 $ $ 应该被忽略',
    '跨行测试：$x = 1\n+ 2$ 应该失败',
    '复杂公式：$x = 1 \\quad \\text{和} \\quad x = \\frac{1}{2}$'
  ];
  
  // 测试用例已移除 console.log 输出
  testCases.forEach((testCase) => {
    // 测试公式检测
    detectMathFormulas(testCase);
    
    // 测试文本分割
    splitTextWithMathFormulas(testCase);
    // 静默测试，不输出到控制台
  });
}


