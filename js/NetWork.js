import UserServer from "./UserServer.js";
import InfoServer from "./InfoServer.js";

class NetWork {
    constructor() {
        this.userServer = UserServer;
        this.infoServer = InfoServer;
        this.NETWORK_WRONG = 0;
    }

    sendRequest(httpRequest, callback) {
        console.log("NetWork: Processing request for URL:", httpRequest.section.toString());
        console.log("NetWork: URL pathname:", httpRequest.section.pathname);
        console.log("NetWork: HTTP Method:", httpRequest.method);
        
        // בדיקת שגיאת רשת - אם יש שגיאה, לא ממשיכים
        if (this._checkNetworkError()) {
            // מחזירים שגיאה מיד ולא מבצעים את הפעולה
            callback && callback({ success: false, error: "Network error", status: 500 });
            return;
        }
        
        const url = httpRequest.section;
        if (this._invalidProtocol(url)) {
            return callback && setTimeout(() => callback({ success: false, error: "Invalid protocol", status: 400 }), 100);
        }
        
        const pathParts = url.pathname.split('/').filter(Boolean);
        console.log("NetWork: Path parts:", pathParts);
        
        // ביצוע הבקשה רק אם אין שגיאת רשת
        setTimeout(() => {
            const response = this._handleRouting(url, pathParts, httpRequest.details, httpRequest.method);
            console.log("NetWork: Sending response:", response);
            callback && callback(response);
        }, 1000);
    }

    _checkNetworkError() {
        this.NETWORK_WRONG++;
        if (this.NETWORK_WRONG % 10 === 0) {
            alert('Network Failed')
            // התרעה על שגיאת רשת
            window.dispatchEvent(new CustomEvent('networkError'));
            return true; // מחזירים true כדי לעצור את הפעולה
        }
        return false;
    }

    _invalidProtocol(url) {
        return url.protocol !== "http:" && url.protocol !== "https:";
    }

    _handleRouting(url, pathParts, details, method) {
        console.log(url);
        if (pathParts[1] === "Users-Servers") {
            console.log("NetWork: Routing to UserServer");
            return this.userServer.handleRequest(url, details, method);
        }
        if (pathParts[1] === "Info-Servers") {
            console.log("NetWork: Routing to InfoServer");
            return this.infoServer.handleRequest(url, details, method);
        }
        console.log("NetWork: No matching server found");
        return {
            success: false,
            error: `Network: No server found for path ${url.pathname}`,
            status: 404
        };
    }
}

export default new NetWork();