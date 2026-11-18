---
title: "General - Data Formats"
date: 2026-11-18 23:38:49 +0900
categories: ["CTF/Wargame", "CryptoHack"]
tags: ["cryptohack", "Data Formats", "GENERAL"]
tistory_url: https://heahgo.tistory.com/entry/General-Data-Formats
published: true
obsidian_source: "6. Posts/tistory/CTF Wargame - CryptoHack/General - Data Formats.md"
---

## Privacy-Enhanced Mail?

### 원문

As we've seen in the encoding section, cryptography involves dealing with data in a wide variety of formats: big integers, raw bytes, hex strings and more. A few structured formats have been standardised to help send and receive cryptographic data. It helps to be able to recognise and manipulate these common data formats.  

PEM is a popular format for sending keys, certificates, and other cryptographic material. It looks like:  

-----BEGIN RSA PUBLIC KEY-----  
MIIBCgKC... (a whole bunch of base64)  
-----END RSA PUBLIC KEY-----  

It wraps base64-encoded data by a one-line header and footer to indicate how to parse the data within. Perhaps unexpectedly, it's important for there to be the correct number of hyphens in the header and footer, otherwise cryptographic tools won't be able to recognise the file.  

The data that gets base64-encoded is DER-encoded ASN.1 values. Confused? The resources linked below have more information about what these acronyms mean but the complexity is there for historical reasons and going too deep into the details may drive you insane.  

Extract the private key d as a decimal integer from this PEM-formatted RSA key.  

 There are two main approaches for solving this challenge. The data in the certificate can be read with the openssl command line tool, or in Python using PyCryptodome. We recommend using PyCryptodome: first import the RSA module with from Crypto.PublicKey import RSA and you can read the key data using RSA.importKey().  

Challenge files:  
  - privacy_enhanced_mail.pem

### 번역

인코딩 섹션에서 살펴보았듯이, 암호학에서는 큰 정수, 원시 바이트(raw bytes), 16진수 문자열 등 매우 다양한 형식의 데이터를 다룹니다. 암호화 데이터를 송수신하는 데 도움을 주기 위해 몇 가지 구조화된 형식이 표준화되었습니다. 이러한 일반적인 데이터 형식을 인식하고 다룰 수 있으면 큰 도움이 됩니다.  

PEM은 키, 인증서 및 기타 암호화 자료를 전송할 때 널리 사용되는 형식입니다. 다음과 같은 형태를 띱니다:  

-----BEGIN RSA PUBLIC KEY-----  
MIIBCgKC... (수많은 base64 데이터)  
-----END RSA PUBLIC KEY-----  

이는 내부 데이터를 어떻게 파싱할지 나타내기 위해 base64로 인코딩된 데이터를 한 줄짜리 헤더와 푸터로 감쌉니다. 의외일 수 있지만, 헤더와 푸터에 정확한 개수의 하이픈(`-`)이 들어가는 것이 중요하며, 그렇지 않으면 암호화 도구가 파일을 인식하지 못합니다.  

base64로 인코딩되는 데이터는 DER로 인코딩된 ASN.1 값입니다. 헷갈리시나요? 아래 링크된 자료에 이 약어들이 무엇을 의미하는지에 대한 자세한 정보가 있지만, 이러한 복잡성은 역사적인 이유로 생겨난 것이므로 세부 사항을 너무 깊게 파고들면 정신이 나갈 수도 있습니다.  

이 PEM 형식의 RSA 키에서 개인키 `d`를 10진수 정수로 추출하세요.  

이 문제를 해결하는 데는 두 가지 주요 접근 방식이 있습니다. openssl 명령줄 도구를 사용해 인증서의 데이터를 읽거나, 파이썬에서 PyCryptodome을 사용하는 것입니다. PyCryptodome 사용을 권장합니다: 먼저 from Crypto.PublicKey import RSA로 RSA 모듈을 임포트한 뒤, `RSA.importKey()`를 사용해 키 데이터를 읽을 수 있습니다.  

문제 파일:  

- privacy_enhanced_mail.pem

### 풀이

주어진 pem 파일을 읽어 RSA의 개인키를 얻으면 된다.

#### ex.py

