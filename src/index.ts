export { remarkDocx } from "./plugin";
export type { DocxOptions } from "./plugin";
export { preprocessMathFormulas, preprocessMathFormulasBatch } from "./mathPreprocessor";
export { clearXSLContentCache, compareConversionMethods } from "./latex-omml";

// 默认导出
export { remarkDocx as default } from "./plugin";
