class FXMLHttpRequest{
    constructor(){
        console.log("in XML constructor");
        this.network=new NetWork;
        this.state=0;
        this.status=0;
    }
    open(method,url){
        this.state=1;
        
    }
    send(){

    }
    onReadyStateChange(){

    }
    onError(type){

    }
}