```python
from Crypto.PublicKey import RSA

key = RSA.import_key(open('./privacy_enhanced_mail.pem').read())
print(key.d)
```

#### 출력 (flag)

```python
1568270028805633136478717104581997365499114994919795992986086122818002170731685192445620554366556581089267419005983133023143697091447477456271494562051914438978515890899418195134884601743250646416356496099378425415339540679910131476003344506519342959251234995202098293221852446234100210206343548931881331646451162173694393844071047069491233623768021974620459512895916180059521636623753829644733537581887195252002699310214832889708354718428649324119150595360166885894112979096690923694112785137020242113589709108676356988476009911229107205697------------마스킹----------579768748054760104838790424708988260443926906673795975104689
```

## CERTainly not

### 원문

As mentioned in the previous challenge, PEM is just a nice wrapper above DER encoded ASN.1. In some cases you may come across DER files directly; for instance many Windows utilities prefer to work with DER files by default. However, other tools expect PEM format and have difficulty importing a DER file, so it's good to know how to convert one format to another.  

An SSL certificate is a crucial part of the modern web, binding a cryptographic key to details about an organisation. We'll cover more about these and PKI in the TLS category. Presented here is a DER-encoded x509 RSA certificate. Find the modulus of the certificate, giving your answer as a decimal.  

Challenge files:  
  - 2048b-rsa-example-cert.der

### 번역

이전 문제에서 언급했듯이, PEM은 DER로 인코딩된 ASN.1을 감싸는 깔끔한 래퍼(wrapper)일 뿐입니다. 경우에 따라 DER 파일을 직접 접하게 될 수도 있습니다. 예를 들어 많은 Windows 유틸리티는 기본적으로 DER 파일로 작업하는 것을 선호합니다. 그러나 다른 도구들은 PEM 형식을 기대하며 DER 파일을 가져오는 데 어려움을 겪기 때문에, 한 형식을 다른 형식으로 변환하는 방법을 알아두는 것이 좋습니다.  

SSL 인증서는 암호화 키를 조직의 세부 정보와 연결해 주는 현대 웹의 핵심적인 부분입니다. 이에 대한 내용과 PKI는 TLS 카테고리에서 더 자세히 다루겠습니다. 여기에 DER로 인코딩된 x509 RSA 인증서가 주어져 있습니다. 이 인증서의 모듈러스(modulus)를 찾아 10진수로 답을 제출하세요.  

문제 파일:  
    - 2048b-rsa-example-cert.der

### 풀이

Privacy-Enhanced Mail? 문제는 PEM을 읽어 RSA의 개인키 d를 구했다면, 이번에는 DER을 읽어 RSA의 모듈러스를 구하면 된다. 코드는 거의 같은데 차이점은 텍스트로 읽냐 바이트로 읽냐의 차이다.

#### ex.py

```python
from Crypto.PublicKey import RSA

key = RSA.import_key(open('./2048b-rsa-example-cert.der', "rb").read())
print(key.n)
```

#### 출력 (flag)

```python
2282537369201953080430621286460951277537417182399370851650989763154751363463585637562400373706803454904767799931094183745437882935139830238262965826407877545683862620750772549403060051687285230619125549292649596553637927187531045731910793602073005047623527867152826581757143391956117566509617118975840613645398796625523696378266606696265467846495007592306032735869135663290860649823175596356738233901098522262320558692346640580921742667033341001442990514694165229336621290373363008301639881088735601997740946737474------------마스킹-----------76874204809506045914964491063393800499167416471949021995447722415959979785959569497
```

## SSH Keys

### 원문

Secure Shell Protocol (SSH) is a network protocol that uses cryptography to establish a secure channel over an insecure network (i.e. the internet). SSH enables developers and system administrators to run commands on servers from the other side of the world, without their password being sniffed or data being stolen. It is therefore critical to the security of the web.  

In the old days, system administrators used to logon to their servers using telnet. This works similarly to our interactive challenges that involve connecting to socket.cryptohack.org - data is sent to a remote server, which performs actions based on what is sent. There is no transport encryption, so anyone listening in on the network (such as the WiFi access point owner, your ISP, or the NSA) can see all the telnet traffic.  

