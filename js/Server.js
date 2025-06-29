class Server {
    constructor() {
        console.log("Server initialized");
    }

    // פונקציה כללית לטיפול בבקשות
    handleRequest(url, data) {
        try {
            const method = this.extractMethod(url);
            const pathParts = url.pathname.split('/').filter(Boolean);
            
            console.log(`Server: Handling ${method} request for path: ${url.pathname}`);
            console.log(`Server: Path parts:`, pathParts);
            console.log(`Server: Data received:`, data);
            
            switch (method.toLowerCase()) {
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

    // חילוץ method מה-URL או מ-data
    extractMethod(url) {
        // השינוי: תיקון חילוץ ה-method
        const urlParams = new URLSearchParams(url.search);
        const methodFromParams = urlParams.get('method');
        if (methodFromParams) {
            console.log(`Server: Method from URL params: ${methodFromParams}`);
            return methodFromParams;
        }
        // ברירת מחדל
        console.log("Server: Using default method: GET");
        return 'GET';
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
}

export default Server;