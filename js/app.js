import DietCore from "./DietCore.js";

class AppManager {
    isInDiary = false;
    constructor() {
        this.init();
    }
    init() {
        location.hash = '#signUp';
        if (!location.hash || location.hash === '#') {
            location.hash = '#signUp';
            return;
        }
        this.loadListeners();
        this.showPage();
    }

    switchPage(pageName) {
        if (!pageName) return;
        location.hash = `#${pageName}`;
    }

    logout() {
        sessionStorage.removeItem('currentUser');
        this.isInDiary = false;
        history.replaceState(null, null, '#login');
        location.hash = '#login';
        let blockedBack = false;
        window.onpopstate = () => {
            if (!blockedBack) {
                blockedBack = true;
                history.go(1);
            }
        };
        this.showPage();
    }

    showPage() {
        let currentPage = location.hash.substring(1);
        if (currentPage === 'diary') {
            window.dietInstance = new DietCore();
            // this.isInDiary = true;
            // history.replaceState(null, null, '#diary');
        } else {
            this.isInDiary = false;
        }
        if (!currentPage) {
            currentPage = 'signUp';
            location.hash = '#signUp';
            return;
        }
        console.log("Showing page:", currentPage);
        this.theMainArea(currentPage);
    }

    theMainArea(currentPage) {
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

    loadListeners() {
        window.addEventListener('hashchange', (e) => {
            if (this.isInDiary && !location.hash.includes('diary')) {
                e.preventDefault();
                location.hash = '#diary';
                return;
            }
            this.showPage();
         });
        window.addEventListener('popstate', (e) => {
            if (this.isInDiary) {
                history.pushState({ page: 'diary' }, '', '#diary');
                alert('לא ניתן לחזור אחורה. השתמש בכפתור "התנתק" כדי לצאת.');
                return;
            }
        });
    }
}

const appInstance = new AppManager();
export const switchPage = appInstance.switchPage.bind(appInstance);
export const logout = appInstance.logout.bind(appInstance);
