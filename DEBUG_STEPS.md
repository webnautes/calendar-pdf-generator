# 날짜/시간 표시 문제 디버깅 가이드

## 1단계: 브라우저 콘솔 확인

1. 웹사이트 열기
2. **F12** 눌러서 개발자 도구 열기
3. **Console** 탭 선택
4. **F5** 눌러서 새로고침
5. 다음 로그 찾기:
   ```
   전체 PDF 생성 횟수: X회
   마지막 생성 시간 (timestamp): ???
   ```

### 확인할 내용:
- `timestamp` 값이 **숫자**로 표시되는지? (예: 1704369600000)
- 아니면 **0** 또는 **null**로 표시되는지?

이 정보를 알려주세요!

## 2단계: Google Sheets 확인

1. Google Sheets에서 통계 시트 열기
2. **A2 셀** 확인:
   - 값이 있는지?
   - 어떤 값인지? (숫자? 날짜? 비어있음?)
3. 스크린샷 또는 값을 알려주세요

## 3단계: Apps Script 로그 확인 (고급)

1. Apps Script 편집기 열기
2. 아래의 개선된 코드로 교체
3. 실행 로그 확인

---

## 개선된 Apps Script 코드

기존 `doGet` 함수를 다음으로 교체:

```javascript
// 현재 카운트 조회 (GET 요청) - 디버깅 강화 버전
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Stats');

    // 현재 카운트 가져오기
    var count = sheet.getRange('A1').getValue() || 0;
    var timestampValue = sheet.getRange('A2').getValue();

    // 디버깅: 원본 값 로깅
    Logger.log('A2 원본 값: ' + timestampValue);
    Logger.log('A2 타입: ' + typeof timestampValue);

    // timestamp를 숫자로 변환 (여러 방법 시도)
    var timestamp = 0;

    if (timestampValue) {
      // 방법 1: 이미 숫자인 경우
      if (typeof timestampValue === 'number') {
        timestamp = timestampValue;
      }
      // 방법 2: Date 객체인 경우
      else if (timestampValue instanceof Date) {
        timestamp = timestampValue.getTime();
      }
      // 방법 3: 문자열인 경우
      else if (typeof timestampValue === 'string') {
        timestamp = Number(timestampValue);
        if (isNaN(timestamp)) {
          timestamp = 0;
        }
      }
      // 방법 4: 기타
      else {
        timestamp = Number(timestampValue);
        if (isNaN(timestamp)) {
          timestamp = 0;
        }
      }
    }

    Logger.log('변환된 timestamp: ' + timestamp);

    // 응답 반환
    var result = {
      success: true,
      count: count,
      timestamp: timestamp,
      debug: {
        rawValue: String(timestampValue),
        rawType: typeof timestampValue
      }
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

저장 → 배포 관리 → 새 버전 → 배포

그 다음 F5 새로고침하고 콘솔에서 `debug` 값도 확인해주세요!
