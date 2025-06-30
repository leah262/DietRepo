import FXMLHttpRequest from "./FXMLHttpRequest";

class Daiet {
    constructor() {
        this.userId = JSON.parse(sessionStorage.getItem('currentUser')).id;
    }
    init() {
        if (this.userId) {
            let fxhr = new FXMLHttpRequest();
            fxhr.addEventListener('onReadyStateChange', this.handleStateChange.bind(this));
            fxhr.open('GET', `https://fake.server/api/Info-Servers/records/${this.userId}?method=GET`)
            fxhr.send(null);
        }
    }
    handleStateChange(e) {
        let fxhr = e.target;
        if (fxhr.state === 4) {
            let data = fxhr.response.data;
            console.log("in response of loading page", fxhr.response);
            if (fxhr.response && fxhr.response.success) {

                console.log("loadDiet: Registration successful");
                this.handelingRecords(data, e.target);
            } else {
                console.error("loadDiet: Registration failed:", fxhr.response);
                alert('אירעה שגיאה בעת הרישום. אנא נסי שוב.');
            }
        }
    }
    handelingRecords(data, target) {
        let diaryPlaceHolder = document.getElementById('diaryTable');
        if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
                diaryPlaceHolder.insertAdjacentHTML('beforeend', `<tr id=${i}>
                    <td>${data[i].date}</td>
                    <td>${data[i].name}</td>
                    <td>${data[i].calories}</td>
                    <td class="delete"></td>
                    <td class="update"></td>
                </tr>`)
            }
        }

    }
    delete(e){
        
    }
}