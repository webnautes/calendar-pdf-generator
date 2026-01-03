// Google Calendar API 설정
const CLIENT_ID = '212094760476-2gu4j66cvv709ni4e8221pvcof5ioljq.apps.googleusercontent.com';
const API_KEY = ''; // API 키 (선택사항, OAuth만으로도 작동)
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

let tokenClient;
let gapiInited = false;
let gisInited = false;
let accessToken = null;
let googleEvents = {}; // 구글 캘린더 이벤트 저장

// 현재 날짜
const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth() + 1; // JavaScript는 0부터 시작
let showHolidays = false; // 공휴일 표시 여부
let showGoogleEvents = false; // 구글 이벤트 표시 여부

// 한국 고정 공휴일 (매년 동일한 날짜)
const fixedHolidays = {
    '01-01': '신정',
    '03-01': '삼일절',
    '05-05': '어린이날',
    '06-06': '현충일',
    '08-15': '광복절',
    '10-03': '개천절',
    '10-09': '한글날',
    '12-25': '크리스마스'
};

// 음력 기반 공휴일 데이터 (양력 변환 결과)
const lunarHolidays = {
    2020: {
        '01-24': '설날 전날', '01-25': '설날', '01-26': '설날 다음날',
        '04-30': '부처님오신날',
        '09-30': '추석 전날', '10-01': '추석', '10-02': '추석 다음날'
    },
    2021: {
        '02-11': '설날 전날', '02-12': '설날', '02-13': '설날 다음날',
        '05-19': '부처님오신날',
        '09-20': '추석 전날', '09-21': '추석', '09-22': '추석 다음날'
    },
    2022: {
        '01-31': '설날 전날', '02-01': '설날', '02-02': '설날 다음날',
        '05-08': '부처님오신날',
        '09-09': '추석 전날', '09-10': '추석', '09-11': '추석 다음날'
    },
    2023: {
        '01-21': '설날 전날', '01-22': '설날', '01-23': '설날 다음날',
        '05-27': '부처님오신날',
        '09-28': '추석 전날', '09-29': '추석', '09-30': '추석 다음날'
    },
    2024: {
        '02-09': '설날 전날', '02-10': '설날', '02-11': '설날 다음날',
        '05-15': '부처님오신날',
        '09-16': '추석 전날', '09-17': '추석', '09-18': '추석 다음날'
    },
    2025: {
        '01-28': '설날 전날', '01-29': '설날', '01-30': '설날 다음날',
        '05-05': '부처님오신날',
        '10-05': '추석 전날', '10-06': '추석', '10-07': '추석 다음날'
    },
    2026: {
        '02-16': '설날 전날', '02-17': '설날', '02-18': '설날 다음날',
        '05-24': '부처님오신날',
        '09-24': '추석 전날', '09-25': '추석', '09-26': '추석 다음날'
    },
    2027: {
        '02-05': '설날 전날', '02-06': '설날', '02-07': '설날 다음날',
        '05-13': '부처님오신날',
        '09-14': '추석 전날', '09-15': '추석', '09-16': '추석 다음날'
    },
    2028: {
        '01-25': '설날 전날', '01-26': '설날', '01-27': '설날 다음날',
        '05-02': '부처님오신날',
        '10-02': '추석 전날', '10-03': '추석', '10-04': '추석 다음날'
    },
    2029: {
        '02-12': '설날 전날', '02-13': '설날', '02-14': '설날 다음날',
        '05-20': '부처님오신날',
        '09-21': '추석 전날', '09-22': '추석', '09-23': '추석 다음날'
    },
    2030: {
        '02-02': '설날 전날', '02-03': '설날', '02-04': '설날 다음날',
        '05-09': '부처님오신날',
        '09-11': '추석 전날', '09-12': '추석', '09-13': '추석 다음날'
    },
    2031: {
        '01-22': '설날 전날', '01-23': '설날', '01-24': '설날 다음날',
        '05-28': '부처님오신날',
        '09-30': '추석 전날', '10-01': '추석', '10-02': '추석 다음날'
    },
    2032: {
        '02-10': '설날 전날', '02-11': '설날', '02-12': '설날 다음날',
        '05-16': '부처님오신날',
        '09-18': '추석 전날', '09-19': '추석', '09-20': '추석 다음날'
    },
    2033: {
        '01-30': '설날 전날', '01-31': '설날', '02-01': '설날 다음날',
        '05-06': '부처님오신날',
        '09-07': '추석 전날', '09-08': '추석', '09-09': '추석 다음날'
    },
    2034: {
        '02-18': '설날 전날', '02-19': '설날', '02-20': '설날 다음날',
        '05-25': '부처님오신날',
        '09-26': '추석 전날', '09-27': '추석', '09-28': '추석 다음날'
    },
    2035: {
        '02-07': '설날 전날', '02-08': '설날', '02-09': '설날 다음날',
        '05-15': '부처님오신날',
        '09-15': '추석 전날', '09-16': '추석', '09-17': '추석 다음날'
    }
};

