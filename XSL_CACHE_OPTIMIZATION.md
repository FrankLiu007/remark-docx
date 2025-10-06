# XSL 缓存优化说明

## 🚀 优化内容

### 问题描述
之前的实现中，每次使用浏览器原生 XSL 转换数学公式时，都会调用 `getEmbeddedXSLContentLocal()` 函数重新读取内嵌的 XSL 内容。这是不必要的性能浪费，因为 XSL 内容是静态的，只需要读取一次即可。

### 解决方案
实现了全局缓存机制，确保 XSL 内容只读取一次并缓存起来，后续调用直接返回缓存内容。

## 🔧 技术实现

### 1. 添加全局缓存变量
```typescript
// 缓存 XSL 内容，避免重复读取
let _cachedXSLContent: string | null = null;
```

### 2. 优化 `getEmbeddedXSLContentLocal` 函数
```typescript
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
      console.log('✅ 首次读取并缓存内嵌 XSL 内容，长度:', content.length);
    } else {
      console.warn('❌ 内嵌 XSL 内容为空');
    }
    return content;
  } catch (error) {
    console.warn('❌ 无法获取内嵌 XSL 内容:', error);
    return null;
  }
}
```

### 3. 添加缓存管理函数
```typescript
/**
 * 清除 XSL 内容缓存
 * 用于测试或重新加载 XSL 内容
 */
export function clearXSLContentCache(): void {
  _cachedXSLContent = null;
  console.log('🗑️ XSL 内容缓存已清除');
}
```

### 4. 导出缓存管理函数
在 `src/index.ts` 中添加导出：
```typescript
export { clearXSLContentCache } from "./latex-omml";
```

## 📊 性能提升

### 优化前
- 每次转换都调用 `getEmbeddedXSLContent()`
- 重复解析和读取 XSL 内容
- 不必要的性能开销

### 优化后
- 首次调用时读取并缓存 XSL 内容
- 后续调用直接返回缓存内容
- 显著减少重复操作

## 🧪 测试功能

在 svelte-test 中添加了测试按钮：
- **🔄 测试 XSL 缓存** - 清除缓存，下次转换将重新读取 XSL 内容

## 📝 使用说明

### 正常使用
无需任何代码修改，缓存机制自动工作：
1. 首次使用浏览器原生 XSL 转换时，会读取并缓存 XSL 内容
2. 后续转换直接使用缓存内容，无需重复读取

### 手动清除缓存
如果需要重新加载 XSL 内容（比如在开发测试中）：
```typescript
import { clearXSLContentCache } from 'remark-docx';

// 清除缓存
clearXSLContentCache();
```

## 🎯 控制台日志

### 首次读取
```
✅ 首次读取并缓存内嵌 XSL 内容，长度: 12345
```

### 后续使用
无额外日志（直接返回缓存内容）

### 手动清除缓存
```
🗑️ XSL 内容缓存已清除
```

## ✅ 验证方法

1. 打开浏览器开发者工具控制台
2. 点击"🌐 浏览器原生 XSL"按钮进行转换
3. 观察控制台日志：
   - 第一次转换：显示"首次读取并缓存内嵌 XSL 内容"
   - 后续转换：无额外 XSL 读取日志
4. 点击"🔄 测试 XSL 缓存"按钮清除缓存
5. 再次转换：重新显示"首次读取并缓存内嵌 XSL 内容"

这个优化显著提升了浏览器原生 XSL 转换的性能，特别是在处理多个数学公式时。
