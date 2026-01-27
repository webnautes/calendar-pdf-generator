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
  - 세로 방향 출력
  - 한 장당 1~3개월 선택 가능 (1개월, 2개월, 3개월)
  - 1개월 선택 시 제철 음식 정보 포함
- **한국 공휴일 표시**: 설날, 추석 등 한국 공휴일 자동 표시
- **D-Day 카운터**: 최대 3개의 D-Day 설정 및 표시
- **제철 음식 정보**: 월별 제철 해산물, 과일, 채소 추천 (웹 화면 및 1개월 PDF)
- **오늘 날짜 하이라이트**: 현재 날짜를 쉽게 확인
- **서버 불필요**: 브라우저에서 직접 PDF 생성

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **PDF 생성**: jsPDF + html2canvas
- **호스팅**: GitHub Pages

## 📱 사용 방법

1. **년도/월 선택**: 드롭다운에서 원하는 년도와 월을 선택하거나 이전/다음 버튼으로 이동
2. **공휴일 표시**: 체크박스를 선택하여 한국 공휴일 표시
3. **D-Day 설정**: 기념일이나 중요한 날짜를 D-Day로 설정
4. **제철 음식**: 웹 화면에서 월별 제철 음식 정보 확인
5. **PDF 다운로드**:
   - PDF 한 장당 개수 선택 (1개월/2개월/3개월)
   - "PDF 다운로드" 버튼 클릭
   - 1개월 선택 시 제철 음식 정보가 PDF에 포함됨

## 📊 통계 기능 설정 (선택사항)

전체 사용자의 PDF 생성 통계를 표시하려면 Google Apps Script를 설정해야 합니다.

**설정하지 않으면**: 통계가 표시되지 않습니다 (카운트 0).

**설정하면**: 모든 사용자가 공유하는 전체 PDF 생성 횟수와 마지막 생성 시간이 표시됩니다.

상세한 설정 방법은 [APPS_SCRIPT_SETUP.md](./APPS_SCRIPT_SETUP.md) 파일을 참고하세요.

**간단 요약:**
1. Google Sheets 생성
2. Apps Script 코드 배포
3. `script.js`에 웹앱 URL 설정

## 🏗️ 프로젝트 구조

```
calendar-pdf-generator/
├── index.html              # 메인 페이지
├── style.css               # 스타일시트
├── script.js               # 달력 및 PDF 생성 로직
├── privacy-policy.html     # 개인정보처리방침 페이지
├── terms-of-service.html   # 이용약관 페이지
├── PRIVACY_POLICY.md       # 개인정보처리방침 (마크다운)
├── TERMS_OF_SERVICE.md     # 이용약관 (마크다운)
├── APPS_SCRIPT_SETUP.md    # Google Apps Script 설정 가이드
└── README.md
```

## 🔐 개인정보 보호

- **서버 불필요**: 모든 처리가 브라우저에서 이루어지며 데이터를 서버에 전송하지 않습니다
- **데이터 저장 없음**: 어떠한 개인정보도 수집하거나 저장하지 않습니다

## 🎨 스크린샷

모바일과 데스크톱 모두에서 최적화된 UI로 달력을 확인할 수 있습니다.

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 📋 법적 문서

- [개인정보처리방침](./PRIVACY_POLICY.md) - 개인정보 수집 및 사용에 대한 정책
- [서비스 이용약관](./TERMS_OF_SERVICE.md) - 서비스 이용 시 적용되는 약관
