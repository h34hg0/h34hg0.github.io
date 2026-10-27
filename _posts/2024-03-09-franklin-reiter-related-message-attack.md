---
title: "Franklin-Reiter Related Message Attack"
date: 2024-03-09 00:55:25 +0900
categories: ["블로그/기술문서", "Cryptography"]
tags: ["Franklin-Reiter Related Message Attack", "RSA", "암호학"]
tistory_url: https://heahgo.tistory.com/entry/Cryptography-Franklin-Reiter-Related-Message-Attack
published: true
obsidian_source: "6. Posts/tistory/Cryptography/Franklin-Reiter Related Message Attack.md"
---

## Franklin-Reiter Related Message Attack
---

Franklin-Reiter Related Message Attack 은 두 개의 관련된 메세지에 대하여 동일한 RSA 키로 암호화 된 값을 알 때, 관련된 메세지의 값을 알 수 있는 공격이다.

![tistory-91-1](/assets/img/posts/franklin-reiter-related-message-attack/tistory-91-1.png)

M이라는 메세지와 관련된 메세지인 M1, M2 메세지의 암호화 값인 C1, C2를 알고 있으면 M값을 구할 수 있다.

두 방정식 f1, f2는 X = M 일 경우 0을 값으로 가진다.  ( f1(M) = f2(M) = 0 )

즉, X-M 을 공통 인수로 가지게 되어 gcd 알고리즘을 통해 f1, f2의 공통 인수 X-M을 구할 수 있으며,

구해진 인수 X-M의 상수항 -M에 N을 더함으로 M을 구하게 된다.

RSA의 공개키 e가 3일 경우 공통 인수는 일차식으로 나오게 되지만 e가 3이 아닐 경우 일차식이 아닌 경우가 있다.

일차식이 아닌 경우 공격에는 실패하게 된다.

아래의 코드는 Franklin-Reiter Related Message Attack 의 예시를 파이썬 언어로 나타낸 코드이다.

**poc.py**

```python
# poc.sage
from sage.all import *
from Crypto.Util.number import getPrime, bytes_to_long, long_to_bytes

M = b"cryptography"
M1 = M + b" is hard"
M2 = b"I hate " + M

e = 3
p, q = getPrime(512), getPrime(512)
N = p * q

c1 = pow(bytes_to_long(M1), e, N)
c2 = pow(bytes_to_long(M2), e, N)

def gcd(a, b):
    while b:
        a, b = b, a % b
    return a.monic()

a = 2 ** (8 * len(b" is hard"))
b = bytes_to_long(b" is hard")
c = 1
d = bytes_to_long(b"I hate ") * (2 ** (8 * len(M)))

# preparse("P.<X> =  PolynomialRing(Zmod(N))")
P = PolynomialRing(Zmod(N), names=("X",))
(X,) = P._first_ngens(1)

g1 = (a * X + b) ** e - c1
g2 = (c * X + d) ** e - c2

result = -gcd(g1, g2)
print(f"M = {long_to_bytes(int(result[0])).decode()}")
```

**실행 결과**

![tistory-91-2](/assets/img/posts/franklin-reiter-related-message-attack/tistory-91-2.png)

M1, M2 의 공통된 부분인 M을 복호화 해낸 것을 볼 수 있다.
