import Server from './Server.js';
import UsersDB from './UsersDB.js';

class UserServer extends Server {
    constructor() {
        super();
        this.usersDB = new UsersDB();
        console.log("UsersServer initialized");
    }
    get(url, pathParts) {
        try {
            const action = pathParts[2];
            const urlParams = new URLSearchParams(url.search);
            switch (action) {
                case 'users':
                    return this.getAllUsers();
                case 'user':
                    return this.getOneUser();
                default:
                    return this.createResponse(false, `Action '${action}' not found`, 404, null);
            }
        } catch (error) {
            console.error("UsersServer GET error:", error);
            return this.createResponse(false, error.message, 500, null);
        }
    }
    getOneUser() {
        const email = urlParams.get('email');
        if (!email) {
            return this.createResponse(false, "Email parameter is required", 400, null);
        }
        const user = this.usersDB.read(email);
        if (user) {
            return this.createResponse(true, null, 200, "User found", user);
        } else {
            return this.createResponse(false, "User not found", 404);
        }
    }
    getAllUsers() {
        const allUsers = this.usersDB.readAll();
        return this.createResponse(true, null, 200, "Users retrieved successfully", allUsers);
    }
    post(url, data, pathParts) {
        try {
            const action = pathParts[2];
            switch (action) {
                case 'register':
                    return this.handelSignUpRequest(action, url, data, pathParts);
                case 'login':
                    return this.handelLoginRequest(action, url, data, pathParts);
                default:
                    return this.createResponse(false, `Action '${action}' not found`, 404, null);
            }
        } catch (error) {
            console.error("UsersServer POST error:", error);
            return this.createResponse(false, error.message, 500, null);
        }
    }
    handelSignUpRequest(action, url, data, pathParts) {
        if (!data) {
            return this.createResponse(false, "User data is required", 400, null);
        }
        let userData;
        if (typeof data === 'string') {
            userData = JSON.parse(data);
        } else if (typeof data === 'object') {
            userData = data;
        } else {
            return this.createResponse(false, "Invalid user data format", 400, null)
        }
        if (!userData.email || !userData.password) {
            return this.createResponse(false, "Email and password are required", 400, null);
        }
        this.usersDB.write(userData);
        return this.createResponse(true, null, 201, null, userData)
    }
    handelLoginRequest(action, url, data, pathParts) {
        if (!data) {
            return this.createResponse(false, "Login data is required", 400, null);
        }
        const loginData = typeof data === 'string' ? JSON.parse(data) : data;
        if (!loginData.email || !loginData.password) {
            this.createResponse(false, "Email and password are required", 400, null);
        }
        const foundUser = this.usersDB.read(loginData.email);
        if (!foundUser) {
            return this.createResponse(false, "User not found", 404, null);
        }
        if (foundUser.password !== loginData.password) {
            return this.createResponse(false, "Invalid password", 401, null);
        }
        return this.createResponse(true, null, 200, "Login successful", {
            id: foundUser.id,
            email: foundUser.email,
            firstName: foundUser.firstName,  
            lastName: foundUser.lastName     
        });

    }

    put(url, data, pathParts) {
        try {
            const action = pathParts[2];
            if (action === 'update') {
                if (!data) {
                    return this.createResponse(false, "User data is required", 400, null);
                }
                const userData = typeof data === 'string' ? JSON.parse(data) : data;
                if (!userData.email) {
                    return this.createResponse(false, "Email is required for update", 400, null);
                }
                const existingUser = this.usersDB.read(userData.email);
                if (!existingUser) {
                    return this.createResponse(false, "User not found", 404, null);
                }
                const updatedUser = { ...existingUser, ...userData };
                this.usersDB.post(JSON.stringify(updatedUser), existingUser.id);
                return this.createResponse(true, null, 200, "User updated successfully", updatedUser);
            }
            return this.createResponse(false, `Action '${action}' not found`, 404, null);
        } catch (error) {
            console.error("UsersServer PUT error:", error);
            return this.createResponse(false, error.message, 500, null);
        }
    }
    delete(url, pathParts) {
        try {
            const action = pathParts[2];
            const urlParams = new URLSearchParams(url.search);
            if (action === 'user') {
                const email = urlParams.get('email');
                if (!email) {
                    return this.createResponse(false, "Email parameter is required", 400, null);
                }
                const user = this.usersDB.read(email);
                if (!user) {
                    return this.createResponse(false, "User not found", 404, null);
                }
                this.usersDB.deleteById(user.id);
                return this.createResponse(true, null, 200, "User deleted successfully");
            }
            return this.createResponse(false, `Action '${action}' not found`, 404, null);
        } catch (error) {
            console.error("UsersServer DELETE error:", error);
            return this.createResponse(false, error.message, 500, null);
        };
    }
}
export default new UserServer();