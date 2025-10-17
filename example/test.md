# 例子

## User

洛必达法则来个例子

*2025/10/17 12:48:12*

## Assistant

好的，我来给你举一个 洛必达法则 的例子。


例子题目

计算极限：

$$\lim_{x \to 0} \frac{\sin x}{x}$$

解题步骤



直接代入

当 $x \to 0$ 时：

$$\sin x \to 0, \quad x \to 0$$
所以是一个 $\tfrac{0}{0}$ 型未定式，可以用洛必达法则。




应用洛必达法则

洛必达法则说：

如果 $\lim_{x\to a} f(x) = \lim_{x\to a} g(x) = 0$ 或 $\pm \infty$，并且在邻域内 $f'(x), g'(x)$ 存在且 $g'(x) \neq 0$，

那么：

$$\lim_{x \to a} \frac{f(x)}{g(x)} = \lim_{x \to a} \frac{f'(x)}{g'(x)}$$
这里：

$$f(x) = \sin x, \quad f'(x) = \cos x$$
$$g(x) = x, \quad g'(x) = 1$$
所以：

$$\lim_{x \to 0} \frac{\sin x}{x} = \lim_{x \to 0} \frac{\cos x}{1} = \cos 0 = 1$$




最终答案

$$\lim_{x \to 0} \frac{\sin x}{x} = 1$$

要不要我再给你举一个更复杂一点的例子（比如 $\lim_{x \to \infty} \frac{e^x}{x^2}$ 这种）来帮助你更全面地理解？

*2025/10/17 12:48:12*

## User

来个矩阵的例子

*2025/10/17 12:48:12*

## Assistant

好的 👍 我来给你举一个 涉及矩阵的洛必达法则例子，这样你能看到它在矩阵（或向量函数）里的应用。


例子

计算极限：

$$\lim_{x \to 0} \frac{A e^{x} - A}{x}$$
其中 $A$ 是一个常数矩阵（比如 $n \times n$ 矩阵）。


解题思路



观察分子分母



当 $x \to 0$ 时：

$$A e^x - A = A( e^x - 1 ) \to 0$$
而分母 $x \to 0$。




所以这是一个 $\tfrac{0}{0}$ 型未定式。







应用洛必达法则



分子：$f(x) = A e^x - A$，其导数为：

$$f'(x) = A e^x$$



分母：$g(x) = x$，其导数为：

$$g'(x) = 1$$



所以：

$$\lim_{x \to 0} \frac{A e^x - A}{x} = \lim_{x \to 0} \frac{A e^x}{1}$$



代入极限

$$\lim_{x \to 0} A e^x = A \cdot e^0 = A \cdot 1 = A$$




最终答案

$$\lim_{x \to 0} \frac{A e^x - A}{x} = A$$

✨ 这个例子展示了洛必达法则在矩阵函数中的应用：

虽然矩阵本身不能直接“除”，但由于极限是逐项计算的，而指数函数和导数对矩阵乘法保持线性，所以整个推导和标量情况几乎一致。


要不要我再给你举一个 向量函数极限 的洛必达例子？那样你能看到它在多维函数里怎么用。

*2025/10/17 12:48:12*

## User

是

*2025/10/17 12:48:12*

## Assistant

好哒！给你一个向量函数版的洛必达例子（逐分量用法）。

例子

计算极限：

$$\lim_{t\to 0}\frac{\big(\sin t,\; e^{t}-1,\; \ln(1+t)\big)}{t}$$
思路

这是一个向量除以标量的表达式，可以逐分量看成三个 $\frac{0}{0}$ 型未定式，然后分别用洛必达法则：



第1分量：$\displaystyle \lim_{t\to 0}\frac{\sin t}{t}$




第2分量：$\displaystyle \lim_{t\to 0}\frac{e^{t}-1}{t}$




第3分量：$\displaystyle \lim_{t\to 0}\frac{\ln(1+t)}{t}$




对每个分量分别求导（分子、分母对 $t$ 求导）：



第1分量：$\displaystyle \lim_{t\to 0}\frac{\cos t}{1}=\cos 0=1$




第2分量：$\displaystyle \lim_{t\to 0}\frac{e^{t}}{1}=e^{0}=1$




第3分量：$\displaystyle \lim_{t\to 0}\frac{\frac{1}{1+t}}{1}=\frac{1}{1+0}=1$




结果

$$\lim_{t\to 0}\frac{\big(\sin t,\; e^{t}-1,\; \ln(1+t)\big)}{t}=(1,\;1,\;1)$$

小结：向量值函数 $\mathbf{F}(t)$ 相比标量，只要每个分量在邻域内可导、分母导数在极限点不为 0，就可以逐分量应用洛必达法则。事实上，这个极限也等价于导数定义：


$$\lim_{t\to 0}\frac{\mathbf{F}(t)-\mathbf{F}(0)}{t}=\mathbf{F}'(0).$$
要不要来个更进阶的：比如 $\displaystyle \lim_{t\to 0}\frac{\big(\tan(2t)-2t,\;\; \sqrt{1+3t}-1\big)}{t}$ 或者用范数构造的标量极限？