As the internet became increasingly hostile, people realised the need for both authentication and encryption for administrative network traffic. SSH, first released in 1995, achieves these goals and much more, with advanced functionality built into the software like port forwarding, X11 forwarding, and SFTP (Secure File Transfer Protocol). SSH uses a client-server architecture, meaning the server runs SSH as a service daemon which is always online and waiting to receive connections, and the user runs an SSH client to make a connection to it.  

Most commonly, SSH is configured to use public-private key pairs for authentication. On the server, a copy of the user's public key is stored. The user's private key is stored locally on their laptop.  

Now let's say Bruce wants to connect as his user account bschneier to his server bruces-server. From his laptop he runs ssh bschneier@bruces-server. His SSH client opens a connection to the server on port 22 where the SSH daemon listens. First, the ciphers that will be used are agreed upon, then a session key to encrypt the connection is established using Diffie-Hellman Key exchange, but we won't go into the details on that here. Then, the server sends a random challenge message encrypted with Bruce's public key. Bruce uses his private key to decrypt the challenge and send a hash of the random challenge message back, proving that he owns the correct private key and he therefore authenticates himself to the server as bschneier. Now, the server gives Bruce a shell to run commands. If public-private key cryptography doesn't make sense to you yet, don't worry - we'll cover it extensively in the RSA category.  

An SSH private key is stored in the PEM format, which we discussed in the "Privacy-Enhanced Mail" challenge. So it looks like this and is stored on Bruce's laptop at /home/bschneier/.ssh/id_rsa:  

-----BEGIN RSA PRIVATE KEY-----  
MIIBCgKC... (a whole bunch of base64)  
-----END RSA PRIVATE KEY-----  

SSH public keys, however, use a different format:  

ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCtPLqba+GFvDHdFVs1Vvdk56cKqqw5cdomlu034666UsoFIqkig8H5kNsNefSpaR/iU7G0ZKCiWRRuAbTsuHN+Cz526XhQvzgKTBkTGYXdF/WdG/6/umou3Z0+wJvTZgvEmeEclvitBrPZkzhAK1M5ypgNR4p8scJplTgSSb84Ckqul/Dj/Sh+fwo6sU3S3j92qc27BVGChpQiGwjjut4CkHauzQA/gKCBIiLyzoFcLEHhjOBOEErnvrRPWCIAJhALkwV2rUbD4g1IWa7QI2q3nB0nlnjPnjjwaR7TpH4gy2NSIYNDdC1PZ8reBaFnGTXgzhQ2t0ROBNb+ZDgH8Fy+KTG+gEakpu20bRqB86NN6frDLOkZ9x3w32tJtqqrJTALy4Oi3MW0XPO61UBT133VNqAbNYGE2gx+mXBVOezbsY46C/V2fmxBJJKY/SFNs8wOVOHKwqRH0GI5VsG1YZClX3fqk8GDJYREaoyoL3HKQt1Ue/ZW7TlPRYzAoIB62C0= bschneier@facts  

This format makes it easier for these public keys to be added as lines to the file /home/bschneier/.ssh/authorized_keys on the server. Adding the public key to this file allows the corresponding private key to be used to authenticate on the server.  

The ssh-keygen command is used to produce these public-private keypairs.  

Extract the modulus n as a decimal integer from Bruce's SSH public key.  

Challenge files:  
  - bruce_rsa.pub

### 번역

시큐어 셸 프로토콜(SSH)은 안전하지 않은 네트워크(즉, 인터넷) 상에서 암호화를 사용해 안전한 채널을 구축하는 네트워크 프로토콜입니다. SSH를 사용하면 개발자와 시스템 관리자가 비밀번호가 스니핑되거나 데이터를 도난당할 걱정 없이 지구 반대편에 있는 서버에서 명령을 실행할 수 있습니다. 따라서 웹 보안에 매우 중요합니다.  

