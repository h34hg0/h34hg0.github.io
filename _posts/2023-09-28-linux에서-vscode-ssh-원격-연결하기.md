---
title: "Linux에서 VScode SSH 원격 연결하기"
date: 2023-09-28 09:36:49 +0900
categories: ["개발", "VScode"]
tags: ["Linux", "ssh", "vscode"]
tistory_url: https://heahgo.tistory.com/entry/Linux%EC%97%90%EC%84%9C-VScode-SSH-%EC%9B%90%EA%B2%A9-%EC%97%B0%EA%B2%B0%ED%95%98%EA%B8%B0
published: true
obsidian_source: "6. Posts/tistory/VScode/Linux에서 VScode SSH 원격 연결하기.md"
---

vscode에서 ssh 원격 연결을 하기 위해서는 **Remote - SSH** 라는 확장을 먼저 설치해야 한다.

![tistory-85-1](/assets/img/posts/linux에서-vscode-ssh-원격-연결하기/tistory-85-1.png)
*Remote-SSH*

설치 했으면 **Ctrl + Shift + p** 를 눌러 **Remote-SSH: Open SSH Configuration File...** 을 클릭한다.

![tistory-85-2](/assets/img/posts/linux에서-vscode-ssh-원격-연결하기/tistory-85-2.png)
*Remote-SSH: Open SSH Configuration File...*

그러면 다음과 같은 화면이 나오는데 **/home/user/.ssh/config** 을 들어간다.

![tistory-85-3](/assets/img/posts/linux에서-vscode-ssh-원격-연결하기/tistory-85-3.png)

config 파일을 자신이 연결할 원격에 맞춰서 설정한다.

![tistory-85-4](/assets/img/posts/linux에서-vscode-ssh-원격-연결하기/tistory-85-4.png)
*/home/user/.ssh/config*

![tistory-85-5](/assets/img/posts/linux에서-vscode-ssh-원격-연결하기/tistory-85-5.png)
*예시*

설정을 했으면 **Ctrl + Shift + p** 를 입력히고 **Remote-SSH: Connect to Host...** 를 클릭한다.

![tistory-85-6](/assets/img/posts/linux에서-vscode-ssh-원격-연결하기/tistory-85-6.png)
*Remote-SSH: Connect to Host...*

클릭을 하면 config 파일에 Host에 설정한 이름이 보이며 이를 클릭하면 원격으로 연결을 하게 된다.

![tistory-85-7](/assets/img/posts/linux에서-vscode-ssh-원격-연결하기/tistory-85-7.png)
*remoteServer*
