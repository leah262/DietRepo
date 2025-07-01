import UserServer from "./UserServer.js";
import InfoServer from "./infoServer.js";
class NetWork {
    constructor() {
        this.userServer = new UserServer();
        this.infoServer = new InfoServer();
    }
    sendRequest(httpRequest, callback) {
        console.log("NetWork: Processing request for URL:", httpRequest.section.href);
        console.log("NetWork: URL pathname:", httpRequest.section.pathname);
        const url = httpRequest.section;
        if (this._invalidProtocol(url)) {
            return callback && setTimeout(() => callback({ success: false, error: "Invalid protocol", status: 400 }), 100);
        }
        const pathParts = url.pathname.split('/').filter(Boolean);
        console.log("NetWork: Path parts:", pathParts);
        setTimeout(() => {
            const response = this._handleRouting(url, pathParts, httpRequest.details);
            console.log("NetWork: Sending response:", response);
            callback && callback(response);
        }, 1000);
    }
    _invalidProtocol(url) {
        return url.protocol !== "http:" && url.protocol !== "https:";
    }
    _handleRouting(url, pathParts, details) {
        console.log(url);
        if (pathParts[1] === "Users-Servers") {
            console.log("NetWork: Routing to UserServer");
            return this.userServer.handleRequest(url, details);
        }
        if (pathParts[1] === "Info-Servers") {
            console.log("NetWork: Routing to InfoServer");
            return this.infoServer.handleRequest(url, details);
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