// 특정 날짜의 공휴일 정보 가져오기
function getHoliday(year, month, day) {
    if (!showHolidays) return null;

    const dateKey = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // 고정 공휴일 확인
    if (fixedHolidays[dateKey]) {
        return fixedHolidays[dateKey];
    }

    // 음력 기반 공휴일 확인
    if (lunarHolidays[year] && lunarHolidays[year][dateKey]) {
        return lunarHolidays[year][dateKey];
    }

    return null;
}

// Google API 초기화
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    const initConfig = {
        discoveryDocs: [DISCOVERY_DOC],
    };
    if (API_KEY) {
        initConfig.apiKey = API_KEY;
    }
    await gapi.client.init(initConfig);
    gapiInited = true;
    maybeEnableButtons();
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // 나중에 정의
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('authorizeButton').style.display = 'inline-block';
    }
}

// 로그인 처리
function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        accessToken = gapi.client.getToken();
        document.getElementById('signoutButton').style.display = 'inline-block';
        document.getElementById('authorizeButton').style.display = 'none';
        document.getElementById('authStatus').textContent = '✓ 구글 캘린더 연동됨';
        document.getElementById('showGoogleEvents').disabled = false;

        // 이벤트 가져오기
        await loadCalendarEvents();
        renderCalendar();
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        tokenClient.requestAccessToken({prompt: ''});
    }
}

// 로그아웃 처리
function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        accessToken = null;
        googleEvents = {};
        document.getElementById('authorizeButton').style.display = 'inline-block';
        document.getElementById('signoutButton').style.display = 'none';
        document.getElementById('authStatus').textContent = '';
        document.getElementById('showGoogleEvents').checked = false;
        document.getElementById('showGoogleEvents').disabled = true;
        showGoogleEvents = false;
        renderCalendar();
    }
}

// 캘린더 이벤트 가져오기
async function loadCalendarEvents() {
    try {
        const startDate = new Date(currentYear, 0, 1);
        const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

        const request = {
            'calendarId': 'primary',
            'timeMin': startDate.toISOString(),
            'timeMax': endDate.toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 2500,
            'orderBy': 'startTime',
        };

        const response = await gapi.client.calendar.events.list(request);
        const events = response.result.items;

        // 이벤트를 날짜별로 정리
        googleEvents = {};
        events.forEach(event => {
            const start = event.start.dateTime || event.start.date;
            const eventDate = new Date(start);
            const dateKey = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;

            if (!googleEvents[dateKey]) {
                googleEvents[dateKey] = [];
            }
            googleEvents[dateKey].push({
                title: event.summary || '(제목 없음)',
                start: start,
                allDay: !event.start.dateTime
            });
        });

        console.log('구글 캘린더 이벤트 로드 완료:', Object.keys(googleEvents).length, '일');
    } catch (err) {
        console.error('이벤트 가져오기 실패:', err);
        alert('캘린더 이벤트를 가져오는데 실패했습니다.');
    }
}

// 특정 날짜의 구글 이벤트 가져오기
function getGoogleEvents(year, month, day) {
    if (!showGoogleEvents) return [];
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return googleEvents[dateKey] || [];
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initYearSelector();
    updateSelectors();
    renderCalendar();
    attachEventListeners();

    // Google API 로드
    if (typeof gapi !== 'undefined') {
        gapiLoaded();
    }
    if (typeof google !== 'undefined') {
        gisLoaded();
    }
});

// 년도 선택기 초기화
function initYearSelector() {
    const yearSelect = document.getElementById('yearSelect');
    const startYear = 1900;
    const endYear = 2100;

    for (let year = startYear; year <= endYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = `${year}년`;
        yearSelect.appendChild(option);
    }
}

