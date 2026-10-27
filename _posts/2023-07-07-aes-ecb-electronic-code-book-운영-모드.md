---
title: "AES-ECB (Electronic Code Book) 운영 모드"
date: 2023-07-07 16:07:56 +0900
categories: ["블로그/기술문서", "Cryptography"]
tags: ["AES", "AES-ECB", "Crypto", "암호학"]
tistory_url: https://heahgo.tistory.com/entry/AES-ECB-Electronic-Code-Book-%EC%9A%B4%EC%98%81-%EB%AA%A8%EB%93%9C
published: true
obsidian_source: "6. Posts/tistory/Cryptography/AES-ECB (Electronic Code Book) 운영 모드.md"
---

### ECB (Electronic Code Book) 운영 모드
---

ECB 운영 모드는  AES 암호화를 그대로 적용한 모드이다.

![tistory-84-1](/assets/img/posts/aes-ecb-electronic-code-book-운영-모드/tistory-84-1.png)
*AES-ECB Encrytion*

평문을 블록의 크기 (128 bit) 만큼 나눈 후, 각각의 블록을 동일한 키로 암호화를 한 결과를 합쳐서 암호문을 완성한다.  

복호화는 암호화의 역과정이다.

![tistory-84-2](/assets/img/posts/aes-ecb-electronic-code-book-운영-모드/tistory-84-2.png)
*AES-ECB DEcrytion*

## ECB 운영 모드의 취약함
---

ECB 운영 모드는 단순하게 블록만을 암호화 하기 때문에 다른 블록과의 연관성이 없다.  
그러한 이유로 ECB는 취약해서 사용되지 않고 있다.  

만약 동일한 평문 블록이 있으면 암호화된 평문 블록들 또한 동일한 값을 가지기 때문에 이를 통해 동일한 평문들을 찾을 수도 있을 것이다.  
또한 평문 블록들이 동일한 키로 암호화 되어 이를 이용해 평문을 알아낼 수도 있다.

![tistory-84-3](/assets/img/posts/aes-ecb-electronic-code-book-운영-모드/tistory-84-3.png)
*https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation*

또한 위의 이미지를 보면 가장 왼쪽 이미지를 AES-ECB로 암호화 한 결과가 중간 이미지이다.  
원래 이미지와는 색만 다를 뿐인 암호화된 이미지를 출력한다. 암호화 전의 이미지가 보인다는 것은 ECB 운영모드를 사용하지 말아야할 이유로 충분하다.

---

---
