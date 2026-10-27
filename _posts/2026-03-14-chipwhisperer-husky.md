---
title: "ChipWhisperer Husky"
date: 2026-03-14 23:25:21 +0900
categories: ["블로그/기술문서", "Side Channel Analysis"]
tags: ["ChipWhisperer", "부채널", "부채널분석"]
tistory_url: https://heahgo.tistory.com/entry/ChipWhisperer-Husky
published: true
obsidian_source: "6. Posts/tistory/Side Channel Analysis/ChipWhisperer Husky.md"
---

## ChipWhisperer

---

NewAE Technology에서 개발한 임베디드 기기 보안 연구용 오픈 소스 도구 체인으로, 전력 분석(SPA/CPA) 및 글리칭(Voltage/Clock)을 통한 부채널 공격(Side-Channel Attack)을 수행하는 FPGA 기반 하드웨어 및 소프트웨어 플랫폼으로  

별도의 하드웨어 구성 없이 부채널 분석에 대한 연구가 가능하다.  

<https://chipwhisperer.readthedocs.io/en/latest/getting-started.html>

## ChipWhisperer Husky

---

ChipWhisperer-Husky는 CW1173 ChipWhisperer-Lite의 후속 제품으로 이전 모델에 비해 해상도와 속도가 향상된 ADC, ChipWhisperer-Pro에서만 제공되었던 추가 기능을 구현할 수 있는 더 큰 FPGA, 그리고 더욱 유연한 클럭킹 등 여러 가지 개선 사항을 갖추고 있다.  

대충 여러 공격 (전력 분석, 글리칭 등) 을 수행하게 도와주는 거라고 생각하면 된다.  

<https://chipwhisperer.readthedocs.io/en/latest/Capture/ChipWhisperer-Husky.html>

## NAE-CWHUSKY-SK1

---

부채널 분석을 위한 도구 모음으로 부채널 분석 및 글리칭에 대한 실습을 할 수 있다.

![tistory-97-1](/assets/img/posts/chipwhisperer-husky/tistory-97-1.png)

아래 사이트를 통해 실습 환경 구축을 위한 설치를 할 수 있다.  
설치한 경우 주피터 노트북이 설치가 되며 여러 공격에 대한 튜토리얼이 있다.  
<https://chipwhisperer.readthedocs.io/en/latest/starting.html>  

아래는 NAE-CWHUSKY-SK1에 대한 메뉴얼이다.  
<https://media.newae.com/manuals/cwhusky_manual_28march2023.pdf>  

아래의 링크는 마우저 구매링크이다. 가격은 USD로 사는게 더 싸며 지금 기준으로 $643.75이다.  
관세랑 부가세를 합치면 110만원 정도 나왔던 거 같다.  
<https://www.mouser.kr/ProductDetail/NewAE/NAE-CWHUSKY-SK1?qs=rQFj71Wb1eUq6zUbSt2x8g%3D%3D&srsltid=AfmBOoreYSc6qOvVWQcKMnqSSydjIJdE1if7R-Sp2bSZ5T4cqUtOCMYM>  

앞으로 이 장비를 사용해서 ChipWhisperer가 제공하는 주피터 노트북의 실습을 따라하는 글들을 올리겠다.
