import { ParagraphChild, ImportedXmlComponent, TextRun } from "docx";
import { mml2omml } from "mathml2omml";
import katex from "katex";
import { getEmbeddedXSLContent } from "./embedded-xsl";

// 浏览器环境类型声明
declare global {
  interface Window {
    XSLTProcessor: typeof XSLTProcessor;
    DOMParser: typeof DOMParser;
    XMLSerializer: typeof XMLSerializer;
  }
}

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
    // 使用更严格的检查，确保不会重复添加
    if (!cleanOmml.includes('<m:oMath') && !cleanOmml.includes('</m:oMath>')) {
      cleanOmml = `<m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">${cleanOmml}</m:oMath>`;
    }
    
    return cleanOmml;
  } catch (error) {
    console.warn('MathML to OMML conversion failed:', error);
    return null;
  }
}

/**
 * 使用浏览器原生 XSLTProcessor 将 MathML 转换为 OMML (同步版本)
 * 使用内嵌的 XSL 内容，不依赖外部文件
 */
function mathMLtoOMMLWithXSL(mathml: string, _xslPath?: string): string | null {

  
  try {
    // 检查是否在浏览器环境中
    if (!isBrowserEnvironment()) {
      console.error('❌ [mathMLtoOMMLWithXSL] XSLTProcessor 在此环境中不可用');
      return null;
    }
    
    
    // 使用内嵌的 XSL 内容
    const xslContent = getEmbeddedXSLContentLocal();
    if (!xslContent) {
      console.error('❌ [mathMLtoOMMLWithXSL] 无法获取内嵌 XSL 内容');
      return null;
    }
    
    
    // 创建 XSLTProcessor
    const processor = new XSLTProcessor();
    const serializer = new XMLSerializer();
    
    
    // 解析 XSL 样式表
    const xslDoc = new DOMParser().parseFromString(xslContent, 'text/xml');
    if (xslDoc.documentElement.nodeName === 'parsererror') {
      console.error('❌ [mathMLtoOMMLWithXSL] XSL 解析错误:', xslDoc.documentElement.textContent);
      throw new Error('XSL 解析错误: ' + xslDoc.documentElement.textContent);
    }
    
    
    // 解析 MathML
    const mathmlDoc = new DOMParser().parseFromString(mathml, 'text/xml');
    if (mathmlDoc.documentElement.nodeName === 'parsererror') {
      console.error('❌ [mathMLtoOMMLWithXSL] MathML 解析错误:', mathmlDoc.documentElement.textContent);
      throw new Error('MathML 解析错误: ' + mathmlDoc.documentElement.textContent);
    }
    
    
    // 导入样式表并执行转换
    processor.importStylesheet(xslDoc);
    
    const resultDoc = processor.transformToDocument(mathmlDoc);
    
    // 检查转换结果是否有效
    if (!resultDoc || !resultDoc.documentElement) {
      console.error('❌ [mathMLtoOMMLWithXSL] XSLTProcessor transformToDocument 返回无效结果');
      return null;
    }
    
    
    // 序列化结果
    const resultString = serializer.serializeToString(resultDoc);
    
    if (resultString && resultString.trim()) {
      return resultString.trim();
    }
    
    console.error('❌ [mathMLtoOMMLWithXSL] 序列化结果为空');
    return null;
  } catch (error) {
    console.error('❌ [mathMLtoOMMLWithXSL] XSLTProcessor MathML to OMML 转换失败:', error);
    return null;
  }
}

/**
 * 获取内嵌的 XSL 内容（带缓存）
 * 使用预编译的内嵌 XSL 内容，无需文件加载
 * 首次调用时读取并缓存，后续调用直接返回缓存内容
 */
function getEmbeddedXSLContentLocal(): string | null {
  // 如果已经缓存，直接返回
  if (_cachedXSLContent !== null) {
    return _cachedXSLContent;
  }
  
  try {
    const content = getEmbeddedXSLContent();
    if (content) {
      // 缓存内容
      _cachedXSLContent = content;
    } else {
      console.warn('❌ 内嵌 XSL 内容为空');
    }
    return content;
  } catch (error) {
    console.warn('❌ 无法获取内嵌 XSL 内容:', error);
    return null;
  }
}

/**
 * 清除 XSL 内容缓存
 * 用于测试或重新加载 XSL 内容
 */
