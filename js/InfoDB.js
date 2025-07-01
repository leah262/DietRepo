import DB from "./DB.js";

class InfoDB extends DB {
    constructor() {
        super();
        this.prefix = 'diet_'; // קידומת לרשומות דיאטה
        this.userRecordsKey = 'user_records_'; // קידומת למעקב אחר רשומות משתמש
    }

    // הוספת רשומה חדשה
    addRecord(record) {
        try {
            const recordId = this.id;
            record.id = recordId;
            record.timestamp = record.timestamp || new Date().toISOString();

            // שמירת הרשומה
            const recordKey = this.prefix + recordId;
            this.post(JSON.stringify(record), recordKey);

            // עדכון רשימת הרשומות של המשתמש
            this.addToUserRecords(record.userId, recordId);

            return recordId;
        } catch (error) {
            console.error('InfoDB: Error adding record:', error);
            throw error;
        }
    }
    // תיקון פונקציית הוספה לרשימת המשתמש
    addToUserRecords(userId, recordId) {
        try {
            const userRecordsKey = this.userRecordsKey + userId;
            let recordIds = localStorage.getItem(userRecordsKey);

            if (!recordIds) {
                recordIds = [];
            } else {
                recordIds = JSON.parse(recordIds);
            }

            // המרה לנומבר לוודא התאמה
            const numericRecordId = parseInt(recordId);
            if (!recordIds.includes(numericRecordId)) {
                recordIds.push(numericRecordId);
                localStorage.setItem(userRecordsKey, JSON.stringify(recordIds));
            }
        } catch (error) {
            console.error('InfoDB: Error adding to user records:', error);
        }
    }

    // תיקון פונקציית הסרה מרשימת המשתמש
    removeFromUserRecords(userId, recordId) {
        try {
            const userRecordsKey = this.userRecordsKey + userId;
            let recordIds = localStorage.getItem(userRecordsKey);

            if (recordIds) {
                recordIds = JSON.parse(recordIds);
                // המרה לנומבר לוודא התאמה
                const numericRecordId = parseInt(recordId);
                const filteredIds = recordIds.filter(id => parseInt(id) !== numericRecordId);
                localStorage.setItem(userRecordsKey, JSON.stringify(filteredIds));
            }
        } catch (error) {
            console.error('InfoDB: Error removing from user records:', error);
        }
    }

    // תיקון פונקציית קבלת רשומות המשתמש
    getRecordsByUserId(userId) {
        try {
            const userRecordsKey = this.userRecordsKey + userId;
            const recordIds = localStorage.getItem(userRecordsKey);

            if (!recordIds) {
                return [];
            }

            const ids = JSON.parse(recordIds);
            const records = [];

            for (const id of ids) {
                const recordKey = this.prefix + id;
                const recordData = localStorage.getItem(recordKey);
                if (recordData) {
                    try {
                        const parsedRecord = JSON.parse(recordData);
                        records.push(parsedRecord);
                    } catch (parseError) {
                        console.error(`Error parsing record ${id}:`, parseError);
                    }
                }
            }

            return records;
        } catch (error) {
            console.error('InfoDB: Error getting user records:', error);
            return [];
        }
    }

    // עדכון רשומה
    updateRecord(recordId, updatedData) {
        try {
            const recordKey = this.prefix + recordId;
            const existingData = localStorage.getItem(recordKey);

            if (!existingData) {
                throw new Error('Record not found');
            }

            const existingRecord = JSON.parse(existingData);
            const updatedRecord = { ...existingRecord, ...updatedData, id: recordId };

            localStorage.setItem(recordKey, JSON.stringify(updatedRecord));
            return updatedRecord;
        } catch (error) {
            console.error('InfoDB: Error updating record:', error);
            throw error;
        }
    }

    // מחיקת רשומה
    deleteRecord(recordId, userId) {
        try {
            const recordKey = this.prefix + recordId;

            // מחיקת הרשומה
            localStorage.removeItem(recordKey);

            // הסרה מרשימת הרשומות של המשתמש
            this.removeFromUserRecords(userId, recordId);

            return true;
        } catch (error) {
            console.error('InfoDB: Error deleting record:', error);
            return false;
        }
    }

    // הוספה לרשימת הרשומות של המשתמש
    // קבלת רשומה בודדת
    getRecord(recordId) {
        try {
            const recordKey = this.prefix + recordId;
            const recordData = localStorage.getItem(recordKey);
            return recordData ? JSON.parse(recordData) : null;
        } catch (error) {
            console.error('InfoDB: Error getting record:', error);
            return null;
        }
    }
}

export default InfoDB;