// calendar.js

// Import the Jalaali library
function loadJalaaliDate() {
    const now = new Date();
    const [jy, jm, jd] = toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    document.getElementById('iranian-calendar').innerText =
        `Today's Date (Jalali): ${jy}/${jm}/${jd}`;
}

// Helper function to load the script dynamically
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
}

// Load the jalaali-js library and display the date
window.onload = function () {
    loadScript('https://cdn.jsdelivr.net/npm/jalaali-js/dist/jalaali.min.js', loadJalaaliDate);
};
