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
let calendarList = []; // 사용 가능한 캘린더 목록
let selectedCalendars = new Set(); // 선택된 캘린더 ID 목록

// 현재 날짜
const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth() + 1; // JavaScript는 0부터 시작
let showHolidays = false; // 공휴일 표시 여부
let showGoogleEvents = false; // 구글 이벤트 표시 여부
let monthsPerPage = 3; // PDF 한 장당 달력 개수
let showSeasonalFood = false; // 제철 음식 표시 여부 (1개월 모드)

// D-Day 설정 (최대 3개)
let ddaySettings = [
    { show: false, date: null, name: '', color: '#667eea' },
    { show: false, date: null, name: '', color: '#667eea' },
    { show: false, date: null, name: '', color: '#667eea' }
];

// PDF 달 선택
let selectedMonths = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]); // 선택된 달 (기본: 전체)

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

// 월별 제철 음식 데이터 (한국) - 상세 정보 포함
const seasonalFoods = {
    1: {
        title: '1월 제철 음식',
        description: '추운 겨울을 이기며 영양을 축적한 해산물과 비타민C 풍부한 감귤류가 제철',
        categories: [
            {
                name: '해산물',
                items: [
                    { food: '굴', reason: '겨울철 산란 전 영양 최고조, 철분·아연 풍부', nutrition: '철분, 아연, 타우린' },
                    { food: '방어', reason: '지방이 올라 고소하고 담백한 맛의 절정', nutrition: '오메가3, 단백질' },
                    { food: '꼬막', reason: '살이 통통하고 철분이 가장 풍부한 시기', nutrition: '철분, 단백질, 비타민B12' }
                ]
            },
            {
                name: '과일·채소',
                items: [
                    { food: '귤·한라봉', reason: '비타민C 풍부해 감기 예방에 효과적', nutrition: '비타민C, 구연산' },
                    { food: '시금치', reason: '겨울 노지 시금치가 가장 달고 영양가 높음', nutrition: '철분, 엽산, 비타민A' }
                ]
            }
        ]
    },
    2: {
        title: '2월 제철 음식',
        description: '이른 봄나물이 나오기 시작하며, 해독과 춘곤증 극복에 좋은 식재료의 계절',
        categories: [
            {
                name: '해산물',
                items: [
                    { food: '도미', reason: '맑고 담백한 맛, 단백질이 풍부한 시기', nutrition: '단백질, 비타민D' },
                    { food: '꼬막', reason: '살이 차고 탱글한 식감이 최고', nutrition: '철분, 비타민B12' }
                ]
            },
            {
                name: '채소·과일',
                items: [
                    { food: '봄동', reason: '겨울을 난 봄동은 달콤하고 아삭함', nutrition: '비타민C, 식이섬유' },
                    { food: '냉이·달래', reason: '향긋한 봄나물로 입맛 돋우고 해독 효과', nutrition: '비타민C, 칼슘' },
                    { food: '딸기', reason: '하우스 딸기가 가장 달고 향기로운 시기', nutrition: '비타민C, 안토시아닌' }
                ]
            }
        ]
    },
    3: {
        title: '3월 제철 음식',
        description: '춘곤증 극복! 비타민B와 무기질 풍부한 봄나물과 타우린 가득한 해산물의 계절',
        categories: [
            {
                name: '해산물',
                items: [
                    { food: '주꾸미', reason: '산란 전 알이 가득, 타우린이 피로회복에 탁월', nutrition: '타우린, 단백질' },
                    { food: '도다리', reason: '쑥과 함께 끓이면 봄철 최고의 보양식', nutrition: '단백질, 비타민B' },
                    { food: '바지락', reason: '살이 통통하고 국물 맛이 시원한 시기', nutrition: '철분, 타우린' }
                ]
            },
            {
                name: '채소',
                items: [
                    { food: '냉이', reason: '향긋하고 간 해독에 효과적인 대표 봄나물', nutrition: '비타민A, 칼슘' },
                    { food: '달래', reason: '톡 쏘는 매운맛, 혈액순환과 춘곤증에 좋음', nutrition: '비타민C, 알리신' },
                    { food: '쑥', reason: '따뜻한 성질로 냉한 체질에 좋은 봄나물', nutrition: '비타민A, 철분' }
                ]
            }
        ]
    },
    4: {
        title: '4월 제철 음식',
        description: '봄철 산나물과 해산물의 전성기! 단백질 풍부한 자연 보양식의 계절',
        categories: [
            {
                name: '해산물',
                items: [
                    { food: '멍게', reason: '독특한 향과 쫄깃한 식감이 최고인 시기', nutrition: '글리코겐, 타우린' },
                    { food: '미더덕', reason: '향긋하고 쫄깃, 찜이나 탕에 풍미 더함', nutrition: '단백질, 미네랄' },
                    { food: '키조개', reason: '관자가 크고 달콤한 맛이 절정', nutrition: '단백질, 아연' }
                ]
            },
            {
                name: '채소',
                items: [
                    { food: '두릅', reason: '단백질이 채소 중 가장 많고 향긋한 봄의 맛', nutrition: '단백질, 비타민C, 사포닌' },
                    { food: '참나물', reason: '부드럽고 향긋, 나물이나 샐러드로 최적', nutrition: '비타민A, 칼슘' },
                    { food: '미나리', reason: '해독 작용이 뛰어나고 아삭한 식감', nutrition: '비타민C, 식이섬유' }
                ]
            }
        ]
    },
    5: {
        title: '5월 제철 음식',
        description: '매실 담그기 적기! 초여름 과일이 시작되고 해산물도 풍부한 계절',
        categories: [
            {
                name: '해산물',
                items: [
                    { food: '전복', reason: '살이 통통하고 쫄깃, 여름 보양식으로 최고', nutrition: '단백질, 타우린' },
                    { food: '병어', reason: '지방이 적당히 올라 구이로 담백한 맛', nutrition: '단백질, 불포화지방산' },
                    { food: '참조기', reason: '산란 전 살이 오르고 고소한 맛의 절정', nutrition: '단백질, 비타민D' }
                ]
            },
            {
                name: '과일·채소',
                items: [
                    { food: '매실', reason: '청매실 수확 시기, 피로회복과 해독에 탁월', nutrition: '구연산, 피크르산' },
                    { food: '참외', reason: '아삭하고 달콤, 수분 보충에 효과적', nutrition: '비타민C, 엽산' },
                    { food: '아스파라거스', reason: '부드럽고 고소, 피로회복에 좋은 아스파라긴산', nutrition: '아스파라긴산, 엽산' }
                ]
            }
        ]
    },
    6: {
        title: '6월 제철 음식',
        description: '여름 과일의 시작! 더위에 지친 몸에 활력을 주는 제철 식재료의 계절',
        categories: [
            {
                name: '해산물',
                items: [
                    { food: '장어', reason: '여름 보양식의 대표, 체력 회복에 최고', nutrition: '비타민A, 단백질, DHA' },
                    { food: '오징어', reason: '쫄깃한 식감과 담백한 맛의 절정', nutrition: '타우린, 단백질' },
                    { food: '민어', reason: '담백하고 부드러워 여름 보양식으로 인기', nutrition: '단백질, 비타민B' }
                ]
            },
            {
                name: '과일·채소',
                items: [
                    { food: '자두', reason: '새콤달콤, 장 건강과 피부미용에 좋음', nutrition: '안토시아닌, 식이섬유' },
                    { food: '수박', reason: '수분 90% 이상, 더위 해소와 이뇨작용', nutrition: '리코펜, 칼륨' },
                    { food: '감자', reason: '햇감자가 포슬포슬하고 맛있는 시기', nutrition: '비타민C, 칼륨' }
                ]
            }
        ]
    },
    7: {
        title: '7월 제철 음식',
        description: '삼복더위 보양식의 계절! 스태미나 음식과 수분 가득한 여름 과일이 풍성',
        categories: [
            {
                name: '해산물',
                items: [
                    { food: '장어', reason: '복날 보양식, 비타민A가 면역력 강화', nutrition: '비타민A·E, 오메가3' },
                    { food: '민어', reason: '담백하고 소화 잘 되어 여름 보양탕으로 최적', nutrition: '단백질, 라이신' },
                    { food: '농어', reason: '지방이 적당히 올라 회나 구이로 담백', nutrition: '단백질, DHA' }
                ]
            },
            {
                name: '과일·채소',
                items: [
                    { food: '수박', reason: '더위 해소와 갈증 해결의 대표 과일', nutrition: '리코펜, 시트룰린' },
                    { food: '복숭아', reason: '달콤하고 수분 많아 피부미용에 좋음', nutrition: '비타민C, 칼륨' },
                    { food: '옥수수', reason: '여름철 간식, 식이섬유와 비타민B 풍부', nutrition: '식이섬유, 비타민B' }
                ]
            }
        ]
    },
    8: {
        title: '8월 제철 음식',
        description: '여름 과일의 전성기! 토마토는 햇빛 받아 라이코펜이 최고조인 시기',
        categories: [
            {
                name: '해산물',
                items: [
                    { food: '전복', reason: '여름철 산란기 전 살이 통통하고 쫄깃', nutrition: '타우린, 아르기닌' },
                    { food: '낙지', reason: '피로회복에 좋은 타우린이 풍부', nutrition: '타우린, 철분' },
                    { food: '갈치', reason: '기름이 오르기 시작해 구이로 고소', nutrition: 'DHA, 단백질' }
                ]
            },
            {
                name: '과일·채소',
                items: [
                    { food: '포도', reason: '당도 높고 안토시아닌이 항산화에 효과적', nutrition: '안토시아닌, 레스베라트롤' },
                    { food: '토마토', reason: '햇빛 받아 라이코펜과 글루타민 최고', nutrition: '라이코펜, 비타민C' },
                    { food: '가지', reason: '보라색 껍질에 안토시아닌, 열 내려줌', nutrition: '안토시아닌, 칼륨' }
                ]
            }
        ]
    },
    9: {
        title: '9월 제철 음식',
        description: '가을의 시작! 살이 오른 꽃게와 전어, 달콤한 햇과일이 풍성한 계절',
        categories: [
            {
                name: '해산물',
                items: [
                    { food: '꽃게', reason: '암꽃게 알이 가득, 감칠맛과 영양 최고', nutrition: '키토산, 단백질' },
                    { food: '전어', reason: '가을 전어는 집 나간 며느리도 돌아오게 하는 맛', nutrition: '오메가3, 칼슘' },
                    { food: '대하', reason: '살이 탱글하고 달콤, 소금구이로 최고', nutrition: '키토산, 타우린' }
                ]
            },
            {
                name: '과일·채소',
                items: [
                    { food: '배', reason: '수분 많고 시원, 기관지와 소화에 좋음', nutrition: '루테올린, 식이섬유' },
                    { food: '사과', reason: '아삭하고 달콤, 펙틴이 장 건강에 도움', nutrition: '펙틴, 폴리페놀' },
                    { food: '고구마', reason: '햇고구마가 달콤하고 식이섬유 풍부', nutrition: '베타카로틴, 식이섬유' }
                ]
            }
        ]
    },
    10: {
        title: '10월 제철 음식',
        description: '풍성한 가을! 고등어는 지방이 올라 고소하고, 단풍철 밤과 감이 달콤',
        categories: [
            {
                name: '해산물',
                items: [
                    { food: '고등어', reason: '가을 고등어는 기름져서 구이로 최고', nutrition: 'DHA, EPA, 오메가3' },
                    { food: '꽃게', reason: '수게 살이 꽉 차고 고소한 맛의 절정', nutrition: '단백질, 아연' },
                    { food: '갈치', reason: '은빛 윤기, 살이 부드럽고 구이로 담백', nutrition: 'DHA, 단백질' }
                ]
            },
            {
                name: '과일·채소',
                items: [
                    { food: '감', reason: '단감은 아삭, 홍시는 달콤하게 익어가는 시기', nutrition: '비타민A·C, 베타카로틴' },
                    { food: '밤', reason: '햇밤이 달콤하고 고소, 피로회복에 좋음', nutrition: '비타민C, 탄수화물' },
                    { food: '버섯', reason: '송이·표고 등 향긋한 가을 버섯의 계절', nutrition: '비타민D, 식이섬유' }
                ]
            }
        ]
    },
    11: {
        title: '11월 제철 음식',
        description: '김장철! 배추와 무가 달콤하고, 겨울 해산물이 맛있어지기 시작',
        categories: [
            {
                name: '해산물',
                items: [
                    { food: '굴', reason: '찬바람 불면 굴이 제맛, 영양이 풍부해짐', nutrition: '아연, 타우린, 철분' },
                    { food: '대게', reason: '살이 차오르기 시작, 달콤하고 담백', nutrition: '단백질, 키토산' },
                    { food: '방어', reason: '지방이 오르면서 횟감으로 최고의 맛', nutrition: '오메가3, 비타민D' }
                ]
            },
            {
                name: '채소·과일',
                items: [
                    { food: '배추', reason: '서리 맞은 배추가 달콤, 김장용으로 최적', nutrition: '비타민C, 식이섬유' },
                    { food: '무', reason: '시원하고 달콤, 소화효소 디아스타아제 풍부', nutrition: '비타민C, 디아스타아제' },
                    { food: '귤', reason: '새콤달콤, 감기 예방에 좋은 비타민C', nutrition: '비타민C, 구연산' }
                ]
            }
        ]
    },
    12: {
        title: '12월 제철 음식',
        description: '바다의 우유 굴! 겨울철 보양 해산물과 비타민C 가득한 감귤류가 풍성',
        categories: [
            {
                name: '해산물',
                items: [
                    { food: '굴', reason: '바다의 우유, 아연과 타우린이 최고조', nutrition: '아연, 타우린, 글리코겐' },
                    { food: '과메기', reason: '오메가3가 풍부한 겨울 별미', nutrition: 'DHA, EPA, 비타민E' },
                    { food: '대게', reason: '살이 꽉 차고 달콤한 겨울 별미', nutrition: '단백질, 칼슘' }
                ]
            },
            {
                name: '과일·채소',
                items: [
                    { food: '한라봉', reason: '달콤하고 향긋, 비타민C가 귤의 2배', nutrition: '비타민C, 구연산' },
                    { food: '시금치', reason: '겨울 노지 시금치가 가장 달고 철분 풍부', nutrition: '철분, 엽산, 비타민K' },
                    { food: '대파', reason: '추위에 단맛 증가, 혈액순환에 좋음', nutrition: '알리신, 비타민C' }
                ]
            }
        ]
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

// D-Day까지 남은 날짜 계산 (여러 D-Day 지원)
function getDdayInfo(year, month, day) {
    const results = [];
    const currentDate = new Date(year, month - 1, day);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < ddaySettings.length; i++) {
        const setting = ddaySettings[i];
        if (!setting.show || !setting.date) continue;

        const targetDate = new Date(setting.date);
        targetDate.setHours(0, 0, 0, 0);

        const diffTime = targetDate - currentDate;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0) {
            let text;
            if (diffDays === 0) {
                text = 'D-Day';
            } else {
                text = `D-${diffDays}`;
            }
            results.push({
                text: text,
                name: setting.name,
                color: setting.color,
                isDday: diffDays === 0
            });
        }
    }

    return results;
}