// 선택기 업데이트
function updateSelectors() {
    document.getElementById('yearSelect').value = currentYear;
    document.getElementById('monthSelect').value = currentMonth;
}

// 달력 렌더링 (화면 표시용)
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    // 헤더
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.textContent = `${currentYear}년 ${currentMonth}월`;
    calendar.appendChild(header);

    // 그리드
    const grid = document.createElement('div');
    grid.className = 'calendar-grid';

    // 요일 헤더
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    dayNames.forEach((day, index) => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = day;

        if (index === 0) dayHeader.classList.add('sunday');
        if (index === 6) dayHeader.classList.add('saturday');

        grid.appendChild(dayHeader);
    });

    // 달력 데이터 생성
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    // 빈 셀 추가 (첫날 전)
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell empty';
        grid.appendChild(emptyCell);
    }

    // 날짜 셀 추가
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'day-cell';

        const dayOfWeek = (firstDay + day - 1) % 7;
        const holiday = getHoliday(currentYear, currentMonth, day);
        const events = getGoogleEvents(currentYear, currentMonth, day);

        // 컨테이너 생성
        const content = document.createElement('div');
        content.className = 'day-cell-content';

        const dayNum = document.createElement('span');
        dayNum.textContent = day;
        content.appendChild(dayNum);

        // 공휴일 표시
        if (holiday) {
            const holidayName = document.createElement('div');
            holidayName.className = 'holiday-name';
            holidayName.textContent = holiday;
            content.appendChild(holidayName);
            dayCell.classList.add('holiday');
        }

        // 구글 이벤트 점 표시
        if (events.length > 0) {
            const eventDot = document.createElement('div');
            eventDot.className = 'event-dot';
            eventDot.title = events.map(e => e.title).join('\n');
            content.appendChild(eventDot);
        }

        dayCell.appendChild(content);

        if (dayOfWeek === 0 || holiday) dayCell.classList.add('sunday');
        if (dayOfWeek === 6 && !holiday) dayCell.classList.add('saturday');

        // 오늘 날짜 하이라이트
        if (currentYear === today.getFullYear() &&
            currentMonth === today.getMonth() + 1 &&
            day === today.getDate()) {
            dayCell.classList.add('today');
        }

        grid.appendChild(dayCell);
    }

    calendar.appendChild(grid);
}

// 특정 월의 달력 HTML 생성 (PDF용)
function createMonthCalendar(year, month) {
    const container = document.createElement('div');
    container.style.cssText = `
        background: white;
        padding: 15px;
        width: 280px;
        box-sizing: border-box;
    `;

    // 월 헤더
    const header = document.createElement('div');
    header.style.cssText = `
        text-align: center;
        font-size: 16px;
        font-weight: bold;
        color: #667eea;
        margin-bottom: 10px;
    `;
    header.textContent = `${year}년 ${month}월`;
    container.appendChild(header);

    // 그리드
    const grid = document.createElement('div');
    grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 5px;
    `;

    // 요일 헤더
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    dayNames.forEach((day, index) => {
        const dayHeader = document.createElement('div');
        dayHeader.style.cssText = `
            text-align: center;
            padding: 5px 2px;
            font-weight: bold;
            font-size: 12px;
            color: ${index === 0 ? '#e74c3c' : index === 6 ? '#3498db' : '#666'};
        `;
        dayHeader.textContent = day;
        grid.appendChild(dayHeader);
    });

    // 달력 데이터
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    // 빈 셀
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.style.cssText = 'padding: 8px;';
        grid.appendChild(emptyCell);
    }

    // 날짜 셀
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        const dayOfWeek = (firstDay + day - 1) % 7;
        const holiday = getHoliday(year, month, day);
        const events = getGoogleEvents(year, month, day);

        // 공휴일이면 빨간색, 아니면 기존 색상
        const textColor = holiday ? '#e74c3c' : (dayOfWeek === 0 ? '#e74c3c' : dayOfWeek === 6 ? '#3498db' : '#333');

        dayCell.style.cssText = `
            text-align: center;
            padding: ${holiday || events.length > 0 ? '4px 2px' : '8px 5px'};
            font-size: 12px;
            background: #f8f9fa;
            border-radius: 5px;
            color: ${textColor};
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;

        const dayNum = document.createElement('span');
        dayNum.textContent = day;
        dayCell.appendChild(dayNum);

        // 공휴일 이름 표시
        if (holiday) {
            const holidayName = document.createElement('div');
            holidayName.style.cssText = `
                font-size: 7px;
                color: #e74c3c;
                margin-top: 1px;
                line-height: 1.1;
            `;
            holidayName.textContent = holiday;
            dayCell.appendChild(holidayName);
        }

        // 구글 이벤트 점 표시
        if (events.length > 0) {
            const eventDot = document.createElement('div');
            eventDot.style.cssText = `
                width: 4px;
                height: 4px;
                background: #4285f4;
                border-radius: 50%;
                margin-top: 2px;
            `;
            dayCell.appendChild(eventDot);
        }

        grid.appendChild(dayCell);
    }

    container.appendChild(grid);
    return container;
}

