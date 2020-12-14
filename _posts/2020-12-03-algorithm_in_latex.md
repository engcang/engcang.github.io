---
layout: post
title: "Algorithm in LaTex"
date: 2020-12-03
excerpt: "LaTex"
tags: [LaTex]
post: true
project: false
legacy: false
comments: true
---

## Writing Algorithm table in LaTex
### Refernce : [here1](https://ctan.org/pkg/algorithmicx?lang=en) [here for right alinged comment](2)

<br>

+ LaTex Code:
    + No explanation is needed I think!

<br>

~~~
\usepackage{algorithm}
\usepackage{algpseudocode}
\renewcommand{\algorithmicrequire}{\textbf{Input:}} % this makes \Require as Input
\renewcommand{\algorithmicensure}{\textbf{Output:}} % this makes \Ensure as Output
%\algrenewcommand{\algorithmiccomment}[1]{\hskip3em$\rightarrow$ #1} %this makes comment with right arrow
  
\begin{algorithm}
    \caption{3D Frontier Calculation}
    \label{alg1}
    \begin{algorithmic}[1]
        \Require{ test input}
        \Ensure{test output}
        \If {condition for if}
        \State{then is automatically generated}
        \EndIf
    \State state is normal sentence \Comment{comment with right arrow}
    \ForAll {elements}
        \State {do is generated automatically}
    \EndFor
    \\
    \Return True
\end{algorithmic}
\end{algorithm}
~~~

<br>

+ Result

<p align="center" onContextMenu="return false;" onselectstart="return false" ondragstart="return false">
<figure>
    <img src="/assets/img/tex.PNG" style="width:90%"  onContextMenu="return false;">
    <figcaption style="text-align:center;"> Algorithm in LaTex </figcaption>
</figure>
</p>

<br>
