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
        this.state = 1; // OPENED
        console.log("FXMLHttpRequest: Opening connection");
        this.request = new HttpRequest(method, url);
    }
    
    send(details) {
        this.request.details = details;
        this.state = 2; // HEADERS_RECEIVED - השינוי: מיד אחרי שליחה
        
        console.log("FXMLHttpRequest: Sending request...");
        
        // השינוי: שליחה אסינכרונית עם callback
        this.netWork.sendRequest(this.request, (response) => {
            console.log("FXMLHttpRequest: Response received", response);
            this.response = response;
            this.status = response.status || 200;
            
            // השינוי: עדכון מדורג של ה-state
            setTimeout(() => {
                this.state = 3; // LOADING
                setTimeout(() => {
                    this.state = 4; // DONE - השינוי: בקשה הושלמה
                }, 100);
            }, 100);
        });
    }
    
    onReadyStateChange() {
        // נשאר ריק - האירוע נשלח דרך EventTarget
    }
    
    onError(type) {
        // נשאר ריק
    }
}

export default FXMLHttpRequest;