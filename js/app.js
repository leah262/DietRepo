
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
}

function showPage() {
    let currentPage = location.hash.substring(1);
    // if(currentPage==='diary'){
    //     console.log("id diet!!");
    //        window.dietInstance = new Diet();
        
    // }
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

// האזן רק לשינויים ב-hash
window.addEventListener('hashchange', showPage);

init();