과거에는 시스템 관리자들이 telnet을 사용해 서버에 로그인하곤 했습니다. 이는 socket.cryptohack.org에 접속하는 우리의 대화형 문제들과 비슷하게 작동합니다. 원격 서버로 데이터가 전송되면 서버가 전송된 내용을 바탕으로 작업을 수행하는 방식입니다. 전송 구간 암호화가 없기 때문에 네트워크를 도청하는 누구든지(예: WiFi 액세스 포인트 소유자, ISP 또는 NSA) 모든 telnet 트래픽을 볼 수 있습니다.  

인터넷 환경이 점점 더 위협적으로 변하면서, 사람들은 관리자용 네트워크 트래픽에 대해 인증과 암호화가 모두 필요하다는 것을 깨달았습니다. 1995년에 처음 출시된 SSH는 이러한 목표를 달성할 뿐만 아니라 포트 포워딩, X11 포워딩, SFTP(Secure File Transfer Protocol)와 같은 고급 기능들이 소프트웨어에 내장되어 있어 훨씬 더 많은 역할을 수행합니다. SSH는 클라이언트-서버 아키텍처를 사용하며, 이는 서버가 항상 온라인 상태로 연결 수신을 대기하는 서비스 데몬으로 SSH를 실행하고, 사용자는 SSH 클라이언트를 실행해 서버에 연결하는 구조를 의미합니다.  

가장 일반적으로 SSH는 인증을 위해 공개키-개인키 쌍을 사용하도록 구성됩니다. 서버에는 사용자의 공개키 사본이 저장되고, 사용자의 개인키는 로컬 노트북에 저장됩니다.  

이제 브루스(Bruce)가 자신의 사용자 계정 bschneier로 자신의 서버 bruces-server에 접속하려고 한다고 가정해 봅시다. 그는 자신의 노트북에서 ssh bschneier@bruces-server를 실행합니다. 그의 SSH 클라이언트는 SSH 데몬이 수신 대기 중인 서버의 22번 포트로 연결을 엽니다. 먼저 사용할 암호화 알고리즘(cipher)에 대해 합의한 뒤, 디피-헬만(Diffie-Hellman) 키 교환을 사용해 연결을 암호화할 세션 키를 확립하지만, 여기서는 그 세부 사항까지 다루지는 않겠습니다. 그런 다음, 서버는 브루스의 공개키로 암호화된 무작위 챌린지 메시지를 보냅니다. 브루스는 자신의 개인키를 사용해 해당 챌린지를 복호화하고 무작위 챌린지 메시지의 해시값을 다시 전송함으로써 자신이 올바른 개인키를 소유하고 있음을 증명하며, 이를 통해 서버에 자신을 bschneier로 인증합니다. 이제 서버는 브루스에게 명령을 실행할 수 있는 셸을 제공합니다. 공개키-개인키 암호화가 아직 잘 이해되지 않더라도 걱정하지 마세요. RSA 카테고리에서 이를 폭넓게 다룰 예정입니다.  

SSH 개인키는 "Privacy-Enhanced Mail" 문제에서 다루었던 PEM 형식으로 저장됩니다. 따라서 다음과 같은 형태를 띠며, 브루스의 노트북의 /home/bschneier/.ssh/id_rsa 경로에 저장됩니다:  

Plaintext  
-----BEGIN RSA PRIVATE KEY-----  
MIIBCgKC... (수많은 base64 데이터)  
-----END RSA PRIVATE KEY-----  
하지만 SSH 공개키는 다른 형식을 사용합니다:  

Plaintext  
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCtPLqba+GFvDHdFVs1Vvdk56cKqqw5cdomlu034666UsoFIqkig8H5kNsNefSpaR/iU7G0ZKCiWRRuAbTsuHN+Cz526XhQvzgKTBkTGYXdF/WdG/6/umou3Z0+wJvTZgvEmeEclvitBrPZkzhAK1M5ypgNR4p8scJplTgSSb84Ckqul/Dj/Sh+fwo6sU3S3j92qc27BVGChpQiGwjjut4CkHauzQA/gKCBIiLyzoFcLEHhjOBOEErnvrRPWCIAJhALkwV2rUbD4g1IWa7QI2q3nB0nlnjPnjjwaR7TpH4gy2NSIYNDdC1PZ8reBaFnGTXgzhQ2t0ROBNb+ZDgH8Fy+KTG+gEakpu20bRqB86NN6frDLOkZ9x3w32tJtqqrJTALy4Oi3MW0XPO61UBT133VNqAbNYGE2gx+mXBVOezbsY46C/V2fmxBJJKY/SFNs8wOVOHKwqRH0GI5VsG1YZClX3fqk8GDJYREaoyoL3HKQt1Ue/ZW7TlPRYzAoIB62C0= bschneier@facts  
이 형식 덕분에 서버의 /home/bschneier/.ssh/authorized_keys 파일에 이러한 공개키들을 한 줄씩 쉽게 추가할 수 있습니다. 이 파일에 공개키를 추가하면 그에 대응하는 개인키를 사용해 서버에서 인증을 받을 수 있게 됩니다.  

