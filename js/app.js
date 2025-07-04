import DietCore from "./DietCore.js";
let isInDiary = false; // דגל למעקב אחר מיקום בדיארי
function init() {
    // location.hash='#signUp'
    if (!location.hash || location.hash === '#') {
        location.hash = '#signUp';
        return;
    }
    loadListeners();
    showPage();
}
export function switchPage(pageName) {
    if (!pageName) return;
    location.hash = `#${pageName}`;
}
export function logout() {
    sessionStorage.removeItem('currentUser');
    isInDiary = false;
    history.replaceState(null, null, '#login');
    location.hash = '#login';
    let blockedBack = false;
    window.onpopstate = function () {
        if (!blockedBack) {
            blockedBack = true;
            history.go(1);
        }
    };
    showPage();
}
function showPage() {
    let currentPage = location.hash.substring(1);
    if (currentPage === 'diary') {
        console.log("id diet!!");
        window.dietInstance = new DietCore();
        isInDiary = true;
        history.replaceState(null, null, '#diary');
    } else {
        isInDiary = false;
    }
    if (!currentPage) {
        currentPage = 'signUp';
        location.hash = '#signUp';
        return;
    }
    console.log("Showing page:", currentPage);
    theMainArea(currentPage)

}
function theMainArea(currentPage) {
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
function loadListeners(){
    window.addEventListener('hashchange', (e) => {
        if (isInDiary && !location.hash.includes('diary')) {
            e.preventDefault();
            location.hash = '#diary';
            alert('לא ניתן לחזור אחורה. השתמש בכפתור "התנתק" כדי לצאת.');
            return;
        }
        showPage();
    });
    window.addEventListener('popstate', (e) => {
        if (isInDiary) {
            history.pushState({ page: 'diary' }, '', '#diary');
            alert('לא ניתן לחזור אחורה. השתמש בכפתור "התנתק" כדי לצאת.');
            return;
        }
    });
}
init();