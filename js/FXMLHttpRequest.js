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
    get responseText() {
        return this.response;
    }
    set state(newState) {
        this._state = newState;
        console.log(`FXMLHttpRequest: State changed to ${newState}`);
        const event = new CustomEvent('onReadyStateChange', {
            detail: { state: newState }
        });
        this.dispatchEvent(event);
        console.log("on set state");

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
        this.prepareRequest(details);
        this.state = 2; // HEADERS_RECEIVED

        console.log("FXMLHttpRequest: Sending request...");

        this.netWork.sendRequest(this.request, (response) => {
            if (this.isErrorResponse(response)) {
                this.handleErrorResponse(response);
                return;
            }

            this.handleSuccessResponse(response);
        });
    }
    prepareRequest(details) {
        this.request.details = details;
    }

    isErrorResponse(response) {
        return !response || response.error || response.status >= 400;
    }

    handleErrorResponse(response) {
        const msg = response?.error || "Unknown network error";
        this.onError(msg);
    }

    handleSuccessResponse(response) {
        console.log("FXMLHttpRequest: Response received", response);
        this.response = JSON.stringify(response);
        this.status = response.status || 200;

        this.simulateStateProgression();
    }

    simulateStateProgression() {
        setTimeout(() => {
            this.state = 3; // LOADING
            setTimeout(() => {
                this.state = 4; // DONE
            }, 100);
        }, 100);
    }

    onError(errorMessage) {
        this.state = 4;
        this.status = 500;
        const errorEvent = new CustomEvent('error', {
            detail: { message: errorMessage }
        });
        this.dispatchEvent(errorEvent);
    }

}

export default FXMLHttpRequest;