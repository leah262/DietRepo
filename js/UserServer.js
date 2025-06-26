import Server from './Server.js';
import UsersDB from './UsersDB.js';

class UserServer extends Server {
    constructor() {
        super();
        this.usersDB = new UsersDB();
        console.log("UsersServer initialized");
    }

    // טיפול בבקשות GET
    get(url, pathParts) {
        try {
            // pathParts[0] = "api", pathParts[1] = "Users-Servers", pathParts[2] = action
            const action = pathParts[2];
            const urlParams = new URLSearchParams(url.search);

            switch (action) {
                case 'users':
                    // GET /api/Users-Servers/users - קבלת כל המשתמשים
                    const allUsers = this.usersDB.readAll();
                    return {
                        success: true,
                        data: allUsers,
                        status: 200,
                        message: "Users retrieved successfully"
                    };

                case 'user':
                    // GET /api/Users-Servers/user?email=example@email.com
                    const email = urlParams.get('email');
                    if (!email) {
                        return {
                            success: false,
                            error: "Email parameter is required",
                            status: 400
                        };
                    }
                    
                    const user = this.usersDB.read(email);
                    if (user) {
                        return {
                            success: true,
                            data: user,
                            status: 200,
                            message: "User found"
                        };
                    } else {
                        return {
                            success: false,
                            error: "User not found",
                            status: 404
                        };
                    }

                default:
                    return {
                        success: false,
                        error: `Action '${action}' not found`,
                        status: 404
                    };
            }
        } catch (error) {
            console.error("UsersServer GET error:", error);
            return {
                success: false,
                error: error.message,
                status: 500
            };
        }
    }

    // טיפול בבקשות POST
    post(url, data, pathParts) {
        try {
            const action = pathParts[2];

            switch (action) {
                case 'register':
                    // POST /api/Users-Servers/register
                    if (!data) {
                        return {
                            success: false,
                            error: "User data is required",
                            status: 400
                        };
                    }

                    // בדיקת נתונים נדרשים
                    const userData = typeof data === 'string' ? JSON.parse(data) : data;
                    
                    if (!userData.email || !userData.password) {
                        return {
                            success: false,
                            error: "Email and password are required",
                            status: 400
                        };
                    }

                    // בדיקה אם המשתמש כבר קיים
                    try {
                        const existingUser = this.usersDB.read(userData.email);
                        if (existingUser) {
                            return {
                                success: false,
                                error: "User already exists",
                                status: 409
                            };
                        }
                    } catch (error) {
                        // המשתמש לא קיים - זה טוב
                    }

                    // רישום המשתמש
                    this.usersDB.postUser(userData);
                    
                    return {
                        success: true,
                        data: {
                            id: userData.id,
                            email: userData.email,
                            message: "User registered successfully"
                        },
                        status: 201
                    };

                case 'login':
                    // POST /api/Users-Servers/login
                    if (!data) {
                        return {
                            success: false,
                            error: "Login data is required",
                            status: 400
                        };
                    }

                    const loginData = typeof data === 'string' ? JSON.parse(data) : data;
                    
                    if (!loginData.email || !loginData.password) {
                        return {
                            success: false,
                            error: "Email and password are required",
                            status: 400
                        };
                    }

                    // חיפוש המשתמש
                    const foundUser = this.usersDB.read(loginData.email);
                    if (!foundUser) {
                        return {
                            success: false,
                            error: "User not found",
                            status: 404
                        };
                    }

                    // בדיקת סיסמה
                    if (foundUser.password !== loginData.password) {
                        return {
                            success: false,
                            error: "Invalid password",
                            status: 401
                        };
                    }

                    return {
                        success: true,
                        data: {
                            id: foundUser.id,
                            email: foundUser.email,
                            message: "Login successful"
                        },
                        status: 200
                    };

                default:
                    return {
                        success: false,
                        error: `Action '${action}' not found`,
                        status: 404
                    };
            }
        } catch (error) {
            console.error("UsersServer POST error:", error);
            return {
                success: false,
                error: error.message,
                status: 500
            };
        }
    }

    // טיפול בבקשות PUT (עדכון משתמש)
    put(url, data, pathParts) {
        try {
            const action = pathParts[2];
            
            if (action === 'update') {
                // PUT /api/Users-Servers/update
                if (!data) {
                    return {
                        success: false,
                        error: "User data is required",
                        status: 400
                    };
                }

                const userData = typeof data === 'string' ? JSON.parse(data) : data;
                
                if (!userData.email) {
                    return {
                        success: false,
                        error: "Email is required for update",
                        status: 400
                    };
                }

                // בדיקה אם המשתמש קיים
                const existingUser = this.usersDB.read(userData.email);
                if (!existingUser) {
                    return {
                        success: false,
                        error: "User not found",
                        status: 404
                    };
                }

                // עדכון המשתמש
                const updatedUser = { ...existingUser, ...userData };
                this.usersDB.post(JSON.stringify(updatedUser), existingUser.id);

                return {
                    success: true,
                    data: updatedUser,
                    status: 200,
                    message: "User updated successfully"
                };
            }

            return {
                success: false,
                error: `Action '${action}' not found`,
                status: 404
            };
        } catch (error) {
            console.error("UsersServer PUT error:", error);
            return {
                success: false,
                error: error.message,
                status: 500
            };
        }
    }

    // טיפול בבקשות DELETE
    delete(url, pathParts) {
        try {
            const action = pathParts[2];
            const urlParams = new URLSearchParams(url.search);

            if (action === 'user') {
                // DELETE /api/Users-Servers/user?email=example@email.com
                const email = urlParams.get('email');
                if (!email) {
                    return {
                        success: false,
                        error: "Email parameter is required",
                        status: 400
                    };
                }

                const user = this.usersDB.read(email);
                if (!user) {
                    return {
                        success: false,
                        error: "User not found",
                        status: 404
                    };
                }

                this.usersDB.deleteById(user.id);

                return {
                    success: true,
                    message: "User deleted successfully",
                    status: 200
                };
            }

            return {
                success: false,
                error: `Action '${action}' not found`,
                status: 404
            };
        } catch (error) {
            console.error("UsersServer DELETE error:", error);
            return {
                success: false,
                error: error.message,
                status: 500
            };
        }
    }
}

export default UserServer;