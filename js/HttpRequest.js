class HttpRequest {
    constructor(method, section) {
        this.method = method;
        this.section = new URL(section, "https://fake.server"); // פתרון כאן
        console.log("new request:", this.method, this.section.href);
    }
}
export default HttpRequest;
