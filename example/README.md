# remark-docx 示例

这个目录包含了 remark-docx 的使用示例和测试文件，包括数学公式转换的多种方案。

## 文件说明

### 核心示例
- `test.md` - 包含数学公式的测试 Markdown 文件
- `test-comprehensive.ts` - 综合测试脚本，演示如何使用 remark-docx 将 Markdown 转换为 DOCX

### LaTeX-OMML 转换库
- `latex-omml-usage-example.ts` - LaTeX-OMML 库使用示例
- `mml2omml-xsl-example.ts` - 使用 XSL 文件的转换示例
- `README-latex-omml.md` - LaTeX-OMML 库详细文档

### 浏览器测试
- `browser-xslt-example.html` - 浏览器原生 XSLTProcessor 测试页面
- `MML2OMML.XSL` - 微软提供的 MathML 到 OMML 转换样式表

## 运行示例

### 基础测试
```bash
# 进入 example 目录
cd example

# 运行综合测试
npx tsx test-comprehensive.ts
```

### LaTeX-OMML 库测试
```bash
# 运行 LaTeX-OMML 库使用示例
npx tsx latex-omml-usage-example.ts

# 运行 XSL 转换示例
npx tsx mml2omml-xsl-example.ts
```

### 浏览器测试
```bash
# 启动本地服务器
npx http-server . -p 8080

# 然后访问浏览器测试页面
# http://localhost:8080/browser-xslt-example.html
```

## 功能特性

### 基础功能
1. **数学公式预处理** - 自动将 LaTeX 格式的数学公式转换为 remark-math 支持的格式
2. **OMML 支持** - 使用 OMML 解析器提供更好的数学公式兼容性
3. **完整的 Markdown 处理** - 支持标题、段落、列表、代码块等
4. **详细的日志输出** - 显示处理过程和统计信息

### 高级数学公式转换
1. **智能环境检测** - 自动检测浏览器/Node.js 环境并选择最佳转换方案
2. **双重转换方案**：
   - **浏览器环境**: 使用原生 XSLTProcessor + 微软 XSL 文件（推荐）
   - **Node.js 环境**: 使用 mathml2omml JavaScript 库
3. **自动回退机制** - XSLTProcessor 失败时自动回退到 mathml2omml 库
4. **缓存优化** - 环境检测结果缓存，避免重复判断

### 浏览器原生支持
1. **XSLTProcessor 集成** - 直接使用浏览器原生的 XSLT 处理能力
2. **微软 XSL 文件** - 使用官方提供的 MML2OMML.XSL 样式表
3. **实时测试界面** - 提供 Web 界面进行交互式测试
4. **多公式测试** - 支持各种复杂数学公式的转换测试

## 输出文件

运行测试后，会在当前目录生成带时间戳的文件：

### 基础测试
- `comprehensive-omml-test-YYYY-MM-DDTHH-MM-SS.docx` - 综合测试生成的 DOCX 文件

### LaTeX-OMML 库测试
- `latex-omml-usage-example-YYYY-MM-DDTHH-MM-SS.docx` - 库使用示例生成的 DOCX 文件
- `mml2omml-xsl-example-YYYY-MM-DDTHH-MM-SS.docx` - XSL 转换示例生成的 DOCX 文件

## 浏览器测试说明

### 访问测试页面
1. 启动本地服务器：`npx http-server . -p 8080`
2. 访问：`http://localhost:8080/browser-xslt-example.html`
3. 页面会自动加载 `MML2OMML.XSL` 文件
4. 可以测试各种数学公式的转换

### 测试功能
- **自动加载 XSL**: 页面加载时自动读取微软的 XSL 文件
- **实时转换**: 输入 MathML 立即看到 OMML 转换结果
- **预设示例**: 包含常用数学公式的测试用例
- **详细输出**: 显示转换状态、结果长度和完整 OMML

## 注意事项

### 环境要求
- **Node.js 环境**: 支持 mathml2omml 库方案
- **浏览器环境**: 支持两种方案，推荐使用 XSLTProcessor
- 确保已安装所有必要的依赖

### 文件依赖
- `MML2OMML.XSL` 文件必须存在于 example 目录中
- 测试文件会自动处理 `test.md` 中的数学公式
- 生成的 DOCX 文件可以在 Microsoft Word 中打开查看

### 性能优化
- 环境检测结果会被缓存，避免重复判断
- 浏览器环境中优先使用原生 XSLTProcessor
- 自动回退机制确保转换的可靠性
