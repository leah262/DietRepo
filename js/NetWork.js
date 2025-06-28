import UserServer from "./UserServer.js";
// import  InfoServer from "./infoServer.js";

class NetWork {
    constructor() {
        this.userServer = new UserServer();

        // this.infoServer = new FilmsServer();
    }

    sendRequest(httpRequest, callback) {
        let response;
        const url = new URL(httpRequest.section); // נשתמש ב-section מה-HttpRequest

        if (url.protocol !== "http:" && url.protocol !== "https:") {
            response = "Invalid protocol";
            if (callback) callback(response);
            return;
        }

        let pathParts = url.pathname.split('/').filter(Boolean);
        if (pathParts[1] === "Users-Servers") {
            response = this.userServer.handleRequest(url, null);
        } else if (pathParts[1] === "Info-Server") {
            response = this.infoServer.handleRequest(url, null);
        } else {
            response = `Network: No server found for path ${url.pathname}`;
        }

        if (callback) callback(response);
    }

}
export default new NetWork();