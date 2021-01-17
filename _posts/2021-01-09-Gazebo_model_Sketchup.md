---
layout: post
title: "Gazebo model making from Google Sketchup"
date: 2021-01-09
excerpt: "For better sim"
tags: [Gazebo, Blender, Sketchup]
post: true
project: false
legacy: false
comments: true
---

## Gazebo model making from Google Sketchup
What we will cover here (with the free version of SketchUp)
1. Create a model that is not provided in Gazebo using Google Sketchup
2. When there is an invisible object after making it -> to be modified in SketchUp
(In the next post: 3. When newly made model is colored different in Gazebo -> Editing it using Blender)

+ First, go to the Google Sketchup's 3dwarehouse and look for anything similar to the model to be made.
I needed a staircase, so I searched for the stair.

<figure>
    <img src="/assets/posting/20210110/s1.JPG" style="width:100%"  onContextMenu="return false;">
</figure>

+ If you press the down button right away, you can download it as a sketchup file and a collada file. (I will finally download it as a collada file (.dae extension) and put it in Gazebo later.) Since we need to modify it, download the latest version of the sketchup file (.skp extension file) for now.

<figure>
    <img src="/assets/posting/20210110/s2.JPG" style="width:100%"  onContextMenu="return false;">
</figure>

+ Open the .skp file in the SketchUp. The free version is good enough, and the web browser version works well enough.
<figure>
    <img src="/assets/posting/20210110/s3.JPG" style="width:100%"  onContextMenu="return false;">
</figure>

+ I put the stair downloaded above, and just drew some more parts.
<figure>
    <img src="/assets/posting/20210110/s4.JPG" style="width:100%"  onContextMenu="return false;">
</figure>

+ After drawing, click the warehouse button on the right menu, In the pop-up window that appears, click the upload button to upload it to the warehouse.
<figure>
    <img src="/assets/posting/20210110/s5.JPG" style="width:100%"  onContextMenu="return false;">
</figure>

+ After uploading, you can easily download it by logging in the Warehouse and going to 'My content'.
<figure>
    <img src="/assets/posting/20210110/s6.JPG" style="width:100%"  onContextMenu="return false;">
</figure>

+ When downloading, download it as <span style="color:#3399ff"> Collada File. (file with .dae extension). </span>
I drew it very hard... It seems it took about 4-5 hours through trial and error. I guess I could draw faster now? maybe 2-3 hours?
<figure>
    <img src="/assets/posting/20210110/s7.JPG" style="width:100%"  onContextMenu="return false;">
</figure>

+ After download the Collada file, we need to create a Gazebo model using a .sdf file so that the simulator can recognize it. First, create <span style="color:#3399ff"> a folder with the desired model name.</span> In the folder, create model.config file and model.sdf file.
<figure>
    <img src="/assets/posting/20210110/s10.png" style="width:100%"  onContextMenu="return false;">
</figure>

+ And extract the compressed Collada file downloaded here.
<figure>
    <img src="/assets/posting/20210110/s11.png" style="width:100%"  onContextMenu="return false;">
</figure>

+ To use the model in Gazebo, open the .bashrc located in the home directory with text editer (e.g. gedit). Just like the dragged part below, <span style="color:#3399ff"> add the directory to GAZEBO_MODEL_PATH.</span> (multiple paths separated by colons)
<figure>
    <img src="/assets/posting/20210110/s9.png" style="width:100%"  onContextMenu="return false;">
</figure>

+ model.sdf example is as below, model name should be the same as the folder name. In collision, create a colliding object like the look of the .dae file, make visible objects that look like dae files in visual. 
    + If I comment out or remove either? -> I can make the object without any collision or invisible.
~~~xml
<?xml version="1.0" ?>
<sdf version='1.5'>
  <model name='stair_thing'>
    <static>true</static>
      <link name='stair_thing'>
        <pose frame=''>0 0 0 0 0 0</pose>
         <collision name='stair_thing'>
          <geometry>
            <mesh>
              <uri>model://stair_thing/model.dae</uri>
            </mesh>
          </geometry>
        </collision>
        <visual name='stair_thing'>
        <cast_shadows>false</cast_shadows>
          <geometry>
            <mesh>
              <scale>1 1 1</scale>
              <uri>model://stair_thing/model.dae</uri>
            </mesh>
          </geometry>
          <material>
            <script>
              <name>stair_thing</name>
              <uri>model://stair_thing/model.dae</uri>
            </script>
          </material>
        </visual>
      </link>
  </model>
</sdf>
~~~

+ Below is the model.config example. Just write the name and the name of the sdf file properly.
~~~xml
<?xml version="1.0"?>
<model>
  <name>stair_thing</name>
  <version>1.0</version>
  <sdf version='1.5'>model.sdf</sdf>

  <author>
    <name>Mason</name>
    <email>mason@kaist.ac.kr</email>
  </author>

  <description>
  </description>
</model>
~~~

+ Now source the .bashrc and run the Gazebo. Added path can be checked from Insert menu. Click the added model, stair_thing to put it in the world.
<figure>
    <img src="/assets/posting/20210110/s12.png" style="width:100%"  onContextMenu="return false;">
</figure>

+ Ta-da~ Now the object drawn in sketchup came into Gazebo. But something is weird. There are some invisible objects in Gazebo, Some objects have strange colors. (In the photo, the lower part of the concrete outer wall is black;;)
<figure>
    <img src="/assets/posting/20210110/s13.png" style="width:100%"  onContextMenu="return false;">
</figure>

+ For invisible objects first, It can be solved by selecting all components one by one and processing <span style="color:#3399ff">'Make Unique'</span> in Sketchup before uploading it!
<figure>
    <img src="/assets/posting/20210110/s14.JPG" style="width:100%"  onContextMenu="return false;">
</figure>

+ If the color is strange, it should be solved by using Blender and the next post will cover it.
