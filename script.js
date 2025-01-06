
var getJSON = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};

const DAYS_IN_WEEK = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
const MONTHS = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
];

let time_ir_data = {};

function jalaliToHijri(jy, jm, jd) {
    if ((jy * 100 + jm) in time_ir_data) {
        //
    } else {
        // const r = fetch(`https://prayer.aviny.com/city_time.aspx?Code=${jy}&Y=1403&M=0&D=0`,
        //   {
        //     method: "GET",
        //     // headers: {
        //     //   'Accept': 'application/json',
        //     //   'Content-Type': 'application/json',
        //     // },
        //   })
        //   .then((response) => response.text())
        //   .then((html) => {
        //     const parser = new DOMParser();
        //     const doc = parser.parseFromString(html, "text/html");
        //     doc.getElementById("DataGrid1_wrapper");

        //   })
        //   .catch(error => console.warn(error));
        // // console.log(r);
        // return r;

        //   let headers = new Headers();

        //   headers.append('Content-Type', 'application/json');
        //   headers.append('Accept', 'application/json');
        //   headers.append('Origin','http://localhost:3000');

        //   var formData = {
        //     Year: jy,
        //     Month: jm,
        //     Base1: 0,
        //     Base2: 1,
        //     Base3: 2,
        //     Responsive: true
        //   }; 
        //   const r = fetch('https://cors-anywhere.herokuapp.com/https://www.time.ir/', {
        //     data: formData,
        //     method: 'POST',
        //     headers: headers,
        //     body: JSON.stringify(formData),
        //   })
        //   .then((response) => response.text())
        //   .then((result) => {
        //       console.log(result)
        //   })
        //   .catch((error) => {
        //     console.error('Error:', error);
        //   });
        // }

        const puppeteer = require('puppeteer');
        (async () => {
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();

            await page.goto('https://www.time.ir/fa/eventyear-%d8%aa%d9%82%d9%88%db%8c%d9%85-%d8%b3%d8%a7%d9%84%db%8c%d8%a7%d9%86%d9%87', { waitUntil: 'domcontentloaded' });

            // Simulate a click
            await page.click('#ctl00_cphTop_Sampa_Web_View_EventUI_EventYearCalendar10cphTop_3417_btnGo');

            // Extract content
            const data = await page.evaluate(() => {
                return document.querySelector('#ctl00_cphTop_Sampa_Web_View_EventUI_EventYearCalendar10cphTop_3417_pnlYearCalendar').innerText;
            });

            // console.log(data);

            await browser.close();
        })();
    }

};


/*
  Jalaali years starting the 33-year rule.
*/
var breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210
    , 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178
]

/*
  Converts a Gregorian date to Jalaali.
*/
function toJalaali(gy, gm, gd) {
    if (Object.prototype.toString.call(gy) === '[object Date]') {
        gd = gy.getDate()
        gm = gy.getMonth() + 1
        gy = gy.getFullYear()
    }
    var x = d2j(g2d(gy, gm, gd));
    return [x['jy'], x['jm'], x['jd']]
}

/*
  Converts a Jalaali date to Gregorian.
  @return
    gy: Calendar year (years BC numbered 0, -1, -2, ...)
    gm: Calendar month (1 to 12)
    gd: Calendar day of the month M (1 to 28/29/30/31)
*/
function toGregorian(jy, jm, jd) {
    return d2g(j2d(jy, jm, jd))
}

/*
  Checks whether a Jalaali date is valid or not.
*/
function isValidJalaaliDate(jy, jm, jd) {
    return jy >= -61 && jy <= 3177 &&
        jm >= 1 && jm <= 12 &&
        jd >= 1 && jd <= jalaaliMonthLength(jy, jm)
}

/*
  Is this a leap year or not?
*/
function isLeapJalaaliYear(jy) {
    return jalCalLeap(jy) === 0
}

