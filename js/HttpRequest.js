class HttpRequest{
    constructor(method, url){
        this.method=method;
        this.section=url;
        // this.url=new URL(url);
        console.log("new request");
        
    }
}
export default HttpRequest;