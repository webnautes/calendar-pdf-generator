# Google Apps Script 설정 가이드

PDF 생성 통계를 공용으로 저장하기 위한 Google Apps Script 설정 방법입니다.

## 1단계: Google Sheets 생성

1. [Google Sheets](https://sheets.google.com) 접속
2. 새 스프레드시트 만들기
3. 이름: `Calendar PDF Stats` (또는 원하는 이름)
4. 시트 이름을 `Stats`로 변경

### 시트 구조:
- A1: 총 PDF 생성 횟수 (숫자)
- A2: 마지막 업데이트 시간 (날짜)

## 2단계: Apps Script 작성

1. 스프레드시트에서 **확장 프로그램 > Apps Script** 클릭
2. 기본 코드를 삭제하고 아래 코드 붙여넣기:

```javascript
// PDF 생성 카운터 증가 (POST 요청)
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Stats');

    // 현재 카운트 가져오기
    var count = sheet.getRange('A1').getValue() || 0;

    // 카운트 증가
    count++;

    // 현재 시간 (timestamp로 저장)
    var now = new Date().getTime();

    // 스프레드시트 업데이트
    sheet.getRange('A1').setValue(count);
    sheet.getRange('A2').setValue(now);  // timestamp를 숫자로 저장

    // 응답 반환
    var result = {
      success: true,
      count: count,
      timestamp: now
    };

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    var errorResult = {
      success: false,
      error: error.toString()
    };

    return ContentService
      .createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 현재 카운트 조회 (GET 요청)
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Stats');

    // 현재 카운트 가져오기
    var count = sheet.getRange('A1').getValue() || 0;

    // timestamp를 getDisplayValue()로 문자열로 가져온 후 숫자 변환
    var timestampStr = sheet.getRange('A2').getDisplayValue();
    var timestamp = 0;

    if (timestampStr && timestampStr !== '') {
      var parsed = parseFloat(timestampStr);
      if (!isNaN(parsed) && parsed > 0) {
        timestamp = parsed;
      }
    }

    // 응답 반환
    var result = {
      success: true,
      count: count,
      timestamp: timestamp
    };

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    var errorResult = {
      success: false,
      error: error.toString(),
      count: 0,
      timestamp: 0
    };

    return ContentService
      .createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. **저장 아이콘** 클릭 (또는 Ctrl+S)
4. 프로젝트 이름: `Calendar Stats API` (또는 원하는 이름)

## 3단계: 웹앱으로 배포

1. 오른쪽 상단 **배포 > 새 배포** 클릭
2. 설정:
   - **유형 선택**: 웹 앱
   - **설명**: `PDF 통계 API v1` (선택사항)
   - **다음 계정으로 실행**: **나** (본인 계정)
   - **액세스 권한**: **모든 사용자** ⚠️ 중요!
3. **배포** 클릭
4. 권한 승인:
   - "액세스 권한 승인" 클릭
   - Google 계정 선택
   - "고급" → "안전하지 않은 페이지로 이동" 클릭 (본인 스크립트이므로 안전함)
   - "허용" 클릭
5. **웹 앱 URL** 복사 (형식: `https://script.google.com/macros/s/AKfy...../exec`)

## 4단계: script.js 설정

1. `script.js` 파일 상단에 있는 `STATS_API_URL` 변수를 찾아서
2. 3단계에서 복사한 웹 앱 URL로 교체:

```javascript
const STATS_API_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

예시:
```javascript
const STATS_API_URL = 'https://script.google.com/macros/s/AKfycbz1234567890abcdefg/exec';
```

## 5단계: 테스트

1. 웹사이트 새로고침
2. PDF 다운로드 버튼 클릭
3. 카운터가 증가하는지 확인
4. Google Sheets에서 A1 셀 확인 (숫자 증가 확인)

## 문제 해결

### 카운터가 증가하지 않는 경우:
1. 브라우저 개발자 도구(F12) → Console 탭에서 에러 확인
2. Apps Script URL이 올바른지 확인
3. Apps Script 배포 시 "모든 사용자" 권한으로 설정했는지 확인

### CORS 에러가 발생하는 경우:
- Apps Script는 자동으로 CORS를 허용하므로 정상적으로 작동해야 합니다
- URL이 `.../exec`로 끝나는지 확인 (`.../dev`가 아님)

### 스프레드시트가 업데이트되지 않는 경우:
1. Apps Script 편집기에서 **실행 > doPost** 선택하여 수동 테스트
2. 에러 메시지 확인

## 재배포 방법 (코드 수정 후)

Apps Script 코드를 수정한 경우:
1. **배포 > 배포 관리** 클릭
2. 현재 배포 옆 **수정 아이콘** 클릭
3. **버전**: 새 버전
4. **배포** 클릭

URL은 변경되지 않으므로 script.js 수정 불필요합니다.

## 보안 참고사항

- Apps Script는 서버리스 환경에서 실행되므로 API 키 노출 위험 없음
- 악의적인 사용자가 카운터를 조작할 수 있으나, 중요한 데이터가 아니므로 괜찮음
- 필요시 Apps Script에 Rate Limiting 추가 가능 (고급)
