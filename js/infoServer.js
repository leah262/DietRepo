import Server from './Server.js';
import InfoDB from './InfoDB.js';

class InfoServer extends Server {
    constructor() {
        super();
        this.infoDB = new InfoDB();
        console.log("InfoServer initialized");
    }

    get(url, pathParts) {
        const userId = pathParts[3];
        if (!userId) return this.createResponse(false, "User ID is required", 400);

        const userRecords = this.infoDB.getRecordsByUserId(userId);
        return this.createResponse(true, null, 200, "Records retrieved successfully", userRecords);
    }

    post(url, data, pathParts) {
        const recordData = this.parseData(data);
        if (!this.validatePostData(recordData)) {
            return this.createResponse(false, "Missing required fields: userId, name, calories", 400);
        }

        const recordId = this.infoDB.addRecord(recordData);
        return this.createResponse(true, null, 201, "Record added successfully", { id: recordId, ...recordData });
    }

    put(url, data, pathParts) {
        const recordId = pathParts[3];
        if (!recordId) return this.createResponse(false, "Record ID is required", 400);

        const updateData = this.parseData(data);
        const existingRecord = this.infoDB.getRecord(recordId);
        if (!existingRecord) return this.createResponse(false, "Record not found", 404);

        const updatedRecord = this.infoDB.updateRecord(recordId, updateData);
        return this.createResponse(true, null, 200, "Record updated successfully", updatedRecord);
    }

    delete(url, pathParts) {
        const recordId = pathParts[3];
        if (!recordId) return this.createResponse(false, "Record ID is required", 400);

        const userRecord = this.infoDB.getRecord(recordId);
        if (!userRecord || !userRecord.userId) return this.createResponse(false, "User ID is required for deletion", 400);

        const success = this.infoDB.deleteRecord(recordId, userRecord.userId);
        return success
            ? this.createResponse(true, null, 200, "Record deleted successfully")
            : this.createResponse(false, "Failed to delete record", 500);
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
