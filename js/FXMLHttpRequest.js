class FXMLHttpRequest extends EventTarget {
    constructor() {
        super()
        console.log("in XML constructor");
        // this.network=new NetWork;
        this.state = '';
        this.status = 0;
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

    }
    send() {

    }
    onReadyStateChange() {

    }
    onError(type) {

    }
}
export default FXMLHttpRequest;