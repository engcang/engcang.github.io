---
layout: post
title: "Ardupilot 1: Ardupilot-SITL-Gazebo"
subtitle: "PX4 펌웨어 탈출..."
date: 2024-05-10
comments: true
published: true
---

### 서론:
+ 드론 비행할때 항상 `픽스호크`를 사용하고 있고, `PX4` 펌웨어를 항상 사용해왔는데, 좀 무거운 감이 있고 항상 알수 없는 문제들이 발생할 때가 많아서 조금 더 역사가 오래된 `Ardupilot` 펌웨어로 갈아타기로 했다.
+ `PX4의` 좋은 점은 `PX4-SITL`이 잘되어 있어서 현실과 거의 동일하게 시뮬레이션을 해볼 수 있다는 것인데, `Ardupilot`도 잘 알아보니 SITL이 있고, `Gazebo`에도 연동할 수 있다.

<br>

### 그래서 해당 포스트에서는
+ `Ardupilot` 및 `Ardupilot-SITL`을 설치하고, `Gazebo`에 연동하는 것까지 설명하고자 한다.
+ [다음 포스트]({{site.url}}/ardupilot_guided_without_gps.html)에서는 GPS/GNSS 없이 SLAM으로 비행하도록 파라미터 설정하는 것과 takeoff, land를 포함해서 아주 간단한 비행 예제 코드를 설명하고자 한다.

<br>

#### 1. 준비물
+ `ROS`와 `Gazebo`는 설치되어 있다고 가정한다. (해당 포스트에서는 `ROS1`, `Gazebo-classic`임)
+ `MAVROS`를 설치해야 한다. 드론에 명령을 내리는 `mavlink` 프로토콜을 `ROS`에서 사용하도록 해주는 패키지임.
    ```bash
    sudo apt-get install ros-noetic-mavros ros-noetic-mavros-extras -y
    wget -O - https://raw.githubusercontent.com/mavlink/mavros/master/mavros/scripts/install_geographiclib_datasets.sh
    chmod +x install_geographiclib_datasets.sh
    sudo ./install_geographiclib_datasets.sh
    ```

<br>

#### 2. `Ardupilot`, `Ardupilot-Gazebo` plugin 설치
+ 먼저 `Ardupilot` 소스 코드 다운 및 설치, simulation 실행에 필요한 `mavproxy` 설치
    ```bash
    git clone https://github.com/ArduPilot/ardupilot
    cd ardupilot
    git submodule update --init --recursive
    bash Tools/environment_install/install-prereqs-ubuntu.sh -y || true
    . ~/.profile

    sudo usermod -a -G dialout $USER
    python3 -m pip install -U mavproxy
    ```

+ `Ardupilot-Gazebo` plugin 설치
    ```bash
    git clone https://github.com/khancyr/ardupilot_gazebo
    cd ardupilot_gazebo
    mkdir -p build
    cd build
    cmake ..
    make -j4
    sudo make install
    ```

+ 환경 변수 설정하기 (~/.bashrc 파일)
    + ``GIT_CLONED_PATH`` 잘 확인하기
        ```bash
        gedit .bashrc

        !! 입력하기
        source /usr/share/gazebo/setup.sh
        export GAZEBO_MODEL_PATH=$GAZEBO_MODEL_PATH:<GIT_CLONED_PATH>/ardupilot_gazebo/models

        !! 내 경우
        export GAZEBO_MODEL_PATH=$GAZEBO_MODEL_PATH:/home/mason/ws/ardupilot_gazebo/models

        !! 저장 후에 환경 변수 새로고침
        . ~/.bashrc
        ```

+ `Ardupilot-SITL` 빌드 및 실행해보기
    ```bash
    cd ardupilot/ArduCopter
    ../Tools/autotest/sim_vehicle.py -w
    ../Tools/autotest/sim_vehicle.py --console --map
    ```

<br>

#### 3. SITL + `Gazebo` 실행해보기
+ 위에서 실행한 SITL 종료하고, 다시 SITL 실행 및 `Gazebo`와 연결되는지 확인해보기
    ```bash
    cd ardupilot/ArduCopter
    ../Tools/autotest/sim_vehicle.py -f gazebo-iris --map --console

    cd ardupilot_gazebo
    gazebo --verbose worlds/iris_arducopter_runway.world
    ```
+ SITL을 실행한 터미널에서 (sim_vehicle.py를 실행한 터미널)
    ```bash
    >> arm throttle
    >> takeoff 5
    !! 시동 및 5m 높이로 이륙하는것 확인!
    ```

<br>

#### 4. SITL + `Gazebo-ROS`, `MAVROS` 실행해보기
+ `Gazebo-ROS`용 launch 파일 만들기 (world file의 경로 잘 확인하기)
    ```xml
    <?xml version="1.0"?>
    <launch>
        <!-- launches PX4 SITL, Gazebo environment, and spawns vehicle -->
        <arg name="world" default="/home/mason/ws/ardupilot_gazebo/worlds/iris_arducopter_runway.world"/>
        <!-- gazebo configs -->
        <arg name="gui" default="true"/>
        <arg name="debug" default="false"/>
        <arg name="verbose" default="false"/>
        <arg name="paused" default="false"/>
        <arg name="respawn_gazebo" default="false"/>
        <!-- Gazebo sim -->
        <include file="$(find gazebo_ros)/launch/emspty_world.launch">
            <arg name="gui" value="$(arg gui)"/>
            <arg name="world_name" value="$(arg world)"/>
            <arg name="debug" value="$(arg debug)"/>
            <arg name="verbose" value="$(arg verbose)"/>
            <arg name="paused" value="$(arg paused)"/>
            <arg name="respawn_gazebo" value="$(arg respawn_gazebo)"/>
        </include>
    </launch>
    ```
+ `MAVROS`의 `apm.launch` 파일 수정하기
    + IP 주소와 port 번호는 SITL (sim_vehicle.py)을 실행했을때 출력된 (SIM_VEHICLE: "mavproxy.py" "--out" "127.0.0.1:14550" ...) 에서 out 뒤에 오는 주소와 포트번호임
        ```xml
        <launch>
            ...
            <arg name="fcu_url" default="udp://127.0.0.1:14550@"/>
            ...
        </launch>
        ```
+ 이제 모두 실행하고 명령 줘보기
    ```bash
    cd ardupilot/ArduCopter
    ../Tools/autotest/sim_vehicle.py -f gazebo-iris --map --console

    roslaunch gazebo_ardupilot_iris.launch (위에서 만든 launch 파일, Gazebo와 드론을 불러옴)

    roslaunch mavros apm.launch

    !! 이제 명령 줘보기 (5m 이륙 확인)
    rosservice call /mavros/cmd/arming "value: true"
    rosservice call /mavros/cmd/takeoff "{min_pitch: 0.0, yaw: 0.0, latitude: 0.0, longitude: 0.0, altitude: 5.0}"    
    ```

<br>

#### 참고 링크들
+ [https://github.com/yanhwee/ardupilot-gazebo-ros-guide](https://github.com/yanhwee/ardupilot-gazebo-ros-guide)
+ [https://ardupilot.org/dev/docs/setting-up-sitl-on-linux.html](https://ardupilot.org/dev/docs/setting-up-sitl-on-linux.html)
+ [https://ardupilot.org/dev/docs/ros-sitl.html](https://ardupilot.org/dev/docs/ros-sitl.html)
