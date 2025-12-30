# 📅 Calendar PDF Generator

FastAPI 기반 달력 생성 및 PDF 다운로드 웹 애플리케이션입니다.

## 🚀 기능

- **년도/월 선택**: 드롭다운으로 원하는 년도와 월 선택
- **모바일 최적화**: 한 달씩 크게 보여주는 반응형 디자인
- **월 네비게이션**: 이전/다음 버튼으로 쉽게 이동
- **PDF 다운로드**: 전체 년도의 달력을 PDF로 저장
- **오늘 날짜 하이라이트**: 현재 날짜를 쉽게 확인

## 📋 요구사항

- Python 3.8 이상
- pip

## 🛠️ 설치 방법

```bash
# 저장소 클론
git clone https://github.com/webnautes/calendar-pdf-generator.git
cd calendar-pdf-generator

# 의존성 설치
pip install -r requirements.txt
```

## ▶️ 실행 방법

```bash
# FastAPI 서버 실행
python main.py
```

서버가 실행되면 브라우저에서 `http://localhost:8000` 으로 접속하세요.

## 📱 사용 방법

1. 상단의 **년도 선택** 드롭다운에서 원하는 년도를 선택합니다 (1900~2100년)
2. **월 선택** 드롭다운에서 보고 싶은 월을 선택합니다
3. 또는 **이전/다음** 버튼으로 월을 이동합니다
4. **PDF 다운로드** 버튼을 클릭하면 선택한 년도의 전체 달력(1~12월)을 PDF로 다운로드할 수 있습니다

## 🏗️ 프로젝트 구조

```
calendar-pdf-generator/
├── main.py              # FastAPI 백엔드 서버
├── requirements.txt     # Python 의존성
├── static/
│   ├── index.html      # 메인 HTML
│   ├── style.css       # 스타일시트
│   └── script.js       # 프론트엔드 로직
└── README.md
```

## 🔧 기술 스택

- **Backend**: FastAPI, Uvicorn, ReportLab
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **PDF 생성**: ReportLab

## 📄 API 엔드포인트

- `GET /` - 메인 페이지
- `GET /api/calendar/{year}` - 특정 년도의 달력 데이터 (JSON)
- `GET /api/pdf/{year}` - 특정 년도의 달력 PDF 생성 및 다운로드

## 🎨 스크린샷

모바일과 데스크톱 모두에서 최적화된 UI로 달력을 확인할 수 있습니다.

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