ssh-keygen 명령어는 이러한 공개키-개인키 쌍을 생성하는 데 사용됩니다.  

브루스의 SSH 공개키에서 모듈러스 n을 10진수 정수로 추출하세요.  

문제 파일:  
    - bruce_rsa.pub

### 풀이

이번에는bruce의 ssh 공개키 파일인 bruce_rsa.pub에 RSA의 모듈러스 n을 추출하는 문제이다. 애도 그냥 pem 파일 읽듯이 코드를 하면 pycryptodome의 RSA.import_key 함수가 알아서 파싱해준다.

코드는 아래와 같다.

#### ex.py

```python
from Crypto.PublicKey import RSA

key = RSA.import_key(open('./bruce_rsa.pub').read())
print(key.n)
```

#### 출력 (flag)

```python
39314062729225234484361945998200930162414726581518015528450945185795078159906004596692596036452615329276111529849428408898987565320608948570451753001457658006334990054517388720813812670040698655573956385500411142061430854036072341092932863363935527568939846052143529887052586389794547365149973142236690759007838067153988803106959459451477551329190379738890751917859777978615572286781595388821535447177971004010964350623594741297556254538318824906035601344770432354332027089486152345369847158721133438127601028123231803915444960301636530469314147238513745548730365822823899048385976682865433374265816808177960387112284014432446551621993023520179649978666773171610140831167305358755212866318581027689610988512094009738993939649316050678560054109986318426730309010780084086496135381437999598036850415669645144898092119629------------마스킹---------------908984318940411698961150731204316670646676976361958828528229837610795843145048243492909
```

## Transparency

### 원문

When you connect to a website over HTTPS, the first TLS message sent by the server is the ServerHello containing the server TLS certificate. Your browser verifies that the TLS certificate is valid, and if not, will terminate the TLS handshake. Verification includes ensuring that:  

the name on the certificate matches the domain  
the certificate has not expired  
the certificate is ultimately signed (via a "chain of trust") by a root key of a Certificate Authority (CA) that's trusted by your browser or operating system  

Since CAs have the power to sign any certificate, the security of the internet depends upon these organisations to issue TLS certificates to the correct people: they must only issue certificates to the real domain owners. However with Windows trusting root certificates from over 100 organisations by default, there's a number of opportunities for hackers, politics, or incompetence to break the whole model. If you could trick just a single CA to issue you a certificate for microsoft.com, you could use the corresponding private key to sign malware and bypass trust controls on Windows. CAs are strongly incentivised to be careful since their business depends upon people trusting them, however in practice they have failed several times.  

In 2011 Comodo CA was compromised and the hacker was able to issue certificates for Gmail and other services. In 2016, Symantec was found to have issued over 150 certificates without the domain owner's knowledge, as well as 2400 certificates for domains that were never registered.  

Due to such events, together with the fact that fraudulent certificates can take a long time to be discovered, since 2018 Certificate Transparency has been enforced by Google Chrome. Every CA must publish all certificates that they issue to a log, which anyone can search.  

Attached is an RSA public key in PEM format. Find the subdomain of cryptohack.org which uses these parameters in its TLS certificate, and visit that subdomain to obtain the flag.  

Challenge files:  
  - transparency.pem

### 번역

HTTPS를 통해 웹사이트에 연결할 때, 서버가 보내는 첫 번째 TLS 메시지는 서버 TLS 인증서가 포함된 ServerHello입니다. 브라우저는 TLS 인증서가 유효한지 검증하며, 유효하지 않을 경우 TLS 핸드셰이크를 종료합니다. 검증 과정에는 다음 사항을 확인하는 것이 포함됩니다:  

