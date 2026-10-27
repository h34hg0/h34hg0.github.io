---
title: "SageMath에서 pwntools, pycrpytodome 사용하는 방법 (모듈 설치 방법)"
date: 2024-03-20 02:41:07 +0900
categories: ["블로그/기술문서", "SageMath"]
tags: ["pwntools", "pycrpytodome", "SageMath"]
tistory_url: https://heahgo.tistory.com/entry/sagemath%EC%97%90%EC%84%9C-pwntools-pycrpytodome-%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95
published: true
obsidian_source: "6. Posts/tistory/SageMath/SageMath에서 pwntools, pycrpytodome 사용하는 방법 (모듈 설치 방법).md"
---

sage -sh 입력 후, pip install pwntools, pip install pycryptodome 을 입력 해주면 된다.

```python
sage -sh
pip install pwntools
pip install pycryptodome
```

이 외에도 다른 모듈이 사용하고 싶으면 sage -sh 입력후 pip install [module name] 로 설치해주면 된다.  

+ 더 간단한 방법으로  sage --pip [mudule name] 으로 설치하면 된다
