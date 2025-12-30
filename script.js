// 현재 날짜
const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth() + 1; // JavaScript는 0부터 시작

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
        dayCell.textContent = day;

        const dayOfWeek = (firstDay + day - 1) % 7;
        if (dayOfWeek === 0) dayCell.classList.add('sunday');
        if (dayOfWeek === 6) dayCell.classList.add('saturday');

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

// 월별 달력 데이터 생성
function getMonthCalendarData(year, month) {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    const weeks = [];
    let week = new Array(7).fill(0);
    let dayCounter = 1;

    // 첫 주
    for (let i = firstDay; i < 7 && dayCounter <= daysInMonth; i++) {
        week[i] = dayCounter++;
    }
    weeks.push([...week]);

    // 나머지 주
    while (dayCounter <= daysInMonth) {
        week = new Array(7).fill(0);
        for (let i = 0; i < 7 && dayCounter <= daysInMonth; i++) {
            week[i] = dayCounter++;
        }
        weeks.push([...week]);
    }

    return weeks;
}

// PDF 생성
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 제목
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text(`${currentYear} Calendar`, pageWidth / 2, 15, { align: 'center' });

    // 12개월을 3x4 그리드로 배치
    const cols = 4;
    const rows = 3;
    const marginX = 10;
    const marginY = 25;
    const cellWidth = (pageWidth - marginX * 2) / cols;
    const cellHeight = (pageHeight - marginY - 10) / rows;

    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월',
                        '7월', '8월', '9월', '10월', '11월', '12월'];
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    for (let month = 1; month <= 12; month++) {
        const row = Math.floor((month - 1) / cols);
        const col = (month - 1) % cols;

        const x = marginX + col * cellWidth;
        const y = marginY + row * cellHeight;

        // 월 이름
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(monthNames[month - 1], x + cellWidth / 2, y + 5, { align: 'center' });

        // 요일 헤더
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        const dayWidth = cellWidth / 7;

        dayNames.forEach((day, i) => {
            const dayX = x + i * dayWidth + dayWidth / 2;
            const dayY = y + 10;

            // 일요일은 빨강, 토요일은 파랑
            if (i === 0) {
                doc.setTextColor(231, 76, 60); // 빨강
            } else if (i === 6) {
                doc.setTextColor(52, 152, 219); // 파랑
            } else {
                doc.setTextColor(0, 0, 0); // 검정
            }

            doc.text(day, dayX, dayY, { align: 'center' });
        });

        // 날짜들
        const weeks = getMonthCalendarData(currentYear, month);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);

        weeks.forEach((week, weekIdx) => {
            week.forEach((day, dayIdx) => {
                if (day !== 0) {
                    const dateX = x + dayIdx * dayWidth + dayWidth / 2;
                    const dateY = y + 15 + weekIdx * 5;

                    // 일요일은 빨강, 토요일은 파랑
                    if (dayIdx === 0) {
                        doc.setTextColor(231, 76, 60);
                    } else if (dayIdx === 6) {
                        doc.setTextColor(52, 152, 219);
                    } else {
                        doc.setTextColor(0, 0, 0);
                    }

                    doc.text(day.toString(), dateX, dateY, { align: 'center' });
                }
            });
        });
    }

    // PDF 다운로드
    doc.save(`calendar_${currentYear}.pdf`);
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
    document.getElementById('downloadPdf').addEventListener('click', () => {
        try {
            generatePDF();
        } catch (error) {
            alert('PDF 생성 중 오류가 발생했습니다.');
            console.error(error);
        }
    });
}
