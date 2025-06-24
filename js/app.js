function init() {
    window.addEventListener('popstate', () =>showPage())
    history.replaceState({}, 'signUp', '#signUp');
    showPage()
    trying();
}
function switchPage(pageName){
    // window.location.hash = pageName;
    history.pushState({}, pageName, `#${pageName}`);
    showPage();
}
function showPage() {
    let currentPage = location.hash.substring(1);
    let mainArea = document.querySelector('#appContainer');
    let currentView = document.getElementById(currentPage).content.cloneNode(true);
    mainArea.replaceChildren(currentView);
}
function trying(){
    setTimeout(() => {
        switchPage("login")    
    }, 5000);
}
init();