/*
  Number of days in a given month in a Jalaali year.
*/
function jalaaliMonthLength(jy, jm) {
    if (jm <= 6) return 31
    if (jm <= 11) return 30
    if (isLeapJalaaliYear(jy)) return 30
    return 29
}

/*
    This function determines if the Jalaali (Persian) year is
    leap (366-day long) or is the common year (365 days)

    @param jy Jalaali calendar year (-61 to 3177)
    @returns number of years since the last leap year (0 to 4)
 */
function jalCalLeap(jy) {
    var bl = breaks.length
        , jp = breaks[0]
        , jm
        , jump
        , leap
        , n
        , i

    if (jy < jp || jy >= breaks[bl - 1])
        throw new Error('Invalid Jalaali year ' + jy)

    for (i = 1; i < bl; i += 1) {
        jm = breaks[i]
        jump = jm - jp
        if (jy < jm)
            break
        jp = jm
    }
    n = jy - jp

    if (jump - n < 6)
        n = n - jump + div(jump + 4, 33) * 33
    leap = mod(mod(n + 1, 33) - 1, 4)
    if (leap === -1) {
        leap = 4
    }

    return leap
}

/*
  This function determines if the Jalaali (Persian) year is
  leap (366-day long) or is the common year (365 days), and
  finds the day in March (Gregorian calendar) of the first
  day of the Jalaali year (jy).

  @param jy Jalaali calendar year (-61 to 3177)
  @param withoutLeap when don't need leap (true or false) default is false
  @return
    leap: number of years since the last leap year (0 to 4)
    gy: Gregorian year of the beginning of Jalaali year
    march: the March day of Farvardin the 1st (1st day of jy)
  @see: http://www.astro.uni.torun.pl/~kb/Papers/EMP/PersianC-EMP.htm
  @see: http://www.fourmilab.ch/documents/calendar/
*/
function jalCal(jy, withoutLeap) {
    var bl = breaks.length
        , gy = jy + 621
        , leapJ = -14
        , jp = breaks[0]
        , jm
        , jump
        , leap
        , leapG
        , march
        , n
        , i

    if (jy < jp || jy >= breaks[bl - 1])
        throw new Error('Invalid Jalaali year ' + jy)

    // Find the limiting years for the Jalaali year jy.
    for (i = 1; i < bl; i += 1) {
        jm = breaks[i]
        jump = jm - jp
        if (jy < jm)
            break
        leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4)
        jp = jm
    }
    n = jy - jp

    // Find the number of leap years from AD 621 to the beginning
    // of the current Jalaali year in the Persian calendar.
    leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4)
    if (mod(jump, 33) === 4 && jump - n === 4)
        leapJ += 1

    // And the same in the Gregorian calendar (until the year gy).
    leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150

    // Determine the Gregorian date of Farvardin the 1st.
    march = 20 + leapJ - leapG

    // return with gy and march when we don't need leap
    if (withoutLeap) return { gy: gy, march: march };


    // Find how many years have passed since the last leap year.
    if (jump - n < 6)
        n = n - jump + div(jump + 4, 33) * 33
    leap = mod(mod(n + 1, 33) - 1, 4)
    if (leap === -1) {
        leap = 4
    }

    return {
        leap: leap
        , gy: gy
        , march: march
    }
}

/*
  Converts a date of the Jalaali calendar to the Julian Day number.

  @param jy Jalaali year (1 to 3100)
  @param jm Jalaali month (1 to 12)
  @param jd Jalaali day (1 to 29/31)
  @return Julian Day number
*/
function j2d(jy, jm, jd) {
    var r = jalCal(jy, true)
    return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1
}

