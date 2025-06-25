class NetWork {
    constructor() {
        this.usersServer = new InfoServer();
        this.infoServer = new FilmsServer();
    }

    sendRequest(url, data, callback) {
        let response;
        url = new URL(url);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
            response = "Invalid protocol";
            callback(response);
            return;
        }
        let pathParts = url.pathname.split('/').filter(Boolean);
        if (pathParts[1] === "Users-Servers") {
            response = this.usersServer.handleRequest(url, data);
        } else if (pathParts[1] === "Info-Server") {
            response = this.infoServer.handleRequest(url, data);
        } else {
            response = `Network: No server found for path ${url.pathname}`;
        }
        callback(response);
    }

}