인증서에 기재된 이름이 도메인과 일치하는지  
인증서가 만료되지 않았는지  
인증서가 브라우저나 운영체제에서 신뢰하는 인증 기관(CA)의 루트 키에 의해("신뢰 체인"을 통해) 최종적으로 서명되었는지  

CA는 어떤 인증서에든 서명할 수 있는 권한을 가지고 있기 때문에, 인터넷의 보안은 이러한 기관들이 올바른 대상에게 TLS 인증서를 발급하는지에 달려 있습니다. 즉, 실제 도메인 소유자에게만 인증서를 발급해야 합니다. 하지만 Windows는 기본적으로 100개 이상의 기관에서 발급한 루트 인증서를 신뢰하고 있어, 해커나 정치적 요인, 혹은 무능함으로 인해 전체 모델이 무너질 수 있는 여지가 많습니다. 만약 단 하나의 CA라도 속여 microsoft.com에 대한 인증서를 발급받을 수 있다면, 그에 대응하는 개인키를 사용해 악성코드에 서명하고 Windows의 신뢰 제어를 우회할 수 있습니다. CA는 사람들의 신뢰에 비즈니스가 달려 있으므로 주의를 기울일 강력한 동기가 있지만, 실제로는 여러 차례 실패한 사례가 있습니다.  

2011년에는 Comodo CA가 해킹당해 해커가 Gmail 및 기타 서비스에 대한 인증서를 발급할 수 있었습니다. 2016년에는 Symantec이 도메인 소유자도 모르게 150개 이상의 인증서를 발급했을 뿐만 아니라, 등록된 적도 없는 도메인에 대해 2,400개의 인증서를 발급한 사실이 드러났습니다.  

이러한 사건들과 더불어 부정 발급된 인증서가 발견되기까지 오랜 시간이 걸릴 수 있다는 점 때문에, 2018년부터 Google Chrome에서는 인증서 투명성(Certificate Transparency)이 의무화되었습니다. 모든 CA는 발급하는 모든 인증서를 로그에 공개해야 하며, 누구나 이를 검색할 수 있습니다.  

PEM 형식의 RSA 공개키가 첨부되어 있습니다. TLS 인증서에서 이 파라미터를 사용하는 cryptohack.org의 서브도메인을 찾은 뒤, 해당 서브도메인에 접속하여 플래그를 획득하세요.  

문제 파일:  
     - transparency.pem

### 풀이

문제 설명을 보니 인증서 로그를 찾아서 서브도메인을 찾고 들어가 플래그를 구하면 되는거 같다.

인증서 로그를 검색하는 방법은 pem의 sha256 값을 인증서 로그를 찾아주는 사이트에 입력하면 된다.

사이트는 <https://crt.sh/> 를 사용했다.

pem 파일의 sha256은 아래 코드를 통해 구했다.

#### ex.py

```python
from Crypto.Hash import SHA256
from Crypto.PublicKey import RSA

with open("transparency.pem", "rb") as f:
    key = RSA.import_key(f.read())

der_data = key.export_key(format="DER")

h = SHA256.new(der_data)
print(h.hexdigest())
```

#### 출력 (PUBKEY 해시값)

```python
29ab37df0a4*********************e48fdd9cd652cbc5c222edd26d77d2
```

![tistory-999994-1](/assets/img/posts/general-data-formats/tistory-999994-1.png)
*해시 검색*

Advanced에 들어가 해시한 값에 맞는 타입을 고르고 해시를 입력해 검색했다.

![tistory-999994-2](/assets/img/posts/general-data-formats/tistory-999994-2.png)

위와 같은 결과가 나왔다.

![tistory-999994-3](/assets/img/posts/general-data-formats/tistory-999994-3.png)
![tistory-999994-4](/assets/img/posts/general-data-formats/tistory-999994-4.png)

crt.sh ID 맨 윗부분을 누르면 Subject: commonName 부분에 서브도메인이 있어 그 도메인으로 접속하면 flag가 나온다.
