# remark-docx 示例

这个目录包含了 remark-docx 的使用示例和测试文件。

## 文件说明

- `test.md` - 包含数学公式的测试 Markdown 文件
- `test-comprehensive.ts` - 综合测试脚本，演示如何使用 remark-docx 将 Markdown 转换为 DOCX

## 运行示例

```bash
# 进入 example 目录
cd example

# 运行综合测试
npx tsx test-comprehensive.ts
```

## 功能特性

测试脚本演示了以下功能：

1. **数学公式预处理** - 自动将 LaTeX 格式的数学公式转换为 remark-math 支持的格式
2. **OMML 支持** - 使用 OMML 解析器提供更好的数学公式兼容性
3. **完整的 Markdown 处理** - 支持标题、段落、列表、代码块等
4. **详细的日志输出** - 显示处理过程和统计信息

## 输出

运行测试后，会在当前目录生成一个带时间戳的 DOCX 文件：
- `comprehensive-omml-test-YYYY-MM-DDTHH-MM-SS.docx`

## 注意事项

- 确保已安装所有必要的依赖
- 测试文件会自动处理 `test.md` 中的数学公式
- 生成的 DOCX 文件可以在 Microsoft Word 中打开查看
