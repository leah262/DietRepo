import Diet from "./diet.js";

let isInDiary = false; // דגל למעקב אחר מיקום בדיארי

function init() {
    // אם אין האש, הגדר ל-signUp כברירת מחדל
    if (!location.hash || location.hash === '#') {
        location.hash = '#signUp';
        return;
    }
    showPage();
}

export function switchPage(pageName) {
    if (!pageName) return;
    // שנה את ה-hash ישירות
    location.hash = `#${pageName}`;
    // showPage();
}

// פונקציה חדשה ל-logout
export function logout() {
    // נקה את הסשן
    sessionStorage.removeItem('currentUser');
    // איפוס דגל הדיארי
    isInDiary = false;
    // נקה את כל ההיסטוריה
    history.replaceState(null, null, '#signUp');
    // מעבר לעמוד ההתחברות
    location.hash = '#signUp';
    let blockedBack = false;

    window.onpopstate = function () {
        if (!blockedBack) {
            blockedBack = true;
            history.go(1); // דוחף את המשתמש חזרה קדימה רק פעם אחת
        }
    };


    showPage();
}

function showPage() {
    let currentPage = location.hash.substring(1);

    if (currentPage === 'diary') {
        console.log("id diet!!");
        window.dietInstance = new Diet();
        isInDiary = true;
        // נקה את כל ההיסטוריה ועשה reset מלא
        history.replaceState(null, null, '#diary');
    } else {
        isInDiary = false;
    }

    if (!currentPage) {
        currentPage = 'signUp'; // ברירת מחדל ל-signUp
        location.hash = '#signUp';
        return;
    }
    console.log("Showing page:", currentPage);

    let mainArea = document.querySelector('#appContainer');
    let templateElement = document.getElementById(currentPage);

    if (!templateElement) {
        console.error(`Template with id "${currentPage}" not found`);
        return;
    }

    let currentView = templateElement.content.cloneNode(true);
    mainArea.replaceChildren(currentView);

    document.dispatchEvent(new CustomEvent('pageLoaded', {
        detail: { pageName: currentPage }
    }));
}

// האזן לשינויים ב-hash
window.addEventListener('hashchange', (e) => {
    // אם אנחנו בדיארי ומנסים לצאת, חסום את זה
    if (isInDiary && !location.hash.includes('diary')) {
        e.preventDefault();
        // חזור לדיארי
        location.hash = '#diary';
        // הצג הודעה למשתמש
        alert('לא ניתן לחזור אחורה. השתמש בכפתור "התנתק" כדי לצאת.');
        return;
    }
    showPage();
});

// האזן לכפתור "אחורה" של הדפדפן
window.addEventListener('popstate', (e) => {
    if (isInDiary) {
        // חסום את הפעולה ותחזיר לדיארי
        history.pushState({ page: 'diary' }, '', '#diary');
        // הצג הודעה למשתמש
        alert('לא ניתן לחזור אחורה. השתמש בכפתור "התנתק" כדי לצאת.');
        return;
    }
});

init();