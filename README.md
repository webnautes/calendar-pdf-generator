# 📅 Calendar PDF Generator

[![GitHub Pages](https://img.shields.io/badge/demo-live-success?style=for-the-badge&logo=github)](https://webnautes.github.io/calendar-pdf-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

순수 JavaScript 기반 달력 생성 및 PDF 다운로드 웹 애플리케이션입니다.

## 🌐 데모

**GitHub Pages에서 바로 사용해보세요:**

🔗 **[https://webnautes.github.io/calendar-pdf-generator](https://webnautes.github.io/calendar-pdf-generator)**

## 🚀 기능

- **년도/월 선택**: 드롭다운으로 원하는 년도와 월 선택 (1900~2100년)
- **모바일 최적화**: 한 달씩 크게 보여주는 반응형 디자인
- **월 네비게이션**: 이전/다음 버튼으로 쉽게 이동
- **PDF 다운로드**: 전체 년도의 달력(1~12월)을 PDF로 저장
- **오늘 날짜 하이라이트**: 현재 날짜를 쉽게 확인
- **서버 불필요**: 브라우저에서 직접 PDF 생성

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **PDF 생성**: jsPDF (클라이언트 사이드)
- **호스팅**: GitHub Pages

## 📱 사용 방법

1. 상단의 **년도 선택** 드롭다운에서 원하는 년도를 선택합니다
2. **월 선택** 드롭다운에서 보고 싶은 월을 선택합니다
3. 또는 **이전/다음** 버튼으로 월을 이동합니다
4. **PDF 다운로드** 버튼을 클릭하면 선택한 년도의 전체 달력을 PDF로 다운로드할 수 있습니다

## 🏗️ 프로젝트 구조

```
calendar-pdf-generator/
├── index.html          # 메인 HTML 페이지
├── style.css           # 스타일시트
├── script.js           # 달력 생성 및 PDF 로직
└── README.md
```

## 💻 로컬에서 실행하기

```bash
# 저장소 클론
git clone https://github.com/webnautes/calendar-pdf-generator.git
cd calendar-pdf-generator

# 간단한 HTTP 서버 실행 (선택사항)
# Python 3
python -m http.server 8000

# 또는 그냥 index.html 파일을 브라우저에서 열기
```

브라우저에서 `http://localhost:8000` 또는 `index.html` 파일을 직접 열어서 사용하세요.

## 🚀 GitHub Pages에 배포하기

1. GitHub 저장소 Settings로 이동
2. 왼쪽 메뉴에서 "Pages" 선택
3. Source를 "Deploy from a branch"로 설정
4. Branch를 "main" (또는 원하는 브랜치) 선택, 폴더는 "/ (root)" 선택
5. Save 클릭
6. 몇 분 후 `https://[username].github.io/calendar-pdf-generator` 에서 접속 가능

## 📄 API 없음

이 프로젝트는 순수 프론트엔드로 작동하며, 백엔드 서버나 API가 필요하지 않습니다.
모든 처리는 브라우저에서 JavaScript로 이루어집니다.

## 🎨 스크린샷

모바일과 데스크톱 모두에서 최적화된 UI로 달력을 확인할 수 있습니다.

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

---

## 🔙 FastAPI 버전

Python FastAPI 기반 버전을 사용하려면 `main.py`를 참고하세요.

<details>
<summary>FastAPI 버전 실행 방법</summary>

```bash
# 의존성 설치
pip install -r requirements.txt

# 서버 실행
python main.py
```

브라우저에서 `http://localhost:8000` 접속
</details>
