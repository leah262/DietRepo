function init() {
    window.addEventListener('popstate', () => showPage())
    history.replaceState({}, 'signUp', '#signUp');
    showPage()
}

export function switchPage(pageName){
    // הסרנו את השורה שמשנה את location.hash כדי למנוע קריאה כפולה
    console.log("Switching to page:", pageName);
    
    history.pushState({}, pageName, `#${pageName}`);
    showPage();
}

function showPage() {
    let currentPage = location.hash.substring(1) ; // ברירת מחדל אם אין האש
    console.log("Showing page:", currentPage);
    if (!currentPage || currentPage === '') {
        currentPage = 'login';
        history.replaceState({}, 'login', '#login');
    }

    let mainArea = document.querySelector('#appContainer');
    let templateElement = document.getElementById(currentPage);
    
    // בדיקה שהטמפלייט קיים
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

// function trying(){
//     setTimeout(() => {
//         switchPage("login")    
//     }, 5000);
// }



init();
