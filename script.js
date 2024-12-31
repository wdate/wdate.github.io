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

function populateCalendar(year, month) {
    const calendarDays = document.getElementById("calendar-days");
    calendarDays.innerHTML = "";

    const today = new Date();
    const [todayJalaliYear, todayJalaliMonth, todayJalaliDay] = gregorianToJalali(
        today.getFullYear(),
        today.getMonth() + 1,
        today.getDate()
    );

    const firstDay = new Date(year, month - 1, 1).getDay();
    const totalDays = new Date(year, month, 0).getDate();

    let row = document.createElement("tr");

    // Empty cells for the days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement("td");
        cell.className = "inactive";
        row.appendChild(cell);
    }

    // Create cells for each day in the month
    for (let day = 1; day <= totalDays; day++) {
        if (row.children.length === 7) {
            calendarDays.appendChild(row);
            row = document.createElement("tr");
        }

        const cell = document.createElement("td");
        cell.innerText = day;

        // Highlight today's date
        if (
            year === todayJalaliYear &&
            month === todayJalaliMonth &&
            day === todayJalaliDay
        ) {
            cell.className = "today";
        }

        row.appendChild(cell);
    }

    // Fill the remaining cells of the last row
    while (row.children.length < 7) {
        const cell = document.createElement("td");
        cell.className = "inactive";
        row.appendChild(cell);
    }

    calendarDays.appendChild(row);
}

let currentJalaliYear;
let currentJalaliMonth;

// Initialize calendar
function initCalendar() {
    const today = new Date();
    const [jy, jm] = gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());

    currentJalaliYear = jy;
    currentJalaliMonth = jm;

    updateCalendar();
}

// Update the calendar display
function updateCalendar() {
    document.getElementById("current-month").innerText = `${MONTHS[currentJalaliMonth - 1]} ${currentJalaliYear}`;
    populateCalendar(currentJalaliYear, currentJalaliMonth);
}

// Event listeners for next/previous month buttons
document.getElementById("next-month").addEventListener("click", () => {
    if (currentJalaliMonth === 12) {
        currentJalaliMonth = 1;
        currentJalaliYear++;
    } else {
        currentJalaliMonth++;
    }
    updateCalendar();
});

document.getElementById("prev-month").addEventListener("click", () => {
    if (currentJalaliMonth === 1) {
        currentJalaliMonth = 12;
        currentJalaliYear--;
    } else {
        currentJalaliMonth--;
    }
    updateCalendar();
});

// Initialize the calendar on page load
initCalendar();
