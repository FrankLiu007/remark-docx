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
      return null;
    }
  } catch (error) {
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
      return null;
    }
    
    
    // 使用内嵌的 XSL 内容
    const xslContent = getEmbeddedXSLContentLocal();
    if (!xslContent) {
      return null;
    }
    
    
    // 创建 XSLTProcessor
    const processor = new XSLTProcessor();
    const serializer = new XMLSerializer();
    
    
    // 解析 XSL 样式表
    const xslDoc = new DOMParser().parseFromString(xslContent, 'text/xml');
    if (xslDoc.documentElement.nodeName === 'parsererror') {
      throw new Error('XSL 解析错误: ' + xslDoc.documentElement.textContent);
    }
    
    
    // 解析 MathML
    const mathmlDoc = new DOMParser().parseFromString(mathml, 'text/xml');
    if (mathmlDoc.documentElement.nodeName === 'parsererror') {
      throw new Error('MathML 解析错误: ' + mathmlDoc.documentElement.textContent);
    }
    
    
    // 导入样式表并执行转换
    processor.importStylesheet(xslDoc);
    
    const resultDoc = processor.transformToDocument(mathmlDoc);
    
    // 检查转换结果是否有效
    if (!resultDoc || !resultDoc.documentElement) {
      return null;
    }
    
    
    // 序列化结果
    const resultString = serializer.serializeToString(resultDoc);
    
    if (resultString && resultString.trim()) {
      return resultString.trim();
    }
    
    return null;
  } catch (error) {
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
    }
    return content;
  } catch (error) {
    return null;
  }
}



/**
 * 将 OMML 转换为 docx Math 元素
 * 确保数学公式被正确包装在 w:r 元素内
 */
function convertOmml2Math(ommlString: string): ParagraphChild | null {
  try {
    if (!ommlString || !ommlString.trim()) {
      return null;
    }

    // 使用 ImportedXmlComponent 正确解析 OMML XML
    const result = ImportedXmlComponent.fromXmlString(ommlString);
    
    // 获取根元素
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rootElement = (result as any).root[0];
 
    if (rootElement && rootElement.rootKey === 'm:oMath') {
      // 直接返回 rootElement，它已经是一个完整的 m:oMath 元素
      // 不需要再包装在 Math 中，因为 rootElement 本身就是正确的 OMML 结构
      return rootElement as any;
    }
    
    return null;
  } catch (error) {
    console.error('convertOmml2Math 转换错误:', error);
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

// 缓存 XSL 内容，避免重复读取
let _cachedXSLContent: string | null = null;

/**
 * 检查是否在浏览器环境中（缓存结果）
 */
function isBrowserEnvironment(): boolean {
  if (_isBrowserEnvironment === null) {
    _isBrowserEnvironment = typeof window !== 'undefined' && 
                           typeof window.XSLTProcessor !== 'undefined' &&
                           typeof window.DOMParser !== 'undefined' &&
                           typeof window.XMLSerializer !== 'undefined';
  }
  return _isBrowserEnvironment;
}



/**
 * 将 OMML 字符串包装成可插入的段落子元素
 */
function buildDocxElementFromOMML(omml: string): ParagraphChild | null {
  try {

    
    if (!omml) {
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
    
    
    // 返回一个正确的 TextRun 对象而不是包含 type 属性的对象
    return new TextRun({
      text: displayText,
      font: 'Cambria Math',
      size: 22,
      italics: true,
      color: 'FF0000'
    }) as unknown as ParagraphChild;
    
  } catch (err) {
    return null;
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
                         value.includes('\\]') ||
                         value.includes('$$');
    
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
                         value.includes('\\]') ||
                         value.includes('$$');
    
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
    return [[new TextRun({
      text: `[LaTeX Error: ${value}]`,
      font: 'Courier New',
      size: 22,
      color: 'FF0000',
      italics: true
    }) as unknown as ParagraphChild]];
  }
}

