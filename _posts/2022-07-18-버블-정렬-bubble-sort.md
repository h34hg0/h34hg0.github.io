---
title: "버블 정렬 (Bubble Sort)"
date: 2022-07-18 00:30:12 +0900
categories: ["블로그/기술문서", "Algorithm"]
tags: ["bubble sort", "버블정렬", "정렬 알고리즘"]
tistory_url: https://heahgo.tistory.com/entry/%EB%B2%84%EB%B8%94%EC%A0%95%EB%A0%AC-Bubble-Sort
published: true
obsidian_source: "6. Posts/tistory/Algorithm/버블 정렬 (Bubble Sort).md"
---

## 버블 정렬
---

### 버블 정렬이란?
---

인접한 두 원소의 크기를 비교하여 대소관계에 따라 위치를 교환하거나 교환하지 않음으로 오름차순이나 내림차순으로 데이터를 정렬하는 알고리즘이다.

---

### 예시
---

![tistory-54-1](/assets/img/posts/버블-정렬-bubble-sort/tistory-54-1.png)

위의 배열을 버블정렬을 통해 오름차순으로 한번 정렬해 보자

![tistory-54-2](/assets/img/posts/버블-정렬-bubble-sort/tistory-54-2.png)

인접한 두 값을 비교하여 큰 값이 왼쪽에 있다면 (큰 값, 작은 값) 두 개의 값의 위치를 서로 바꿔주고, 반대되는 경우 (작은 값, 큰 값) 자리를 바꾸지 않는다.

이 과정을 수행하면 배열에서 가장 큰 값이 배열의 가장 오른쪽에 위치하게 된다.

![tistory-54-3](/assets/img/posts/버블-정렬-bubble-sort/tistory-54-3.png)

배열에 가장 큰 값인 5를 오른쪽에 옮겼던 과정을 다시 수행한다.

이때 5는 이미 제자리를 찾았으므로 비교대상에서 제외한다.

비교를 수행하여 배열에서 두 번째로 큰 값인 4가 5 다음에 위치하게 된다.

![tistory-54-4](/assets/img/posts/버블-정렬-bubble-sort/tistory-54-4.png)

4와 5가 제자리를 찾았으므로 이 두 값을 제외한 값들을 비교하여 정렬한다.

![tistory-54-5](/assets/img/posts/버블-정렬-bubble-sort/tistory-54-5.png)

정렬한 결과 뒤죽박죽이였던 배열의 값들이 아름답게 오름차순으로 정렬된 것을 볼 수 있다.

---

### 시간복잡도
---

![tistory-54-6](/assets/img/posts/버블-정렬-bubble-sort/tistory-54-6.png)
*1부터 n-1까지의 합*

n개의 값을 가지는 배열을 정렬한다고 가정했을 때, 가장 최악의 경우 비교 횟수는 (n - 1) + (n - 2) + (n - 3) + ....... + 1 가 된다.

1 부터 n - 1 까지의 합을 식으로 표현하면 위와 같다.

![tistory-54-7](/assets/img/posts/버블-정렬-bubble-sort/tistory-54-7.png)
*빅오 표기법*

빅오 표기법으로 시간복잡도를 나타내면 최고차항이 n^2이므로 O(n^2) 이 된다.

---

### 코드 구현
---

```python
# bubble_sort.py
# Time Complexity : O(n^2)

def bubble_sort(arr, result):

    for i in range(len(arr)):
        for j in range(len(arr) - 1 - i):
            if result[j] > result[j+1]:
                tmp = result[j]
                result[j] = result[j + 1]
                result[j + 1] = tmp

if __name__=="__main__":
    number_list = list(map(int, input("Input Sequence : ").split()))
    sort = number_list[:]
    print("before :", number_list)
    bubble_sort(number_list, sort)
    print("after :", sort)
```

![tistory-54-8](/assets/img/posts/버블-정렬-bubble-sort/tistory-54-8.png)
*4 5 1 3 2 입력 후 결과*

4 5 1 3 2를 입력하니 버블 정렬의 결과인 1 2 3 4 5가 출력되는 것을 볼 수 있다.

---

---
