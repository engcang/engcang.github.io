---
layout: post
title: "원격 접속 설정: RustDesk + Tailscale 조합 - 무료 오픈소스, TeamViewer, AnyDesk 대체"
subtitle: "국제연결 하기에 XRDP는 너무 느려서..."
date: 2026-07-22
comments: true
published: true
---

### 서론:
+ `XRDP` (윈도우 원격데스크톱연결) 기반으로 원격 접속하면 실제 그 컴퓨터에서 작업하는 듯한 일인칭 시점을 제공해서 좋지만, 보통의 대학교들이 모두 보안상의 문제로 교내 VPN망에 접속해서 인증을 해야만 연결이 된다. 번거롭다. 그리고, 미국-한국처럼 먼 곳에서 사용하니 속도가 굉장히 느리다. 화면을 전송하는 방식 자체의 문제라서 어떻게 할 수가 없다.
+ 대안으로 `TeamViewer`나 `AnyDesk`를 많이 사용할텐데, 시간 제한이 있고 상업적 사용으로 의심되면 차단당한다. 한달에 3-4만원정도 금액을 내기엔 뭔가 아깝다.
+ `TeamViewer`, `AnyDesk`와 동일하게 동작하지만 무료 오픈소스인 `RustDesk`를 `ChatGPT`한테 추천 받아서 셋팅 및 사용해보고 좋아서 글로 정리해둔다.
+ 요새 누가 이런 포스팅을 볼까? GPT가 다 알려주는디

<br>

### 그래서 해당 포스트에서는
+ `RustDesk` 설정 및 사용 방법을 아주 간단하게 정리해두려고 한다.
+ 추가로, 공유기 포트포워딩 설정의 번거로움과 + 혹시 모를 해킹의 위험을 피하고 + `RustDesk` ID를 외울 필요 없이 사용 가능하도록 `Tailscale`을 함께 설정한다. 아, `Windows`랑 `Ubuntu` 다 된다.
+ 즉, **`RustDesk` 공개 서버를 사용하지 않고, `Tailscale`의 사설 IP로 직접 접속**한다.

<br>

### 1. 원격 호스트 (접속 당하는) PC 설정
+ `Tailscale` 설치 - `Windows`
    1. [홈페이지](https://tailscale.com/download)에서 다운 받아 설치하고 실행
    2. `Tailscale` 계정 회원가입 및 로그인
    3. 트레이 아이콘 우클릭
    4. (**부팅시 자동으로 시작**) `Preferences → Run unattended` 활성화
    5. PC의 사설 IP는 트레이 아이콘 우클릭해서 확인하거나, [http://console.tailscale.com/admin](http://console.tailscale.com/admin)에 접속해서 내 계정의 모든 IP를 확인 가능
+ `Tailscale` 설치 - `Ubuntu`
    + 다운 및 실행
        ```bash
        curl -fsSL https://tailscale.com/install.sh | sh
        sudo tailscale up
        ```
    + 자동으로 열리는 브라우저에서 계정 회원가입 및 로그인
    + 자동 시작 확인:
        ```bash
        sudo systemctl enable --now tailscaled
        systemctl is-enabled tailscaled
        systemctl is-active tailscaled
        ```
    + Tailscale IP 확인: (혹은 [http://console.tailscale.com/admin](http://console.tailscale.com/admin)에 접속해서 내 계정의 모든 IP를 확인 가능)
        ```bash
        tailscale ip -4
        ```
+ `RustDesk` 설치 - `Windows`
    1. [홈페이지](https://rustdesk.com/)에서 다운 받아 설치 및 실행 (**`exe`로 받으면 설치 불필요**)
    2. `Settings → Security → Unlock security settings`
    3. 다음 설정 활성화:
        * `Enable direct IP access`
        * 영구 비밀번호 설정
        * Direct IP 포트는 기본값 `21118` 사용
        * 자동 시작
        * Windows 방화벽 요청이 나오면 RustDesk의 사설 네트워크 접근을 허용한다.
+ `RustDesk` 설치 - `Ubuntu`
    1. [홈페이지](https://rustdesk.com/)에서 다운 받아 설치 및 실행
        ```bash
        sudo apt install ./rustdesk-*.deb
        sudo systemctl enable --now rustdesk
        ```
    2. `Settings → Security → Unlock security settings`
    3. 다음 설정 활성화:
        * `Enable direct IP access`
        * 영구 비밀번호 설정
        * Direct IP 포트는 기본값 `21118` 사용
        * 자동 시작
    4. 방화벽 (ufw) 설정:
        ```bash
        sudo ufw allow in on tailscale0 to any port 21118 proto tcp
        sudo ufw status
        ```

---

### 2. 클라이언트 (접속하는) PC 설정 및 접속
1. `Tailscale` 및 `RustDesk`는 위의 호스트 PC 설정과 동일하게 설치 및 설정
2. **호스트와 동일한 `Tailscale` 계정으로 로그인**
4. `RustDesk` 원격 주소 입력란에 다음 입력 하고 접속:
    ```text
    호스트-Tailscale-IP:21118
    (예) 100.80.20.15:21118
    ```
5. 호스트에서 설정한 `RustDesk` 영구 비밀번호 입력

---

### 3. 요약
+ 호스트
    + `Tailscale`, `RustDesk` 자동 시작
    + Direct IP access 활성화
    + 영구 비밀번호 설정
+ 클라이언트
    + `Tailscale` 로그인
    + `RustDesk`에서 100.x.x.x:21118로 접속