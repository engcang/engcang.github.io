---
layout: post
title: "How to edit the color of hyperlink on the github blog"
date: 2020-11-05
excerpt: "For better Depth"
tags: [html, github, blog]
post: true
project: false
legacy: false
comments: true
---

## ​ How to edit the color of hyperlink on the github.io blog
+ Find the layout and check any ***html file***, it should include ***head.html*** like below
<figure>
<img src="/assets/image/html.png">
</figure>

<br>

+ Then edit the ***head.html*** file.
  + Add the code block as below
~~~html
<style type="text/css">
a:link {text-decoration: underline; color: #3399ff;}
a:visited {text-decoration: underline; color: #9933ff;}
a:active {text-decoration: underline; color: #9933ff;}
a:hover {text-decoration: underline; color: red;}
</style>
~~~
<figure>
<img src="/assets/image/head.png">
</figure>

<br>

+ Explanation
  + a:link changed the color of the general link
  + a:visited changed the color of the previously visited link
  + a:active changed the color of the link when it is clicked
  + a:hover changed the color of the link when the mouse pointer is hovering above the link.

+ After edited the ***head.html***, result should be like: 
<figure>
<img src="/assets/image/hyper.png">
</figure>
