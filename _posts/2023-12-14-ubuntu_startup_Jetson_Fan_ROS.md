---
layout: post
title: "Jetson Orin NX FAN max PWM 설정 with 부팅 - Ubuntu 시작 프로그램"
subtitle: "Ubuntu startup program on boot"
date: 2023-12-14
comments: true
published: true
---

### 주저리주저리
+ Jetson Orin NX를 쓰는데, 보통 드론에 달아서 쓰다보니 프로펠러가 식혀줘서 열이 문제가 되는지 몰랐다. 
+ 근데 Xavier NX랑은 다르게 FAN이 생각보다 엄청 천천히 돌아간다... 자동으로 킬때마다 항상 최대 PWM으로 FAN을 동작하고 싶었다.
+ 꼭 이 용도가 아니더라도 다른 프로그램을 Ubuntu 시작 시에 자동으로 실행할 수 있다. ***심지어 sudo 권한***이다.

<br>


### 본론

#### 1. 프로그램 등록
+ `rc-local` service는 ***부팅이 끝나고 나서 자동으로 root 권한으로 시작하는 프로그램***들을 담고 있는데, Ubuntu 18.04부터 비활성화 되어있어서 활성화가 필요하다.
+ 일단 `rc.local` 파일이 존재 하지도 않는 경우가 많으니 만들어야한다. `gedit` 등으로 `/etc/rc.local` 파일을 열어서 다음과 같이 입력하고 저장한다.

```sh
#!/bin/bash

# rc.local
#
# This script is executed at the end of each multiuser runlevel.
# Make sure that the script will "exit 0" on success or any other
# value on error.
#
# In order to enable or disable this script just change the execution
# bits.
#
# By default this script does nothing.

exit 0
```

+ 이제 `#!/bin/bash`와 `exit 0` 사이에 원하는 명령어를 적으면 된다.
+ 내 Jetson Orin NX의 `/etc/rc.local` 파일은 다음과 같이 생겼다.

```sh
#!/bin/bash

# ...
/usr/bin/jetson_clocks --fan

exit 0
```

+ `sudo /usr/bin/jetson_clocks --fan` 명령어는 FAN의 PWM을 최대로 설정하지만, 재부팅하면 날아간다. 부팅할 때마다 이제 자동으로 FAN이 최대 속도로 돌아갈 것이다.
+ `rc.local`에 실행 권한을 부여한다.
```bash
sudo chmod +x /etc/rc.local
```

#### 2. 설정 및 활성화
+ 먼저, 모든 `user`에 동일하게 프로그램들을 실행하기 위해 다음 `Install` 태그의 내용을 `/lib/systemd/system/rc-local.service`에 추가로 입력해준다.

```ini
#  SPDX-License-Identifier: LGPL-2.1+
#
#  This file is part of systemd.
#
#  systemd is free software; you can redistribute it and/or modify it
#  under the terms of the GNU Lesser General Public License as published by
#  the Free Software Foundation; either version 2.1 of the License, or
#  (at your option) any later version.

# This unit gets pulled automatically into multi-user.target by
# systemd-rc-local-generator if /etc/rc.local is executable.
[Unit]
Description=/etc/rc.local Compatibility
Documentation=man:systemd-rc-local-generator(8)
ConditionFileIsExecutable=/etc/rc.local
After=network.target

[Service]
Type=forking
ExecStart=/etc/rc.local start
TimeoutSec=0
RemainAfterExit=yes
GuessMainPID=no

[Install]
WantedBy=multi-user.target
```

+ 그리고 활성화 진행!

```bash
sudo systemctl enable rc-local.service
sudo systemctl start rc-local.service

이후, 제대로 rc-local이 켜져있는지 확인
sudo systemctl status rc-local.service

종료를 원하면
sudo systemctl stop rc-local.service
sudo systemctl disable rc-local.service
```

+ 이제, 재부팅하면 FAN이 자동으로 최대 속도로 돌아간다.

#### 3. 응용
+ `rc.local`에 명령어를 저렇게 직접 적어주어도 되고, 또 다른 실행 프로그램들을 등록할수도 있다. 이를 테면 ROS node들이라든지...
+ ROS 프로그램을 실행하는 script를 하나 만들고 실행가능 하도록 권한을 부여한다.

```sh
#!/bin/bash

source /opt/ros/noetic/setup.bash
source /home/mason/catkin_ws/devel.setup.bash

export ROS_MASTER_URI="http://localhost:11311"
export ROS_HOSTNAME="localhost"

roscore & roslaunch --wait test_package test.launch

exit 0
```

```bash
sudo chmod +x /home/mason/test.sh
```

+ 마찬가지로 `/etc/rc.local`에 추가해준다

```sh
#!/bin/bash

# ...
/usr/bin/jetson_clocks --fan
/home/mason/test.sh # 혹은 sh /home/mason/test.sh

exit 0
```

#### 참고 및 출처
+ [https://passwd.tistory.com/212](https://passwd.tistory.com/212)