---
title: "AES 펌웨어 구현에 대한 DPA(Differential Power Analysis)"
date: 2026-03-23 21:43:04 +0900
categories: ["블로그/기술문서", "Side Channel Analysis"]
tags: ["Differential Power Analysis", "DPA", "SCA", "Side Channel Analysis"]
tistory_url: https://heahgo.tistory.com/entry/AES-%ED%8E%8C%EC%9B%A8%EC%96%B4-%EA%B5%AC%ED%98%84%EC%97%90-%EB%8C%80%ED%95%9C-DPADifferential-Power-Analysis
published: true
obsidian_source: "6. Posts/tistory/Side Channel Analysis/AES 펌웨어 구현에 대한 DPA(Differential Power Analysis).md"
---

아래 링크의 강의에 있는 코드와 내용을 참고 및 사용 해서 쓴 글 입니다.

[Lab 3_2 - Recovering Data from a Single Bit](https://github.com/newaetech/chipwhisperer-jupyter/blob/59b5ac01118facacb625450af370ae95a0bc1c68/courses/sca101/Lab%203_2%20-%20Recovering%20Data%20from%20a%20Single%20Bit.ipynb)

[chipwhisperer-jupyter/courses/sca101/Lab 3_2 - Recovering Data from a Single Bit.ipynb at 59b5ac01118facacb625450af370ae95a0bc1c](https://github.com/newaetech/chipwhisperer-jupyter/blob/59b5ac01118facacb625450af370ae95a0bc1c68/courses/sca101/Lab%203_2%20-%20Recovering%20Data%20from%20a%20Single%20Bit.ipynb)

[Lab 3_3 - DPA on Firmware Implementation of AES](https://github.com/newaetech/chipwhisperer-jupyter/blob/59b5ac01118facacb625450af370ae95a0bc1c68/courses/sca101/Lab%203_3%20-%20DPA%20on%20Firmware%20Implementation%20of%20AES%20(MAIN).ipynb)

[chipwhisperer-jupyter/courses/sca101/Lab 3_3 - DPA on Firmware Implementation of AES (MAIN).ipynb at 59b5ac01118facacb625450af37](https://github.com/newaetech/chipwhisperer-jupyter/blob/59b5ac01118facacb625450af370ae95a0bc1c68/courses/sca101/Lab%203_3%20-%20DPA%20on%20Firmware%20Implementation%20of%20AES%20(MAIN).ipynb)

동일한 키로 임의의 평문들을 암호화 할 때의 소비 전력을 알고 있는 경우, 전력의 차이를 이용하여 key를 구하는 것을 보이겠습니다.

## 공격 환경
---

펌웨어는 AES-128의 간단한 구현으로 이루어져있습니다.

아래 코드가 **전력을 측정할 때 사용되는 코드**로 AES의 키를 세팅하고 서로 다른 평문들을 암호화하는 과정에서의 전력 트레이스를 2500개를 수집하는 동작을 합니다.

```cpp
from tqdm.notebook import trange
import numpy as np
import time

ktp = cw.ktp.Basic() # key text provider
trace_array = []
textin_array = []

# aes가 구현된 펌웨어에 넣을 key와 text 생성, 이때 생성한 key만을 사용
key, text = ktp.next()

target.set_key(key)

N = 2500 # 전력 트레이스 2500개 수집할 거임
for i in trange(N, desc='Capturing traces'):
    # ChipWhisperer의 FPGA에게 트리거를 찾도록 지시하는 함수라고 한다.
    # 트리거가 감지되면 (설정된 대로 scope.adc.samples) 샘플 수집을 시작
    scope.arm()

    # 타겟 기기에 평문으로 text를 보낸다.
    target.simpleserial_write('p', text)

    ret = scope.capture() # 전력 트레이스를 캡쳐한다.
    if ret:
        print("Target timed out!")
        continue
    # 타겟 기기에서 16바이트 읽어온다. 아마 암호문인듯
    response = target.simpleserial_read('r', 16)

    # 타겟 기기의 AES 암호화가 끝나면 캡쳐한 전력 트레이스를 불러와 리스트에 저장
    trace_array.append(scope.get_last_trace())
    # 타겟 기기에 입력된 평문을 리스트로 저장
    textin_array.append(text)

    #새로운 key와 평문 생성, 현재 코드에서는 key는 재사용하지 않음
    key, text = ktp.next()
```

수집한 파형 중 3개를 그래프로 출력하면 다음 그래프가 나옵니다.

**전력 트레이스 캡쳐 출력 코드**

```cpp
fig = cw.plot()

for i in trange(3):
    fig = cw.plot(trace_array[i])  

fig
```

**실행 결과**

![tistory-99-1](/assets/img/posts/aes-펌웨어-구현에-대한-dpadifferential-power-analysis/tistory-99-1.png)
*trace*

## 공격
---

![tistory-99-2](/assets/img/posts/aes-펌웨어-구현에-대한-dpadifferential-power-analysis/tistory-99-2.png)

AES는 암호화 과정 처음에 AddRoundKey연산 후, SubBytes 연산을 수행합니다.

이 연산에 대한 자세한 내용은 [Cryptograhpy AES (Advanced Encrytion Standard)](/posts/aes-advanced-encrytion-standard/)를 참고해주세요.

입력한 평문의 한 바이트에 대해 연산 과정을 코드로 나타내면 아래 코드에 정의된 함수와 같습니다.

```python
sbox = [
    # 0    1    2    3    4    5    6    7    8    9    a    b    c    d    e    f
    0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76, # 0
    0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0, # 1
    0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15, # 2
    0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75, # 3
    0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84, # 4
    0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf, # 5
    0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8, # 6
    0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2, # 7
    0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73, # 8
    0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb, # 9
    0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79, # a
    0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08, # b
    0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a, # c
    0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e, # d
    0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf, # e
    0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16  # f
]

def aes_internal(inputdata, key):
    return sbox[inputdata ^ key]
```

### AES DPA 과정
---

n번째 key 바이트를 추측하는 과정은 다음과 같습니다.

1. 추측한 key의 n번째 바이트를 key_byte_ guess 라 하자.
2. 주어진 전력 트레이스 캡쳐에 사용된 평문의 n번째 바이트를 input_byte라 하자.
3. hypothetical_leakage = aes_internal(key_byte_ guess , input_byte)를 계산한다.
4. input_byte의 해당하는 평문에 대한 전력 트레이스 캡쳐를 trace라 할 때 hypothetical_leakage의 첫번째 비트가 1인경우 one_list에 trace를 저장하고, 0이면 zero_list에 trace를 저장한다. (첫번째 비트가 아니어도 된다.)
5. one_list와 zero_list의 트레이스 캡쳐를 평균을 낸 것들을 one_avg, zero_avg라 하자.
6. max_diff_value = max(abs(one_avg - zero_avg))를 구한다.

위 과정을 0x00  ~ 0xFF 까지 반복하고 **가장 큰 max_diff_value가지는 n번째 key 바이트는**

**실제 n번째 키 바이트의 후보 중 하나**입니다.

왜 차이가 가장 큰  max_diff_value를 가지는 n번째 key 바이트 후보인지 설명하겠습니다.

먼저 비트가 1로 설정될 때와 0으로 설정 될 때의 전력차이는 분명한 차이가 있다는 겁니다.

자세한 내용은 아래 강의를 참고해주세요.

[Lab 3_1 - Large Hamming Weight Swings](https://github.com/newaetech/chipwhisperer-jupyter/blob/59b5ac01118facacb625450af370ae95a0bc1c68/courses/sca101/Lab%203_1%20-%20Large%20Hamming%20Weight%20Swings%20(MAIN).ipynb)

[chipwhisperer-jupyter/courses/sca101/Lab 3_1 - Large Hamming Weight Swings (MAIN).ipynb at 59b5ac01118facacb625450af370ae95a0bc1](https://github.com/newaetech/chipwhisperer-jupyter/blob/59b5ac01118facacb625450af370ae95a0bc1c68/courses/sca101/Lab%203_1%20-%20Large%20Hamming%20Weight%20Swings%20(MAIN).ipynb)

#### 추측한 key 바이트가 실제 key 바이트인 경우
---

추측한 n번째 key 바이트가 **실제 key 바이트라고 가정**하겠습니다.

실제 key 바이트인 경우 3번 과정인 hypothetical_leakage = aes_internal(key_byte_ guess , input_byte)의 hypothetical_leakage 값은 **실제 암호화 과정과는 연관이 되어있는 값**입니다.

hypothetical_leakage의 첫번째 비트가 1 또는 0 인 경우 해당 평문에 대한 전력 트레이스 캡쳐를 4번에서 one_list, zero_list로 분류 했었습니다.

추측한 key 바이트는 실제 key 바이트이므로 one_list에 분류된 전력 트레이스는 **실제로 암호화 과정중 aes_internal 과정에서 첫번째 비트가 1로 설정됩니다.**

이와 마찬가지로 zero_list에 분류된 전력 트레이스는 **실제로 암호화 과정중 aes_internal 과정에서 첫번째 비트가 0**로 설정됩니다.

앞서 언급한 **비트가 1로 설정될 때와 0으로 설정 될 때의 전력차이는 분명한 차이가 있다는 사실**을 이용하여

6번의 과정을 통해 얻은 **max_diff_value**(=max(abs(one_avg - zero_avg)))는 아래에 살펴볼 n번째 key 바이트가 실제 key 바이트가 아닌 경우의 값보다 **큰 값이 될 것 입니다.**

#### 추측한 key 바이트가 실제 key 바이트가 아닌 경우
---

추측한 n번째 key 바이트가 **실제 key 바이트가 아니라 가정**하겠습니다.

실제 key 바이트가  아닌 경우 3번 과정인 hypothetical_leakage = aes_internal(key_byte_ guess , input_byte)의 hypothetical_leakage 값은 **실제 암호화 과정과는 상관이 없는 값**입니다.

hypothetical_leakage의 첫번째 비트가 1 또는 0 인 경우 해당 평문에 대한 전력 트레이스 캡쳐를 4번에서 one_list, zero_list로 분류 했었습니다.

그러나 추측한 key 바이트는 실제 key 바이트가 아니기 때문에 **hypothetical_leakage의 첫번째 비트**의 값과, hypothetical_leakage 계산과정에서 사용된 **input_data에 대한 평문에 해당하는 전력 트레이스 캡쳐**에는 **상관관계가 존재하지 않습니다.** 따라서 max_diff_value(=max(abs(one_avg - zero_avg)))는 **사실상 무작위하게 one_list, zero_list를 고르는 것으로 보이며** 실제 key 바이트를 통해 얻은 max_diff_value와는 다르게 확실한 차이를 가지지 않으로 큰 값을 가지지 않게 됩니다.

따라서 **max_diff_value의 값이 큰 값이 높은 확률로 key 바이트에 해당**하므로 각 바이트 위치마다 (1~16) max_diff_value를 구해, 큰 값에 해당하는 key 바이트가  AES 암호화에 사용된 키 입니다.

위 사실을 코드로 구현하면 아래와 같습니다.

```python
from tqdm.notebook import trange
import numpy as np

# textin_array : 암호화에 사용된 평문 값 리스트
# trace_array : 암호화에 사용된 평문 값들에 대한 전력 트레이스 캡쳐 리스트

def aes_internal(inputdata, key):
    return sbox[inputdata ^ key]

# 비트가 1인 경우와 0인 경우의 트레이스 캡쳐들을 평균내서 반환
def calculate_diffs(guess, byteindex=0, bitnum=0):
    """Perform a simple DPA on two traces, uses global `textin_array` and `trace_array` """

    one_list = []
    zero_list = []

    for trace_index in range(numtraces):
        hypothetical_leakage = aes_internal(guess, textin_array[trace_index][byteindex])

        #Mask off the requested bit
        if hypothetical_leakage & (1<<bitnum):
            one_list.append(trace_array[trace_index])
        else:
            zero_list.append(trace_array[trace_index])

    one_avg = np.asarray(one_list).mean(axis=0)
    zero_avg = np.asarray(zero_list).mean(axis=0)
    return abs(one_avg - zero_avg)

#Store your key_guess here, compare to known_key
key_guess = []

# AES 펌웨어에 사용된 키
known_key = [0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6, 0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c]

for subkey in trange(0, 16, desc="Attacking Subkey"):
    guesses = []
    for guess in range(0x100): # 0x00 ~ 0xFF
        max_diff_value = np.max(calculate_diffs(guess, subkey, bitnum=0))
        guesses.append(max_diff_value) # 가장 큰 max_diff_value를 guesses 리스트에 추가
    sorted_guesses = np.argsort(guesses)[::-1] # 큰 순으로 정렬

    print("Top 5 guesses:")
    for i in range(5):
        print("    %02X"%(sorted_guesses[i]))
    print("\n")
```

####

#### 실행결과
```python
Error displaying widget: model not found
Top 5 guesses:
    2B
    E6
    B9
    96
    94

Top 5 guesses:
    7E
    15
    C3
    9E
    9B

Top 5 guesses:
    15
    01
    E1
    F2
    A8

Top 5 guesses:
    16
    EF
    EA
    AB
    24

Top 5 guesses:
    28
    DA
    4D
    0E
    F3

Top 5 guesses:
    AE
    42
    37
    56
    8F

Top 5 guesses:
    D2
    F9
    33
    40
    32

Top 5 guesses:
    A6
    37
    CD
    1B
    95

Top 5 guesses:
    AB
    46
    BC
    DF
    C0

Top 5 guesses:
    F7
    4A
    1B
    20
    E8

Top 5 guesses:
    15
    A8
    7E
    70
    7C

Top 5 guesses:
    88
    40
    35
    DB
    E3

Top 5 guesses:
    09
    6E
    BC
    E5
    84

Top 5 guesses:
    CF
    29
    68
    A4
    72

Top 5 guesses:
    4F
    24
    D6
    E2
    D7

Top 5 guesses:
    3C
    38
    81
    76
    57
```

실행 결과의 top1 guesses를 조합하면 2B, 7E, 15, 16, 28, AE, D2, A6, AB, F7, 15, 88, 09, CF, 4F, 3C

이는 실제 AES의 키 값인known_key = [0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6, 0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c]  
 와 동일합니다.

따라서 DPA를 통해 AES펌웨어 구현에 대해 키를 구하게 됩니다.
