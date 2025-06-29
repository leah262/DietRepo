class DB {
    constructor() {
        this.id = 1;
    }
    //read/ delete/ update/post/rest api
    readAll() {

    }
    deleteById(id) {
        localStorage.removeItem(id);
    }
    readById(id) {
        let theUser = JSON.parse(localStorage.getItem(id));
        if (theUser)
            return theUser;
        else
            throw new Error("object not found");
    }
    post(data, key) {
        localStorage.setItem(key, data);
    }
}
export default DB;