/*
  Converts the Julian Day number to a date in the Jalaali calendar.

  @param jdn Julian Day number
  @return
    jy: Jalaali year (1 to 3100)
    jm: Jalaali month (1 to 12)
    jd: Jalaali day (1 to 29/31)
*/
function d2j(jdn) {
    var gy = d2g(jdn).gy // Calculate Gregorian year (gy).
        , jy = gy - 621
        , r = jalCal(jy, false)
        , jdn1f = g2d(gy, 3, r.march)
        , jd
        , jm
        , k

    // Find number of days that passed since 1 Farvardin.
    k = jdn - jdn1f
    if (k >= 0) {
        if (k <= 185) {
            // The first 6 months.
            jm = 1 + div(k, 31)
            jd = mod(k, 31) + 1
            return {
                jy: jy
                , jm: jm
                , jd: jd
            }
        } else {
            // The remaining months.
            k -= 186
        }
    } else {
        // Previous Jalaali year.
        jy -= 1
        k += 179
        if (r.leap === 1)
            k += 1
    }
    jm = 7 + div(k, 30)
    jd = mod(k, 30) + 1
    return {
        jy: jy
        , jm: jm
        , jd: jd
    }
}

/*
  Calculates the Julian Day number from Gregorian or Julian
  calendar dates. This integer number corresponds to the noon of
  the date (i.e. 12 hours of Universal Time).
  The procedure was tested to be good since 1 March, -100100 (of both
  calendars) up to a few million years into the future.

  @param gy Calendar year (years BC numbered 0, -1, -2, ...)
  @param gm Calendar month (1 to 12)
  @param gd Calendar day of the month (1 to 28/29/30/31)
  @return Julian Day number
*/
function g2d(gy, gm, gd) {
    var d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
        + div(153 * mod(gm + 9, 12) + 2, 5)
        + gd - 34840408
    d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752
    return d
}

/*
  Calculates Gregorian and Julian calendar dates from the Julian Day number
  (jdn) for the period since jdn=-34839655 (i.e. the year -100100 of both
  calendars) to some millions years ahead of the present.

  @param jdn Julian Day number
  @return
    gy: Calendar year (years BC numbered 0, -1, -2, ...)
    gm: Calendar month (1 to 12)
    gd: Calendar day of the month M (1 to 28/29/30/31)
*/
function d2g(jdn) {
    var j
        , i
        , gd
        , gm
        , gy
    j = 4 * jdn + 139361631
    j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908
    i = div(mod(j, 1461), 4) * 5 + 308
    gd = div(mod(i, 153), 5) + 1
    gm = mod(div(i, 153), 12) + 1
    gy = div(j, 1461) - 100100 + div(8 - gm, 6)
    return {
        gy: gy
        , gm: gm
        , gd: gd
    }
}

/**
 * Return Saturday and Friday day of current week(week start in Saturday)
 * @param {number} jy jalaali year
 * @param {number} jm jalaali month
 * @param {number} jd jalaali day
 * @returns Saturday and Friday of current week
 */
function jalaaliWeek(jy, jm, jd) {
    var dayOfWeek = jalaaliToDateObject(jy, jm, jd).getDay();

    var startDayDifference = dayOfWeek == 6 ? 0 : -(dayOfWeek + 1);
    var endDayDifference = 6 + startDayDifference;

    return {
        saturday: d2j(j2d(jy, jm, jd + startDayDifference)),
        friday: d2j(j2d(jy, jm, jd + endDayDifference))
    }
}

/**
 * Convert Jalaali calendar dates to javascript Date object
 * @param {number} jy jalaali year
 * @param {number} jm jalaali month
 * @param {number} jd jalaali day
 * @param {number} [h] hours
 * @param {number} [m] minutes
 * @param {number} [s] seconds
 * @param {number} [ms] milliseconds
 * @returns Date object of the jalaali calendar dates
 */
function jalaaliToDateObject(
    jy,
    jm,
    jd,
    h,
    m,
    s,
    ms
) {
    var gregorianCalenderDate = toGregorian(jy, jm, jd);

    return new Date(
        gregorianCalenderDate.gy,
        gregorianCalenderDate.gm - 1,
        gregorianCalenderDate.gd,
        h || 0,
        m || 0,
        s || 0,
        ms || 0
    );
}

