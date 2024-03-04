---
layout: post
title: "Jetson 보드 (Orin NX) Jetpack 기본 OpenCV 죽이고 ROS, Ubuntu에서 사용하는 standard version OpenCV 설치"
subtitle: "NVIDIA 왜 standard version으로 JetPack 구성 안했어... 부들부들..."
date: 2024-03-05
comments: true
published: true
---

### 주저리주저리
+ 드론에 주로 `Jetson Orin NX`를 사용하는데, `OpenCV`를 사용할 일이 생겼다. `Jetpack`에서 기본으로 넣어주는 `OpenCV` 버전과 `Ubuntu` 20.04 (`ROS noetic`)의 표준 버전과 달라서 문제가 많다.
+ 기존에도 `Jetpack`과 `Ubuntu` 표준의 `OpenCV` 버전이 다른 경우가 있었던 것 같지만, 해당 조합에서는 `OpenCV` 4.5.4와 `OpenCV` 4.2.0의 문법 차이가 있어서 **<span style="color:#3399ff">Segmentation fault</span>**가 발생한다...

<br>

### 그래서 해당 포스트에서는
+ `Jetson Orin NX`에 `Jetpack`으로 설치된 `OpenCV` 4.5.4를 지우고 + `apt source list`에서도 지워서
+ apt로 `OpenCV`를 설치할 때와 `ROS noetic`에서 사용하는 `OpenCV` 패키지들, `cv_bridge` 사용에 문제가 없도록 설정하는 법을 정리한다.
+ 단순히 `Jetpack`의 `OpenCV`를 지우거나 source 빌드하는 것은, `ROS noetic`에서 사용하는 `OpenCV` 관련된 패키지들을 사용할 때 발생하는 모드의 근본적인 해결이 되지 못한다.
+ 따라서, 
    1. `Jetpack`의 `OpenCV`를 지우고
    2. `Jetpack`에서 넣어둔 `apt source list`의 `OpenCV` 우선 순위를 낮추고
    3. `Ubuntu` 20.04 (`ROS noetic`) standard version의 `OpenCV`를 `apt source list`에서 우선 순위를 높여서 문제를 해결한다.


<br>

#### 1. `Jetpack`의 `OpenCV` 지우기
+ 일단 `OpenCV` 관련된 거 다 지워야 한다.
    + 보통 `OpenCV` 4.5.4와 `ROS` (`Ubuntu`)의 4.2.0이 섞여 있는 상태이고, 다시 4.2.0을 설치할 것이므로 굳이 여기서 `sudo apt autoremove` 까지 할필요 없다. 괜히 너무 많이 지우면 골치아파짐.
```bash
sudo apt remove libopencv*
sudo find /usr/ -name "*opencv*" -exec rm {} \;
```

<br>

#### 2. `apt source list`와 `preferences` 확인 및 수정
+ `Ubuntu` 20.04의 경우 `universe` repository에 이미 OpenCV 4.2.0을 가지고 있다. 
+ 따라서 `universe` repository를 apt list에 추가 하면 된다.

    ```bash
    sudo add-apt-repository universe
    >> 이미 있는 경우,
    'universe' distribution component is already enabled for all sources.
    ```

+ 그리고 apt list를 확인해 보면 다음과 같이 `universe`가 있다. 그리고 열받는 `repo.download.nvidia.com`도 추가되어 있다.

    ```bash
    >> apt list 확인
    apt policy

    ...

    500 https://repo.download.nvidia.com/jetson/t234 r35.3/main arm64 Packages
        release o=Nvidia,a=stable,n=r35.3,l=L4T Jetson T234 r35.3,c=main,b=arm64
        origin repo.download.nvidia.com
    500 https://repo.download.nvidia.com/jetson/common r35.3/main arm64 Packages
        release o=Nvidia,a=stable,n=r35.3,l=L4T Jetson r35.3,c=main,b=arm64
        origin repo.download.nvidia.com

    ...

    500 http://kr.archive.ubuntu.com/ubuntu focal/universe amd64 Packages
        release v=20.04,o=Ubuntu,a=focal,n=focal,l=Ubuntu,c=universe,b=amd64
        origin kr.archive.ubuntu.com

    ...
    ```

+ 이제, `universe` repository의 우선 순위를 `repo.download.nvidia.com`보다 높게 설정한다.

    ```bash
    >> 파일 이름은 아무렇게나 해도 됨
    sudo gedit /etc/apt/preferences.d/opencv-priority

    >> 입력 후 저장
    Package: libopencv* opencv*
    Pin: release o=Ubuntu
    Pin-Priority: 1001

    Package: *
    Pin: origin repo.download.nvidia.com
    Pin-Priority: 100
    ```

<br>

#### 3. Standard version OpenCV 설치
+ 마지막으로, `apt list`를 갱신하고 표준 버전의 `OpenCV`를 설치하면 된다.
    ```bash
    >> 4.5.4가 아니라 4.2.0이 설치됨
    sudo apt update
    sudo apt install libopencv-dev

    >> ROS가 깔려 있었던 경우, opencv를 지우면서 많은 패키지가 지워지거나 파괴 되었으므로
    sudo apt install ros-noetic-desktop-full
    ```


<br>

<h1 align="center">끝</h1>