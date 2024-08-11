---
layout: post
title: "Ardupilot 2: GUIDED mode, takeoff, land"
subtitle: "PX4 펌웨어 탈출..."
date: 2024-05-11
comments: true
published: true
---

### 서론:
+ 드론 비행할때 항상 `픽스호크`를 사용하고 있고, `PX4` 펌웨어를 항상 사용해왔는데, 좀 무거운 감이 있고 항상 알수 없는 문제들이 발생할 때가 많아서 조금 더 역사가 오래된 `Ardupilot` 펌웨어로 갈아타기로 했다.
+ `Ardupilot`에서도 드론 온보드 PC에서 바로 `픽스호크`로 명령을 줄 수 있고, `MAVROS`를 사용해서 `GPS` 없이 자율 비행 하도록 구현이 가능한데, 조금 헤맸어서 필요한 기초만 정리해두려고 한다.
+ [이전 포스트]({{site.url}}/ardupilot_sitl_gazebo.html)에서는 쉬운 개발 환경을 위해 `Ardupilot`용 `SITL`과 `Gazebo`, `ROS`를 연동하는 법에 대해서 다뤘다.

<br>

### 그래서 해당 포스트에서는
+ `GPS`/`GNSS` 없이 `SLAM` 등의 외부 위치 추정값으로 드론을 비행하도록 파라미터 설정하는 방법과
+ Takeoff, land가 가능하도록 설정, 명령어를 알아보도록 한다.

<br>

