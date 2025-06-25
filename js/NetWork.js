class NetWork {
    constructor() {
        this.peopleServer = new PeopleServer();
        this.filmsServer = new FilmsServer();
    }

    sendRequest(url, data) {
        if (url.startsWith('/people')) {
            return this.peopleServer.handleRequest(url, data);
        } else if (url.startsWith('/films')) {
            return this.filmsServer.handleRequest(url, data);
        } else {
            return `Network: No server found for path ${url}`;
        }
    }
}