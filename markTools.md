﻿# markTools

---

##实现一个在页面上打mark的工具（参考qq截图）

###V1.0

####页面结构如下：
  * 四个按钮，分别对应点（Pin）、矩形（Rectangle）、椭圆（Ellipse）和箭头（Arrow）的绘制功能。
  * 用于显示绘制内容的画布
  * 用于在图形绘制完成后可以输入标记内容的弹出框
  * 用于打印标记及图形坐标内容的控制台

*提示：画图部分用canvas实现，主要会用到mousedown、mouseup和mousemove事件，箭头的效果自定义。*

####页面功能如下：
  * 点击一个功能按钮，将鼠标移动至画布区域，点击鼠标并拖动即可看见绘制的图形随着鼠标移动而改变，松开鼠标完成绘制，此时弹出标记框可输入内容，点击 **确定** 后，图片将确认显示在画布上，控制台中输出图形坐标和标记内容，若点击 **取消** 则不会保存该绘制的图片。
  * 点击图形，图形的周围将显示可拉伸效果的边框。若鼠标在图形内部区域点击并移动，可实现图形的拖动；若鼠标在图形边框顶点位置点击并移动可实现图形的放大缩小。

###V2.0
增加如下功能：
  * 画刷按钮（Brush），可在画布上画出任意轨迹。
  * 文字按钮（Text），可在画布上任意区域标记文字。