// PDF 생성 (한글 지원) - A4 한 장에 4개월씩, 3페이지
async function generatePDF() {
    const { jsPDF } = window.jspdf;

    // PDF 생성
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 임시 컨테이너 생성
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        background: white;
        padding: 20px;
    `;
    document.body.appendChild(tempContainer);

    try {
        // 3페이지 생성 (4개월씩)
        for (let page = 0; page < 3; page++) {
            // 페이지 컨테이너
            const pageContainer = document.createElement('div');
            pageContainer.style.cssText = `
                background: white;
                padding: 30px;
                width: 1200px;
                font-family: -apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif;
            `;

            // 제목 추가
            const title = document.createElement('div');
            title.style.cssText = `
                text-align: center;
                font-size: 36px;
                font-weight: bold;
                color: #333;
                margin-bottom: 30px;
            `;
            title.textContent = `${currentYear}년 달력 (${page * 4 + 1}월 - ${page * 4 + 4}월)`;
            pageContainer.appendChild(title);

            // 4개월 그리드 컨테이너 (2x2)
            const gridContainer = document.createElement('div');
            gridContainer.style.cssText = `
                display: grid;
                grid-template-columns: repeat(2, 550px);
                grid-template-rows: repeat(2, auto);
                gap: 30px;
                background: white;
            `;

            // 4개월 달력 생성
            for (let i = 0; i < 4; i++) {
                const month = page * 4 + i + 1;
                if (month <= 12) {
                    const monthCalendar = createMonthCalendarForPDF(currentYear, month);
                    gridContainer.appendChild(monthCalendar);
                }
            }

            pageContainer.appendChild(gridContainer);
            tempContainer.appendChild(pageContainer);

            // 폰트 로딩 대기
            await document.fonts.ready;
            await new Promise(resolve => setTimeout(resolve, 100));

            // html2canvas로 이미지 생성
            const canvas = await html2canvas(pageContainer, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true,
                letterRendering: true
            });

            const imgData = canvas.toDataURL('image/png');

            // 이미지 크기 계산
            const imgWidth = pageWidth - 10;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let finalWidth = imgWidth;
            let finalHeight = imgHeight;

            if (imgHeight > pageHeight - 10) {
                finalHeight = pageHeight - 10;
                finalWidth = (canvas.width * finalHeight) / canvas.height;
            }

            // PDF에 이미지 추가 (중앙 정렬)
            const x = (pageWidth - finalWidth) / 2;
            const y = (pageHeight - finalHeight) / 2;

            if (page > 0) {
                doc.addPage();
            }

            doc.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

            // 페이지 컨테이너 제거 (다음 페이지를 위해)
            tempContainer.removeChild(pageContainer);
        }

        // PDF 다운로드
        doc.save(`calendar_${currentYear}.pdf`);
    } catch (error) {
        console.error('PDF 생성 오류:', error);
        alert('PDF 생성 중 오류가 발생했습니다: ' + error.message);
    } finally {
        // 임시 컨테이너 제거
        document.body.removeChild(tempContainer);
    }
}

// PDF용 큰 달력 생성 (A4에 4개씩 배치)
function createMonthCalendarForPDF(year, month) {
    const container = document.createElement('div');
    container.style.cssText = `
        background: white;
        padding: 20px;
        width: 530px;
        box-sizing: border-box;
    `;

    // 월 헤더
    const header = document.createElement('div');
    header.style.cssText = `
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        color: #667eea;
        margin-bottom: 15px;
    `;
    header.textContent = `${month}월`;
    container.appendChild(header);

    // 그리드
    const grid = document.createElement('div');
    grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;
    `;

    // 요일 헤더
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    dayNames.forEach((day, index) => {
        const dayHeader = document.createElement('div');
        dayHeader.style.cssText = `
            text-align: center;
            padding: 10px 5px;
            font-weight: bold;
            font-size: 16px;
            color: ${index === 0 ? '#e74c3c' : index === 6 ? '#3498db' : '#666'};
        `;
        dayHeader.textContent = day;
        grid.appendChild(dayHeader);
    });

    // 달력 데이터
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    // 빈 셀
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.style.cssText = 'padding: 15px;';
        grid.appendChild(emptyCell);
    }

    // 날짜 셀
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        const dayOfWeek = (firstDay + day - 1) % 7;
        const holiday = getHoliday(year, month, day);
        const events = getGoogleEvents(year, month, day);

        const textColor = holiday ? '#e74c3c' : (dayOfWeek === 0 ? '#e74c3c' : dayOfWeek === 6 ? '#3498db' : '#333');

        dayCell.style.cssText = `
            text-align: center;
            padding: ${holiday || events.length > 0 ? '8px 5px' : '15px 10px'};
            font-size: 16px;
            background: #f8f9fa;
            border-radius: 8px;
            color: ${textColor};
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 50px;
        `;

        const dayNum = document.createElement('span');
        dayNum.textContent = day;
        dayCell.appendChild(dayNum);

        // 공휴일 이름 표시
        if (holiday) {
            const holidayName = document.createElement('div');
            holidayName.style.cssText = `
                font-size: 10px;
                color: #e74c3c;
                margin-top: 3px;
                line-height: 1.2;
            `;
            holidayName.textContent = holiday;
            dayCell.appendChild(holidayName);
        }

        // 구글 이벤트 점 표시
        if (events.length > 0) {
            const eventDot = document.createElement('div');
            eventDot.style.cssText = `
                width: 6px;
                height: 6px;
                background: #4285f4;
                border-radius: 50%;
                margin-top: 4px;
            `;
            dayCell.appendChild(eventDot);
        }

        grid.appendChild(dayCell);
    }

    container.appendChild(grid);
    return container;
}

