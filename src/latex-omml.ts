import { ParagraphChild, ImportedXmlComponent } from "docx";
import { mml2omml } from "mathml2omml";
import katex from "katex";

// KaTeX 配置
const KATEX_CONFIG = {
  throwOnError: false,
  errorColor: '#cc0000',
  strict: false,
  trust: false,
  macros: {
    "\\f": "#1f(#2)"
  }
};

/**
 * 识别 OMML XML 的根元素 key
 */
function identifyRootKey(xmlString: string): string | null {
  const match = xmlString.match(/<([^>\s]+)/);
  return match ? (match[1] ?? null) : null;
}

/**
 * 使用 KaTeX 将 LaTeX 转换为 MathML
 */
function latexToMathML(latex: string, displayMode: boolean = false): string | null {
  try {
    const mathml = katex.renderToString(latex, {
      ...KATEX_CONFIG,
      output: 'mathml',
      displayMode: displayMode
    });
    
    const match = mathml.match(/<math[\s\S]*?<\/math>/i);
    if (match) {
      return match[0];
    } else {
      console.warn('No MathML found in KaTeX output');
      return null;
    }
  } catch (error) {
    console.warn('KaTeX LaTeX to MathML conversion failed:', error);
    return null;
  }
}

/**
 * 使用 mathml2omml 库将 MathML 转换为 OMML
 */
function mathMLtoOMML(mathml: string): string | null {
  try {
    const omml = mml2omml(mathml, { disableDecode: true });
    if (!omml) {
      return null;
    }
    
    // 确保 OMML 结构正确，避免嵌套的 m:oMath 元素
    let cleanOmml = omml.trim();
    
    // 如果 OMML 已经包含完整的 m:oMath 结构，直接返回
    if (cleanOmml.startsWith('<m:oMath') && cleanOmml.endsWith('</m:oMath>')) {
      return cleanOmml;
    }
    
    // 如果 OMML 不包含 m:oMath 包装，添加它
    if (!cleanOmml.includes('<m:oMath')) {
      cleanOmml = `<m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">${cleanOmml}</m:oMath>`;
    }
    
    return cleanOmml;
  } catch (error) {
    console.warn('MathML to OMML conversion failed:', error);
    return null;
  }
}

/**
 * 将 OMML 转换为 docx Math 元素
 * 使用正确的方法避免嵌套问题
 */
function convertOmml2Math(ommlString: string): ParagraphChild | null {
  try {
    const xmlString = ommlString.trim();
    const identifiedRootKey = identifyRootKey(xmlString);
    
    if (identifiedRootKey !== "m:oMath" && identifiedRootKey !== "m:oMathPara") {
      throw new Error('识别到的 rootKey 不是 m:oMath 或 m:oMathPara');
    }
    
    // 使用 ImportedXmlComponent 正确解析 OMML XML
    const result = ImportedXmlComponent.fromXmlString(xmlString);
    
    // 返回根元素，这应该是一个正确的 Math 元素
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (result as any).root[0];
  } catch (error) {
    console.error('OMML XML 转换失败:', error);
    return null;
  }
}

/**
 * 将 LaTeX 转换为 OMML
 */
function convertLatexToOMML(latex: string, displayMode: boolean = false): string | null {
  try {
    // 步骤1: LaTeX → MathML
    const mathml = latexToMathML(latex, displayMode);
    if (!mathml) {
      console.warn('Failed to convert LaTeX to MathML');
      return null;
    }
    
    // 步骤2: MathML → OMML
    const omml = mathMLtoOMML(mathml);
    if (!omml) {
      console.warn('Failed to convert MathML to OMML');
      return null;
    }
    
    return omml;
  } catch (error) {
    console.error('LaTeX to OMML conversion failed:', error);
    return null;
  }
}

/**
 * 将 OMML 字符串包装成可插入的段落子元素
 */
function buildDocxElementFromOMML(omml: string): ParagraphChild | null {
  try {
    if (!omml) {
      console.warn('OMML 字符串为空');
      return null;
    }
    
    // 使用自定义的 convertOmml2Math 函数将 OMML 转换为 Math 元素
    const mathElement = convertOmml2Math(omml);
    if (mathElement) {
      return mathElement;
    }
    
    // 回退到文本显示
    const textMatch = omml.match(/<m:t[^>]*>([^<]*)<\/m:t>/);
    let displayText = textMatch ? textMatch[1] : '';
    
    if (!displayText) {
      const mathTextMatch = omml.match(/<m:r[^>]*>.*?<m:t[^>]*>([^<]*)<\/m:t>.*?<\/m:r>/);
      if (mathTextMatch) {
        displayText = mathTextMatch[1];
      }
    }
    
    if (!displayText) {
      displayText = '[数学公式转换失败]';
    }
    
    return {
      type: 'textRun',
      text: displayText,
      font: 'Cambria Math',
      size: 22,
      italics: true,
      color: 'red'
    } as unknown as ParagraphChild;
    
  } catch (err) {
    console.warn('Failed to create Math element from OMML:', err);
    return null;
  }
}

/**
 * 基于 OMML 的 LaTeX 解析器
 * 返回格式与原始 LatexParser 兼容
 */
export function parseLatexOMML(value: string): ParagraphChild[][] {
  try {
    // 判断是否为块级公式
    const isDisplayMode = value.includes('\\begin{') || 
                         value.includes('\\end{') ||
                         value.includes('\\[') ||
                         value.includes('\\]');
    
    // 转换 LaTeX 到 OMML
    const omml = convertLatexToOMML(value, isDisplayMode);
    if (!omml) {
      // 转换失败，返回错误文本
      return [[{
        type: 'textRun',
        text: `[LaTeX: ${value}]`,
        font: 'Courier New',
        size: 22,
        color: 'red',
        italics: true
      } as unknown as ParagraphChild]];
    }
    
    // 将 OMML 转换为 docx 元素
    const mathElement = buildDocxElementFromOMML(omml);
    if (!mathElement) {
      return [[{
        type: 'textRun',
        text: `[LaTeX: ${value}]`,
        font: 'Courier New',
        size: 22,
        color: 'red',
        italics: true
      } as unknown as ParagraphChild]];
    }
    
    // 返回格式化的结果，每个段落包含一个数学元素
    return [[mathElement]];
    
  } catch (error) {
    console.error('OMML LaTeX parsing failed:', error);
    return [[{
      type: 'textRun',
      text: `[LaTeX Error: ${value}]`,
      font: 'Courier New',
      size: 22,
      color: 'red',
      italics: true
    } as unknown as ParagraphChild]];
  }
}
