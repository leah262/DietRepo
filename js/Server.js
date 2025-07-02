class Server {
    constructor() {
        console.log("Server initialized");
    }
    handleRequest(url, data, method) {
        try {
            // השימוש ב-method שהועבר כפרמטר במקום לחלץ מה-URL
            const httpMethod = method || 'GET';
            const pathParts = url.pathname.split('/').filter(Boolean);
            console.log(`Server: Handling ${httpMethod} request for path: ${url.pathname}`);
            console.log(`Server: Path parts:`, pathParts);
            console.log(`Server: Data received:`, data);
            
            switch (httpMethod.toLowerCase()) {
                case 'get':
                    return this.get(url, pathParts);
                case 'post':
                    return this.post(url, data, pathParts);
                case 'put':
                    return this.put(url, data, pathParts);
                case 'delete':
                    return this.delete(url, pathParts);
                default:
                    return { error: "Method not supported", status: 405 };
            }
        } catch (error) {
            console.error("Server error:", error);
            return { error: error.message, status: 500 };
        }
    }

    get(url, pathParts) {
        console.log("GET method called - should be implemented by child class");
        return { message: "GET method not implemented", status: 501 };
    }

    post(url, data, pathParts) {
        console.log("POST method called - should be implemented by child class");
        return { message: "POST method not implemented", status: 501 };
    }

    put(url, data, pathParts) {
        console.log("PUT method called - should be implemented by child class");
        return { message: "PUT method not implemented", status: 501 };
    }

    delete(url, pathParts) {
        console.log("DELETE method called - should be implemented by child class");
        return { message: "DELETE method not implemented", status: 501 };
    }
    
    createResponse(isSuccess, requestError, requestStatus, requestMessage, data = null) {
        let response = {
            success: isSuccess,
            status: requestStatus
        };
        if (data) {
            response.data = data;
        }
        if (requestMessage) {
            response.message = requestMessage;
        } else if (requestError) {
            response.error = requestError;
        }
        return response;
    }
}

export default Server;