# remark-docx 开发环境

这个文档说明如何设置和使用 remark-docx 的开发环境。

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

这个命令会：
- 构建 remark-docx 库到 `dist/` 目录
- 复制测试文件到 `dist/` 目录
- 启动 HTTP 服务器在 `http://localhost:8080`
- 自动打开浏览器

### 3. 测试页面

访问以下页面进行测试：

- **`http://localhost:8080/test-dist.html`** - 简单的构建测试页面
- **`http://localhost:8080/browser-xslt-example.html`** - 完整的浏览器 XSLT 测试页面

## 📁 目录结构

```
remark-docx/
├── dist/                          # 构建输出目录
│   ├── remark-docx.js            # 构建后的库文件 (IIFE)
│   ├── remark-docx.esm.js        # 构建后的库文件 (ESM)
│   ├── test-dist.html            # 简单测试页面
│   ├── browser-xslt-example.html # 完整测试页面
│   ├── MML2OMML.XSL             # XSL 转换文件
│   └── test.md                   # 测试 Markdown 文件
├── src/                          # 源代码
├── example/                      # 示例文件
├── scripts/                      # 构建脚本
└── package.json                  # 项目配置
```

## 🔧 构建命令

### 构建库到 lib 目录（发布用）

```bash
pnpm build
```

### 构建库到 dist 目录（开发测试用）

```bash
pnpm build:dist
```

### 复制测试文件

```bash
pnpm copy:test
```

### 完整开发流程

```bash
pnpm dev
```

## 🧪 测试功能

### test-dist.html

简单的测试页面，包含：

- **库加载检查**: 验证所有必要的库是否正确加载
- **Markdown 转换**: 测试基本的 Markdown 到 DOCX 转换
- **数学公式支持**: 测试 LaTeX 数学公式的转换

### browser-xslt-example.html

完整的测试页面，包含：

- **XSLTProcessor 测试**: 使用浏览器原生 XSLT 功能
- **多种转换方案**: 支持 XSLTProcessor 和 mathml2omml 库
- **完整的 remark-docx 流程**: 模拟完整的库功能
- **实时预览**: 显示转换过程和结果

## 📝 使用示例

### 1. 基本 Markdown 转换

```markdown
# 标题

这是一个段落。

## 数学公式

行内公式：$E = mc^2$

块级公式：
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

### 2. 测试流程

1. 在测试页面的输入框中输入 Markdown 内容
2. 点击相应的转换按钮
3. 查看转换结果和下载的 DOCX 文件

## 🔍 调试

### 查看控制台日志

打开浏览器开发者工具，查看详细的转换日志：

- 库加载状态
- 转换过程
- 错误信息

### 检查构建文件

确保 `dist/` 目录包含所有必要的文件：

```bash
ls -la dist/
```

## 🚨 常见问题

### 1. 库未加载

**问题**: 控制台显示 "RemarkDocx 库未加载"

**解决**: 确保 `pnpm build:dist` 成功执行，检查 `dist/remark-docx.js` 文件是否存在

### 2. XSL 文件未找到

**问题**: 无法加载 MML2OMML.XSL 文件

**解决**: 确保 `pnpm copy:test` 成功执行，检查 `dist/MML2OMML.XSL` 文件是否存在

### 3. 数学公式转换失败

**问题**: 数学公式显示为文本而不是可编辑的公式

**解决**: 
- 检查 KaTeX 和 mathml2omml 库是否正确加载
- 查看控制台错误信息
- 尝试使用不同的数学公式格式

## 📚 相关文档

- [remark-docx API 文档](./docs/API.md)
- [LaTeX-OMML 转换库文档](./example/README-latex-omml.md)
- [示例说明](./example/README.md)