/*
  Utility helper functions.
*/

function div(a, b) {
    return ~~(a / b)
}

function mod(a, b) {
    return a - ~~(a / b) * b
}

/**
 * 
  @param year Jalaali year (1 to 3100)
  @param month Jalaali month (1 to 12)
  @return Return weekday (0 = Saturday, ..., 6 = Friday), Jalali week day
 */
function getJalaliFirstDayOfWeek(year, month) {
    // Convert the first day of the Jalali month to Gregorian
    const [gYear, gMonth, gDay] = jalaliToGregorian(year, month, 1);
    const firstDay = new Date(gYear, gMonth - 1, gDay).getDay(); // Get Gregorian weekday
    return (firstDay + 1) % 7; // Return weekday (0 = Sunday, ..., 6 = Saturday), Jalali week day
}

/**
 * 
  @param jy Jalaali year (1 to 3100)
  @param jm Jalaali month (1 to 12)
  @param jd Jalaali day (1 to 29/31)
  @return
    gy: Calendar year (years BC numbered 0, -1, -2, ...)
    gm: Calendar month (1 to 12)
    gd: Calendar day of the month M (1 to 28/29/30/31)
 */
function jalaliToGregorian(jy, jm, jd) {
    const g = toGregorian(jy, jm, jd); // Assuming you're using a Jalali date library
    return [g.gy, g.gm, g.gd];
}

function jalaaliMonthLength(year, month) {
    return month <= 6 ? 31 : month <= 11 ? 30 : isJalaliLeap(year) ? 30 : 29;
}

function isJalaliLeap(year) {
    const [, r] = toJalaali(year, 3, 21);
    return r === 0; // A leap year if remainder of the calculation is 0
}



function getJalaliMonthName(month) {
    const jalaliMonths = [
        "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
        "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
    ];
    return jalaliMonths[month - 1];
}

function getGregorianMonthName(month) {
    const gregorianMonths = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return gregorianMonths[month - 1];
}

function getHijriMonthName(month) {
    const hijriMonths = [
        "محرم", "صفر", "ربیع الاول", "ربیع الثانی", "جمادی الاول", "جمادی الثانی",
        "رجب", "شعبان", "رمضان", "شوال", "ذیقعده", "ذیحجه"
    ];
    return hijriMonths[month - 1];
}

const hindi_digits  = '۰۱۲۳۴۵۶۷۸۹'.split('');
const arabic_digits = '0123456789'.split('');


function convertToHindi(input) {
    var input = input.toString();
    var array = input.split('');
    array.map(function (value, i, array) {
        if (arabic_digits.indexOf(array[i]) >= 0) {
            array[i] = hindi_digits[arabic_digits.indexOf(array[i])];
        }
    });
    return array.join('');
}

function convertToArabic(input) {
    var input = input.toString();
    var array = input.split('');
    array.map(function (value, i, array) {
        if (hindi_digits.indexOf(array[i]) >= 0) {
            array[i] = arabic_digits[hindi_digits.indexOf(array[i])];
        }
    });
    return array.join('');
}

function jalaliDateAdd(jYear, jMonth, jDay, addDays) {
    const [gYear_, gMonth_, gDay_] = jalaliToGregorian(jYear, jMonth, jDay);
    const d = new Date(gYear_, gMonth_ - 1, gDay_ + addDays, 0, 0, 0);
    const [gYear, gMonth, gDay] = [d.getFullYear(), d.getMonth() + 1, d.getDate()];
    const [iYear, iMonth, iDay] = toJalaali(gYear, gMonth, gDay);
    return [iYear, iMonth, iDay];
}

var debug_var;

