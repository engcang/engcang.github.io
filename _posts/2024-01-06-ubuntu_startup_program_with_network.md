---
layout: post
title: "Ubuntu 시작 프로그램 - network (WiFi 등) 연결 후 프로그램 시작 (ROS로 로봇 자동 시작)"
subtitle: "라우터에 연결 된 후 ROS 프로그램 시작을 위해..."
date: 2024-01-06
comments: true
published: true
---

### 주저리주저리
+ [이전 포스팅]({{site.url}}/2023/12/14/ubuntu_startup_Jetson_Fan_ROS.html)에서 이미 `rc.local` 파일을 이용해서 `rc-local` 서비스, 즉 Ubuntu 부팅이 끝난 후 자동으로 root 권한으로 프로그램을 시작하는 서비스를 사용했었다.
+ 해당 서비스를 사용하면 ROS 노드나 launch파일을 실행할 수 있는데, 문제는 ROS를 `localhost`에서 사용할 때만 잘 동작한다.
+ 다른 remote PC에서 같은 ROS master에 접속 및 데이터를 확인하려고 `ROS_MASTER_URI`와 `ROS_HOSTNAME`을 이용해봤지만, 아예 launch파일이 실행 되지 않았다.
+ Network연결이 안되니까 ROS master 실행을 포기해버린 것. 그래서 **원하는 network 연결 후에 프로그램을 시작하도록 설정**하고자 한다.

<br>

### 본론
+ Ubuntu에서 제공하는 `systemd-networkd-wait-online` 서비스를 활용한다. 먼저 상태를 확인해보면 다음과 같이 죽어있을 것이다.

```bash
sudo systemctl status systemd-networkd-wait-online.service 

● systemd-networkd-wait-online.service - Wait for Network to be Configured
     Loaded: loaded (/lib/systemd/system/systemd-networkd-wait-online.service; disabled; vendor pres>
     Active: inactive (dead)
       Docs: man:systemd-networkd-wait-online.service(8)

```

+ 해당 서비스를 활성화 한다. 활성화 하고 어떤 네트워크에 연결되기를 기다릴지 `override` 파일을 만들어서 설정 해준다.

```bash
sudo systemctl enable systemd-networkd-wait-online.service

sudo gedit /etc/systemd/system/systemd-networkd-wait-online.service.d/override.conf
```

+ 나는 WiFi 라우터에 고정 IP를 할당 해놓고, 해당 라우터 외에는 아무것도 연결 안되게 다 지워버렸다. 무선랜카드 네트워크가 연결되면 프로그램을 시작하게 할 건데, 그러면 다음과 같이 적고 저장하면 된다.
    + 무선랜카드가 1개뿐이어서 `wlan0`에 네트워크가 연결 되면 항상 프로그램을 시작한다.
    + 비슷하게 이더넷으로 연결되는 네트워크는 `eno1` 등이 있는데, 이는 `ifconfig` 명령어로 본인 컴퓨터에 어떤 네트워크가 연결되었는지 확인해보면 된다.

```ini
[Service]
ExecStart=/usr/lib/systemd/systemd-networkd-wait-online -i wlan0
```

+ 이제 `wlan0` 네트워크가 연결될 때까지 기다리는 서비스는 생성이 되었다.

<br>

+ 이 `systemd-networkd-wait-online` 서비스가 실행되고 나서 실제로 수행할 프로그램도 서비스로 만들어서 다음과 같이 등록해주었다.

```bash
sudo gedit /etc/systemd/system/ros.service
```

```ini
[Unit]
Description=Drone Service
Wants=network-online.target
After=network-online.target

[Service]
Type=oneshot
ExecStart=/home/mason/autostart.sh

[Install]
WantedBy=multi-user.target
```

+ 서비스 enable

```bash
sudo systemctl enable ros.service
```

+ 설명하면, network-online이 될때까지 기다리고, 그 이후에 `/home/mason/autostart.sh` 프로그램을 1회 실행하는 서비스이다.
+ 더 자세하게 `service` 작성에 대해 알고 싶으면 [여기](https://manpages.ubuntu.com/manpages/focal/en/man5/systemd.service.5.html) 참고

<br>

+ 다음은 예시로 내가 사용하는 `autostart.sh` 프로그램의 내용이다. 물론 `chmod +x autostart.sh` 명령어로 실행 가능한 파일로 만들어두어야 한다.

```bash
#!/bin/bash

source /opt/ros/noetic/setup.bash
source /home/mason/catkin_ws/devel.setup.bash

export ROS_MASTER_URI="http://192.168.0.100:11311"
export ROS_HOSTNAME="192.168.0.100"

roscore & roslaunch --wait test_package test.launch

exit 0
```

+ 이제 재부팅 후 네트워크에 연결되면 자동으로 프로그램을 시작한다. 굳굳