export function clearXSLContentCache(): void {
  _cachedXSLContent = null;
}

/**
 * 比较两种转换方法的结果
 * 用于调试和验证差异
 */
export function compareConversionMethods(mathml: string): {
  xslResult: string | null;
  libraryResult: string | null;
  areSame: boolean;
  differences: string[];
} {
  
  // XSL 转换
  const xslResult = mathMLtoOMMLWithXSL(mathml);
  
  // mathml2omml 库转换
  const libraryResult = mathMLtoOMML(mathml);
  
  // 比较结果
  const areSame = xslResult === libraryResult;
  const differences: string[] = [];
  
  if (xslResult && libraryResult) {
    if (xslResult.length !== libraryResult.length) {
      differences.push(`长度不同: XSL=${xslResult.length}, 库=${libraryResult.length}`);
    }
    
    if (xslResult !== libraryResult) {
      differences.push('内容不同');
      // 找出第一个不同的字符位置
      const minLength = Math.min(xslResult.length, libraryResult.length);
      for (let i = 0; i < minLength; i++) {
        if (xslResult[i] !== libraryResult[i]) {
          differences.push(`第一个差异位置: ${i}`);
          differences.push(`XSL 字符: "${xslResult[i]}" (${xslResult.charCodeAt(i)})`);
          differences.push(`库字符: "${libraryResult[i]}" (${libraryResult.charCodeAt(i)})`);
          break;
        }
      }
    } else {
      differences.push('内容完全相同');
    }
  } else if (!xslResult && !libraryResult) {
    differences.push('两种方法都转换失败');
  } else {
    differences.push('只有一种方法转换成功');
  }
  
  
  return {
    xslResult,
    libraryResult,
    areSame,
    differences
  };
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
      console.error('❌ [convertOmml2Math] 根元素不是 m:oMath 或 m:oMathPara:', identifiedRootKey);
      throw new Error('识别到的 rootKey 不是 m:oMath 或 m:oMathPara');
    }
        
    // 使用 ImportedXmlComponent 正确解析 OMML XML
    const result = ImportedXmlComponent.fromXmlString(xmlString);
    
    
    // 返回根元素，这应该是一个正确的 Math 元素
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rootElement = (result as any).root[0];
    
    return rootElement;
  } catch (error) {
    console.error('❌ [convertOmml2Math] OMML XML 转换失败:', error);
    return null;
  }
}

/**
 * 转换方案类型
 */
export type ConversionMethod = 'mathml2omml' | 'xslt-processor';

/**
 * 转换方案常量
 */
export const ConversionMethod = {
  MATHML2OMML: 'mathml2omml' as const,  // 使用 mathml2omml 库
  XSLT_PROCESSOR: 'xslt-processor' as const  // 使用浏览器原生 XSLTProcessor
} as const;

// 缓存环境检测结果，避免重复判断
let _isBrowserEnvironment: boolean | null = null;
let _defaultConversionMethod: ConversionMethod | null = null;

// 缓存 XSL 内容，避免重复读取
let _cachedXSLContent: string | null = null;

/**
 * 检查是否在浏览器环境中（缓存结果）
 */
export function isBrowserEnvironment(): boolean {
  if (_isBrowserEnvironment === null) {
    _isBrowserEnvironment = typeof window !== 'undefined' && 
                           typeof window.XSLTProcessor !== 'undefined' &&
                           typeof window.DOMParser !== 'undefined' &&
                           typeof window.XMLSerializer !== 'undefined';
  }
  return _isBrowserEnvironment;
}

/**
 * 获取默认的转换方案（缓存结果）
 */
export function getDefaultConversionMethod(): ConversionMethod {
  if (_defaultConversionMethod === null) {
    _defaultConversionMethod = isBrowserEnvironment() ? ConversionMethod.XSLT_PROCESSOR : ConversionMethod.MATHML2OMML;
  }
  return _defaultConversionMethod;
}

/**
 * 将 LaTeX 转换为 OMML
 * @param latex LaTeX 字符串
 * @param displayMode 是否为显示模式
 * @param method 转换方案（如果不指定，会根据环境自动选择）
 * @param xslPath XSL 文件路径（仅在使用 XSLT_PROCESSOR 时需要）
 */
