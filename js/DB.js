class DB {
    constructor() {
        this.init();
    }

    init() {
        // אתחול מונה ה-ID
        if (!localStorage.getItem('dbCounter')) {
            localStorage.setItem('dbCounter', '1');
        }
    }

    get id() {
        return parseInt(localStorage.getItem('dbCounter')) || 1;
    }

    set id(value) {
        localStorage.setItem('dbCounter', value.toString());
    }

    // שמירת נתונים
    post(data, id = null) {
        try {
            const recordId = id || this.id;
            localStorage.setItem(recordId.toString(), data);
            
            if (!id) {
                this.id = recordId + 1;
            }
            
            console.log(`DB: Data saved with ID ${recordId}`);
            return recordId;
        } catch (error) {
            console.error('DB: Error saving data:', error);
            throw error;
        }
    }

    // קריאת נתונים לפי ID
    readById(id) {
        try {
            const data = localStorage.getItem(id.toString());
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('DB: Error reading data:', error);
            return null;
        }
    }

    // מחיקת נתונים לפי ID
    deleteById(id) {
        try {
            localStorage.removeItem(id.toString());
            console.log(`DB: Record ${id} deleted`);
            return true;
        } catch (error) {
            console.error('DB: Error deleting data:', error);
            return false;
        }
    }

    // מחיקת כל הנתונים
    clearAll() {
        try {
            localStorage.clear();
            this.init();
            console.log('DB: All data cleared');
            return true;
        } catch (error) {
            console.error('DB: Error clearing data:', error);
            return false;
        }
    }
}

export default DB;