// PDF 달 선택 모달 관련 함수
function openPdfModal() {
    const modal = document.getElementById('pdfMonthModal');
    modal.style.display = 'flex';
    renderMonthGrid();
    updateSelectedCount();
}

function closePdfModal() {
    const modal = document.getElementById('pdfMonthModal');
    modal.style.display = 'none';
}

function renderMonthGrid() {
    const monthGrid = document.getElementById('monthGrid');
    monthGrid.innerHTML = '';

    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    for (let month = 1; month <= 12; month++) {
        const monthItem = document.createElement('div');
        monthItem.className = 'month-item' + (selectedMonths.has(month) ? ' selected' : '');
        monthItem.dataset.month = month;

        // 헤더 (체크박스 + 월 이름)
        const header = document.createElement('div');
        header.className = 'month-header';

        const checkbox = document.createElement('div');
        checkbox.className = 'month-checkbox';

        const monthName = document.createElement('span');
        monthName.className = 'month-name';
        monthName.textContent = `${currentYear}년 ${month}월`;

        header.appendChild(checkbox);
        header.appendChild(monthName);

        // 미리보기 달력
        const preview = document.createElement('div');
        preview.className = 'month-preview';

        const grid = document.createElement('div');
        grid.className = 'month-preview-grid';

        // 요일 헤더
        dayNames.forEach((day, idx) => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'month-preview-header';
            if (idx === 0) dayHeader.classList.add('sunday');
            if (idx === 6) dayHeader.classList.add('saturday');
            dayHeader.textContent = day;
            grid.appendChild(dayHeader);
        });

        // 날짜 계산
        const firstDay = new Date(currentYear, month - 1, 1).getDay();
        const daysInMonth = new Date(currentYear, month, 0).getDate();

        // 빈 셀
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'month-preview-day empty';
            empty.textContent = '';
            grid.appendChild(empty);
        }

        // 날짜
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'month-preview-day';
            const dayOfWeek = (firstDay + day - 1) % 7;
            if (dayOfWeek === 0) dayCell.classList.add('sunday');
            if (dayOfWeek === 6) dayCell.classList.add('saturday');
            dayCell.textContent = day;
            grid.appendChild(dayCell);
        }

        preview.appendChild(grid);
        monthItem.appendChild(header);
        monthItem.appendChild(preview);

        // 클릭 이벤트
        monthItem.addEventListener('click', () => {
            toggleMonth(month);
        });

        monthGrid.appendChild(monthItem);
    }
}

