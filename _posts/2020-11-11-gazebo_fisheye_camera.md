---
layout: post
title: "Fisheye Camera in Gazebo Simulator"
date: 2020-11-11
excerpt: "T265 camera"
tags: [Gazebo, T265, Fisheye]
post: true
project: false
legacy: false
comments: true
---

# Making fisheye camera model for Gazebo sim.
+ Modeled <span style="color:#3399ff">Intel Realsense T265</span>
+ Referred [Fisheye Lense model](https://en.wikipedia.org/wiki/Fisheye_lens#cite_ref-44) and this [Link](https://github.com/ros-simulation/gazebo_ros_pkgs/issues/758)
+ Result video clip

<br>

<p align="center">
    <video width="781" height="320" controls>
      <source src="/assets/posting/1111-fisheye.mp4" type="video/mp4">
    </video>
</p>

<br>

+ in the **.sdf** file, insert `camera` sensor with `wideanglecamera` type.
~~~xml
      <sensor name="camera" type="wideanglecamera">
        <camera name="left">
          <pose>0 0 0 0 0 0</pose>
          <horizontal_fov>3.141592</horizontal_fov>
          <image>
            <width>848</width>
            <height>800</height>
            <format>R8G8B8</format>
          </image>
          <clip>
            <near>0.15</near>
            <far>1500</far>
          </clip>
          <noise>
            <type>gaussian</type>
            <mean>0.0</mean>
            <stddev>0.0001</stddev>
          </noise>
          <lens>
            <type>custom</type> 
            <custom_function> <!-- manually defined mapping function r = c1*f*fun(theta/c2 + c3) More information here: https://en.wikipedia.org/wiki/Fisheye_lens#Mapping_function -->
              <c1>1.0</c1>    <!-- linear scaling -->
              <c2>1.95</c2>       <!-- angle scaling -->
              <f>6</f>       <!-- one more scaling parameter -->
              <fun>tan</fun>   <!-- one of sin,tan,id -->
            </custom_function>
            <scale_to_hfov>true</scale_to_hfov>  <!-- if it is set to `true` your horizontal FOV will ramain as defined, othervise it depends on lens type and custom function, if there is one -->
            <!-- clip everything that is outside of this angle -->
            <cutoff_angle>2.84488668</cutoff_angle>
            <env_texture_size>512</env_texture_size> <!-- resolution of the cubemap texture, the highter it is - the sharper is your image -->
          </lens>
          <always_on>1</always_on>
          <update_rate>30</update_rate>
        </camera>
        <plugin name="camera_controller" filename="libgazebo_ros_camera.so">
          <robotNamespace>/t265</robotNamespace>
          <cameraName>stereo_ir/left</cameraName>
          <imageTopicName>fisheye_image_raw</imageTopicName>
          <cameraInfoTopicName>camera_info</cameraInfoTopicName>
          <frameName>camera_link</frameName>
          <hackBaseline>0</hackBaseline>
        </plugin>
      </sensor>
~~~
