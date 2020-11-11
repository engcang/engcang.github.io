---
layout: post
title: "Mavros Vision pose fusion with T265 and D435i: VINS-Fusion"
date: 2020-11-09
excerpt: "mavros_vision_pose"
tags: [pixhawk, T265, D435i]
post: true
project: false
legacy: false
comments: true
---

# Mavros Vision pose fusion with T265 and D435i: VINS-Fusion

<br>

## ● T265 odometry and VINS-Fusion on D435i with Pixhawk4 mini IMU to fly without GPS
### ● <span style="color:#3399ff">T265 showed the great performance thanks to its large FoV around 160 degree.</span>
### ● <span style="color:#3399ff">VINS-Fusion showed slight divergence when rotated/moved fast</span>

+ Platform apperance

<figure>
    <img src="/assets/posting/1109-t265d435px4.jpg" style="width:50%">
    <figcaption style="text-align:center;"> Fixed platform </figcaption>
</figure>

<br>

+ When moved slowly, 
    + the shortest, and the thickest axis : ***T265***
    + longer, thiner : ***VINS-Fusion*** on **D435i** with **pixhawk4 mini IMU**
    + longer, thiner : ***/mavros/local_position/pose*** position, EKF filtered from ***PX4***
    + the longest, the thinnest : input ***/mavros/vision_pose/pose***, which is fused with ***T265*** and ***VINS-Fusion***

<p align="center">
    <video width="427" height="240" controls controlsList="nodownload">
      <source src="/assets/posting/1109-slow.mp4" type="video/mp4">
    </video>
</p>

<br>

+ When moved fast,
    + the shortest, and the thickest axis, **far right** : ***T265***
    + longer, thiner, **far left** : ***VINS-Fusion*** on **D435i** with **pixhawk4 mini IMU**
    + longer, thiner : ***/mavros/local_position/pose*** position, EKF filtered from ***PX4***
    + the longest, the thinnest : input ***/mavros/vision_pose/pose***, which is fused with ***T265*** and ***VINS-Fusion***

<p align="center">
    <video width="427" height="240" controls controlsList="nodownload">
      <source src="/assets/posting/1109-fast.mp4" type="video/mp4">
    </video>
</p>
