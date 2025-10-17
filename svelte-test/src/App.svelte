<script>
  import SimpleRemarkDocxTest from './SimpleRemarkDocxTest.svelte';
</script>

<div class="container">
  <div class="header">
    <h1>🚀 Remark-Docx 高度封装测试</h1>
    <p>使用 createRemarkDocxProcessor 简化 DOCX 转换流程</p>
  </div>
  
  <div class="content">
    <SimpleRemarkDocxTest />
  </div>
</div>

<style>
  .container {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .header {
    padding: 20px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #e1e5e9;
    text-align: center;
  }

  .header h1 {
    margin: 0 0 10px 0;
    color: #1f2937;
    font-size: 24px;
    font-weight: 700;
  }

  .header p {
    margin: 0;
    color: #6b7280;
    font-size: 16px;
  }

  .content {
    flex: 1;
    overflow: hidden;
  }
</style>