function toggleMonth(month) {
    if (selectedMonths.has(month)) {
        selectedMonths.delete(month);
    } else {
        selectedMonths.add(month);
    }

    // UI 업데이트
    const monthItem = document.querySelector(`.month-item[data-month="${month}"]`);
    if (monthItem) {
        monthItem.classList.toggle('selected', selectedMonths.has(month));
    }

    updateSelectedCount();
}

function selectAllMonths() {
    for (let i = 1; i <= 12; i++) {
        selectedMonths.add(i);
    }
    document.querySelectorAll('.month-item').forEach(item => {
        item.classList.add('selected');
    });
    updateSelectedCount();
}

function deselectAllMonths() {
    selectedMonths.clear();
    document.querySelectorAll('.month-item').forEach(item => {
        item.classList.remove('selected');
    });
    updateSelectedCount();
}

function updateSelectedCount() {
    const count = selectedMonths.size;
    const countText = document.getElementById('selectedMonthsCount');
    const confirmBtn = document.getElementById('confirmPdfDownload');

    countText.textContent = `${count}개월 선택됨`;
    confirmBtn.disabled = count === 0;
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

        // 캘린더 목록 먼저 가져오기
        await loadCalendarList();

        // 이벤트 가져오기
        await loadCalendarEvents();

        // 자동으로 이벤트 표시 활성화
        document.getElementById('showGoogleEvents').checked = true;
        showGoogleEvents = true;

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
        calendarList = [];
        selectedCalendars.clear();
        document.getElementById('authorizeButton').style.display = 'inline-block';
        document.getElementById('signoutButton').style.display = 'none';
        document.getElementById('authStatus').textContent = '';
        document.getElementById('showGoogleEvents').checked = false;
        document.getElementById('showGoogleEvents').disabled = true;
        showGoogleEvents = false;

        // 캘린더 선택 UI 숨기기
        const calendarSelector = document.getElementById('calendarSelector');
        if (calendarSelector) {
            calendarSelector.style.display = 'none';
        }

        renderCalendar();
    }
}

// 캘린더 목록 가져오기
async function loadCalendarList() {
    try {
        const response = await gapi.client.calendar.calendarList.list({
            'showDeleted': false,
            'showHidden': false  // 숨긴 캘린더는 표시 안함
        });

        calendarList = response.result.items || [];

        // 기본적으로 모든 캘린더 선택
        selectedCalendars.clear();
        calendarList.forEach(cal => {
            selectedCalendars.add(cal.id);
        });

        // 캘린더 선택 UI 업데이트
        renderCalendarSelector();

        console.log('캘린더 목록 로드 완료:', calendarList.length, '개');
        console.log('캘린더 목록:', calendarList.map(c => c.summary));
        return calendarList;
    } catch (err) {
        console.error('캘린더 목록 가져오기 실패:', err);
        return [];
    }
}

