import Server from './Server.js';
import InfoDB from './InfoDB.js';

class InfoServer extends Server {
    constructor() {
        super();
        this.infoDB = new InfoDB();
        console.log("InfoServer initialized");
    }

    get(url, pathParts) {
        try {
            const userId = pathParts[3];
            if (!userId) return this.createResponse(false, "User ID is required", 400, null);

            const userRecords = this.infoDB.getRecordsByUserId(userId);
            return this.createResponse(true, null, 200, "Records retrieved successfully", userRecords);
        } catch (error) {
            console.error("InfoServer GET error:", error);
            return this.createResponse(false, error.message, 500, null);
        }
    }

    post(url, data, pathParts) {
        try {
            const recordData = this.parseData(data);
            if (!this.validatePostData(recordData)) {
                return this.createResponse(false, "Missing required fields: userId, name, calories", 400, null);
            }

            const recordId = this.infoDB.addRecord(recordData);
            return this.createResponse(true, null, 201, "Record added successfully", { id: recordId, ...recordData });
        } catch (error) {
            console.error("InfoServer POST error:", error);
            return this.createResponse(false, error.message, 500, null);
        }
    }

    put(url, data, pathParts) {
        try {
            const recordId = pathParts[3];
            if (!recordId) return this.createResponse(false, "Record ID is required", 400, null);

            const updateData = this.parseData(data);
            const existingRecord = this.infoDB.getRecord(recordId);
            if (!existingRecord) return this.createResponse(false, "Record not found", 404, null);

            const updatedRecord = this.infoDB.updateRecord(recordId, updateData);
            return this.createResponse(true, null, 200, "Record updated successfully", updatedRecord);
        } catch (error) {
            console.error("InfoServer PUT error:", error);
            return this.createResponse(false, error.message, 500, null);
        }
    }

    delete(url, pathParts) {
        try {
            const recordId = pathParts[3];
            if (!recordId) return this.createResponse(false, "Record ID is required", 400, null);
            const userId = this.infoDB.getRecord(recordId)?.userId;
            if (!userId) return this.createResponse(false, "User ID is required for deletion", 400, null);
            const success = this.infoDB.deleteRecord(recordId, userId);
            return success
                ? this.createResponse(true, null, 200, "Record deleted successfully")
                : this.createResponse(false, "Failed to delete record", 500, null);
        } catch (error) {
            console.error("InfoServer DELETE error:", error);
            return this.createResponse(false, error.message, 500, null);
        }
    }

    parseData(data) {
        if (typeof data === 'string') return JSON.parse(data);
        if (typeof data === 'object') return data;
        throw new Error("Invalid data format");
    }

    validatePostData(data) {
        return data?.userId && data?.name && data?.calories;
    }
}

export default new InfoServer();
