---
layout: post
title: "Ouster Gazebo Plugin boosting up with GPU ray: tested on multi robots"
date: 2021-01-18
excerpt: "For faster Ouster"
tags: [Gazebo, LiDAR, Ouster, Multi Robot]
post: true
project: false
legacy: false
comments: true
---

## Ouster Gazebo Plugin boosting up with GPU ray: tested on multi robots
### Referenced [this blog](https://www.wilselby.com/2019/05/simulating-an-ouster-os-1-lidar-sensor-in-ros-gazebo-and-rviz/) 
### Downloaded Ouster plugin from [this github repo](https://github.com/wilselby/ouster_example/tree/master/ouster_gazebo_plugins) and got the urdf files from [this github repo](https://github.com/wilselby/ouster_example/tree/master/ouster_description)

<br>

+ Result clip is below
<p align="center">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/0L2FCupYuH8" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</p>

<br>

+ Ouster Gazebo plugin source codes include **GPU** ray as [here](https://github.com/wilselby/ouster_example/blob/master/ouster_gazebo_plugins/include/ouster_gazebo_plugins/GazeboRosOusterLaser.h#L68)

~~~cpp
......

#if GAZEBO_GPU_RAY
#define GazeboRosOusterLaser GazeboRosOusterGpuLaser
#define RayPlugin GpuRayPlugin
#define RaySensorPtr GpuRaySensorPtr
#endif

......
~~~

<br>

+ However, original Ouster urdf file from the repository does not use **GPU** as [here](https://github.com/wilselby/ouster_example/blob/master/ouster_description/urdf/OS1-64.urdf.xacro#L55) or as below
+ So we have to edit those two lines to use **<span style="color:#3399ff">gpu_ray</span>** sensor instead of **ray**.

~~~xml
......

    <gazebo reference="${name}">
        <sensor type="gpu_ray" name="${name}-OS1-64">
<!--        <sensor type="ray" name="${name}-OS1-64">-->

......

          <plugin name="gazebo_ros_laser_controller" filename="libgazebo_ros_ouster_gpu_laser.so">
<!--          <plugin name="gazebo_ros_laser_controller" filename="libgazebo_ros_ouster_laser.so">-->

......
~~~

<br>

+ It perfectly works only consuming little amount of GPU resource!
<figure>
    <img src="/assets/posting/20210118/o1.png" style="width:100%"  onContextMenu="return false;">
</figure>

<br>

+ Using the edited Ouster urdf file boosts up the real time factor of Gazebo from around 0.3 to 1.0.

<figure>
    <img src="/assets/posting/20210118/o2.png" style="width:100%"  onContextMenu="return false;">
</figure>

