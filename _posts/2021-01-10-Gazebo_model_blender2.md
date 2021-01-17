---
layout: post
title: "Gazebo models joining seamlessly using Blender"
date: 2021-01-10
excerpt: "For better sim"
tags: [Gazebo, Blender]
post: true
project: false
legacy: false
comments: true
---

## Gazebo models joining seamlessly using Blender

<br>

What to cover in this post:
1. Combining two objects in a Blender (joining two holes) seamlessly.
2. Adding texture on an object using UV map.
+ Content covered in previous posts:
    + Create a model that is not provided in Gazebo using Google Sketchup.
    + If some objects are invisible in Gazebo -> ‘Make Unique’ in Sketchup.
    + When a 3D model is newly made and put it in Gazebo, but the color is strange -> It can be modified using a Blender.
    + Resolving invisible colliding objects in Gazebo.
     
<br>

+ Models used today: Scanned LiDAR PointCloud model (.dae file) of an abandoned mine in Virginia published in the paper:
    + Dharmadhikari, M., Dang, T., Solanka, L., Loje, J., Nguyen, H., Khedekar, N. and Alexis, K., 2020, May. Motion primitives-based path planning for fast and agile exploration using aerial robots. In 2020 IEEE *International Conference on Robotics and Automation (ICRA)* (pp. 179-185).
+ Turn on Blender, and import the model.
<figure>
    <img src="/assets/posting/20210110/t1.png" style="width:100%"  onContextMenu="return false;">
</figure>

<br>

+ After copy-pasting, bring them nearby each other.
+ Since there is no hole, I planned to make holes and attach them. 
    + I was considering use it to develop exploration algorithm with UAV by expanding the abandoned mine.
<figure>
    <img src="/assets/posting/20210110/t2.png" style="width:100%"  onContextMenu="return false;">
</figure>

<br>

+ Press the **Tab** key to change to **<span style="color:#3399ff">Edit mode</span>**, then
+ Press **Alt + Z** to enter **<span style="color:#3399ff">transparent mode</span>** and select the vertices to be deleted.
<figure class="half">
    <img src="/assets/posting/20210110/t3.png" onContextMenu="return false;">
    <img src="/assets/posting/20210110/t4.png" onContextMenu="return false;">
</figure>

<br>

+ After made both holes.
<figure>
    <img src="/assets/posting/20210110/t5.png" style="width:100%"  onContextMenu="return false;">
</figure>

<br>

+ After selecting the vertices to be connected,
+ In the right menu, click the green triangle and click the '+' button to create a new **<span style="color:#3399ff">vertex group</span>**.
+ Press **'Assign'** to assign to the group.
+ Repeat these steps on the other side too.
<figure>
    <img src="/assets/posting/20210110/t6.png" style="width:100%"  onContextMenu="return false;">
</figure>

<br>

+ After that, move and place the two objects so that they overlap each other enough.
+ Click the wrench shaped button and click **<span style="color:#3399ff">Add Modifier->Shrinkwrap</span>**.
+ In the vertex group, select the previously assigned vertex group, and select the name of the other object in **Target**.
+ Choose between **Nearest surface point** or **Nearest vertices** for the wrap method.
+ Set a negative **Offset** value. Then it sticks more tightly.
<figure>
    <img src="/assets/posting/20210110/t7.png" style="width:100%"  onContextMenu="return false;">
</figure>

<br>

+ Do not forget to **<span style="color:#3399ff">apply</span>** it as shown on the right part of the figure.
<figure>
    <img src="/assets/posting/20210110/t8.png" style="width:100%"  onContextMenu="return false;">
</figure>

<br>

+ Make sure **Shrinkwrap** on <span style="color:#3399ff">both side</span> on the vertex group of both objects.
<figure>
    <img src="/assets/posting/20210110/t9.png" style="width:100%"  onContextMenu="return false;">
</figure>

<br>

+ (Optional) After joining, if you select both objects and right click to 'Join' both objects, they become one object.
<figure class="half">
    <img src="/assets/posting/20210110/t10.png" onContextMenu="return false;">
    <img src="/assets/posting/20210110/t11.png" onContextMenu="return false;">
</figure>

<br>

+ Now how to apply texture using UV map.
+ After click the object, go to the **'Material'** from the the right menu.
+ Change the 'base color' to **'Image texture'**, and then load the image of the desired pattern.
<figure>
    <img src="/assets/posting/20210110/t12.png" style="width:100%"  onContextMenu="return false;">
</figure>

<br>

+ After that, press **tab** to enter edit mode.
+ After selecting the part you want to apply texture (it is convenient to use Alt+z transparent mode),
+ If you press **'U'** to 'Unwrap', it is automatically wrapped around the UV map to some extent.
<figure>
    <img src="/assets/posting/20210110/t13.png" style="width:100%"  onContextMenu="return false;">
</figure>

<br>

+ If you want to edit it yourself, select **'UV Editing'** mode from the top menu in Blender.
+ Select the desired part you want to add texture, and then press **'U'** to unwrap,
+ You can also select and move vertices in the left UV window, and press 's' to spread them.
<figure>
    <img src="/assets/posting/20210110/t14.png" style="width:100%"  onContextMenu="return false;">
</figure>

<br>

+ After completing this, export it as a **.dae** file and load the model in Gazebo, and it will look like the video below.
<p align="center" onContextMenu="return false;" onselectstart="return false" ondragstart="return false">
    <video width="602" height="300" controls controlsList="nodownload">
      <source src="/assets/posting/20210110/blen.mp4" type="video/mp4">
    </video>
</p>
