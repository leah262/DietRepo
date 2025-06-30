import DB from "./DB.js";
class InfoDB extends DB{
    constructor(){
        super();
        this.isExist=false;
        // this.init();
    }
    dataPost(info){
        info.id=id;
        id++;
        //need details
        this.post(info,id+"i");
    }
    getRecordsByUserId(userId){
        
        return localStorage.getItem(userId);

    }
}