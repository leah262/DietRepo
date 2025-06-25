import {DB}from "./DB.js";
class InfoDB extends DB{
    constructor(){
        super();
        this.init();
    }
    init(){
        
    }
    dataPost(info){
        info.id=id;
        id++;
        //need details
        this.post(info,id+"i");
    }
}