#### 1. Parameters
+ 외부 위치 추정 값은 `/mavros/vision_pose/pose` topic에 `geometry_msgs/PoseStamped` 형태로 쏴주면 되고, `GPS` 없이 비행하기 위해서는 다음과 같이 파라미터를 설정하면 된다.
    + 일단 전체 파라미터 목록 및 설명 - [https://ardupilot.org/copter/docs/parameters.html](https://ardupilot.org/copter/docs/parameters.html)
    - AHRS_EKF_TYPE = 3 to use EKF3
    - EK2_ENABLE = 0 to disable EKF2
    - EK3_ENABLE = 1 to enable EKF3
    - EK3_SRC1_POSXY = 6 (ExternalNAV)
    - EK3_SRC1_POSZ = 6 (ExternalNAV)
    - EK3_SRC1_VELXY = 6 (ExternalNAV)
    - EK3_SRC1_VELZ = 6 (ExternalNAV)
    - EK3_SRC1_YAW = 6 (ExternalNAV)
    - **EK3_SRC_OPTIONS = 0 (다른 sensor의 속도 전부 섞이지 않도록)**
    - GPS1_TYPE, GPS2_TYPE = 0 to disable the GPS
    - AHRS_GPS_USE=0
    - COMPASS_USE, COMPASS_USE2, COMPASS_USE3 = 0
    - VISO_TYPE = 1 to enable visual odometry
    - **visual odometry로 검색해서 전부 적절히 설정 (offset, variance, delay 등)**
    - **SLAM의 발산 관련**
        - 관련 링크 - [https://ardupilot.org/dev/docs/common-ek3-affinity-lane-switching.html](https://ardupilot.org/dev/docs/common-ek3-affinity-lane-switching.html)
        - 관련 링크 - [https://ardupilot.org/copter/docs/ekf-inav-failsafe.html](https://ardupilot.org/copter/docs/ekf-inav-failsafe.html)
        - **VISO_DELAY_MS, 조금 크게 해야 EKF가 발산 안함 (>100ms)**
        - EK3_SRC2, SRC3 => `SLAM`이 발산하는 등의 비상 상황에만 동작하므로 위해 PosZ는 Barometer, Yaw는 compass 등으로 적절히 설정하면 된다. 근데 저는 그냥 다 ExternalNav로 설정함
        - **EK3_ERR_THRESH 값을 조금 크게 => EKF lane switching 방지**
        - **FS_EKF_THRESH = 0 => EKF fail safe 방지**

<br>

#### 2. Takeoff / Land
+ **`PX4` 펌웨어를 사용할때는 그냥 `OFFBOARD` 모드에서 `/mavros/setpoint_position/local` topic에 명령 값을 주면 이륙과 착륙이 가능했는데, `Ardupilot`에서는 그게 안된다.**
+ 그리고 필수로 **EKF origin을 set 해주어야만 한다.** 아무런 값이나 넣어줘도 되는데, 단위는 주위해야 한다.
    + 방법1: `Lua script` 사용 - 위도와 경도는 10의 7제곱을 곱해주어야하고, 고도는 cm단위이므로 100을 곱해주면 된다.
        + 파라미터에서 `SCR_ENABLE` = 1 로 설정 (enable)
        + 실제 드론의 경우 `픽스호크` SD카드의 APM/scripts 폴더에 파일을 넣으면 된다.
        + 시뮬레이션의 경우 SITL을 실행하는 (sim_vehicle.py) 터미널 현재 경로에 scripts 폴더를 만들고 거기에 파일을 넣으면 된다.
        + **`픽스호크`가 켜질때 자동으로 실행됨**
        + 파일 원본 - [ahrs-set-origin.lua](https://github.com/ArduPilot/ardupilot/blob/master/libraries/AP_Scripting/examples/ahrs-set-origin.lua)
            + 혹시 짤릴까봐 코드 첨부
                ```lua
                function update ()
                    if not ahrs:initialised() then
                        return update, 5000
                    end
                    origin = assert(not ahrs:get_origin(),"Refused to set EKF origin - already set")
                    location = Location() location:lat(-353632640) location:lng(1491652352) location:alt(58409)
                    
                    if ahrs:set_origin(location) then
                        gcs:send_text(6, string.format("Origin Set - Lat:%.7f Long:%.7f Alt:%.1f", location:lat()/10000000, location:lng()/10000000, location:alt()/100))
                    else
                        gcs:send_text(0, "Refused to set EKF origin")
                    end
                    return
                end
                return update()
                ```
    + 방법2: `MAVROS` 사용 - 위도와 경도 고도 모두 `MAVROS`내에서 알맞게 곱해주므로 그대로 넣어주면 된다.
        + `/mavros/global_position/set_gp_origin` topic에 값을 쏘면 된다
        + 예제 코드
            ```cpp
            #include <ros/ros.h>
            #include <geographic_msgs/GeoPointStamped.h> //ekf origin setter

            ros::Publisher m_ekf_ahrs_origin_setter_pub = m_nh.advertise<geographic_msgs::GeoPointStamped>("/mavros/global_position/set_gp_origin", 3);
            
            geographic_msgs::GeoPointStamped ekf_origin_;
            ekf_origin_.header.stamp = ros::Time::now();
            ekf_origin_.position.latitude = -35.3632640;
            ekf_origin_.position.longitude = 149.1652352;
            ekf_origin_.position.altitude = 584.09;
            m_ekf_ahrs_origin_setter_pub.publish(ekf_origin_);
            ```        
- Land: 
    - `GUIDED` 모드 명령 값이 아닌, `land` 명령을 줘야만 함 - [MAV_CMD_NAV_LAND](https://ardupilot.org/copter/docs/common-mavlink-mission-command-messages-mav_cmd.html#mav-cmd-nav-land)
    - `MAVROS` 패키지를 사용하는 경우 `/mavros/cmd/land` service에 명령 값을 쏴주면 되고 위 링크처럼 아무 값도 안넣고 쏘면 된다. 위도와 경도를 명시해주면 해당 위도와 경도로 날아가서 착륙한다는데, `GPS`가 없을 때는 함부로 하지 말자.
- Takeoff:
    - `GUIDED` 모드 명령 값이 아닌, `takeoff` 명령을 줘야만 함 - [MAV_CMD_NAV_TAKEOFF](https://ardupilot.org/copter/docs/common-mavlink-mission-command-messages-mav_cmd.html#mav-cmd-nav-takeoff)
    - `MAVROS` 패키지를 사용하는 경우 `/mavros/cmd/takeoff` service에 명령 값을 쏴주면 되고 위 링크처럼 **원하는 이륙 고도 값을 넣고 쏘면 된다**.

<br>

#### 3. Takeoff / 비행 / Land
+ 예제 코드
    ```cpp
    #include <ros/ros.h>
    #include <mavros_msgs/SetMode.h> //GUIDED mode
    #include <mavros_msgs/CommandTOL.h> //takeoff, land
    #include <geographic_msgs/GeoPointStamped.h> //ekf origin setter

    ros::Publisher m_position_controller_pub = m_nh.advertise<geometry_msgs::PoseStamped>("/mavros/setpoint_position/local", 3);
    ros::Publisher m_ekf_ahrs_origin_setter_pub = m_nh.advertise<geographic_msgs::GeoPointStamped>("/mavros/global_position/set_gp_origin", 3);
    ros::ServiceClient m_set_mode_client = m_nh.serviceClient<mavros_msgs::SetMode>("/mavros/set_mode");
    ros::ServiceClient m_takeoff_client = m_nh.serviceClient<mavros_msgs::CommandTOL>("/mavros/cmd/takeoff");
    ros::ServiceClient m_land_client = m_nh.serviceClient<mavros_msgs::CommandTOL>("/mavros/cmd/land");

    // Skip
    ... 
    ...
    ...

    geographic_msgs::GeoPointStamped ekf_origin_;
    ekf_origin_.header.stamp = ros::Time::now();
    ekf_origin_.position.latitude = -35.3632640;
    ekf_origin_.position.longitude = 149.1652352;
    ekf_origin_.position.altitude = 584.09;
    m_ekf_ahrs_origin_setter_pub.publish(ekf_origin_);

    mavros_msgs::SetMode mode_switch_command_;
    mode_switch_command_.request.custom_mode = "GUIDED";
    m_set_mode_client.call(mode_switch_command_);

    mavros_msgs::CommandTOL mav_cmd_;
    mav_cmd_.request.altitude = m_first_taking_off_altitude;
    m_takeoff_client.call(mav_cmd_);
    if (mav_cmd_.response.success)
    {
        ROS_WARN("Take off success!!");
    }

    geometry_msgs::PoseStamped goal_pose_stamped;
    goal_pose_stamped.header.stamp = ros::Time::now(); //important
    goal_pose_stamped.pose.position.x = 5.0;
    goal_pose_stamped.pose.position.y = 0.0;
    goal_pose_stamped.pose.position.z = 5.0;
    goal_pose_stamped.pose.orientation.w = 1.0;
    m_position_controller_pub.publish(goal_pose_stamped);

    mavros_msgs::CommandTOL mav_cmd_;
    m_land_client.call(mav_cmd_);
    if (mav_cmd_.response.success)
    {
        ROS_WARN("Land success!!");
    }
    ``` 

<br>

#### 참고링크
- [https://github.com/ArduPilot/ardupilot/issues/26993](https://github.com/ArduPilot/ardupilot/issues/26993)
- [https://ardupilot.org/dev/docs/copter-commands-in-guided-mode.html](https://ardupilot.org/dev/docs/copter-commands-in-guided-mode.html)
- [https://ardupilot.org/copter/docs/common-non-gps-navigation-landing-page.html](https://ardupilot.org/copter/docs/common-non-gps-navigation-landing-page.html)
- [https://discuss.ardupilot.org/t/integration-of-ardupilot-and-vio-tracking-camera-part-2-complete-installation-and-indoor-non-gps-flights/43405](https://discuss.ardupilot.org/t/integration-of-ardupilot-and-vio-tracking-camera-part-2-complete-installation-and-indoor-non-gps-flights/43405)
- [https://ardupilot.org/copter/docs/parameters.html](https://ardupilot.org/copter/docs/parameters.html)
- [https://mavlink.io/en/messages/common.html#messages](https://mavlink.io/en/messages/common.html#messages)