// 이벤트 리스너 연결
function attachEventListeners() {
    // 년도 변경
    document.getElementById('yearSelect').addEventListener('change', async (e) => {
        currentYear = parseInt(e.target.value);
        // 구글 캘린더 연동 중이면 이벤트 다시 로드
        if (accessToken) {
            await loadCalendarEvents();
        }
        renderCalendar();
    });

    // 월 변경
    document.getElementById('monthSelect').addEventListener('change', (e) => {
        currentMonth = parseInt(e.target.value);
        renderCalendar();
    });

    // 이전 달
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 1) {
            currentMonth = 12;
            currentYear--;
        }
        updateSelectors();
        renderCalendar();
    });

    // 다음 달
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
        }
        updateSelectors();
        renderCalendar();
    });

    // PDF 다운로드
    document.getElementById('downloadPdf').addEventListener('click', async () => {
        try {
            await generatePDF();
        } catch (error) {
            alert('PDF 생성 중 오류가 발생했습니다.');
            console.error(error);
        }
    });

    // 공휴일 표시 토글
    const holidayCheckbox = document.getElementById('showHolidays');
    if (holidayCheckbox) {
        holidayCheckbox.addEventListener('change', (e) => {
            showHolidays = e.target.checked;
            renderCalendar();
        });
    }

    // 구글 이벤트 표시 토글
    const googleEventsCheckbox = document.getElementById('showGoogleEvents');
    if (googleEventsCheckbox) {
        googleEventsCheckbox.addEventListener('change', (e) => {
            showGoogleEvents = e.target.checked;
            renderCalendar();
        });
    }

    // 구글 로그인 버튼
    const authorizeButton = document.getElementById('authorizeButton');
    if (authorizeButton) {
        authorizeButton.addEventListener('click', handleAuthClick);
    }

    // 구글 로그아웃 버튼
    const signoutButton = document.getElementById('signoutButton');
    if (signoutButton) {
        signoutButton.addEventListener('click', handleSignoutClick);
    }
}
