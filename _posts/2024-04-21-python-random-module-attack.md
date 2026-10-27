---
title: "Python Random Module Attack"
date: 2024-04-21 20:47:33 +0900
categories: ["블로그/기술문서", "Cryptography"]
tags: ["cryptography", "암호학"]
tistory_url: https://heahgo.tistory.com/entry/Cryptographgy-Python-Random-Module-Attack
published: true
obsidian_source: "6. Posts/tistory/Cryptography/Python Random Module Attack.md"
---

## Python Random Module
---

파이선에서 랜덤값을 얻기 위해 ramdon 이라는 모듈을 많이 사용한다.  
하지만 random 모듈은 암호학적인 PRNG (PseudoRandom Number Generator) 로 설계되지 않은 PRNG이기 때문에 난수의 추측이 가능한 등의 여러 취약한 부분이 존재할 수 있다.

## MT19937
---

Python의 Random 모듈은 MT19937 이라는 난수 생성 알고리즘을 사용한다.  
아래에 코드는 random.getrandbits(bit) 의 구현 코드이다.

```python
genrand_uint32(RandomObject *self)
{
    uint32_t y;
    static const uint32_t mag01[2] = {0x0U, MATRIX_A};
    /* mag01[x] = x * MATRIX_A  for x=0,1 */
    uint32_t *mt;

    mt = self->state;
    if (self->index >= N) { /* generate N words at one time */
        int kk;

        for (kk=0;kk<N-M;kk++) {
            y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
            mt[kk] = mt[kk+M] ^ (y >> 1) ^ mag01[y & 0x1U];
        }
        for (;kk<N-1;kk++) {
            y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
            mt[kk] = mt[kk+(M-N)] ^ (y >> 1) ^ mag01[y & 0x1U];
        }
        y = (mt[N-1]&UPPER_MASK)|(mt[0]&LOWER_MASK);
        mt[N-1] = mt[M-1] ^ (y >> 1) ^ mag01[y & 0x1U];

        self->index = 0;
    }

    y = mt[self->index++];
    y ^= (y >> 11);
    y ^= (y << 7) & 0x9d2c5680U;
    y ^= (y << 15) & 0xefc60000U;
    y ^= (y >> 18);
    return y;
}
```

<https://github.com/python/cpython/blob/main/Modules/_randommodule.c>

[cpython/Modules/_randommodule.c at main · python/cpython](https://github.com/python/cpython/blob/main/Modules/_randommodule.c)

##

## Attack
---

위 구현 코드 가장 아래 부분의 코드를 보면 비트 연산을 통하여 최종적으로 값을 생성한다.

```python
    y = mt[self->index++];
    y ^= (y >> 11);
    y ^= (y << 7) & 0x9d2c5680U;
    y ^= (y << 15) & 0xefc60000U;
    y ^= (y >> 18);
    return y;
```

이 과정을 Tempering 이라고 하며, 이를 역연산 하는 방법이 알려져 있다. 역연산 방법은 아래와 같다.

```python
def untemper(y):
    mask = 0x7F
    y ^= y >> 18
    y ^= (y << 15) & 0xEFC60000
    for i in range(1, 5):
        b = (mask << 7 * i) & 0x9D2C5680
        y ^= (y << 7) & b
    for _ in range(3):
        y ^= y >> 11
    return y & 0xFFFFFFFF
```

## Example
---

아래의 코드는 random의 state를 복구하는 예제이다.

mt19937은 32bit 단위의 624개의 state를 생성하고 random.getrandbits(32)는 state의 bits를 32bit씩 끊어서 값을 반환한다.

624개의 state를 다 사용하면 기존 state에서 다음에 쓸 state를 생성하여 사용한다.

즉 처음 state를 알게 되면 다음 random 값을 알 수 있게 된다.

```python
# poc.py

import random

N = 624
M = 397
MATRIX_A = 0x9908B0DF
UPPER_MASK = 0x80000000
LOWER_MASK = 0x7FFFFFFF

def untemper(y):
    mask = 0x7F
    y ^= y >> 18
    y ^= (y << 15) & 0xEFC60000
    for i in range(1, 5):
        b = (mask << 7 * i) & 0x9D2C5680
        y ^= (y << 7) & b
    for _ in range(3):
        y ^= y >> 11
    return y & 0xFFFFFFFF

state = random.getstate() # random의 초기 state 저장
output = []
for i in range(N):
    output.append(random.getrandbits(32)) # output에 random의 출력값 32bit * 624 저장

# random.getrandbits(32) 값에서 untemper를 통해 기존 state 복구
recover = (3, tuple([untemper(output[i]) for i in range(N)] + [0]), None)
random.setstate(recover) # 복구한 state를 초깃값으로 random 세팅

# 복구한 초기값의 random을 통해 생성된 랜덤 값과 초기 state를 통해 생성된 output을 비교해서
# 복구가 잘 되었는지 확인
for i in range(N):
    assert output[i] == random.getrandbits(32)
```
