import DB from "./DB.js";
class UsersDB extends DB {
    constructor() {
        super();
        this.init();
    }
    init() {
    if (!localStorage.getItem('dbCounter')) {
            localStorage.setItem('dbCounter', '1');
        }        if (!localStorage.getItem("userEmails&Id")) {
            localStorage.setItem("userEmails&Id", JSON.stringify([]));
        }
    }
    readAll() {
        let users = [];
        for (let i = 1; i <= this.id; i++) {
            let oneUser = JSON.parse(localStorage.getItem(i));
            if (oneUser) {
                users.push(oneUser);
            }
        }
        return users;
    }
    read(email) {
        let usersEmails = JSON.parse(localStorage.getItem('userEmails&Id'));
        let userId = usersEmails.find(user => user.email === email);
        if (userId) {
            userId = userId.id;
            return this.readById(userId);
        }
    }
    write(user) {
        user.id = this.id;
        this.id++;
        let usersEmail = JSON.parse(localStorage.getItem("userEmails&Id"));
        usersEmail.push({ id: this.id - 1, email: user.email });
        localStorage.setItem("userEmails&Id", JSON.stringify(usersEmail));
        this.write(JSON.stringify(user), this.id - 1);
    }
}
export default  UsersDB;