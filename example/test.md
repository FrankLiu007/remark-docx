LaTeX 矩阵示例

User: 来个latex格式的矩阵
[2025/10/5 12:32:27]

Assistant: 下面给你一个简单的 LaTeX 矩阵示例，你可以直接放在 
\[ ... \] 或者 
equation 环境中使用：

latex
复制代码
\[
A = \begin{bmatrix}
1 & 2 & 3 \\
4 & 5 & 6 \\
7 & 8 & 9
\end{bmatrix}
\]

常见矩阵写法

方括号矩阵：
bmatrix

圆括号矩阵：
pmatrix

竖线矩阵（行列式风格）：
vmatrix

双竖线矩阵：
Vmatrix

例子（圆括号）：

latex
复制代码
\[
B = \begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
\]

要不要我帮你整理一份 矩阵写法速查表（包含各种括号形式和常见操作，比如转置、逆矩阵符号）？
[2025/10/5 12:32:27]

User: \[
A = \begin{bmatrix}
1 & 2 & 3 \\
4 & 5 & 6 \\
7 & 8 & 9
\end{bmatrix}
\]
[2025/10/5 12:32:27]

Assistant: 你写的这段 LaTeX 代码是完全正确的 ✅，编译后会显示一个带方括号的 $3\times 3$ 矩阵：

$$A = \begin{bmatrix}
1 & 2 & 3 \\
4 & 5 & 6 \\
7 & 8 & 9
\end{bmatrix}$$

如果你想换不同风格：

圆括号矩阵：

latex
复制代码
\[
A = \begin{pmatrix}
1 & 2 & 3 \\
4 & 5 & 6 \\
7 & 8 & 9
\end{pmatrix}
\]

竖线矩阵（类似行列式）：

latex
复制代码
\[
\det(A) = \begin{vmatrix}
1 & 2 & 3 \\
4 & 5 & 6 \\
7 & 8 & 9
\end{vmatrix}
\]

要不要我给你整理一份 “矩阵写法速查表”，把各种括号样式、转置 $A^T$、逆矩阵 $A^{-1}$ 的 LaTeX 写法都放在一起？
[2025/10/5 12:32:27]