// 캘린더 선택 UI 렌더링
function renderCalendarSelector() {
    const container = document.getElementById('calendarList');
    if (!container) return;

    container.innerHTML = '';

    calendarList.forEach(calendar => {
        const item = document.createElement('label');
        item.className = 'calendar-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = calendar.id;
        checkbox.checked = selectedCalendars.has(calendar.id);
        checkbox.addEventListener('change', async (e) => {
            if (e.target.checked) {
                selectedCalendars.add(calendar.id);
            } else {
                selectedCalendars.delete(calendar.id);
            }
            // 이벤트 다시 로드
            await loadCalendarEvents();
            renderCalendar();
        });

        const colorDot = document.createElement('span');
        colorDot.className = 'calendar-color-dot';
        colorDot.style.backgroundColor = calendar.backgroundColor || '#4285f4';

        const name = document.createElement('span');
        name.className = 'calendar-name';
        name.textContent = calendar.summary || '(이름 없음)';

        item.appendChild(checkbox);
        item.appendChild(colorDot);
        item.appendChild(name);
        container.appendChild(item);
    });

    // 캘린더 선택 영역 표시
    const calendarSelector = document.getElementById('calendarSelector');
    if (calendarSelector && calendarList.length > 0) {
        calendarSelector.style.display = 'block';
    }
}

// 캘린더 이벤트 가져오기 (선택된 모든 캘린더에서)
async function loadCalendarEvents() {
    try {
        const startDate = new Date(currentYear, 0, 1);
        const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

        // 이벤트 초기화
        googleEvents = {};

        // 선택된 캘린더가 없으면 종료
        if (selectedCalendars.size === 0) {
            console.log('선택된 캘린더가 없습니다.');
            return;
        }

        // 선택된 각 캘린더에서 이벤트 가져오기
        const calendarPromises = Array.from(selectedCalendars).map(async (calendarId) => {
            try {
                const calendar = calendarList.find(cal => cal.id === calendarId);
                const calendarColor = calendar ? (calendar.backgroundColor || '#4285f4') : '#4285f4';

                const request = {
                    'calendarId': calendarId,
                    'timeMin': startDate.toISOString(),
                    'timeMax': endDate.toISOString(),
                    'showDeleted': false,
                    'singleEvents': true,
                    'maxResults': 2500,
                    'orderBy': 'startTime',
                };

                const response = await gapi.client.calendar.events.list(request);
                return {
                    calendarId,
                    calendarColor,
                    calendarName: calendar ? calendar.summary : calendarId,
                    events: response.result.items || []
                };
            } catch (err) {
                console.error(`캘린더 ${calendarId} 이벤트 가져오기 실패:`, err);
                return { calendarId, calendarColor: '#4285f4', events: [] };
            }
        });

        const results = await Promise.all(calendarPromises);

        // 이벤트를 날짜별로 정리
        results.forEach(({ calendarColor, calendarName, events }) => {
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
                    allDay: !event.start.dateTime,
                    color: event.colorId ? getEventColor(event.colorId) : calendarColor,
                    calendarName: calendarName
                });
            });
        });

        console.log('구글 캘린더 이벤트 로드 완료:', Object.keys(googleEvents).length, '일');
    } catch (err) {
        console.error('이벤트 가져오기 실패:', err);
        alert('캘린더 이벤트를 가져오는데 실패했습니다.');
    }
}

// Google Calendar 이벤트 색상 ID를 실제 색상으로 변환
function getEventColor(colorId) {
    const colors = {
        '1': '#7986cb',  // Lavender
        '2': '#33b679',  // Sage
        '3': '#8e24aa',  // Grape
        '4': '#e67c73',  // Flamingo
        '5': '#f6bf26',  // Banana
        '6': '#f4511e',  // Tangerine
        '7': '#039be5',  // Peacock
        '8': '#616161',  // Graphite
        '9': '#3f51b5',  // Blueberry
        '10': '#0b8043', // Basil
        '11': '#d50000'  // Tomato
    };
    return colors[colorId] || '#4285f4';
}

// 특정 날짜의 구글 이벤트 가져오기
function getGoogleEvents(year, month, day) {
    if (!showGoogleEvents) return [];
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return googleEvents[dateKey] || [];
}

// Google Apps Script API URL (배포 후 실제 URL로 교체 필요)
// APPS_SCRIPT_SETUP.md 파일 참고하여 설정하세요
const STATS_API_URL = 'https://script.google.com/macros/s/AKfycbyy329R1fEkfOFjFr92rLna91fOoMsNruhCu2nH6oZNRFNE9FwZDnylRyEDT3M1k6DwrQ/exec';

// PDF 다운로드 카운터 초기화 및 관리
async function initPdfCounter() {
    // Apps Script에서 전체 통계 가져오기
    await fetchPdfStats();
}

// Apps Script에서 현재 통계 가져오기
async function fetchPdfStats() {
    // Apps Script URL이 설정되지 않은 경우
    if (!STATS_API_URL || STATS_API_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
        console.log('Apps Script URL이 설정되지 않음');
        updatePdfCountDisplay(0);
        updateLastPdfTimeDisplay(null);
        return;
    }

    try {
        const response = await fetch(STATS_API_URL, {
            method: 'GET'
        });

        const data = await response.json();

        if (data.success) {
            updatePdfCountDisplay(data.count);
            updateLastPdfTimeDisplay(data.timestamp);
            console.log(`전체 PDF 생성 횟수: ${data.count}회`);
            console.log(`마지막 생성 시간 (timestamp): ${data.timestamp}`);
        } else {
            console.error('통계 조회 실패:', data.error);
            updatePdfCountDisplay(0);
            updateLastPdfTimeDisplay(null);
        }
    } catch (error) {
        console.error('통계 조회 에러:', error);
        updatePdfCountDisplay(0);
        updateLastPdfTimeDisplay(null);
    }
}

function updatePdfCountDisplay(count) {
    const counterElement = document.getElementById('pdfDownloadCount');
    if (counterElement) {
        counterElement.textContent = parseInt(count).toLocaleString('ko-KR');
    }
}

