class HttpRequest{
    constructor(method, section){
        this.method=method;
        this.section=new URL(section);
        console.log("new request");
        
    }
}
export default HttpRequest;