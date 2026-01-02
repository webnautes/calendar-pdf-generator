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

// 달력 렌더링
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
            // showHolidays 상태를 쿼리 파라미터로 전달
            const response = await fetch(`/api/pdf/${currentYear}?holidays=${showHolidays}`);
            if (!response.ok) throw new Error('PDF 생성 실패');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `calendar_${currentYear}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            alert('PDF 다운로드 중 오류가 발생했습니다.');
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
