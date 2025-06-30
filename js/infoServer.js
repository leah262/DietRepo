import Server from './Server.js';
import InfoDB from './InfoDB.js';

class InfoServer extends Server {
    constructor() {
        super();
        this.infoDB = new InfoDB();
        console.log("InfoServer initialized");
    }

    // GET - קבלת רשומות
    get(url, pathParts) {
        try {
            const userId = pathParts[3]; // מהנתיב: /api/Info-Servers/records/{userId}
            
            if (!userId) {
                return {
                    success: false,
                    error: "User ID is required",
                    status: 400
                };
            }

            const userRecords = this.infoDB.getRecordsByUserId(userId);
            
            return {
                success: true,
                data: userRecords,
                status: 200,
                message: "Records retrieved successfully"
            };
            
        } catch (error) {
            console.error("InfoServer GET error:", error);
            return {
                success: false,
                error: error.message,
                status: 500
            };
        }
    }

    // POST - הוספת רשומה חדשה
    post(url, data, pathParts) {
        try {
            if (!data) {
                return {
                    success: false,
                    error: "Record data is required",
                    status: 400
                };
            }

            let recordData;
            if (typeof data === 'string') {
                recordData = JSON.parse(data);
            } else if (typeof data === 'object') {
                recordData = data;
            } else {
                return {
                    success: false,
                    error: "Invalid data format",
                    status: 400
                };
            }

            // וולידציה בסיסית
            if (!recordData.userId || !recordData.name || !recordData.calories) {
                return {
                    success: false,
                    error: "Missing required fields: userId, name, calories",
                    status: 400
                };
            }

            const recordId = this.infoDB.addRecord(recordData);
            
            return {
                success: true,
                data: { id: recordId, ...recordData },
                status: 201,
                message: "Record added successfully"
            };
            
        } catch (error) {
            console.error("InfoServer POST error:", error);
            return {
                success: false,
                error: error.message,
                status: 500
            };
        }
    }

    // PUT - עדכון רשומה
    put(url, data, pathParts) {
        try {
            const recordId = pathParts[3]; // מהנתיב: /api/Info-Servers/records/{recordId}
            
            if (!recordId) {
                return {
                    success: false,
                    error: "Record ID is required",
                    status: 400
                };
            }

            if (!data) {
                return {
                    success: false,
                    error: "Updated data is required",
                    status: 400
                };
            }

            let updateData;
            if (typeof data === 'string') {
                updateData = JSON.parse(data);
            } else if (typeof data === 'object') {
                updateData = data;
            } else {
                return {
                    success: false,
                    error: "Invalid data format",
                    status: 400
                };
            }

            // בדיקה שהרשומה קיימת
            const existingRecord = this.infoDB.getRecord(recordId);
            if (!existingRecord) {
                return {
                    success: false,
                    error: "Record not found",
                    status: 404
                };
            }

            const updatedRecord = this.infoDB.updateRecord(recordId, updateData);
            
            return {
                success: true,
                data: updatedRecord,
                status: 200,
                message: "Record updated successfully"
            };
            
        } catch (error) {
            console.error("InfoServer PUT error:", error);
            return {
                success: false,
                error: error.message,
                status: 500
            };
        }
    }

    // DELETE - מחיקת רשומה
    delete(url, data, pathParts) {
        try {
            const recordId = pathParts[3]; // מהנתיב: /api/Info-Servers/records/{recordId}
            
            if (!recordId) {
                return {
                    success: false,
                    error: "Record ID is required",
                    status: 400
                };
            }

            // קבלת userId מהדאטה או מהרשומה הקיימת
            let userId;
            if (data && data.userId) {
                userId = data.userId;
            } else {
                const existingRecord = this.infoDB.getRecord(recordId);
                if (existingRecord) {
                    userId = existingRecord.userId;
                }
            }

            if (!userId) {
                return {
                    success: false,
                    error: "User ID is required for deletion",
                    status: 400
                };
            }

            const success = this.infoDB.deleteRecord(recordId, userId);
            
            if (success) {
                return {
                    success: true,
                    status: 200,
                    message: "Record deleted successfully"
                };
            } else {
                return {
                    success: false,
                    error: "Failed to delete record",
                    status: 500
                };
            }
            
        } catch (error) {
            console.error("InfoServer DELETE error:", error);
            return {
                success: false,
                error: error.message,
                status: 500
            };
        }
    }
}

export default InfoServer;