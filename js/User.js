class User{
    constructor(firstName, lastName,id, weight, password){
        this.firstName=firstName;
        this.lastName=lastName;
        this.id=id;
        this.weight=weight;
        this.password=password;
        this.init();
    }
    init(){
        let fxhr=new FXHRLHttpRequest();
        //writing to db
    }
}