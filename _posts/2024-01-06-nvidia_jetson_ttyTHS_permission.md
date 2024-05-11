---
layout: post
title: "NVIDIA Jetson boards UART 시리얼 통신 권한 - ttyTHS (Pixhawk to ttyTHS)"
subtitle: "드론 껐다 킬때마다 권한 문제..."
date: 2024-01-06
comments: true
published: true
---

### 주저리주저리
+ 드론 자율비행할 때 pixhawk를 컴퓨터와 연결해서 `mavros`로 이리저리 제어한다.
+ USB로 꽂아쓰면 `ttyACM`으로 잡히는데, 이게 연결이 됐다 안됐다 하는 아주 개같은 놈이다.
+ 어차피 러닝 기반 알고리즘때문이나, 내구성, 전력 소모 등 전체적인 이유로 Jetson 보드를 쓰는데, GPIO 핀이 많이 있어서 아주 좋다.
+ UART로 연결하면 굉장히 안정적인데, 항상 권한 문제때문에 껐다 킬때마다 `chmod a+rw /dev/ttyTHS0`를 입력해주어야 했다.

<br>

### 본론
+ 매우 간단, `rules` 파일 하나 만들고, NVIDIA 서비스 하나 죽이면 된다.
+ 일단 `rules` 파일 먼저 생성 및 아래 내용 입력 후 저장.

```bash
sudo gedit /etc/udev/rules.d/99-ttyths.rules

# 아래 내용 입력 후 저장
ACTION="add", KERNEL=="ttyTHS*", MODE="0666"
```

+ 여기서 숫자 99는 priority이므로 맘에드는 대로 설정하면 된다. 굳이 낮게 만들필요 없다. 0666은 read write 권한이다.

+ 그리고, `ttyTHS`가 NVIDIA의 Tegra에서 지원하는 High Speed 시리얼통신이어서, 자기네들이 만든 용도 모를 service가 선점하고 있다고 한다.
+ 해당 service를 꺼버린다.

```bash
sudo systemctl disable nvgetty.service
```

+ 이후 재부팅하면 `ttyTHS` 포트는 권한 문제 없이 읽고 쓸 수 있다.


<h1 align="center">끝</h1>