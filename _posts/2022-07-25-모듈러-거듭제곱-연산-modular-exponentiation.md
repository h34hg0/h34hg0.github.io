---
title: "모듈러 거듭제곱 연산 (modular exponentiation)"
date: 2022-07-25 03:56:45 +0900
categories: ["블로그/기술문서", "Algorithm"]
tags: ["modular exponentiation", "거듭제곱", "모듈러", "모듈러 거듭제곱", "파이썬"]
tistory_url: https://heahgo.tistory.com/entry/%EB%AA%A8%EB%93%88%EB%9F%AC-%EA%B1%B0%EB%93%AD%EC%A0%9C%EA%B3%B1-%EC%97%B0%EC%82%B0
published: true
obsidian_source: "6. Posts/tistory/Algorithm/모듈러 거듭제곱 연산 (modular exponentiation).md"
---

## 개요
---

일반적으로 매우 큰 지수승의 수에 대해서 연산하는 것은 많은 자원을 이용해야한다. 특히 모듈러 연산 x\*\*e (mod n) 대해서 e가 크면 클수록 매우 많은 공간과 시간을 써야한다. 하지만  모듈러 연산의 성질을 이용하여 연산의 속도를 매우 크게 향상 시킬 수 있다.

---

## 모듈러 연산의 성질
---

이 모듈러 연산에 대해서 여러가지 성질이 있지만 이 글에서 다룰 성질은 단 두가지이다.

![tistory-55-1](/assets/img/posts/모듈러-거듭제곱-연산-modular-exponentiation/tistory-55-1.png)
*1*

![tistory-55-2](/assets/img/posts/모듈러-거듭제곱-연산-modular-exponentiation/tistory-55-2.png)
*2*

---

## 빠른 모듈러 거듭제곱 연산
---

### 과정과 원리
---

아래의 예시로 설명하겠다.

![tistory-55-3](/assets/img/posts/모듈러-거듭제곱-연산-modular-exponentiation/tistory-55-3.png)
*모듈러 연산의 대상의 지수를 2의 제곱의 지수의 합(이진수) 의 형태로 변환*

먼저 우리가 나눌 대상인 x의 지수 7를 2의 제곱의 합으로 나타낸다.

![tistory-55-4](/assets/img/posts/모듈러-거듭제곱-연산-modular-exponentiation/tistory-55-4.png)
*모듈러 연산의 성질 2*

![tistory-55-5](/assets/img/posts/모듈러-거듭제곱-연산-modular-exponentiation/tistory-55-5.png)
*모듈러 연산의 성질 1*

모듈러 연산의 성질을 이용하여 위와 같은 형태로 변환하고 계산한다.  
기존 지수의 대한 연산은 밑을 그 지수의 계수만큼 곱하는 연산이 이루어진다.  
하지만 모듈러연산에서는 지수에 대한 연산을 위와같이 변환하여 큰 지수에 대한 거듭제곱을 바로 하지 않고, 지수를 나누어 단계적으로 모듈러 연산을 하고 그 결과를 저장하여 다음 연산에 이용함으로  빠르게 계산할 수 있게 된다.

---

### 코드 구현 (파이썬)
---

```python
# modular_exponentiation.py
# Time Complexity : O(logn)

def mod_exp_r2l(a, n, m):           # right to left (r2l)
    n = bin(n)[2:]
    A, B = 1, a
    for i in range(len(n) - 1, -1, -1):
        if n[i] == '1':
            A = pow(A*B, 1, m)
        B = pow(B, 2, m)
    return A

def mod_exp_l2r(a, n, m):           # left to right (l2r)
    if (n < 2):
        return a ** n % m
    n = bin(n)[3:]                  # Use less memory than r2l
    A = a
    for i in n:
        A = pow(A, 2, m)
        if i == '1':
            A = pow(A * a, 1, m)
    return A

if __name__ == "__main__":
    first_int, second_int, third_int = map(int, input("Input a, n, m (example 17 9 31) : ").split(' '))
    print('a ^ n mod m')
    print(f'mod_exp_r2l : {mod_exp_r2l(first_int, second_int, third_int)}')
    print(f'mod_exp_l2r : {mod_exp_l2r(first_int, second_int, third_int)}')
    print(f'python  pow : {pow(first_int, second_int, third_int)}' )
```

r2l 과 l2r 의 차이점은 l2r 이 r2l 보다 저장공간을 적게 쓴다는 점이다.  

시간복잡도는 연산 대상의 지수를 이진수로 변환하여 이진수의 자릿수만큼 반복하게 된다.  
따라서 O(logn)으로 시간복잡도를 나타낼 수 있다.

---

---

##
