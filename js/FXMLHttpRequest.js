import HttpRequest from "./HttpRequest";
import NetWork from "./NetWork";
class FXMLHttpRequest extends EventTarget {
    constructor() {
        super()
        console.log("in XML constructor");
        // this.network=new NetWork;
        this._state = 0;
        this.status = 0;
        this.request;
        this.netWork=NetWork();
    }
    set state(newState) {
        this._state = newState; // נשתמש בשם אחר לשמירה פנימית כדי למנוע רקורסיה
        const event = new CustomEvent('onReadyStateChange', {
            detail: { state: newState }
        });
        this.dispatchEvent(event); // שליחת האירוע
    }
    get state() {
        return this._state;
    }
    open(method, url) {
        this.state = 1;
        console.log("opening");
        this.request=new HttpRequest(method,url)

    }
    send() {
        this.netWork.sendRequest(this.request);
        this.state=2;
    }
    onReadyStateChange() {

    }
    onError(type) {

    }
}
export default FXMLHttpRequest;