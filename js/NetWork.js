import  UserServer from "./UserServer.js";
import request from "./signUp.js";
// import  InfoServer from "./infoServer.js";

class NetWork {
    constructor() {
        this.usersServer =  UserServer;
        // this.infoServer = new FilmsServer();
    }

    sendRequest(request,callback) {
        console.log("in network");
        console.log(request);
        
        let response;
        let url = request.url;
        if (url.protocol !== "http:" && url.protocol !== "https:") {
            response = "Invalid protocol";
            callback(response);
            return;
        }
        // let pathParts = url.pathname.split('/').filter(Boolean);
        if (url.hostname === "Users-Servers.com") {
            response = this.usersServer.handleRequest(request);
            console.log("go to user server");
            
        } else if (url.hostname === "Info-Server") {
            response = this.infoServer.handleRequest(url, data);
        } else {
            response = `Network: No server found for path ${url.pathname}`;
        }
        callback(response);
    }

}
export default new NetWork();