function updateLastPdfTimeDisplay(timestamp) {
    const timeElement = document.getElementById('lastPdfTime');
    if (!timeElement) return;

    // timestamp 유효성 검사
    const numTimestamp = Number(timestamp);
    if (!numTimestamp || numTimestamp <= 0 || isNaN(numTimestamp)) {
        timeElement.textContent = '-';
        return;
    }

    const date = new Date(numTimestamp);

    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
        timeElement.textContent = '-';
        return;
    }

    // 날짜와 시간 표시 (YYYY-MM-DD HH:MM:SS 형식)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    timeElement.textContent = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function incrementPdfCounter() {
    // Apps Script URL이 설정되지 않은 경우
    if (!STATS_API_URL || STATS_API_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
        console.log('Apps Script URL이 설정되지 않음');
        return;
    }

    // POST 요청 (keepalive로 페이지 새로고침 시에도 요청 완료 보장)
    fetch(STATS_API_URL, {
        method: 'POST',
        keepalive: true  // 페이지 언로드 시에도 요청 유지
    }).catch(error => {
        console.error('카운터 증가 에러:', error);
    });

    // 3초 후 페이지 새로고침 (POST 요청 완료 시간 확보)
    setTimeout(() => {
        location.reload();
    }, 3000);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initYearSelector();
    updateSelectors();
    renderCalendar();
    attachEventListeners();

    // Google API 로드 (스크립트 로딩 대기)
    initGoogleAPIs();

    // PDF 카운터 초기화
    initPdfCounter();
});

// Google API 초기화 (스크립트 로딩 대기)
function initGoogleAPIs() {
    let gapiReady = false;
    let gisReady = false;

    // gapi 체크
    function checkGapi() {
        if (typeof gapi !== 'undefined' && !gapiReady) {
            gapiReady = true;
            gapiLoaded();
        }
    }

    // GIS(google.accounts) 체크
    function checkGis() {
        if (typeof google !== 'undefined' && google.accounts && !gisReady) {
            gisReady = true;
            gisLoaded();
        }
    }

    // 즉시 체크
    checkGapi();
    checkGis();

    // 아직 로드되지 않았으면 폴링
    if (!gapiReady || !gisReady) {
        const maxAttempts = 50; // 최대 5초 대기
        let attempts = 0;

        const interval = setInterval(() => {
            attempts++;

            if (!gapiReady) checkGapi();
            if (!gisReady) checkGis();

            if ((gapiReady && gisReady) || attempts >= maxAttempts) {
                clearInterval(interval);
                if (attempts >= maxAttempts && (!gapiReady || !gisReady)) {
                    console.warn('Google API 로드 시간 초과. 페이지를 새로고침해 주세요.');
                }
            }
        }, 100);
    }
}

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
        const ddayInfos = getDdayInfo(currentYear, currentMonth, day);

        // 컨테이너 생성
        const content = document.createElement('div');
        content.className = 'day-cell-content';

        const dayNum = document.createElement('span');
        dayNum.className = 'day-number';
        dayNum.textContent = day;
        content.appendChild(dayNum);

        // D-Day 표시 (여러 개 지원)
        if (ddayInfos.length > 0) {
            ddayInfos.forEach(ddayInfo => {
                const ddayContainer = document.createElement('div');
                ddayContainer.className = 'dday-container';

                const ddayLabel = document.createElement('div');
                ddayLabel.className = 'dday-label-cell';
                ddayLabel.style.background = ddayInfo.color;
                ddayLabel.textContent = ddayInfo.text;
                if (ddayInfo.name) {
                    ddayLabel.title = ddayInfo.name;
                }
                ddayContainer.appendChild(ddayLabel);

                // 이벤트 이름 항상 표시 (D-Day 이전에도)
                if (ddayInfo.name) {
                    const ddayNameLabel = document.createElement('div');
                    ddayNameLabel.className = 'dday-name-label';
                    ddayNameLabel.style.color = ddayInfo.color;
                    ddayNameLabel.textContent = ddayInfo.name;
                    ddayContainer.appendChild(ddayNameLabel);
                }

                content.appendChild(ddayContainer);
            });
        }

        // 공휴일 표시
        if (holiday) {
            const holidayName = document.createElement('div');
            holidayName.className = 'holiday-name';
            holidayName.textContent = holiday;
            content.appendChild(holidayName);
            dayCell.classList.add('holiday');
        }

        // 구글 이벤트 텍스트로 표시
        if (events.length > 0) {
            const eventsList = document.createElement('div');
            eventsList.className = 'events-list';

            // 최대 3개의 이벤트 표시
            const maxEvents = 3;
            const displayEvents = events.slice(0, maxEvents);

            displayEvents.forEach(event => {
                const eventItem = document.createElement('div');
                eventItem.className = 'event-item';
                eventItem.style.backgroundColor = event.color || '#4285f4';
                eventItem.textContent = event.title;
                eventItem.title = `[${event.calendarName || '캘린더'}] ${event.title}`;
                eventsList.appendChild(eventItem);
            });

            // 더 많은 이벤트가 있으면 표시
            if (events.length > maxEvents) {
                const moreEvents = document.createElement('div');
                moreEvents.className = 'more-events';
                moreEvents.textContent = `+${events.length - maxEvents}개 더보기`;
                moreEvents.title = events.slice(maxEvents).map(e => `[${e.calendarName || '캘린더'}] ${e.title}`).join('\n');
                eventsList.appendChild(moreEvents);
            }

            content.appendChild(eventsList);
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

    // 1개월 모드에서 제철 음식 옵션 체크 시에만 표시
    if (monthsPerPage === 1 && showSeasonalFood && seasonalFoods[currentMonth]) {
        const foodSection = renderSeasonalFoods(currentMonth);
        calendar.appendChild(foodSection);
    }

    // D-Day 목록 섹션 렌더링
    renderDdayList();
}

// D-Day 목록 섹션 렌더링 (캘린더 아래)
function renderDdayList() {
    const ddayListSection = document.getElementById('ddayListSection');
    if (!ddayListSection) return;

    // 활성화된 D-Day 설정 필터링
    const activeDdays = ddaySettings.filter(setting => setting.show && setting.date);

    if (activeDdays.length === 0) {
        ddayListSection.style.display = 'none';
        return;
    }

    ddayListSection.style.display = 'block';
    ddayListSection.innerHTML = '';

    // 제목
    const title = document.createElement('div');
    title.className = 'dday-list-title';
    title.textContent = '🎯 D-Day 카운터';
    ddayListSection.appendChild(title);

    // D-Day 목록 컨테이너
    const listContainer = document.createElement('div');
    listContainer.className = 'dday-list-container';

    // 오늘 날짜 기준으로 계산
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    activeDdays.forEach(setting => {
        const targetDate = new Date(setting.date);
        targetDate.setHours(0, 0, 0, 0);

        const diffTime = targetDate - todayDate;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        const ddayItem = document.createElement('div');
        ddayItem.className = 'dday-list-item';

        // D-Day 뱃지
        const ddayBadge = document.createElement('div');
        ddayBadge.className = 'dday-list-badge';
        ddayBadge.style.backgroundColor = setting.color;

        let badgeText;
        if (diffDays === 0) {
            badgeText = 'D-Day';
        } else if (diffDays > 0) {
            badgeText = `D-${diffDays}`;
        } else {
            badgeText = `D+${Math.abs(diffDays)}`;
        }
        ddayBadge.textContent = badgeText;

        // 이벤트 정보
        const ddayInfo = document.createElement('div');
        ddayInfo.className = 'dday-list-info';

        const ddayName = document.createElement('div');
        ddayName.className = 'dday-list-name';
        ddayName.textContent = setting.name || '이벤트';
        ddayName.style.color = setting.color;

        const ddayDate = document.createElement('div');
        ddayDate.className = 'dday-list-date';
        const dateObj = new Date(setting.date);
        ddayDate.textContent = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;

        ddayInfo.appendChild(ddayName);
        ddayInfo.appendChild(ddayDate);

        ddayItem.appendChild(ddayBadge);
        ddayItem.appendChild(ddayInfo);
        listContainer.appendChild(ddayItem);
    });

    ddayListSection.appendChild(listContainer);
}