function populateCalendar(year, month) {
    const calendarDays = document.getElementById("calendar-days");
    const calendarGregorianMonth = document.getElementById("calendar-gregorian-month");
    const calendarHijriMonth = document.getElementById("calendar-hijri-month");
    const calendarMonasebat = document.getElementById("monasebat");
    calendarDays.innerHTML = "";

    // const firstDay = getJalaliFirstDayOfWeek(year, month); // Get the correct first day
    // const totalDays = jalaaliMonthLength(year, month); // Get the number of days in the Jalali month


    function prependZero(day) {
        var sDay = '' + day;
        while (sDay.length < 2)
            sDay = '0' + sDay;
        return sDay;
    }

    // function getDateCellInnerHTML(jYear, jMonth, jDay) {
    //     const [gYear, gMonth, gDay] = jalaliToGregorian(jYear, jMonth, jDay);

    //     var hijriDate = new HijriJs();
    //     hijriDate.gregorianToHijri(gYear, gMonth, gDay);
    //     const hDay = hijriDate.day;

    //     return [`<div class="jday">${convertToHindi(jDay)}</div> <!-- Jalali -->
    //         <div class="gday">${prependZero(gDay)}</div> 
    //         <div class="hday">${convertToHindi(prependZero(hDay))}</div>`, 
    //         gYear, gMonth, gDay, hijriDate.year, hijriDate.month, hijriDate.day];
    // }

    function getDataCellInnerHTML(jDate, gDate, hDate) {
        const [gYear, gMonth, gDay] = gDate;
        const [hYear, hMonth, hDay] = hDate;
        const [jYear, jMonth, jDay] = jDate;
        return `<div class="jday">${convertToHindi(jDay)}</div> <!-- Jalali -->
            <div class="gday">${prependZero(gDay)}</div> 
            <div class="hday">${convertToHindi(prependZero(hDay))}</div>`;
    }

    // https://kitset.ir/time/calendar
    fetch(`https://www.bahesab.ir/time/${year}${prependZero(month)}/`)
    // fetch(`https://kitset.ir/date/next-month?time=1737329646`)
        .then((response) => response.text())
        .then((html) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            let table = doc.getElementById("bahesab-time");
            let new_tbody = document.createElement("tbody");
            for (let i = 0; i < table.rows.length; i++) {
                let new_row = document.createElement("tr");
                let row = table.rows[i];
                for (let j = 0; j < row.cells.length; j++) {
                    // console.log(row.cells[j], row.cells[j].tagName);
                    let c = row.cells[j];
                    if (c.tagName == 'TD') {
                        const new_cell = document.createElement("td");
                        if (c.className != 'null') {
                            debug_var = c;
                            let jDay = parseInt(convertToArabic(debug_var.childNodes[0].nodeValue.trim()));
                            let gDay = parseInt(debug_var.childNodes[2].innerText.trim());
                            let hDay = parseInt(convertToArabic(debug_var.childNodes[3].innerText.trim()));
                            // console.log(c, c.children, c.innerText, c.textContent);
                            if (c.className == "Ho") {
                                new_cell.classList.add('holiday');
                            }
                            if (jDay == today[2] && year == today[0] && month == today[1]) {
                                new_cell.classList.add('today');
                            }

                            new_cell.innerHTML = getDataCellInnerHTML([0, 0, jDay], [0, 0, gDay], [0, 0, hDay]);
                            new_row.appendChild(new_cell);
                        } else {
                            new_cell.className = "inactive";
                            new_row.appendChild(new_cell);
                        }
                    }
                }
                new_tbody.appendChild(new_row);
            }
            calendarDays.innerHTML = new_tbody.innerHTML;

            let yearElement = doc.getElementById("year");
            calendarGregorianMonth.innerHTML = yearElement.children[0].innerText;
            calendarHijriMonth.innerHTML = yearElement.children[1].innerText;


            // monasebat
            const new_monasebat_table = document.createElement("table");
            let monasebat = doc.getElementById("monasebat");
            for (let i=0; i<monasebat.children.length; i++) {
                let m = monasebat.children[i];
                let text = '';
                for (let j=1; j<m.children.length; j++) {
                    if (text.length > 0) {
                        text += '؛ ';
                    }
                    text += m.children[j].innerText;
                }

                let row = document.createElement("tr");
                row.innerHTML = '<td class="monasebat-date">' + m.children[0].innerHTML + '<td class="monasebat-text">' + text;
                new_monasebat_table.appendChild(row);
            }
            // console.log(new_monasebat_table.innerHTML);
            document.getElementById("monasebat").innerHTML = new_monasebat_table.outerHTML;

        })
        .catch(error => console.warn(error))
        ;

    return;

    let row = document.createElement("tr");

    // Empty cells for the days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement("td");
        cell.className = "inactive";
        const [iYear, iMonth, iDay] = jalaliDateAdd(year, month, 1, - (firstDay - i));
        const [ihtml, gYear, gMonth, gDay, hYear, hMonth, hDay] = getDateCellInnerHTML(iYear, iMonth, iDay);
        cell.innerHTML = ihtml;
        row.appendChild(cell);
    }

    var minG, minH, maxG, maxH;

    // Create cells for each day in the month
    for (let day = 1; day <= totalDays; day++) {
        if (row.children.length === 7) {
            calendarDays.appendChild(row);
            row = document.createElement("tr");
        }

        const cell = document.createElement("td");

        // Calculate Gregorian date
        const [ihtml, gYear, gMonth, gDay, hYear, hMonth, hDay] = getDateCellInnerHTML(year, month, day);
        if (day == 1) {
            minG = [gYear, gMonth];
        }
        if (day == totalDays) {
            maxG = [gYear, gMonth];
        }

        if (day == 1) {
            minH = [hYear, hMonth];
        }
        if (day == totalDays) {
            maxH = [hYear, hMonth];
        }

        // Add the Jalali, Gregorian, and Hijri dates to the cell
        cell.innerHTML = ihtml;

        // Highlight today's date
        // const today = getToday();
        // const [todayJalaliYear, todayJalaliMonth, todayJalaliDay] = getToday();
        const [todayJalaliYear, todayJalaliMonth, todayJalaliDay] = today;
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
    for (let day = totalDays + 1; row.children.length < 7; day++) {
        const cell = document.createElement("td");
        cell.className = "inactive";
        const [iYear, iMonth, iDay] = jalaliDateAdd(year, month, 1, day - 1);
        const [ihtml, gYear, gMonth, gDay, hYear, hMonth, hDay] = getDateCellInnerHTML(iYear, iMonth, iDay);
        cell.innerHTML = ihtml;
        row.appendChild(cell);
    }

    calendarDays.appendChild(row);

    function dateRangeToMonthTitle(minD, maxD, getMonthNameFunction) {
        return (minD[1] != maxD[1] ? `${getMonthNameFunction(minD[1])}` : '') + (minD[0] != maxD[0] ? ` ${minD[0]}` : '') + (minD != maxD ? ' - ' : '') + `${getMonthNameFunction(maxD[1])} ${maxD[0]}`;
    }
    calendarGregorianMonth.innerHTML = dateRangeToMonthTitle(minG, maxG, getGregorianMonthName);
    calendarHijriMonth.innerHTML = dateRangeToMonthTitle(minH, maxH, getHijriMonthName);
}


