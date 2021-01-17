---
layout: post
title: "Gazebo model editing (color, emission) using Blender"
date: 2021-01-10
excerpt: "For better sim"
tags: [Gazebo, Blender]
post: true
project: false
legacy: false
comments: true
---

## Gazebo model editing (color, emission) using Blender

<br>

What to cover in this post:
1. When a 3D model is newly made and put it in Gazebo, but the color is strange -> It can be modified using a Blender.
2. Resolving invisible colliding objects in Gazebo.

+ Contents covered in the previous post:
    + Create a model that is not provided in Gazebo using Google Sketchup.
    + If some objects are invisible in Gazebo -> 'Make Unique' in Sketchup.
+ Contents to be covered in the next post:
    + Combining two objects in a Blender (joining two holes) seamlessly.
    + Adding texture on an object using UV map.
     
<br>

+ Download Blender and turn it on. Import the .dae file from the menu.
<figure>
    <img src="/assets/posting/20210110/c1.png" style="width:100%"  onContextMenu="return false;">
</figure>
     
<br>

+ I loaded the model created in the previous post. 
    + And later, when saving after modification, export to <strong>.dae</strong> file in export as well.
    + <span style="color:#3399ff"> (Optional) export to <strong>.stl</strong> file as well, to use it in Collision part in .sdf file instead of .dae -> removing invisible colliding objects in Gazebo. </span>
        + To check if it works well, check 'View->Collision' in the top menu of Gazebo.
<figure>
    <img src="/assets/posting/20210110/c2.png" style="width:100%"  onContextMenu="return false;">
</figure>
     
<br>

+ <strong>In fact, there are many cases where the color error disappears just by importing it once into Blender and then exporting it again.</strong>
+ Anyway, to modify the color brightness?? and correct the color of the model, click the imported model and then click <span style="color:#3399ff">'Material'</span> menu from the bottom of the right menu, click all the materials one by one to edit it.
<figure class="half">
    <img src="/assets/posting/20210110/c3.png" onContextMenu="return false;">
    <img src="/assets/posting/20210110/c4.png" onContextMenu="return false;">
</figure>
     
<br>

+ Click the 'Base Color' to change it to image texture, and scroll down to edit <span style="color:#3399ff">'Emission'</span> values.
+ Increase the <span style="color:#3399ff">'V'</span> value of the emission. (around 0.6~0.7?)
+ After that, export .dae file.
<figure>
    <img src="/assets/posting/20210110/c5.png" style="width:100%"  onContextMenu="return false;">
</figure>
     
<br>

+ Just load it into Gazebo as you did in the previous post. Now color has been fixed!
<figure>
    <img src="/assets/posting/20210110/c6.png" style="width:100%"  onContextMenu="return false;">
</figure>
