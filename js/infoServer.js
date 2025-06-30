import Server from './Server.js';
import UsersDB from './UsersDB.js';

class UserServer extends Server {
    constructor() {
        super();
        this.InfoDB = new UsersDB();
        console.log("UsersServer initialized");
    }

    get(url, pathParts) {
        try {
            const action = pathParts[3];
            const urlParams = new URLSearchParams(url.search);
            if(!action){
                throw new error("not valid url");
            }
            let userRecords=this.InfoDB.getRecordsByUserId(action);
            if(userRecords){
            return{
                success:true,
                data:userRecords,
                status:200,
                massege: "Records retrieved successfully"
            };
            }
            throw new error("id is not valid");
            //     }
        } catch (error) {
            console.error("UsersServer GET error:", error);
            return {
                success: false,
                error: error.message,
                status: 500
            };
        }
    }

    post(url, data, pathParts) {
        try {
            
            // const action = pathParts[2];

            // switch (action) {
            //     case 'register':
            //         if (!data) {
            //             return {
            //                 success: false,
            //                 error: "User data is required",
            //                 status: 400
            //             };
            //         }

            //         let userData;
            //         if (typeof data === 'string') {
            //             userData = JSON.parse(data);
            //         } else if (typeof data === 'object') {
            //             userData = data;
            //         } else {
            //             return {
            //                 success: false,
            //                 error: "Invalid user data format",
            //                 status: 400
            //             };
            //         }

            //         if (!userData.email || !userData.password) {
            //             return {
            //                 success: false,
            //                 error: "Email and password are required",
            //                 status: 400
            //             };
            //         }

            //         // בדיקה אם המשתמש כבר קיים
            //         const existingUser = this.usersDB.read(userData.email);
            //         if (existingUser) {
            //             return {
            //                 success: false,
            //                 error: "User already exists",
            //                 status: 409
            //             };
            //         }

            //         // רישום המשתמש
            //         this.usersDB.postUser(userData);

            //         return {
            //             success: true,
            //             data: {
            //                 id: userData.id,
            //                 email: userData.email,
            //                 firstName: userData.firstName, // הוסף את השדות הנוספים
            //                 lastName: userData.lastName
            //             },
            //             status: 201
            //         };

            //     case 'login':
            //         if (!data) {
            //             return {
            //                 success: false,
            //                 error: "Login data is required",
            //                 status: 400
            //             };
            //         }

            //         const loginData = typeof data === 'string' ? JSON.parse(data) : data;

            //         if (!loginData.email || !loginData.password) {
            //             return {
            //                 success: false,
            //                 error: "Email and password are required",
            //                 status: 400
            //             };
            //         }

            //         const foundUser = this.usersDB.read(loginData.email);
            //         if (!foundUser) {
            //             return {
            //                 success: false,
            //                 error: "User not found",
            //                 status: 404
            //             };
            //         }

            //         if (foundUser.password !== loginData.password) {
            //             return {
            //                 success: false,
            //                 error: "Invalid password",
            //                 status: 401
            //             };
            //         }

            //         return {
            //             success: true,
            //             data: {
            //                 id: foundUser.id,
            //                 email: foundUser.email,
            //                 message: "Login successful"
            //             },
            //             status: 200
            //         };

            //     default:
            //         return {
            //             success: false,
            //             error: `Action '${action}' not found`,
            //             status: 404
            //         };
            // }
        } catch (error) {
            console.error("UsersServer POST error:", error);
            return {
                success: false,
                error: error.message,
                status: 500
            };
        }
    }

    put(url, data, pathParts) {
        try {
            const action = pathParts[2];

            if (action === 'update') {
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

                const existingUser = this.usersDB.read(userData.email);
                if (!existingUser) {
                    return {
                        success: false,
                        error: "User not found",
                        status: 404
                    };
                }

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

    delete(url, pathParts) {
        try {
            const action = pathParts[2];
            const urlParams = new URLSearchParams(url.search);

            if (action === 'user') {
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
export default InfoServer;