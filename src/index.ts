import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';

import { remarkDocx } from "./plugin";
import type { DocxOptions } from "./plugin";
import { preprocessMathFormulas, preprocessMathFormulasBatch } from "./mathPreprocessor";
import type { ImageData } from './mdast-to-docx';

export { remarkDocx };
export type { DocxOptions };
export { preprocessMathFormulas, preprocessMathFormulasBatch };

// 高度封装 API 类型定义
export interface HighLevelDocxOptions extends Partial<Omit<DocxOptions, 'imageResolver' | 'output'>> {
  imageResolver?: DocxOptions['imageResolver'];
  output?: 'buffer' | 'blob';
}

export interface ProcessorResult {
  result: Buffer | Blob | string;
  messages?: any[];
}

/**
 * 高度封装的 DOCX 处理器创建函数
 * 简化了 unified 配置流程，提供一站式解决方案
 */
export function createRemarkDocxProcessor(options: HighLevelDocxOptions = {}) {
  // 合并默认选项
  const defaultOptions: DocxOptions = {
    title: 'Document',
    subject: '',
    keywords: '',
    description: '',
    revision: 1,
    styles: {},
    background: undefined,
    output: 'blob',
    useOMML: true,
    useBrowserXSL: false,
    imageResolver: async (_url: string): Promise<ImageData> => {
      // 简单的图片解析器，返回空数据
      return {
        image: new Uint8Array(0),
        width: 100,
        height: 100
      };
    }
  };

  const mergedOptions: DocxOptions = { ...defaultOptions, ...options };

  // 创建 unified 处理器
  const processor = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkDocx, mergedOptions);

  return processor;
}

/**
 * 便捷的 Markdown 转 DOCX 函数
 * 一步完成预处理、处理和返回结果
 */
export async function markdownToDocx(markdown: string, options: HighLevelDocxOptions = {}): Promise<ProcessorResult> {
  const processor = createRemarkDocxProcessor(options);
  
  // 预处理数学公式
  const preprocessedContent = preprocessMathFormulas(markdown);
  
  // 处理 Markdown
  const result = await processor.process(preprocessedContent);
  
  // 转换结果格式以匹配 ProcessorResult 接口
  return {
    result: result.result as Buffer | Blob | string,
    messages: result.messages
  };
}

// 默认导出
export { remarkDocx as default } from "./plugin";
