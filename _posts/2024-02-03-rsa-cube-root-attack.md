---
title: "RSA Cube Root Attack"
date: 2024-02-03 00:43:08 +0900
categories: ["블로그/기술문서", "Cryptography"]
tags: ["Cube Root Attack", "RSA", "암호학"]
tistory_url: https://heahgo.tistory.com/entry/Cryptography-RSA-Cube-Root-Attack
published: true
obsidian_source: "6. Posts/tistory/Cryptography/RSA Cube Root Attack.md"
---

## RSA Cube Root Attack
---

RSA의 공개 지수 e의 값이 3일때 시도할 수 있는 공격이다.

![tistory-89-1](/assets/img/posts/rsa-cube-root-attack/tistory-89-1.png)

C를 암호문, P를 평문이라 했을 때, 위 이미지와 같이 평문 P를 N과 C를 이용하여 세제곱근으로 식을 표현할 수 있다.

암호문 C와 N의 값을 알고 있고, e=3일 때,

- P^3 < N인 경우, P^3 = C 이므로 단순히 C의 세제곱근을 구하면 평문 P를 구할 수 있다.
- P^3 > N인 경우, C + NK 에서 K에 정수를 대입하여 세제곱근이 정수가 나올때 까지 반복한다.  정수가 나오면 이는 평문 P의 값이다. P^3 > N 이므로 K의 값은 P^3을 N으로 나누었을 때의 몫이 0 이상의 정수이므로 0, 1, 2, .... 의 정수가 된다. 따라서 K의 값을 0부터 계속 1씩 증가하여 반복해 세제곱근이 정수가 나올때 까지 반복한다. 이때, P의 크기가 크면 구하는 시간이 오래 걸려서 사실상 값을 구하기 힘들다.

아래의 코드는 RSA Cube Root Attack 의 예시 코드이다.

**poc.py**

```python
# poc.py

from sage.all import *
from Crypto.Util.number import getPrime
from Crypto.Util.number import bytes_to_long, long_to_bytes

m = b"I hate cryptography"
print(f"Plaintext : {m.decode()}")
m = long_to_bytes(bytes_to_long(m))

# Key generation
p = getPrime(256)
q = getPrime(256)
n = p * q
e = 3

# Encryption
c = pow(bytes_to_long(m), e, n)

print(f"\nn = {n}")
print(f"c = {long_to_bytes(c)}")

while True:
    try:
        C = ZZ(c).nth_root(3)
        print(f"\nAttack Result : {long_to_bytes(C).decode()}")
        break
    except:
        c += n
```

**poc.py 실행 결과**

![tistory-89-2](/assets/img/posts/rsa-cube-root-attack/tistory-89-2.png)

m 값이 적당히 작은 값일 때,  공격을 시도 하면 빠르게 구해진다.

아래의 코드는 m이 긴 경우이다.

```python
# poc.py

from sage.all import *
from Crypto.Util.number import getPrime
from Crypto.Util.number import bytes_to_long, long_to_bytes

m = b"I hate cryptography, I hate cryptography"
print(f"Plaintext : {m.decode()}")
m = long_to_bytes(bytes_to_long(m))

# Key generation
p = getPrime(256)
q = getPrime(256)
n = p * q
e = 3

# Encryption
c = pow(bytes_to_long(m), e, n)

print(f"\nn = {n}")
print(f"c = {long_to_bytes(c)}")

while True:
    try:
        C = ZZ(c).nth_root(3)
        print(f"\nAttack Result : {long_to_bytes(C).decode()}")
        break
    except:
        c += n
```

실행해 보면 값이 바로 나오지 않아 오래걸리는 것으로 m 값이 크면 공격 시간이 굉장히 오래걸린다.

그래서 RSA Cube Root Attack 는 m값이 작을 때 가능한 공격이다.
