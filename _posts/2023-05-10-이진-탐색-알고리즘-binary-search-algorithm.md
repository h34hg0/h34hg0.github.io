---
title: "이진 탐색 알고리즘 (Binary Search Algorithm)"
date: 2023-05-10 17:06:48 +0900
categories: ["블로그/기술문서", "Algorithm"]
tags: ["Binary Search algorithm", "이진 탐색 알고리즘"]
tistory_url: https://heahgo.tistory.com/entry/%EC%9D%B4%EC%A7%84-%ED%83%90%EC%83%89-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-Binary-Search-Algorithm
published: true
obsidian_source: "6. Posts/tistory/Algorithm/이진 탐색 알고리즘 (Binary Search Algorithm).md"
---

## 이진 탐색 알고리즘이란?
---

이진 탐색 알고리즘이란 정렬된 배열을 탐색 범위를 절반으로 줄여나가면서 탐색하는 알고리즘이다.

---

## 예시
---

![tistory-76-1](/assets/img/posts/이진-탐색-알고리즘-binary-search-algorithm/tistory-76-1.png)
*1 찾는 과정*

오름차순으로 정렬된 [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] 배열로 1을 찾는 예시를 들어보겠다.

먼저 배열의 중간 값을 배열의 길이와 2를 나눈 몫의 값에 위치한 값이라고 하자.

[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] 의 중간 값인  5와 1을 비교하고,  1이 5보다 작으므로 탐색범위를 [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] 에서 [0, 1, 2, 3, 4] 으로 줄인다.

이제  [0, 1, 2, 3, 4]에서 중간 값인 2가 1보다 크므로 탐색 범위를 [0, 1] 로 줄인다.

[0, 1] 에서 중간 값이  우리가 찾던 1이므로 탐색을 종료한다.

아래 이미지는 3을 찾는 과정을 나타낸다.

![tistory-76-2](/assets/img/posts/이진-탐색-알고리즘-binary-search-algorithm/tistory-76-2.png)
*3 찾는 과정*

---

## 시간 복잡도
---

최악의 경우는 계속 배열을 절반으로 분할하여 분할한 배열의 길이가 1 되는 경우이다.

( 예시를 들었던 배열에서 0을 찾는 경우라고 생각하면 된다. )

따라서 길이가 n = 2^k 인 배열이 있다고 했을 때, 최악의 경우 계속 배열을 절반으로 분할하다 보면( 2^(-1) 배 ) 배열의 길이가 1이 되고 , 그 횟수가 k번이다. ( logn = log2^k = k,      log2, 밑인 2를 생략해서 log 로 표기 )

즉, 최악의 경우  logn = k 번 분할해야 하므로 시간복잡도는 빅오 표기법으로 O(logn) 이다.

---

## 구현
---

```python
# binary_search.py
# Time Complexity : O(logn)

def binary_search_algorithm(arr, num, left, right):

    length = right - left + 1
    mid = length // 2 + left
    if arr == []:
        print("error : arr is Empty")
        return None
    if num == arr[mid]:
        return mid
    elif num < arr[mid]:
        return binary_search_algorithm(arr, num, left, mid - 1)
    else:
        return binary_search_algorithm(arr, num, mid + 1, right)

def binary_search(arr, num):
    return binary_search_algorithm(arr, num, 0, len(arr) - 1)

if __name__ == "__main__":

    exam_arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
    seq = int(input('Input find number : '))
    print(f'{seq} index is {binary_search(exam_arr, seq)}')
```

---
