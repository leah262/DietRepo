import DB from "./DB.js";
class UsersDB extends DB{
    constructor(){
        super();
        this.init();
    }
    init(){
        localStorage.setItem("userEmails&Id",JSON.stringify([]));
    }
    readAll(){
        let users=[];
        for(let i=1;i<=this.id;i++){ 
            let oneUser=JSON.parse(localStorage.getItem(id));
            if(oneUser){
                users.push(oneUser);
            }
        }
        return users;
    }
    read(email){
        let usersEmails=JSON.parse(localStorage.getItem('userEmails&Id'));
        let userId=usersEmails.find(user=>user.email===email);
        if(userId){
            userId=userId.id;
            return this.readById(userId);
        }
    }
    postUser(user){
        user.id=id;
        id++;
        let usersEmail=JSON.parse(localStorage.getItem("userEmails&Id"));
        usersEmail.push({id:id,email:user.email});
        localStorage.setItem("userEmails&Id",JSON.stringify(usersEmail));
        this.post(user,id);
    }

}