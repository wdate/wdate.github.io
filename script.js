const DAYS_IN_WEEK = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
const MONTHS = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
];

// Function to convert Gregorian to Jalali
function gregorianToJalali(gy, gm, gd) {
    const g_d_m = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let jy = (gy <= 1600) ? 0 : 979;
    gy -= (gy <= 1600) ? 621 : 1600;
    const gy2 = (gm > 2) ? (gy + 1) : gy;
    let days = (365 * gy) + parseInt((gy + 3) / 4, 10) - parseInt((gy2 + 99) / 100, 10)
        + parseInt((gy2 + 399) / 400, 10) - 80 + gd;
    for (let i = 0; i < gm; ++i) {
        days += g_d_m[i];
    }
    jy += 33 * parseInt(days / 12053, 10);
    days %= 12053;
    jy += 4 * parseInt(days / 1461, 10);
    days %= 1461;
    if (days > 365) {
        jy += parseInt((days - 1) / 365, 10);
        days = (days - 1) % 365;
    }
    const jm = (days < 186) ? 1 + parseInt(days / 31, 10) : 7 + parseInt((days - 186) / 30, 10);
    const jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
    return [jy, jm, jd];
}

// Populate calendar days
function populateCalendar(year, month) {
    const calendarDays = document.getElementById("calendar-days");
    calendarDays.innerHTML = "";

    // Find the first day of the month
    const firstDay = new Date(year, month - 1, 1).getDay();

    // Get total days in the month
    const totalDays = new Date(year, month, 0).getDate();

    // Create empty cells for days before the start of the month
    for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement("td");
        cell.className = "inactive";
        calendarDays.appendChild(cell);
    }

    // Create cells for each day in the month
    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement("td");
        cell.innerText = day;
        calendarDays.appendChild(cell);
    }
}

// Initialize calendar
function initCalendar() {
    const now = new Date();
    const [jy, jm] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());

    document.getElementById("current-month").innerText = `${MONTHS[jm - 1]} ${jy}`;
    populateCalendar(now.getFullYear(), now.getMonth() + 1);
}

initCalendar();
