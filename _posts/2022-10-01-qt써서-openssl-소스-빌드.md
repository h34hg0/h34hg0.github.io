---
title: "qt써서 openssl 소스 빌드"
date: 2022-10-01 23:46:00 +0900
categories: ["개발", "Programming"]
tags: []
tistory_url: https://heahgo.tistory.com/entry/openssl-%EC%86%8C%EC%8A%A4-%EB%B9%8C%EB%93%9C
published: true
obsidian_source: "6. Posts/tistory/Programming/qt써서 openssl 소스 빌드.md"
---

github에서 소스 git clone

cd openssl

./config --debug

make -j8

cd apps

ldd ./openssl

cd ../

pwd

위 결과 copy

export LD_LIBRARY_PATH=(copy한 패스)

cd apps

ldd ./openssl

바뀐거 확인

qt open create project

import project

import existing project (열려면 \*.creator 파일 오픈)

왼쪽 세로창 project 클릭

run

executable에서 자기 openssl실행파일 패스 입력 (ex home/user/openssl/apps/openssl)

command line arguments는 ./openssl (입력값) 에서 입력값 부분

s_client -connect google.com:443 입력하면 구글과 tls 접속

environment details 클릭

Add클릭

variable 에는 LD_LIBRARY_PATH

value에는 copy한 패스 입력

끝~~~~~~~~~~~