let currentJalaliYear;
let currentJalaliMonth;
let today;

function getToday() {
    const r = fetch('https://prayer.aviny.com/api/prayertimes/1',
        {
            method: "GET",
            // headers: {
            //   'Accept': 'application/json',
            //   'Content-Type': 'application/json',
            // },
        })
        .then((response) => response.json())
        .then((responseData) => {
            // console.log(responseData);
            const r = responseData['Today'].split(' ')[0].split('/').map(Number);
            // console.log(r);
            return r;
        })
        .catch(error => console.warn(error));
    // console.log(r);
    return r;
    // return new Promise(() => {
    //   const now = new Date();
    //   return toJalaali(now.getFullYear(), now.getMonth()+1, now.getDate());
    //   // const start = new Date(now.getFullYear(), 0, 0);
    //   // const diff = now - start;
    //   // const oneDay = 1000 * 60 * 60 * 24;
    //   // const day = Math.floor(diff / oneDay);

    //   // resolve(day);      // this is you resolving the promise you return
    // });

}

// Initialize calendar
function initCalendar() {
    getToday().then(([jy, jm, jd]) => {
        today = [jy, jm, jd];
        currentJalaliYear = jy;
        currentJalaliMonth = jm;
        // today[2] = 25;

        updateCalendar();

    })
}

