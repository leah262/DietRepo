import DB from "./DB.js";

class InfoDB extends DB {
    constructor() {
        super();
        this.prefix = 'diet_';
        this.userRecordsKey = 'user_records_';
    }
    addRecord(record) {
        try {
            const id = this.id;
            record.id = id;
            record.timestamp = record.timestamp || new Date().toISOString();
            this._saveRecord(id, record);
            this._updateUserRecords(record.userId, id, true);
            return id;
        } catch (e) {
            console.error('InfoDB: Error adding record:', e);
            throw e;
        }
    }

    addToUserRecords(userId, recordId) {
        this._updateUserRecords(userId, recordId, true);
    }

    removeFromUserRecords(userId, recordId) {
        this._updateUserRecords(userId, recordId, false);
    }

    getRecordsByUserId(userId) {
        try {
            const ids = this._getUserRecordIds(userId);
            return ids.map(id => this.getRecord(id)).filter(Boolean);
        } catch (e) {
            console.error('InfoDB: Error getting user records:', e);
            return [];
        }
    }

    updateRecord(recordId, updatedData) {
        try {
            const existing = this.getRecord(recordId);
            if (!existing) throw new Error('Record not found');
            const updated = { ...existing, ...updatedData, id: recordId };
            this._saveRecord(recordId, updated);
            return updated;
        } catch (e) {
            console.error('InfoDB: Error updating record:', e);
            throw e;
        }
    }

    deleteRecord(recordId, userId) {
        try {
            localStorage.removeItem(this.prefix + recordId);
            this._updateUserRecords(userId, recordId, false);
            return true;
        } catch (e) {
            console.error('InfoDB: Error deleting record:', e);
            return false;
        }
    }

    getRecord(recordId) {
        try {
            const data = localStorage.getItem(this.prefix + recordId);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('InfoDB: Error getting record:', e);
            return null;
        }
    }
    _saveRecord(id, record) {
        localStorage.setItem(this.prefix + id, JSON.stringify(record));
    }

    _getUserRecordIds(userId) {
        const data = localStorage.getItem(this.userRecordsKey + userId);
        return data ? JSON.parse(data) : [];
    }

    _updateUserRecords(userId, recordId, add) {
        try {
            const key = this.userRecordsKey + userId;
            let ids = this._getUserRecordIds(userId).map(Number);
            const id = Number(recordId);
            ids = add ? (ids.includes(id) ? ids : [...ids, id]) : ids.filter(x => x !== id);
            localStorage.setItem(key, JSON.stringify(ids));
        } catch (e) {
            console.error('InfoDB: Error updating user records:', e);
        }
    }
}

export default InfoDB;
