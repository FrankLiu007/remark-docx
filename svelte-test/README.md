# Remark-Docx Svelte Test

这是一个基于 Svelte + Vite 的测试环境，用于测试 remark-docx 库的完整功能。

## 特点

- ✅ **简单易用**: 基于 Svelte 的现代开发体验
- ✅ **模块化**: 直接使用 ES 模块导入，无需处理全局变量
- ✅ **热重载**: Vite 提供快速的热重载开发体验
- ✅ **类型安全**: 支持 TypeScript 类型检查
- ✅ **完整功能**: 测试 remark-docx 的所有功能

## 快速开始

1. **安装依赖**:
   ```bash
   cd remark-docx/example/svelte-test
   npm install
   ```

2. **启动开发服务器**:
   ```bash
   npm run dev
   ```

3. **打开浏览器**: 访问 http://localhost:3000

## 功能测试

### 1. 数学公式处理
- 行内数学公式: `$E = mc^2$`
- 块级数学公式: `$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$`
- 复杂公式: 泰勒级数、薛定谔方程等

### 2. Markdown 功能
- 标题 (H1-H6)
- 粗体、斜体文本
- 有序/无序列表
- 代码块和行内代码
- 引用块
- 链接

### 3. 预处理测试
- 测试 `preprocessMathFormulas` 函数
- 查看预处理前后的内容对比
- 统计数学公式数量

### 4. 完整转换
- 使用完整的 unified 处理流程
- 生成真实的 DOCX 文件
- 自动下载转换结果

## 项目结构

```
svelte-test/
├── src/
│   ├── App.svelte          # 主应用组件
│   ├── RemarkDocxTest.svelte # 测试组件
│   └── main.js             # 应用入口
├── index.html              # HTML 模板
├── package.json            # 依赖配置
├── vite.config.js          # Vite 配置
└── README.md               # 说明文档
```

## 配置说明

### Vite 配置
- 使用别名 `remark-docx` 指向本地源码
- 支持热重载和快速构建
- 自动打开浏览器

### 依赖管理
- **Svelte**: 现代前端框架
- **Vite**: 快速构建工具
- **unified**: 文本处理生态系统
- **remark-***: Markdown 处理插件
- **katex**: 数学公式渲染
- **mathml2omml**: MathML 到 OMML 转换

## 开发说明

### 调试技巧
1. 使用浏览器开发者工具查看控制台输出
2. 检查网络请求和错误信息
3. 使用 Svelte DevTools 调试组件状态

### 常见问题
1. **依赖错误**: 确保所有依赖都已正确安装
2. **路径问题**: 检查 vite.config.js 中的别名配置
3. **类型错误**: 确保 TypeScript 配置正确

## 与原生 HTML 测试的对比

| 特性 | 原生 HTML | Svelte |
|------|-----------|--------|
| 模块管理 | ❌ 复杂 | ✅ 简单 |
| 全局变量 | ❌ 容易冲突 | ✅ 无冲突 |
| 热重载 | ❌ 需要手动刷新 | ✅ 自动重载 |
| 类型检查 | ❌ 无 | ✅ 支持 |
| 开发体验 | ❌ 繁琐 | ✅ 现代 |

这个 Svelte 测试环境大大简化了 remark-docx 库的测试和开发流程！
