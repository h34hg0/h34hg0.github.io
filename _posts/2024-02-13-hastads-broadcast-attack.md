---
title: "Hastad's Broadcast Attack"
date: 2024-02-13 16:07:51 +0900
categories: ["블로그/기술문서", "Cryptography"]
tags: ["cryptography", "Hastad", "RSA", "암호학", "하스타드"]
tistory_url: https://heahgo.tistory.com/entry/Cryptography-Hastads-Broadcast-Attack
published: true
obsidian_source: "6. Posts/tistory/Cryptography/Hastad's Broadcast Attack.md"
---

## Hastad's Broadcast Attack
---

동일한 평문 M을 동일한 공개지수 e 를 사용하여 서로 다른 N값을 이용하여 암호화 한 값 C 알고 있을 때, 평문을 알아낼 수 있는 공격이다. (C, N 쌍이 e 크기 이상 만큼 필요하다.)

식의 크기를 줄이기 위해 공개 지수인 e의 값을 3이라 생각하고 하겠다.

아래의 C1, C2, C3, N1, N2, N3 를 알고 있다고 하자.

![tistory-90-1](/assets/img/posts/hastads-broadcast-attack/tistory-90-1.png)

그러면 중국인의 나머지 정리 (CRT) 를 이용하여 M^3 mod N1 \* N2 \* N3 (M3 < N1 \* N2 \* N3) 의 값을 알아 낼 수 있다.

중국인의 나머지 정리를 이용하여 M^3를 구해보자.

![tistory-90-2](/assets/img/posts/hastads-broadcast-attack/tistory-90-2.png)

위와 같이 M^3 mod N1 \* N2 \* N3 를 구할 수 있으며 M^3 < N1 \* N2 \* N3 이므로 이는 M^3 값이다.

M^3 < N1 \* N2 \* N3 인 이유

더보기

M^3 < N1 \* N2 \* N3 인 이유는 N1, N2, N3 가 2048비트라 하면, M은 최대 2047 비트 만큼의 크기를 가질 수 있다.

M^3 은 최대 2047 \* 3 =  6141 비트 크기를 가질 수 있으며 N1\*N2\*N3 = 2048\*3 = 6144 비트를 가진다.

따라서 M^3 < N1\*N2\*N3

이제 이 M^3 를 sagemath 의 nth_root 나 gmpy2 의 iroot 메서드를 이용해서 세제곱근을 구하여  M값을 알아낼 수 있다.

아래의 파이썬 코드는 Hastad's Broadcast Attack 의 예시 코드이다.

**poc.py**

```python
# poc.py

from sage.all import *
from Crypto.Util.number import getPrime
from Crypto.Util.number import bytes_to_long, long_to_bytes

m = b"I hate cryptography"

print(f"Plain Text: {m.decode()}")
m = long_to_bytes(bytes_to_long(m))

# Key generation
N = [0, 0, 0]
for i in range(3):
    p = getPrime(256)
    q = getPrime(256)
    N[i] = p * q
e = 3

# Encryption
c = [0, 0, 0]
for i in range(3):
    c[i] = pow(bytes_to_long(m), e, N[i])

print(N)
print(c)

# Hastad's Broadcast Attack
M = N[0] * N[1] * N[2]
n1 = N[1] * N[2]
n2 = N[0] * N[2]
n3 = N[0] * N[1]

s1 = inverse_mod(n1, N[0])
s2 = inverse_mod(n2, N[1])
s3 = inverse_mod(n3, N[2])

decrypted = ((n1 * c[0] * s1) + (n2 * c[1] * s2) + (n3 * c[2] * s3)) % M

decrypted = decrypted.nth_root(3)
print("Plain Text:", long_to_bytes(decrypted).decode())
```

**실행 결과**

![tistory-90-3](/assets/img/posts/hastads-broadcast-attack/tistory-90-3.png)