*2025/10/17 12:48:12*

## User

的

*2025/10/17 12:48:12*

## User

的：比如 $\displaystyle \lim_{t\to 0}\frac{\big(\tan(2t)-2t,\;\; \sqrt{1+3t}-1\big)}{t}$ 或者用

*2025/10/17 12:48:12*

## Assistant

好的，我们就按你给的这个向量极限来做，并顺带给一个“用范数”的标量极限示例。

1) 向量极限（逐分量用洛必达）

$$\lim_{t\to 0}\frac{\big(\tan(2t)-2t,\ \sqrt{1+3t}-1\big)}{t}$$
逐分量分别是 $\frac{\tan(2t)-2t}{t}$ 与 $\frac{\sqrt{1+3t}-1}{t}$，两者都是 $0/0$ 形。



第一分量：

$$\lim_{t\to 0}\frac{\tan(2t)-2t}{t}
\xrightarrow{\text{洛必达}}
\lim_{t\to 0}\big(2\sec^2(2t)-2\big)
= 2\cdot 1 - 2 = 0.$$
（也可用泰勒：$\tan(2t)=2t+\tfrac{(2t)^3}{3}+\cdots$，除以 $t$ 后主导项是常数 0。）




第二分量：

$$\lim_{t\to 0}\frac{\sqrt{1+3t}-1}{t}
\xrightarrow{\text{洛必达}}
\lim_{t\to 0}\frac{\frac{3}{2\sqrt{1+3t}}}{1}
= \frac{3}{2}.$$



结果：

$$\boxed{\ \big(0,\ \tfrac{3}{2}\big)\ }.$$

2) “用范数”的标量极限（顺便看一眼）

例如

$$\lim_{t\to 0}\frac{\left\|\big(\sin t,\ e^{t}-1\big)\right\|}{|t|}
= \lim_{t\to 0}\sqrt{\left(\frac{\sin t}{t}\right)^2+\left(\frac{e^{t}-1}{t}\right)^2}
= \sqrt{1^2+1^2}=\boxed{\sqrt{2}}.$$
思路：两分量分别是 $0/0$ 形，用洛必达得 $\lim \frac{\sin t}{t}=1$、$\lim \frac{e^{t}-1}{t}=1$，代回范数即可。

要不要再来一个矩阵范数相关的（比如 $\lim_{t\to 0}\frac{\|e^{tB}-I\|}{|t|}=\|B\|$ 在一致相容范数下的结论）？

*2025/10/17 12:48:12*

## User

\(\displaystyle \lim_{t\to 0}\frac{\big(\tan(2t)-2t,\;\; \sqrt{1+3t}-1\big)}{t}\)

*2025/10/17 12:48:12*

## Assistant

结果是：

$$\boxed{\left(0,\ \tfrac{3}{2}\right)}$$
证明（逐分量用洛必达）：



第一分量

$$\lim_{t\to 0}\frac{\tan(2t)-2t}{t}
\xrightarrow{\text{洛必达}}
\lim_{t\to 0}\big(2\sec^2(2t)-2\big)
=2\cdot 1-2=0.$$



第二分量

$$\lim_{t\to 0}\frac{\sqrt{1+3t}-1}{t}
\xrightarrow{\text{洛必达}}
\lim_{t\to 0}\frac{\frac{3}{2\sqrt{1+3t}}}{1}
=\frac{3}{2}.$$



（可选）泰勒检验：

$\tan(2t)=2t+\frac{(2t)^3}{3}+O(t^5)\Rightarrow \frac{\tan(2t)-2t}{t}=O(t^2)\to0$；

$\sqrt{1+3t}=1+\frac{3}{2}t-\frac{9}{8}t^2+O(t^3)\Rightarrow \frac{\sqrt{1+3t}-1}{t}\to \frac{3}{2}$.

*2025/10/17 12:48:12*

## User

\$e=mc^2\$

*2025/10/17 12:48:12*

## Assistant

这是爱因斯坦著名的质能方程：

$$E = mc^2$$

含义解释



$E$ ：能量（Energy）




$m$ ：质量（Mass）




$c$ ：真空中的光速（约 $3.0\times10^8 \, \text{m/s}$）




这个公式说明——质量和能量是等价的。

也就是说，一个静止的物体即使不动，也“蕴含”着巨大的能量。


物理意义

当质量 $m$ 转化为能量时，释放的能量为：

$$E = mc^2$$
这意味着哪怕是极小的质量，也能释放出巨大的能量，因为 $c^2$ 是一个非常大的数。


举个例子

假设有 1 克物质（0.001 kg）完全转化为能量：

$$E = 0.001 \times (3\times10^8)^2 = 9\times10^{13}\,\text{J}$$
这大约相当于2.1万吨 TNT 的爆炸能量。


如果你愿意，我可以继续帮你推导一下它从相对论动能公式是怎么来的，要看推导版吗？

*2025/10/17 12:48:12*

## User

$$E = 0.001 \times (3\times10^8)^2 = 9\times10^{13}\,\text{J}$$

*2025/10/17 12:48:12*