// 제철 음식 섹션 렌더링 (웹용)
function renderSeasonalFoods(month) {
    const foodData = seasonalFoods[month];

    const section = document.createElement('div');
    section.className = 'seasonal-foods-section';

    // 제목
    const title = document.createElement('div');
    title.className = 'seasonal-foods-title';
    title.textContent = `🍽️ ${foodData.title}`;
    section.appendChild(title);

    // 설명
    const desc = document.createElement('div');
    desc.className = 'seasonal-foods-desc';
    desc.textContent = foodData.description;
    section.appendChild(desc);

    // 카테고리별 음식 목록
    const categoriesContainer = document.createElement('div');
    categoriesContainer.className = 'seasonal-foods-categories';

    foodData.categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'seasonal-category';

        const categoryName = document.createElement('div');
        categoryName.className = 'seasonal-category-name';
        categoryName.textContent = category.name;
        categoryDiv.appendChild(categoryName);

        category.items.forEach(item => {
            const foodItem = document.createElement('div');
            foodItem.className = 'seasonal-food-item';

            const foodName = document.createElement('span');
            foodName.className = 'seasonal-food-name';
            foodName.textContent = item.food;

            const foodReason = document.createElement('span');
            foodReason.className = 'seasonal-food-reason';
            foodReason.textContent = item.reason;

            const foodNutrition = document.createElement('span');
            foodNutrition.className = 'seasonal-food-nutrition';
            foodNutrition.textContent = item.nutrition;

            foodItem.appendChild(foodName);
            foodItem.appendChild(foodReason);
            foodItem.appendChild(foodNutrition);
            categoryDiv.appendChild(foodItem);
        });

        categoriesContainer.appendChild(categoryDiv);
    });

    section.appendChild(categoriesContainer);

    return section;
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

