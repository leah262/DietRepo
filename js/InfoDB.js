import DB from "./DB.js";

class InfoDB extends DB {
    constructor() {
        super();
        this.prefix = 'diet_';
        this.userRecordsKey = 'user_records_';
    }

    get id() {
        let currentId = parseInt(localStorage.getItem("diet_id") || "0") + 1;
        localStorage.setItem("diet_id", currentId);
        return currentId;
    }

    addRecord(record) {
        const recordId = this.id;
        record.id = recordId;
        record.timestamp = record.timestamp || new Date().toISOString();

        const recordKey = this.prefix + recordId;
        this.write(JSON.stringify(record), recordKey);
        this.addToUserRecords(record.userId, recordId);

        return recordId;
    }

    addToUserRecords(userId, recordId) {
        const userRecordsKey = this.userRecordsKey + userId;
        let recordIds = JSON.parse(localStorage.getItem(userRecordsKey) || "[]");

        const numericRecordId = parseInt(recordId);
        if (!recordIds.includes(numericRecordId)) {
            recordIds.push(numericRecordId);
            localStorage.setItem(userRecordsKey, JSON.stringify(recordIds));
        }
    }

    removeFromUserRecords(userId, recordId) {
        const userRecordsKey = this.userRecordsKey + userId;
        let recordIds = JSON.parse(localStorage.getItem(userRecordsKey) || "[]");

        const numericRecordId = parseInt(recordId);
        const filteredIds = recordIds.filter(id => parseInt(id) !== numericRecordId);
        localStorage.setItem(userRecordsKey, JSON.stringify(filteredIds));
    }

    getRecordsByUserId(userId) {
        const userRecordsKey = this.userRecordsKey + userId;
        const recordIds = JSON.parse(localStorage.getItem(userRecordsKey) || "[]");
        const records = [];

        for (const id of recordIds) {
            const recordKey = this.prefix + id;
            const recordData = localStorage.getItem(recordKey);
            if (recordData) {
                try {
                    const parsedRecord = JSON.parse(recordData);
                    records.push(parsedRecord);
                } catch (_) {
                    // ignore parse error
                }
            }
        }

        return records;
    }

    updateRecord(recordId, updatedData) {
        const recordKey = this.prefix + recordId;
        const existingData = localStorage.getItem(recordKey);
        if (!existingData) return null;

        const existingRecord = JSON.parse(existingData);
        const updatedRecord = { ...existingRecord, ...updatedData, id: recordId };

        localStorage.setItem(recordKey, JSON.stringify(updatedRecord));
        return updatedRecord;
    }

    deleteRecord(recordId, userId) {
        const recordKey = this.prefix + recordId;
        localStorage.removeItem(recordKey);
        this.removeFromUserRecords(userId, recordId);
        return true;
    }

    getRecord(recordId) {
        const recordKey = this.prefix + recordId;
        const recordData = localStorage.getItem(recordKey);
        return recordData ? JSON.parse(recordData) : null;
    }
}

export default InfoDB;
