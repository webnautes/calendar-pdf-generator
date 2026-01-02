// 현재 날짜
const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth() + 1; // JavaScript는 0부터 시작
let showHolidays = false; // 공휴일 표시 여부

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

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initYearSelector();
    updateSelectors();
    renderCalendar();
    attachEventListeners();
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

        // 공휴일이 있을 경우 컨테이너로 감싸기
        if (holiday) {
            const content = document.createElement('div');
            content.className = 'day-cell-content';

            const dayNum = document.createElement('span');
            dayNum.textContent = day;
            content.appendChild(dayNum);

            const holidayName = document.createElement('div');
            holidayName.className = 'holiday-name';
            holidayName.textContent = holiday;
            content.appendChild(holidayName);

            dayCell.appendChild(content);
            dayCell.classList.add('holiday');
        } else {
            dayCell.textContent = day;
        }

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

        // 공휴일이면 빨간색, 아니면 기존 색상
        const textColor = holiday ? '#e74c3c' : (dayOfWeek === 0 ? '#e74c3c' : dayOfWeek === 6 ? '#3498db' : '#333');

        dayCell.style.cssText = `
            text-align: center;
            padding: ${holiday ? '4px 2px' : '8px 5px'};
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

        grid.appendChild(dayCell);
    }

    container.appendChild(grid);
    return container;
}

// PDF 생성 (한글 지원)
async function generatePDF() {
    const { jsPDF } = window.jspdf;

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

    // 전체 컨테이너 (제목 포함)
    const mainContainer = document.createElement('div');
    mainContainer.style.cssText = `
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
    title.textContent = `${currentYear}년 달력`;
    mainContainer.appendChild(title);

    // 12개월 그리드 컨테이너
    const gridContainer = document.createElement('div');
    gridContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(4, 280px);
        grid-template-rows: repeat(3, auto);
        gap: 15px;
        background: white;
    `;

    // 12개월 달력 생성
    for (let month = 1; month <= 12; month++) {
        const monthCalendar = createMonthCalendar(currentYear, month);
        gridContainer.appendChild(monthCalendar);
    }

    mainContainer.appendChild(gridContainer);
    tempContainer.appendChild(mainContainer);

    try {
        // 폰트 로딩 대기 (중요!)
        await document.fonts.ready;

        // 추가 대기 시간 (폰트 완전 렌더링)
        await new Promise(resolve => setTimeout(resolve, 100));

        // html2canvas로 이미지 생성
        const canvas = await html2canvas(mainContainer, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: true,
            letterRendering: true
        });

        const imgData = canvas.toDataURL('image/png');

        // PDF 생성
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // 이미지 크기 계산
        const imgWidth = pageWidth - 10;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // 이미지가 페이지보다 크면 조정
        let finalWidth = imgWidth;
        let finalHeight = imgHeight;

        if (imgHeight > pageHeight - 10) {
            finalHeight = pageHeight - 10;
            finalWidth = (canvas.width * finalHeight) / canvas.height;
        }

        // PDF에 이미지 추가 (중앙 정렬)
        const x = (pageWidth - finalWidth) / 2;
        const y = (pageHeight - finalHeight) / 2;

        doc.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

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

// 이벤트 리스너 연결
function attachEventListeners() {
    // 년도 변경
    document.getElementById('yearSelect').addEventListener('change', (e) => {
        currentYear = parseInt(e.target.value);
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
}
