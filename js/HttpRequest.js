class HttpRequest {
    constructor(method, section) {
        this.method = method; // שמירת ה-method בנפרד
        this.section = new URL(section, "https://fake.server");
        this.details = null;
        console.log("new request:", this.method, this.section.href);
    }
}
export default HttpRequest;