function convertLatexToOMML(
  latex: string, 
  displayMode: boolean = false, 
  method?: ConversionMethod,
  _xslPath?: string
): string | null {
  try {

    // 步骤1: LaTeX → MathML
    const mathml = latexToMathML(latex, displayMode);
    if (!mathml) {
      console.error('❌ [convertLatexToOMML] LaTeX → MathML 转换失败');
      return null;
    }
    
    
    // 步骤2: 确定转换方案（使用传入的 method 或默认方案）
    const conversionMethod = method || getDefaultConversionMethod();
    
    // 步骤3: MathML → OMML (根据选择的方案)
    let omml: string | null = null;
    
    if (conversionMethod === ConversionMethod.XSLT_PROCESSOR) {
      omml = mathMLtoOMMLWithXSL(mathml);
      if (!omml) {
        console.error('❌ [convertLatexToOMML] XSLTProcessor 转换失败，返回 null');
        // 暂时注释掉回退逻辑，让我们看看 XSL 转换是否真的失败
        // omml = mathMLtoOMML(mathml);
      } else {
        
      }
    } else {
      omml = mathMLtoOMML(mathml);
      if (omml) {
      } else {
        console.error('❌ [convertLatexToOMML] mathml2omml 库转换失败');
      }
    }
    
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
      console.error('❌ [buildDocxElementFromOMML] OMML 字符串为空');
      return null;
    }
    
    // 使用自定义的 convertOmml2Math 函数将 OMML 转换为 Math 元素
    const mathElement = convertOmml2Math(omml);
    if (mathElement) {

      return mathElement;
    }
    
    console.warn('⚠️ [buildDocxElementFromOMML] convertOmml2Math 失败，回退到文本显示');
    
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
    
    
    // 返回一个正确的 TextRun 对象而不是包含 type 属性的对象
    return new TextRun({
      text: displayText,
      font: 'Cambria Math',
      size: 22,
      italics: true,
      color: 'FF0000'
    }) as unknown as ParagraphChild;
    
  } catch (err) {
    console.warn('Failed to create Math element from OMML:', err);
    return null;
  }
}

/**
 * 基于 OMML 的 LaTeX 解析器
 * 返回格式与原始 LatexParser 兼容
 * @param value LaTeX 字符串
 * @param method 转换方案（如果不指定，会根据环境自动选择）
 * @param xslPath XSL 文件路径（仅在使用 XSLT_PROCESSOR 时需要）
 */
export function parseLatexOMML(
  value: string, 
  method?: ConversionMethod, 
  xslPath?: string
): ParagraphChild[][] {
  try {
    
    // 判断是否为块级公式
    const isDisplayMode = value.includes('\\begin{') || 
                         value.includes('\\end{') ||
                         value.includes('\\[') ||
                         value.includes('\\]');
    
    
    // 转换 LaTeX 到 OMML
    const omml = convertLatexToOMML(value, isDisplayMode, method, xslPath);
    if (!omml) {
      console.error('❌ [浏览器原生XSL] LaTeX → OMML 转换失败');
      // 转换失败，返回错误文本
      return [[new TextRun({
        text: `[LaTeX: ${value}]`,
        font: 'Courier New',
        size: 22,
        color: 'FF0000',
        italics: true
      }) as unknown as ParagraphChild]];
    }
    

    
    // 将 OMML 转换为 docx 元素
    const mathElement = buildDocxElementFromOMML(omml);
    if (!mathElement) {
      console.error('❌ [浏览器原生XSL] OMML → DOCX 元素转换失败');
      return [[new TextRun({
        text: `[LaTeX: ${value}]`,
        font: 'Courier New',
        size: 22,
        color: 'FF0000',
        italics: true
      }) as unknown as ParagraphChild]];
    }
    
    
    // 返回格式化的结果，每个段落包含一个数学元素
    return [[mathElement]];
    
  } catch (error) {
    console.error('❌ [浏览器原生XSL] OMML LaTeX parsing failed:', error);
    return [[new TextRun({
      text: `[LaTeX Error: ${value}]`,
      font: 'Courier New',
      size: 22,
      color: 'FF0000',
      italics: true
    }) as unknown as ParagraphChild]];
  }
}

/**
 * 使用 mathml2omml 库的同步便捷函数
 */
