# 浏览器原生 XSL 处理数学公式流程分析

## 🔄 完整处理流程

```
LaTeX 输入 (如: $E = mc^2$)
    ↓
parseLatexOMML(value, method, xslPath)
    ↓
1. 判断显示模式 (isDisplayMode)
   - 检测 \begin{}, \end{}, \[, \]
    ↓
2. convertLatexToOMML(latex, displayMode, method, xslPath)
    ↓
3. LaTeX → MathML: latexToMathML(latex, displayMode)
   - 使用 KaTeX 转换
   - 配置: throwOnError: false, output: 'mathml'
    ↓
4. 选择转换方案: getDefaultConversionMethod()
   - 浏览器环境: XSLT_PROCESSOR
   - 非浏览器环境: MATHML2OMML
    ↓
5. MathML → OMML: mathMLtoOMMLWithXSL(mathml, xslPath)
   - 获取内嵌 XSL: getEmbeddedXSLContentLocal()
   - 创建 XSLTProcessor 和 XMLSerializer
   - 解析 XSL 样式表: DOMParser.parseFromString(xslContent, 'text/xml')
   - 解析 MathML: DOMParser.parseFromString(mathml, 'text/xml')
   - 执行转换: processor.transformToDocument(mathmlDoc)
   - 序列化结果: serializer.serializeToString(resultDoc)
    ↓
6. OMML → DOCX 元素: buildDocxElementFromOMML(omml)
   - convertOmml2Math(ommlString)
   - 识别根元素: identifyRootKey(xmlString)
   - 解析 OMML: ImportedXmlComponent.fromXmlString(xmlString)
   - 返回: result.root[0]
    ↓
最终 DOCX 数学元素
```

## 🚨 潜在问题点

### 1. XSL 解析问题
- **位置**: `mathMLtoOMMLWithXSL` 函数
- **问题**: XSL 样式表可能解析失败
- **检查点**: `xslDoc.documentElement.nodeName === 'parsererror'`

### 2. MathML 解析问题
- **位置**: `mathMLtoOMMLWithXSL` 函数
- **问题**: MathML 格式可能不正确
- **检查点**: `mathmlDoc.documentElement.nodeName === 'parsererror'`

### 3. XSLT 转换失败
- **位置**: `processor.transformToDocument(mathmlDoc)`
- **问题**: 转换结果无效
- **检查点**: `!resultDoc || !resultDoc.documentElement`

### 4. OMML 根元素识别问题
- **位置**: `convertOmml2Math` 函数
- **问题**: 根元素不是 `m:oMath` 或 `m:oMathPara`
- **检查点**: `identifiedRootKey !== "m:oMath" && identifiedRootKey !== "m:oMathPara"`

### 5. ImportedXmlComponent 解析失败
- **位置**: `ImportedXmlComponent.fromXmlString(xmlString)`
- **问题**: OMML XML 格式不正确
- **检查点**: 异常捕获

## 🔧 调试建议

### 1. 添加详细日志
在每个关键步骤添加 console.log 来跟踪数据流：

```javascript
console.log('LaTeX 输入:', latex);
console.log('MathML 输出:', mathml);
console.log('OMML 输出:', omml);
console.log('根元素:', identifiedRootKey);
```

### 2. 验证 XSL 内容
检查内嵌 XSL 内容是否完整：

```javascript
const xslContent = getEmbeddedXSLContentLocal();
console.log('XSL 内容长度:', xslContent?.length);
console.log('XSL 内容前100字符:', xslContent?.substring(0, 100));
```

### 3. 验证 MathML 格式
检查 KaTeX 生成的 MathML 是否正确：

```javascript
console.log('MathML 内容:', mathml);
```

### 4. 验证 OMML 格式
检查 XSLT 转换后的 OMML 格式：

```javascript
console.log('OMML 内容:', omml);
console.log('OMML 根元素:', identifyRootKey(omml));
```

## 🎯 常见问题及解决方案

### 问题1: XSL 解析错误
**原因**: 内嵌 XSL 内容损坏或格式不正确
**解决**: 检查 `getEmbeddedXSLContent()` 函数

### 问题2: MathML 解析错误
**原因**: KaTeX 生成的 MathML 格式有问题
**解决**: 检查 LaTeX 输入是否包含不支持的语法

### 问题3: XSLT 转换返回空结果
**原因**: XSL 样式表与 MathML 不匹配
**解决**: 验证 XSL 样式表版本和 MathML 版本兼容性

### 问题4: OMML 根元素识别失败
**原因**: XSLT 转换生成的 OMML 格式不正确
**解决**: 检查 XSL 转换结果，可能需要调整 XSL 样式表

### 问题5: ImportedXmlComponent 解析失败
**原因**: OMML XML 格式不符合 docx 要求
**解决**: 检查 OMML 命名空间和结构
