import HttpRequest from "./HttpRequest.js";
import NetWork from "./NetWork.js";
class FXMLHttpRequest extends EventTarget {
    constructor() {
        super()
        console.log("in XML constructor");
        this._state = 0;
        this.status = 0;
        this.request;
        this.netWork = NetWork;
        this.response = null;
    }
    get responseText(){
        return this.response;
    }
    set state(newState) {
        this._state = newState;
        console.log(`FXMLHttpRequest: State changed to ${newState}`);
        const event = new CustomEvent('onReadyStateChange', {
            detail: { state: newState }
        });
        this.dispatchEvent(event);
    }
    get state() {
        return this._state;
    }
    open(method, url) {
        this.state = 1; 
        console.log("FXMLHttpRequest: Opening connection");
        this.request = new HttpRequest(method, url);
    }
    send(details) {
        this.request.details = details;
        this.state = 2; 
        console.log("FXMLHttpRequest: Sending request...");
        this.netWork.sendRequest(this.request, (response) => {
            console.log("FXMLHttpRequest: Response received", response);
            this.response = JSON.stringify(response);
            this.status = response.status || 200;
            setTimeout(() => {
                this.state = 3; 
                setTimeout(() => {
                    this.state = 4;
                }, 100);
            }, 100);
        });
    }
    onError(type) {//לבדוק אם צריך כי עשינו readystatechange
    }
}
export default FXMLHttpRequest;