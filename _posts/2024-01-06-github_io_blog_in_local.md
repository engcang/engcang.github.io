---
layout: post
title: "Github io Blog를 Ubuntu local에서 빌드 및 확인"
subtitle: "번거로운 commit 및 deployment 대기 시간을 없애기 위해,,,"
date: 2024-01-06
comments: true
published: true
---

### 서론:
+ 처음 Github io blog를 만들고 5년 정도 지난 것 같다. 중간에 한번 지워버려서 포스팅은 많이 날아갔지만,, 
+ 뭐 조금 바꿀때마다 commit하고 page deployment를 한참 기다리고, 그리고 다시 commit하고... 너무 시간 소모가 많았다.
+ 진작에 로컬 환경에서 ruby랑 gem을 이용해서 jekyll을 빌드해서 확인할 수 있다는 걸 알고 있긴 했는데,,,
+ 언제 배워서 언제 또 하나 싶었다가.. 진짜 너무 시간 낭비인것 같아서 빠르게 배웠다.
+ 다른 블로그들 보니 몇 시간씩 헤맸다던데 운 좋게 30분 만에 끝냈다.

<br>

### 본론 전 미리 스포
+ Ubuntu에 보통 `ruby`는 깔려있다. 근데 이게 `gem`이랑 `jekyll`을 쓰기 위한 버전이랑 잘 안맞다.
+ 버전에 맞게 설치 + 권한만 해결 해주면 그냥 바로 된다.
+ 혹여나 무지성 복붙 하지말고 본인 컴터에 맞게 에러나 버전을 잘 확인하면 좋겠습니당.

### 본론

#### 1. `ruby`와 `gem` 설치 및 설정
+ `ruby`와 `gem`은 Ubuntu에 이미 깔려있다. 아래 명령어로 확인

```bash
ruby -v
> ruby 2.7.0p0 (2019-12-25 revision 647ee6f091) [x86_64-linux-gnu]

gem -v
> 3.1.2
```

+ 그래도 필요한 dependency들이 있으니 몇 개만 설치해준다.

```bash
sudo apt-get install ruby-full build-essential zlib1g-dev
```

+ 그리고 기본으로 `gem`이 깔린 폴더는 root 권한이 필요해서 이후에 이래저래 복잡하므로, 권한 문제가 없는 폴더를 사용하도록 환경 변수를 설정해준다.

```bash
# 주의, 최초 1회만 실행하면 됨. 계속 하면 bashrc 더러워짐
echo "export GEM_HOME=$HOME/gems" >> ~/.bashrc
echo "export PATH=$HOME/gems/bin:$PATH" >> ~/.bashrc
source ~/.bashrc
```

<br>


#### 2. `bundler`와 `jekyll` 설치
+ 원래는 다음과 같이 설치한다고 하는데, 바로 에러가 뜰 것이다.

```bash
gem install jekyll bundler # 설치

# 에러들
ERROR:  Error installing jekyll:
	The last version of sass-embedded (~> 1.54) to support your Ruby & RubyGems was 1.63.6. Try installing it with `gem install sass-embedded -v 1.63.6` and then running the current command again
	sass-embedded requires Ruby version >= 3.1.3. The current ruby version is 2.7.0.0.
Fetching bundler-2.5.4.gem
ERROR:  Error installing bundler:
	The last version of bundler (>= 0) to support your Ruby & RubyGems was 2.4.22. Try installing it with `gem install bundler -v 2.4.22`
	bundler requires Ruby version >= 3.0.0. The current ruby version is 2.7.0.0.
```

+ "ERROR"라고 스펠링 대문자인게 진짜 열받지만 나름 친절하게 알려주고 있다. 버전 문제 이므로 시키는 대로 올바른 버전을 설치하면 된다.

```bash
gem install sass-embedded -v 1.54
gem install bundler -v 2.4.22
```

+ 이후에 자기 Github io 블로그를 clone 해오고, 그 폴더에 들어가서 `gem` 설정 및 설치하면 된다.

```bash
# 주소 주의, 내 블로그에용
git clone git@github.com:engcang/engcang.github.io
cd engcang.github.io
```

+ 이 때, 자기가 사용하는 `jekyll-theme`에 따라 `Gemfile`이 있는 경우도 있고, 없는 경우도 있는데, 없어도 상관없다.
+ 다음 명령어로 `Gemfile`을 생성한다.

```bash
bundle init
```

+ 그리고 `Gemfile` 맨 아래에 필요한 `gem`들을 적어주면 되는데, 나 같은 경우에는 블로그 내용물 중 `_config.yml` 파일에 다음과 같은 부분이 있다.

```yaml
plugins:
  - jekyll-sitemap
  - jekyll-seo-tag
  - jemoji
  - jekyll-remote-theme
```

+ 해당 plugins이 필요한 `gem`이므로 `Gemfile`에 다음과 같이 적어준다.
+ 아 참고로 위 plugins에는 없지만 `kramdown-parser-gfm`은 markdown 언어를 사용하기 위해 필요하다고 한다. 

```
# frozen_string_literal: true

source "https://rubygems.org"

# gem "rails"
gem "jekyll-sitemap"
gem "jekyll-seo-tag"
gem "jemoji"
gem "jekyll-remote-theme"
gem "kramdown-parser-gfm"
```

+ 이제 해당 `gem`들을 설치해준다. (현재 터미널 경로는 계속 내 Github 블로그 repository)

```bash
bundle install
```

<br>

#### 3. `bundler`로 `jekyll` 실행 및 내 블로그 빌드해서 로컬에서 보기
+ 생각보다 빨리 끝났다. 터미널은 계속 내 블로그 repository에 위치하고 있는 상태에서, 빌드 및 실행!

```bash
bundler exec jekyll serve
> Server address: http://127.0.0.1:4000
> Server running... press ctrl-c to stop.
```

+ 이제 저 주소로 접속하면 된다. 빌드 개빨라... Git에 push해서 docker image 빌드하고 deploy하는거 기다릴 필요가 없다.

+ 이 때, 혹시 다음과 같은 에러가 발생한다면,

```bash
...

Conversion error: Jekyll::Converters::Markdown encountered an error while converting '_posts/2023-02-27-docker.md':
                    uninitialized constant Kramdown::Utils::OrderedHash
...

14: from /home/mason/gems/gems/jekyll-4.3.3/lib/jekyll/converters/markdown/kramdown_parser.rb:54:in `initialize'
13: from /usr/lib/ruby/vendor_ruby/kramdown/parser/base.rb:69:in `parse'

...
```

+ 또 열받지만 에러에서 친절히 힌트를 주고 있는데, 분명히 설정한 환경변수대로 `$HOME/gems` 폴더만 사용해야하는데, `/usr/lib` 폴더를 동시에 사용해서 문제가 생긴 걸 눈치챌수 있다.
+ 특히나 이 에러는 `kramdown`에서 발생했으므로 그냥 쿨하게 지워주면 된다.

```bash
sudo apt remove ruby-kramdown
```

+ 그리고 다시 빌드 하면 잘됨

```bash
bundler exec jekyll serve
```
