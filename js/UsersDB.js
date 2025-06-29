import DB from "./DB.js";
class UsersDB extends DB {
    constructor() {
        super();
        this.init();
    }
    init() {
        // השינוי: בדיקה אם כבר קיים כדי לא למחוק נתונים קיימים
        if (!localStorage.getItem("userEmails&Id")) {
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
    postUser(user) {
        user.id = this.id;
        this.id++;
        let usersEmail = JSON.parse(localStorage.getItem("userEmails&Id"));
        usersEmail.push({ id: this.id - 1, email: user.email });
        
        // השינוי: תיקון שמירת רשימת האימיילים
        localStorage.setItem("userEmails&Id", JSON.stringify(usersEmail));
        
        // השינוי: תיקון השמירה - הסרת הקריאה הכפולה
        this.post(JSON.stringify(user), this.id - 1);
    }
}
export default  UsersDB;