---
title: "RSA Common Modulas Attack"
date: 2024-01-27 15:02:11 +0900
categories: ["블로그/기술문서", "Cryptography"]
tags: ["cryptography", "RSA", "RSA Common Modulas Attack", "암호학"]
tistory_url: https://heahgo.tistory.com/entry/Ceyptography-RSA-Common-Modulas-Attack
published: true
obsidian_source: "6. Posts/tistory/Cryptography/RSA Common Modulas Attack.md"
---

## RSA Common Modulus Attack
---

동일한 모듈러 값으로 각기 다른 공개지수 e1, e2  ( gcd(e1, e2) = 1 인 ) 를 사용하여 암호화 한 암호문의 평문을 알아내는 공격이다．

아래와 같이 평문 M이 있을 때, 각기 다른 공개지수 e1, e2로 암호화 한 값을 C1, C2라 하자.

![tistory-88-1](/assets/img/posts/rsa-common-modulas-attack/tistory-88-1.png)

![tistory-88-2](/assets/img/posts/rsa-common-modulas-attack/tistory-88-2.png)

확장 유클리드 알고리즘은 필요하다면 아래 페이지를 참고하자.

[확장 유클리드 알고리즘 (Extended Euclidean Algorithm)](/posts/확장-유클리드-알고리즘-extended-euclidean-algorithm/)

구한 s와 t를 각각 e1과 e2를 이용하여 암호화한 값인 c1, c2에 지수승을 하고 둘을 곱하면 평문이 복원된다.

![tistory-88-3](/assets/img/posts/rsa-common-modulas-attack/tistory-88-3.png)

아래의 파이썬 코드는 RSA Common Modulas Attack 의 예시 코드이다.

**poc.py**

```python
# poc.py

from sage.all import *
from Crypto.Util.number import getPrime
from Crypto.Util.number import long_to_bytes, bytes_to_long

# RSA Key Generation
p = getPrime(256)
q = getPrime(256)
n = p * q
e1, e2 = 3, 5

# Encryption
m = b"I hate cryptography"
print("Plain text:", m.decode())
m = bytes_to_long(m)

c1 = pow(m, e1, n)
c2 = pow(m, e2, n)

print(f"\nn = {n}")
print(f"c1 = {long_to_bytes(c1)}")
print(f"c2 = {long_to_bytes(c2)}")

# RSA Common Modulas Attack
u, s, t = xgcd(e1, e2)  # Extended Euclidean Algorithm from sage

decrypted = (pow(c1, s, n) * pow(c2, t, n)) % n
decrypted = int(decrypted)
decrypted = long_to_bytes(decrypted)

print(f"\nAttck Result: {decrypted.decode()}")
```

**poc.py 실행 결과**

![tistory-88-4](/assets/img/posts/rsa-common-modulas-attack/tistory-88-4.png)
