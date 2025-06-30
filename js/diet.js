import FXMLHttpRequest from "./FXMLHttpRequest.js";
import DietUI from "./diet2.js";

class Diet {
    constructor() {
        this.userId = JSON.parse(sessionStorage.getItem('currentUser')).id;
        this.entries = [];
        this.currentEditId = null;
        this.filters = {
            date: 'all',
            meal: 'all'
        };
        this.ui = new DietUI(this);
    }

    init() {
        this.loadEntries();
        this.setupEventListeners();
        this.setTodaysDate();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('diaryForm').addEventListener('submit', this.handleAddEntry.bind(this));
        
        // Filters
        document.getElementById('dateFilter').addEventListener('change', this.handleDateFilter.bind(this));
        document.getElementById('mealFilter').addEventListener('change', this.handleMealFilter.bind(this));
        
        // Modal events
        document.getElementById('closeModal').addEventListener('click', this.closeModal.bind(this));
        document.getElementById('cancelEdit').addEventListener('click', this.closeModal.bind(this));
        document.getElementById('editForm').addEventListener('submit', this.handleEditEntry.bind(this));
        
        // Close modal on outside click
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.id === 'editModal') {
                this.closeModal();
            }
        });
    }

    setTodaysDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    loadEntries() {
        if (this.userId) {
            const fxhr = new FXMLHttpRequest();
            fxhr.addEventListener('onReadyStateChange', this.handleLoadResponse.bind(this));
            fxhr.open('GET', `https://fake.server/api/Info-Servers/records/${this.userId}?method=GET`);
            fxhr.send(null);
        }
    }

    handleLoadResponse(e) {
        const fxhr = e.target;
        if (fxhr.state === 4) {
            const response = JSON.parse(fxhr.responseText);
            console.log("Load response:", response);
            
            if (response && response.success) {
                this.entries = response.data || [];
                this.ui.renderEntries();
                this.ui.updateStats();
            } else {
                console.error("Load failed:", response);
                this.ui.showError('שגיאה בטעינת הנתונים');
            }
        }
    }

    handleAddEntry(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const entry = {
            name: formData.get('meal'),
            calories: parseInt(formData.get('calories')),
            date: formData.get('date'),
            mealType: formData.get('mealType'),
            userId: this.userId,
            timestamp: new Date().toISOString()
        };

        // Validate entry
        if (!this.validateEntry(entry)) {
            return;
        }

        this.addEntryToServer(entry);
    }

    validateEntry(entry) {
        if (!entry.name.trim()) {
            this.ui.showError('נא להזין שם מאכל');
            return false;
        }
        if (!entry.calories || entry.calories <= 0) {
            this.ui.showError('נא להזין מספר קלוריות חיובי');
            return false;
        }
        if (!entry.date) {
            this.ui.showError('נא לבחור תאריך');
            return false;
        }
        if (!entry.mealType) {
            this.ui.showError('נא לבחור סוג ארוחה');
            return false;
        }
        return true;
    }

    addEntryToServer(entry) {
        const fxhr = new FXMLHttpRequest();
        fxhr.addEventListener('onReadyStateChange', this.handleAddResponse.bind(this));
        fxhr.open('POST', 'https://fake.server/api/Info-Servers/records');
        fxhr.send(entry);
    }

    handleAddResponse(e) {
        const fxhr = e.target;
        if (fxhr.state === 4) {
            const response = JSON.parse(fxhr.responseText);
            console.log("Add response:", response);
            
            if (response && response.success) {
                this.ui.showSuccess('הרשומה נוספה בהצלחה! 🎉');
                document.getElementById('diaryForm').reset();
                this.setTodaysDate();
                this.loadEntries(); // Reload to get updated data
            } else {
                console.error("Add failed:", response);
                this.ui.showError('שגיאה בהוספת הרשומה');
            }
        }
    }

    handleEditEntry(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const updatedEntry = {
            id: this.currentEditId,
            name: formData.get('meal'),
            calories: parseInt(formData.get('calories')),
            date: formData.get('date'),
            mealType: formData.get('mealType'),
            userId: this.userId
        };

        if (!this.validateEntry(updatedEntry)) {
            return;
        }

        this.updateEntryOnServer(updatedEntry);
    }

    updateEntryOnServer(entry) {
        const fxhr = new FXMLHttpRequest();
        fxhr.addEventListener('onReadyStateChange', this.handleUpdateResponse.bind(this));
        fxhr.open('PUT', `https://fake.server/api/Info-Servers/records/${entry.id}`);
        fxhr.send(entry);
    }

    handleUpdateResponse(e) {
        const fxhr = e.target;
        if (fxhr.state === 4) {
            const response = JSON.parse(fxhr.responseText);
            console.log("Update response:", response);
            
            if (response && response.success) {
                this.ui.showSuccess('הרשומה עודכנה בהצלחה! ✨');
                this.closeModal();
                this.loadEntries();
            } else {
                console.error("Update failed:", response);
                this.ui.showError('שגיאה בעדכון הרשומה');
            }
        }
    }

    deleteEntry(entryId) {
        if (confirm('את בטוחה שאת רוצה למחוק את הרשומה הזו?')) {
            const fxhr = new FXMLHttpRequest();
            fxhr.addEventListener('onReadyStateChange', this.handleDeleteResponse.bind(this));
            fxhr.open('DELETE', `https://fake.server/api/Info-Servers/records/${entryId}`);
            fxhr.send({ id: entryId, userId: this.userId });
        }
    }

    handleDeleteResponse(e) {
        const fxhr = e.target;
        if (fxhr.state === 4) {
            const response = JSON.parse(fxhr.responseText);
            console.log("Delete response:", response);
            
            if (response && response.success) {
                this.ui.showSuccess('הרשומה נמחקה בהצלחה! 🗑️');
                this.loadEntries();
            } else {
                console.error("Delete failed:", response);
                this.ui.showError('שגיאה במחיקת הרשומה');
            }
        }
    }

    editEntry(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (entry) {
            this.currentEditId = entryId;
            document.getElementById('editId').value = entryId;
            document.getElementById('editMeal').value = entry.name;
            document.getElementById('editCalories').value = entry.calories;
            document.getElementById('editDate').value = entry.date;
            document.getElementById('editMealType').value = entry.mealType;
            document.getElementById('editModal').style.display = 'flex';
        }
    }

    closeModal() {
        document.getElementById('editModal').style.display = 'none';
        this.currentEditId = null;
        document.getElementById('editForm').reset();
    }

    handleDateFilter(e) {
        this.filters.date = e.target.value;
        this.ui.renderEntries();
        this.ui.updateStats();
    }

    handleMealFilter(e) {
        this.filters.meal = e.target.value;
        this.ui.renderEntries();
    }

    filterEntries() {
        return this.entries.filter(entry => {
            const dateMatch = this.ui.filterByDate(entry, this.filters.date);
            const mealMatch = this.filters.meal === 'all' || entry.mealType === this.filters.meal;
            return dateMatch && mealMatch;
        });
    }

    // Getter methods for UI access
    getEntries() {
        return this.entries;
    }

    getFilteredEntries() {
        return this.filterEntries();
    }
}

export default Diet;