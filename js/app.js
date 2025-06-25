function init() {
    window.addEventListener('popstate', () =>showPage())
    history.replaceState({}, 'signUp', '#signUp');
    showPage()
}
export function switchPage(pageName){
    window.location.hash = pageName;
    console.log("abcd");
    
    console.log(pageName);
    history.pushState({}, pageName, `#${pageName}`);
    showPage();
}
function showPage() {
    let currentPage = location.hash.substring(1);
    let mainArea = document.querySelector('#appContainer');
    let currentView = document.getElementById(currentPage).content.cloneNode(true);
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

