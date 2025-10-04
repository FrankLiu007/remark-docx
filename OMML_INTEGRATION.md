# OMML 数学公式解析器集成

## 概述

为了解决 remark-docx 库中数学公式转换的兼容性问题，我们集成了基于 OMML (Office Math Markup Language) 的新解析器。这个解析器使用你项目中成熟的 `convertLatexToOMML` 和 `buildDocxElementFromOMML` 函数，提供更好的数学公式兼容性。

## 主要改进

1. **更好的兼容性**: 使用 KaTeX → MathML → OMML → ImportedXmlComponent 的转换链，与 docx 库完全兼容
2. **100% 兼容**: 通过 `ImportedXmlComponent` 直接插入 OMML，避免了 docx 库 MathRun 的限制
3. **向后兼容**: 保留原始解析器作为默认选项，通过 `useOMML` 选项启用新解析器

## 使用方法

### 1. 在 remark-docx 中使用

```typescript
import { unified } from 'unified';
import markdown from 'remark-parse';
import math from 'remark-math';
import docx from './src/plugin';

const processor = unified()
  .use(markdown)
  .use(math)
  .use(docx, {
    output: "blob",
    useOMML: true, // 启用 OMML 解析器
    imageResolver: async (url: string) => {
      return {
        data: new Uint8Array(0),
        width: 100,
        height: 100
      };
    }
  });

const result = await processor.process(markdownContent);
```

### 2. 在你的项目中使用

```typescript
import { 
  downloadChatAsDocxWithRemarkOMML, 
  downloadMessageAsDocxWithRemarkOMML 
} from './utils/remarkDocx';

// 导出聊天数据（使用 OMML 解析器）
await downloadChatAsDocxWithRemarkOMML(chatData);

// 导出单个消息（使用 OMML 解析器）
await downloadMessageAsDocxWithRemarkOMML(messageContent, 'filename.docx');
```

## 技术实现

### 新增文件

1. **`src/latex-omml.ts`**: 基于 OMML 的 LaTeX 解析器
2. **`test-omml.ts`**: 测试文件
3. **`OMML_INTEGRATION.md`**: 本文档

### 修改文件

1. **`src/plugin.ts`**: 添加 `useOMML` 选项支持
2. **`src/mdast-to-docx.ts`**: 
   - 添加 `useOMML` 选项到 `DocxOptions` 接口
   - 更新 `LatexParser` 类型定义
   - 修改 `buildMath` 和 `buildInlineMath` 函数以处理两种解析器类型

### 核心转换流程

```
LaTeX → KaTeX → MathML → OMML → ImportedXmlComponent → docx
```

1. **LaTeX 解析**: 使用 KaTeX 将 LaTeX 转换为 MathML
2. **MathML 转换**: 使用 `mathml2omml` 库转换为 OMML
3. **OMML 包装**: 使用 `ImportedXmlComponent.fromXmlString` 创建 docx 元素
4. **插入文档**: 直接作为 `ParagraphChild` 插入到 docx 文档中

## 优势

1. **完全兼容**: 使用 docx 库的原生 OMML 支持
2. **高质量渲染**: KaTeX 提供准确的数学公式渲染
3. **广泛支持**: 支持复杂的数学公式，包括矩阵、积分、分数等
4. **错误处理**: 完善的错误处理和回退机制

## 测试

运行测试文件来验证集成：

```bash
# 在 remark-docx 目录中
npx tsx test-omml.ts

# 在你的项目根目录中
npx tsx src/test-remark-docx-omml.ts
```

## 注意事项

1. 确保安装了必要的依赖：`katex`, `mathml2omml`
2. OMML 解析器可能比原始解析器稍慢，但提供更好的兼容性
3. 如果转换失败，会显示红色的错误文本作为回退
4. 建议在生产环境中测试各种数学公式以确保兼容性

## 未来改进

1. 添加更多 LaTeX 命令支持
2. 优化性能
3. 添加更多错误处理选项
4. 支持自定义 KaTeX 配置
