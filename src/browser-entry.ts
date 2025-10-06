// Browser entry point that exposes the complete unified ecosystem
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkDocx from './plugin';
import { preprocessMathFormulas, preprocessMathFormulasBatch } from './mathPreprocessor';

// Export everything needed for browser usage
export { preprocessMathFormulas, preprocessMathFormulasBatch };

// Create a convenience function for easy usage
export function createRemarkDocxProcessor(options: any = {}) {
  return unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkDocx, options);
}

// Export as default for backward compatibility
export default {
  unified,
  remarkParse,
  remarkMath,
  remarkGfm,
  remarkDocx,
  preprocessMathFormulas,
  preprocessMathFormulasBatch,
  createRemarkDocxProcessor
};
