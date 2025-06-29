import UserServer from "./UserServer.js";
// import  InfoServer from "./infoServer.js";

class NetWork {
    constructor() {
        this.userServer = new UserServer();
        // this.infoServer = new FilmsServer();
    }

    sendRequest(httpRequest, callback) {
        // ... הקוד הקיים עד לחלק של setTimeout
        console.log("NetWork: Processing request for URL:", httpRequest.section.href);
        console.log("NetWork: URL pathname:", httpRequest.section.pathname);

        const url = httpRequest.section;

        if (url.protocol !== "http:" && url.protocol !== "https:") {
            const response = { success: false, error: "Invalid protocol", status: 400 };
            if (callback) {
                setTimeout(() => callback(response), 100); // השינוי: הפיכה לאסינכרוני
            }
            return;
        }

        let pathParts = url.pathname.split('/').filter(Boolean);
        console.log("NetWork: Path parts:", pathParts);

        setTimeout(() => {
            let response;
            console.log(url)
            if (pathParts.length > 1 && pathParts[1] === "Users-Servers") {
                console.log("NetWork: Routing to UserServer");
                response = this.userServer.handleRequest(url, httpRequest.details); // שנה מdetails לbody
            } else if (pathParts.length > 1 && pathParts[1] === "Info-Server") {
                console.log("NetWork: Routing to InfoServer");
                response = { success: false, error: "Info server not implemented", status: 501 };
            } else {
                console.log("NetWork: No matching server found");
                response = {
                    success: false,
                    error: `Network: No server found for path ${url.pathname}`,
                    status: 404
                };
            }

            console.log("NetWork: Sending response:", response);
            if (callback) callback(response);
        }, 1000);
    }
}

export default new NetWork();