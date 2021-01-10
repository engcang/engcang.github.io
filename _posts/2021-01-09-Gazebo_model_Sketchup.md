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
(In the next post: 3. Newly made model has strange colors in Gazebo -> Editing it using Blender)

First, go to the Google Sketchup's 3dwarehouse and look for anything similar to the model to be made.
I needed a staircase, so I searched for the stair.

<figure>
    <img src="/assets/posting/20210110/s1.JPG" style="width:50%"  onContextMenu="return false;">
</figure>

<figure>
    <img src="/assets/posting/20210110/s2.JPG" style="width:50%"  onContextMenu="return false;">
</figure>

<figure>
    <img src="/assets/posting/20210110/s3.JPG" style="width:50%"  onContextMenu="return false;">
</figure>

<figure>
    <img src="/assets/posting/20210110/s4.JPG" style="width:50%"  onContextMenu="return false;">
</figure>

<figure>
    <img src="/assets/posting/20210110/s5.JPG" style="width:50%"  onContextMenu="return false;">
</figure>

<figure>
    <img src="/assets/posting/20210110/s6.JPG" style="width:50%"  onContextMenu="return false;">
</figure>

<figure>
    <img src="/assets/posting/20210110/s7.JPG" style="width:50%"  onContextMenu="return false;">
</figure>

<figure>
    <img src="/assets/posting/20210110/s10.png" style="width:50%"  onContextMenu="return false;">
</figure>

<figure>
    <img src="/assets/posting/20210110/s11.png" style="width:50%"  onContextMenu="return false;">
</figure>

<figure>
    <img src="/assets/posting/20210110/s9.png" style="width:50%"  onContextMenu="return false;">
</figure>

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


<figure>
    <img src="/assets/posting/20210110/s12.png" style="width:50%"  onContextMenu="return false;">
</figure>

<figure>
    <img src="/assets/posting/20210110/s13.png" style="width:50%"  onContextMenu="return false;">
</figure>

<figure>
    <img src="/assets/posting/20210110/s14.JPG" style="width:50%"  onContextMenu="return false;">
</figure>