// PDF 생성 (한글 지원) - 세로 방향, 동적 개수
async function generatePDF() {
    const { jsPDF } = window.jspdf;

    // PDF 생성 (세로 방향)
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 선택된 달을 정렬된 배열로 변환
    const sortedMonths = Array.from(selectedMonths).sort((a, b) => a - b);
    if (sortedMonths.length === 0) {
        alert('출력할 달을 선택해주세요.');
        return;
    }

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
        const totalPages = Math.ceil(sortedMonths.length / monthsPerPage);

        // 페이지별 생성
        for (let page = 0; page < totalPages; page++) {
            // 페이지 컨테이너
            const pageContainer = document.createElement('div');
            pageContainer.style.cssText = `
                background: white;
                padding: 25px;
                width: 800px;
                font-family: -apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif;
            `;

            // 이 페이지에 표시될 달 계산
            const pageMonths = sortedMonths.slice(page * monthsPerPage, (page + 1) * monthsPerPage);
            const startMonth = pageMonths[0];
            const endMonth = pageMonths[pageMonths.length - 1];

            // 제목 추가
            const title = document.createElement('div');
            title.style.cssText = `
                text-align: center;
                font-size: 32px;
                font-weight: bold;
                color: #333;
                margin-bottom: 25px;
            `;
            if (pageMonths.length === 1) {
                title.textContent = `${currentYear}년 ${startMonth}월`;
            } else {
                title.textContent = `${currentYear}년 달력 (${startMonth}월 - ${endMonth}월)`;
            }
            pageContainer.appendChild(title);

            // 달력 그리드 컨테이너 (세로 배치)
            const gridContainer = document.createElement('div');
            gridContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: ${pageMonths.length === 1 ? '0px' : '25px'};
                background: white;
            `;

            // 달력 생성 (선택된 달만)
            for (const month of pageMonths) {
                const monthCalendar = createMonthCalendarForPDF(currentYear, month, monthsPerPage);
                gridContainer.appendChild(monthCalendar);
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
        if (tempContainer && tempContainer.parentNode) {
            document.body.removeChild(tempContainer);
        }

        // PDF 생성 시도 카운터 증가 (성공/실패 여부와 관계없이)
        await incrementPdfCounter();
    }
}

// PDF용 달력 생성 (세로 방향, 동적 크기)
function createMonthCalendarForPDF(year, month, perPage) {
    // 페이지당 개수에 따라 크기 조정
    const sizeConfig = {
        1: { width: 750, padding: 30, headerSize: 32, dayHeaderSize: 18, daySize: 14, gap: 10, cellPadding: 18, minHeight: 110 },
        2: { width: 750, padding: 20, headerSize: 26, dayHeaderSize: 16, daySize: 13, gap: 8, cellPadding: 14, minHeight: 85 },
        3: { width: 750, padding: 15, headerSize: 22, dayHeaderSize: 14, daySize: 12, gap: 6, cellPadding: 10, minHeight: 70 }
    };

    const config = sizeConfig[perPage] || sizeConfig[3];

    const container = document.createElement('div');
    container.style.cssText = `
        background: white;
        padding: ${config.padding}px;
        width: ${config.width}px;
        box-sizing: border-box;
    `;

    // 월 헤더 (1개일 때는 숨김 - 제목에 표시됨)
    if (perPage > 1) {
        const header = document.createElement('div');
        header.style.cssText = `
            text-align: center;
            font-size: ${config.headerSize}px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: ${config.padding / 2}px;
        `;
        header.textContent = `${month}월`;
        container.appendChild(header);
    }

    // 그리드
    const grid = document.createElement('div');
    grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: ${config.gap}px;
    `;

    // 요일 헤더
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    dayNames.forEach((day, index) => {
        const dayHeader = document.createElement('div');
        dayHeader.style.cssText = `
            text-align: center;
            padding: ${config.gap + 2}px ${config.gap / 2}px;
            font-weight: bold;
            font-size: ${config.dayHeaderSize}px;
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
        emptyCell.style.cssText = `padding: ${config.cellPadding}px;`;
        grid.appendChild(emptyCell);
    }

    // 날짜 셀
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        const dayOfWeek = (firstDay + day - 1) % 7;
        const holiday = getHoliday(year, month, day);
        const events = getGoogleEvents(year, month, day);
        const ddayInfos = getDdayInfo(year, month, day);

        const textColor = holiday ? '#e74c3c' : (dayOfWeek === 0 ? '#e74c3c' : dayOfWeek === 6 ? '#3498db' : '#333');

        dayCell.style.cssText = `
            padding: ${config.gap}px;
            background: #f8f9fa;
            border-radius: ${config.gap}px;
            min-height: ${config.minHeight}px;
            position: relative;
            box-sizing: border-box;
        `;

        // 날짜 숫자 (왼쪽 위)
        const dayNum = document.createElement('div');
        dayNum.style.cssText = `
            position: absolute;
            top: ${config.gap / 2}px;
            left: ${config.gap / 2}px;
            font-size: ${config.daySize}px;
            font-weight: 600;
            color: ${textColor};
            line-height: 1;
        `;
        dayNum.textContent = day;
        dayCell.appendChild(dayNum);

        // D-Day 표시 (오른쪽 위, 여러 개 지원)
        if (ddayInfos.length > 0) {
            let ddayTopOffset = config.gap / 2;
            ddayInfos.forEach((ddayInfo, index) => {
                const ddayLabel = document.createElement('div');
                ddayLabel.style.cssText = `
                    position: absolute;
                    top: ${ddayTopOffset}px;
                    right: ${config.gap / 2}px;
                    font-size: ${Math.max(config.daySize - 4, 8)}px;
                    font-weight: 600;
                    color: white;
                    background: ${ddayInfo.color};
                    padding: 1px 4px;
                    border-radius: 3px;
                    line-height: 1.2;
                `;
                ddayLabel.textContent = ddayInfo.text;
                dayCell.appendChild(ddayLabel);

                ddayTopOffset += Math.max(config.daySize - 4, 8) + 3;

                // 이벤트 이름 항상 표시 (D-Day 이전에도)
                if (ddayInfo.name) {
                    const ddayNameLabel = document.createElement('div');
                    ddayNameLabel.style.cssText = `
                        position: absolute;
                        top: ${ddayTopOffset}px;
                        right: ${config.gap / 2}px;
                        font-size: ${Math.max(config.daySize - 6, 7)}px;
                        font-weight: 500;
                        color: ${ddayInfo.color};
                        line-height: 1.1;
                        max-width: 70px;
                        text-align: right;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    `;
                    ddayNameLabel.textContent = ddayInfo.name;
                    dayCell.appendChild(ddayNameLabel);

                    ddayTopOffset += Math.max(config.daySize - 6, 7) + 2;
                }
            });
        }

        // 공휴일 이름 표시 (날짜 아래)
        if (holiday) {
            const holidayName = document.createElement('div');
            holidayName.style.cssText = `
                position: absolute;
                top: ${config.gap / 2 + config.daySize + 2}px;
                left: ${config.gap / 2}px;
                font-size: ${config.daySize - 6}px;
                color: #e74c3c;
                line-height: 1.1;
                font-weight: 500;
            `;
            holidayName.textContent = holiday;
            dayCell.appendChild(holidayName);
        }

        // 구글 이벤트 텍스트로 표시
        if (events.length > 0) {
            const eventFontSize = Math.max(config.daySize - 6, 7);
            const eventTop = holiday
                ? config.gap / 2 + config.daySize + eventFontSize + 4
                : config.gap / 2 + config.daySize + 4;
            const maxEvents = perPage === 1 ? 3 : (perPage === 2 ? 2 : 2);
            const displayEvents = events.slice(0, maxEvents);

            displayEvents.forEach((event, index) => {
                const eventItem = document.createElement('div');
                eventItem.style.cssText = `
                    position: absolute;
                    top: ${eventTop + index * (eventFontSize + 3)}px;
                    left: ${config.gap / 2}px;
                    right: ${config.gap / 2}px;
                    font-size: ${eventFontSize}px;
                    color: white;
                    background: ${event.color || '#4285f4'};
                    padding: 1px 3px;
                    border-radius: 2px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    line-height: 1.2;
                `;
                eventItem.textContent = event.title;
                dayCell.appendChild(eventItem);
            });

            // 더 많은 이벤트 표시
            if (events.length > maxEvents) {
                const moreItem = document.createElement('div');
                moreItem.style.cssText = `
                    position: absolute;
                    top: ${eventTop + maxEvents * (eventFontSize + 3)}px;
                    left: ${config.gap / 2}px;
                    font-size: ${eventFontSize - 1}px;
                    color: #666;
                `;
                moreItem.textContent = `+${events.length - maxEvents}개`;
                dayCell.appendChild(moreItem);
            }
        }

        grid.appendChild(dayCell);
    }

    container.appendChild(grid);

    // 1장짜리 PDF일 때 제철 음식 추천 섹션 추가 (옵션 선택 시)
    if (perPage === 1 && showSeasonalFood && seasonalFoods[month]) {
        const foodData = seasonalFoods[month];
        const foodSection = document.createElement('div');
        foodSection.style.cssText = `
            margin-top: 20px;
            padding: 15px;
            background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
            border-radius: 10px;
            border: 1px solid #ddd;
        `;

        // 제목
        const foodTitle = document.createElement('div');
        foodTitle.style.cssText = `
            font-size: 16px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        `;
        foodTitle.textContent = `🍽️ ${foodData.title}`;
        foodSection.appendChild(foodTitle);

        // 설명
        const foodDesc = document.createElement('div');
        foodDesc.style.cssText = `
            font-size: 10px;
            color: #666;
            margin-bottom: 12px;
            font-style: italic;
        `;
        foodDesc.textContent = foodData.description;
        foodSection.appendChild(foodDesc);

        // 카테고리별 음식 목록
        foodData.categories.forEach(category => {
            const categorySection = document.createElement('div');
            categorySection.style.cssText = `margin-bottom: 10px;`;

            // 카테고리 이름
            const categoryName = document.createElement('div');
            categoryName.style.cssText = `
                font-size: 11px;
                font-weight: bold;
                color: #333;
                margin-bottom: 6px;
                padding-left: 3px;
                border-left: 3px solid #667eea;
            `;
            categoryName.textContent = category.name;
            categorySection.appendChild(categoryName);

            // 음식 아이템들
            category.items.forEach(item => {
                const foodItem = document.createElement('div');
                foodItem.style.cssText = `
                    background: white;
                    padding: 6px 10px;
                    border-radius: 6px;
                    margin-bottom: 4px;
                    border: 1px solid #e0e0e0;
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                `;

                const foodName = document.createElement('span');
                foodName.style.cssText = `
                    font-size: 11px;
                    font-weight: 600;
                    color: #667eea;
                    min-width: 55px;
                `;
                foodName.textContent = item.food;

                const foodReason = document.createElement('span');
                foodReason.style.cssText = `
                    font-size: 9px;
                    color: #555;
                    flex: 1;
                `;
                foodReason.textContent = item.reason;

                const foodNutrition = document.createElement('span');
                foodNutrition.style.cssText = `
                    font-size: 8px;
                    color: #888;
                    background: #f0f0f0;
                    padding: 2px 6px;
                    border-radius: 10px;
                    white-space: nowrap;
                `;
                foodNutrition.textContent = item.nutrition;

                foodItem.appendChild(foodName);
                foodItem.appendChild(foodReason);
                foodItem.appendChild(foodNutrition);
                categorySection.appendChild(foodItem);
            });

            foodSection.appendChild(categorySection);
        });

        container.appendChild(foodSection);
    }

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

    // PDF 다운로드 버튼 - 모달 열기
    document.getElementById('downloadPdf').addEventListener('click', () => {
        openPdfModal();
    });

    // 모달 닫기 버튼
    document.getElementById('closeModal').addEventListener('click', () => {
        closePdfModal();
    });

    // 모달 외부 클릭 시 닫기
    document.getElementById('pdfMonthModal').addEventListener('click', (e) => {
        if (e.target.id === 'pdfMonthModal') {
            closePdfModal();
        }
    });

    // 전체 선택 버튼
    document.getElementById('selectAllMonths').addEventListener('click', () => {
        selectAllMonths();
    });

    // 전체 해제 버튼
    document.getElementById('deselectAllMonths').addEventListener('click', () => {
        deselectAllMonths();
    });

    // PDF 생성 확인 버튼
    document.getElementById('confirmPdfDownload').addEventListener('click', async () => {
        closePdfModal();
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

    // PDF 페이지당 개수 변경
    const monthsPerPageSelect = document.getElementById('monthsPerPage');
    const seasonalFoodOption = document.getElementById('seasonalFoodOption');
    if (monthsPerPageSelect) {
        monthsPerPageSelect.addEventListener('change', (e) => {
            monthsPerPage = parseInt(e.target.value);
            // 1개월 선택 시 제철 음식 옵션 표시
            if (seasonalFoodOption) {
                seasonalFoodOption.style.display = monthsPerPage === 1 ? 'block' : 'none';
            }
            renderCalendar(); // 제철 음식 표시를 위해 다시 렌더링
        });
    }

    // 제철 음식 표시 체크박스
    const seasonalFoodCheckbox = document.getElementById('showSeasonalFood');
    if (seasonalFoodCheckbox) {
        seasonalFoodCheckbox.addEventListener('change', (e) => {
            showSeasonalFood = e.target.checked;
            renderCalendar(); // 웹 화면에도 반영
        });
    }

    // D-Day 이벤트 리스너 (3개 지원)
    for (let i = 0; i < 3; i++) {
        // D-Day 체크박스
        const ddayCheckbox = document.getElementById(`showDday${i}`);
        if (ddayCheckbox) {
            ddayCheckbox.addEventListener('change', ((index) => (e) => {
                ddaySettings[index].show = e.target.checked;
                renderCalendar();
            })(i));
        }

        // D-Day 날짜 선택
        const ddayDateInput = document.getElementById(`ddayDate${i}`);
        if (ddayDateInput) {
            ddayDateInput.addEventListener('change', ((index) => (e) => {
                ddaySettings[index].date = e.target.value;
                if (ddaySettings[index].date && ddaySettings[index].show) {
                    renderCalendar();
                }
            })(i));
        }

        // D-Day 이름 입력
        const ddayNameInput = document.getElementById(`ddayName${i}`);
        if (ddayNameInput) {
            ddayNameInput.addEventListener('input', ((index) => (e) => {
                ddaySettings[index].name = e.target.value;
                if (ddaySettings[index].show) {
                    renderCalendar();
                }
            })(i));
        }

        // D-Day 색상 선택
        const ddayColorSelect = document.getElementById(`ddayColor${i}`);
        if (ddayColorSelect) {
            ddayColorSelect.addEventListener('change', ((index) => (e) => {
                ddaySettings[index].color = e.target.value;
                if (ddaySettings[index].show) {
                    renderCalendar();
                }
            })(i));
        }
    }

    // D-Day 추가 버튼
    const addDdayBtn = document.getElementById('addDdayBtn');
    if (addDdayBtn) {
        addDdayBtn.addEventListener('click', () => {
            const ddayItems = document.querySelectorAll('.dday-item');
            let addedCount = 0;
            for (let i = 0; i < ddayItems.length; i++) {
                if (ddayItems[i].style.display !== 'none') {
                    addedCount++;
                }
            }
            // 다음 숨겨진 D-Day 아이템 표시
            if (addedCount < 3) {
                const nextItem = document.querySelector(`.dday-item[data-dday-index="${addedCount}"]`);
                if (nextItem) {
                    nextItem.style.display = 'flex';
                }
            }
            // 최대 3개면 버튼 숨김
            if (addedCount + 1 >= 3) {
                addDdayBtn.style.display = 'none';
            }
        });
    }

    // D-Day 제거 버튼들
    const ddayRemoveBtns = document.querySelectorAll('.dday-remove-btn');
    ddayRemoveBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.removeIndex);
            const ddayItem = document.querySelector(`.dday-item[data-dday-index="${index}"]`);
            if (ddayItem) {
                // 상태 초기화
                ddaySettings[index].show = false;
                ddaySettings[index].date = null;
                ddaySettings[index].name = '';
                ddaySettings[index].color = '#667eea';

                // UI 초기화
                const checkbox = document.getElementById(`showDday${index}`);
                const dateInput = document.getElementById(`ddayDate${index}`);
                const nameInput = document.getElementById(`ddayName${index}`);
                const colorSelect = document.getElementById(`ddayColor${index}`);

                if (checkbox) checkbox.checked = false;
                if (dateInput) dateInput.value = '';
                if (nameInput) nameInput.value = '';
                if (colorSelect) colorSelect.value = '#667eea';

                // 아이템 숨김
                ddayItem.style.display = 'none';

                // 추가 버튼 다시 표시
                if (addDdayBtn) {
                    addDdayBtn.style.display = 'block';
                }

                renderCalendar();
            }
        });
    });

    // 캘린더 목록 토글 버튼
    const toggleCalendarListBtn = document.getElementById('toggleCalendarList');
    const calendarListContainer = document.getElementById('calendarList');
    if (toggleCalendarListBtn && calendarListContainer) {
        toggleCalendarListBtn.addEventListener('click', () => {
            calendarListContainer.classList.toggle('collapsed');
            toggleCalendarListBtn.classList.toggle('collapsed');
            toggleCalendarListBtn.textContent = calendarListContainer.classList.contains('collapsed') ? '▶' : '▼';
        });

        // 헤더 클릭해도 토글
        const calendarSelectorHeader = document.querySelector('.calendar-selector-header');
        if (calendarSelectorHeader) {
            calendarSelectorHeader.addEventListener('click', (e) => {
                if (e.target !== toggleCalendarListBtn) {
                    toggleCalendarListBtn.click();
                }
            });
        }
    }
}
