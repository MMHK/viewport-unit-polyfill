# viewport-unit-polyfill 

viewport unit[vw/vh] polyfill，一个HTML5 VW/VH 单位JS兼容包。该版本暂时只支持vw/vh 两个单位。

## Viewport Unit Polyfill 介绍

视窗(Viewport)是你的浏览器实际显示内容的区域——换句话说是你的不包括工具栏和按钮的网页浏览器。
这些单位是vw,vh,vmin和vmax。它们都代表了浏览器（视窗(Viewport)）尺寸的比例和窗口大小调整产生的规模改变。

比方说我们有一个```1000px```（宽）和```800px```（高）的视窗(Viewport)

- **``` vw ```** ——代表视窗(Viewport)的宽度为```1%```，在我们的例子里```50vw = 500px```。
- **``` vh ```** ——窗口高度的百分比 ```50vh = 400px```。
- **``` vmin ```** ——vmin的值是当前```vw```和```vh``` 中较小的值。在我们的例子里因为是横向模式，所以 ```50vim = 400px```。**该版本未实现**
- **``` vmax ```** ——大尺寸的百分比。```50vmax = 500px```。 **该版本未实现**


## 使用条件

- 页面必须使用 ```link``` 方式引入css，所有inline css及```@import```的css 将不会被处理。
- ```link```方式引入的css文件必须要与页面同域，所有外域的css文件将不会被处理。
- 此 polyfill 不包含```media query```的兼容处理，所有不支持```media query```浏览器，需要使用额外的polyfill处理。


## 使用方法

在源码中已经提供了使用实例放在```docs```文件夹；```dist``` 文件夹是合并压缩后的单文件包。
- ```index.html``` 文件是单文件的使用方式，直接将文件放到```body```结束之前即可。

## 原理

- 检测出浏览器对viewport unit的支持情况。
- 通过使用Ajax技术，加载页面包含的css文件，然后通过css语法分析器 [cssPaser](https://github.com/reworkcss/css)，分析出css中包含vw/vh单位的规则。
- 用js计算出`viewport`的尺寸，动态修改匹配出来的css规则，然后加载到页面的`style`标签中。