// Update the calendar display
function updateCalendar() {
    document.getElementById("month").innerText = `${MONTHS[currentJalaliMonth - 1]}`;
    document.getElementById("year").innerText = `${convertToHindi(currentJalaliYear)}`;
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


document.getElementById("go-to-today").addEventListener("click", () => {
    initCalendar();
});



{
    const monthSelect = document.getElementById("month-options");
    for (var month = 1; month <= 12; month++) {
        const cell = document.createElement("li");
        cell.innerHTML = `${month} ${MONTHS[month - 1]}`;
        monthSelect.appendChild(cell);
        let cMonth = month;
        cell.addEventListener("click", () => {
            currentJalaliMonth = cMonth;
            updateCalendar();
        });
    }
    document.getElementById("month-options");
}

tippy('#dialog-open', {
    content: `
      <div style="padding: 10px; width: 200px;">
        <input type="text" id="popupTextbox" placeholder="سال ..." style="width: 120px; padding: 5px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;" />
        <button id="popupSubmit" style="padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 4px;">ثبت</button>
      </div>
    `,
    allowHTML: true,
    interactive: true,
    trigger: 'click',
    theme: 'light',
    onShown(instance) {
        // Focus the textbox when dropdown is shown
        const textbox = document.getElementById('popupTextbox');
        textbox.focus();

        // Handle submit button click
        document.getElementById('popupSubmit').addEventListener('click', () => {
            //alert(`You entered: ${textbox.value}`);
            let v = parseInt(textbox.value);
            if (!isNaN(v))
                currentJalaliYear = v;
            instance.hide();
            updateCalendar();
        });
    },
});

// document.getElementById("dialog-open").addEventListener("click", () => {
//     var modal = new bootstrap.Modal(document.getElementById('exampleModal'));
//     modal.show();

// });


// // Toggle dropdown on click
// document.getElementById("month-select").addEventListener("click", () => {
//     const trigger = document.getElementById("month-select");
//     const dropdownMenu = document.getElementById("month-select-menu");
//     if (dropdownMenu.style.display === "none" || dropdownMenu.style.display === "") {
//         dropdownMenu.style.display = "block";
//         // Position dropdown below the trigger
//         const rect = trigger.getBoundingClientRect();
//         const menu_rect = dropdownMenu.getBoundingClientRect();
//         dropdownMenu.style.top = `${rect.bottom + window.scrollY}px`;
//         dropdownMenu.style.left = `${rect.left + window.scrollX + (rect.right - rect.left)/2 - (menu_rect.right  - menu_rect.left)/2}px`;
//     } else {
//         dropdownMenu.style.display = "none";
//     }
// });

// document.querySelectorAll(".dropdown-option").forEach(option => {
//     const dropdownMenu = document.getElementById("month-select-menu");
//     option.addEventListener("click", () => {
//         alert(`You clicked on ${option.textContent}`);
//         dropdownMenu.style.display = "none"; // Close the dropdown
//     });
// });

// // Close dropdown if clicking outside
// document.addEventListener("click", (event) => {
//     const trigger = document.getElementById("month-select");
//     const dropdownMenu = document.getElementById("month-select-menu");
//     if (!trigger.contains(event.target) && !dropdownMenu.contains(event.target)) {
//         dropdownMenu.style.display = "none";
//     }
// });

// Initialize the calendar on page load
initCalendar();