export function parseLatexOMMLWithLibrary(value: string): ParagraphChild[][] {
  try {
    
    // 判断是否为块级公式
    const isDisplayMode = value.includes('\\begin{') || 
                         value.includes('\\end{') ||
                         value.includes('\\[') ||
                         value.includes('\\]');
    
    // 使用 KaTeX 将 LaTeX 转换为 MathML
    const mathml = latexToMathML(value, isDisplayMode);
    if (!mathml) {
      // 转换失败，返回错误文本
      return [[new TextRun({
        text: `[LaTeX: ${value}]`,
        font: 'Courier New',
        size: 22,
        color: 'FF0000',
        italics: true
      }) as unknown as ParagraphChild]];
    }
    
    // 使用 mathml2omml 库将 MathML 转换为 OMML
    const omml = mathMLtoOMML(mathml);
    if (!omml) {
      return [[new TextRun({
        text: `[LaTeX: ${value}]`,
        font: 'Courier New',
        size: 22,
        color: 'FF0000',
        italics: true
      }) as unknown as ParagraphChild]];
    }
    
    // 将 OMML 转换为 docx 元素
    const mathElement = buildDocxElementFromOMML(omml);
    if (!mathElement) {
      return [[new TextRun({
        text: `[LaTeX: ${value}]`,
        font: 'Courier New',
        size: 22,
        color: 'FF0000',
        italics: true
      }) as unknown as ParagraphChild]];
    }
    
    return [[mathElement]];
  } catch (error) {
    console.warn('parseLatexOMMLWithLibrary failed:', error);
    return [[new TextRun({
      text: `[LaTeX Error: ${value}]`,
      font: 'Courier New',
      size: 22,
      color: 'FF0000',
      italics: true
    }) as unknown as ParagraphChild]];
  }
}

/**
 * 使用浏览器原生 XSLTProcessor 的同步便捷函数
 * @param value LaTeX 字符串
 * @param xslPath XSL 文件路径
 */
export function parseLatexOMMLWithXSL(value: string, _xslPath?: string): ParagraphChild[][] {
  try {
    
    // 判断是否为块级公式
    const isDisplayMode = value.includes('\\begin{') || 
                         value.includes('\\end{') ||
                         value.includes('\\[') ||
                         value.includes('\\]');
    
    // 使用 KaTeX 将 LaTeX 转换为 MathML
    const mathml = latexToMathML(value, isDisplayMode);
    if (!mathml) {
      // 转换失败，返回错误文本
      return [[new TextRun({
        text: `[LaTeX: ${value}]`,
        font: 'Courier New',
        size: 22,
        color: 'FF0000',
        italics: true
      }) as unknown as ParagraphChild]];
    }
    
    // 尝试使用浏览器原生 XSLTProcessor 转换（同步版本）
    
    let omml = mathMLtoOMMLWithXSL(mathml);
    
    if (!omml) {
      // 回退到 mathml2omml 库
      omml = mathMLtoOMML(mathml);
    }
    
    if (!omml) {
      return [[new TextRun({
        text: `[LaTeX: ${value}]`,
        font: 'Courier New',
        size: 22,
        color: 'FF0000',
        italics: true
      }) as unknown as ParagraphChild]];
    }
    
    // 将 OMML 转换为 docx 元素
    const mathElement = buildDocxElementFromOMML(omml);
    if (!mathElement) {
      return [[new TextRun({
        text: `[LaTeX: ${value}]`,
        font: 'Courier New',
        size: 22,
        color: 'FF0000',
        italics: true
      }) as unknown as ParagraphChild]];
    }
    
    return [[mathElement]];
  } catch (error) {
    console.warn('parseLatexOMMLWithXSL failed:', error);
    return [[new TextRun({
      text: `[LaTeX Error: ${value}]`,
      font: 'Courier New',
      size: 22,
      color: 'FF0000',
      italics: true
    }) as unknown as ParagraphChild]];
  }
}

/**
 * 直接获取 OMML 字符串的便捷函数
 * @param latex LaTeX 字符串
 * @param displayMode 是否为显示模式
 * @param method 转换方案（如果不指定，会根据环境自动选择）
 * @param xslPath XSL 文件路径
 */
export function getOMMLString(
  latex: string, 
  displayMode: boolean = false, 
  method?: ConversionMethod,
  xslPath?: string
): string | null {
  return convertLatexToOMML(latex, displayMode, method, xslPath);
}
