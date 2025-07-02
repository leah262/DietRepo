// import FXMLHttpRequest from "./FXMLHttpRequest.js";
// import { logout } from './App.js';
// import DietAPI from './DietAPI.js';
// import DietRenderer from './DietRenderer.js';
// import DietNotifications from './DietNotifications.js';
// import DietCore from './DietCore.js'
class DietActions {
    setupEventListeners() {
        console.log("Setting up event listeners");
        this.setupFormListener();
        this.setupFilterListeners();
        this.setupModalListeners();
    }
    setupFormListener() {
        const diaryForm = document.getElementById('diaryForm');
        if (diaryForm) {
            diaryForm.addEventListener('submit', this.handleAddEntry.bind(this));
            console.log("Form event listener added");
        } else {
            console.error("diaryForm not found!");
        }
    }
    setupFilterListeners() {
        const dateFilter = document.getElementById('dateFilter');
        const mealFilter = document.getElementById('mealFilter');
        if (dateFilter) {
            dateFilter.addEventListener('change', this.handleDateFilter.bind(this));
        }
        if (mealFilter) {
            mealFilter.addEventListener('change', this.handleMealFilter.bind(this));
        }
    }

    setupModalListeners() {
        const closeModal = document.getElementById('closeModal');
        const cancelEdit = document.getElementById('cancelEdit');
        const editForm = document.getElementById('editForm');
        const editModal = document.getElementById('editModal');

        if (closeModal) {
            closeModal.addEventListener('click', this.closeModal.bind(this));
        }
        if (cancelEdit) {
            cancelEdit.addEventListener('click', this.closeModal.bind(this));
        }
        if (editForm) {
            editForm.addEventListener('submit', this.handleEditEntry.bind(this));
        }
        if (editModal) {
            editModal.addEventListener('click', this.handleModalClick.bind(this));
        }
    }
    setupLogoutButton() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }
    }
    handleLogout() {
        if (confirm('את בטוחה שאת רוצה להתנתק?')) {
            this.clearCurrentInstance();
            logout();
        }
    }
    handleModalClick(e) {
        if (e.target.id === 'editModal') {
            this.closeModal();
        }
    }
    handleAddEntry(e) {
        console.log("handleAddEntry called");
        e.preventDefault();
        console.log("preventDefault called");
        const entry = this.createEntryFromForm(e.target);
        console.log("Entry data:", entry);
        if (this.validateEntry(entry)) {
            this.addEntryToServer(entry);
        }
    }
    createEntryFromForm(form) {
        const formData = new FormData(form);
        return {
            name: formData.get('meal'),
            calories: parseInt(formData.get('calories')),
            date: formData.get('date'),
            mealType: formData.get('mealType'),
            userId: this.userId,
            timestamp: new Date().toISOString()
        };
    }
    resetForm() {
        const form = document.getElementById('diaryForm');
        if (form) {
            form.reset();
        }
    }
    handleEditEntry(e) {
        e.preventDefault();
        const updatedEntry = this.createUpdatedEntry(e.target);
        if (this.validateEntry(updatedEntry)) {
            this.updateEntryOnServer(updatedEntry);
        }
    }

    createUpdatedEntry(form) {
        const formData = new FormData(form);
        return {
            id: this.currentEditId,
            name: formData.get('meal'),
            calories: parseInt(formData.get('calories')),
            date: formData.get('date'),
            mealType: formData.get('mealType'),
            userId: this.userId
        };
    }
    deleteEntry(entryId) {
        if (confirm('את בטוחה שאת רוצה למחוק את הרשומה הזו?')) {
            this.performDelete(entryId);
        }
    }
    editEntry(entryId) {
        const numericId = parseInt(entryId);
        const entry = this.findEntryById(numericId);
        if (entry) {
            this.populateEditModal(entry, numericId);
        } else {
            this.logEntryNotFound(entryId);
        }
    }
    findEntryById(numericId) {
        return this.entries.find(e => parseInt(e.id) === numericId);
    }
     populateEditModal(entry, numericId) {
        this.currentEditId = numericId;
        document.getElementById('editId').value = numericId;
        document.getElementById('editMeal').value = entry.name;
        document.getElementById('editCalories').value = entry.calories;
        document.getElementById('editDate').value = entry.date;
        document.getElementById('editMealType').value = entry.mealType;
        document.getElementById('editModal').style.display = 'flex';
    }
     logEntryNotFound(entryId) {
        console.error('Entry not found:', entryId, 'Available entries:', this.entries);
    }
    closeModal() {
        this.hideModal();
        this.resetEditState();
        this.resetEditForm();
    }
     hideModal() {
        const modal = document.getElementById('editModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    resetEditState() {
        this.currentEditId = null;
    }

    resetEditForm() {
        const editForm = document.getElementById('editForm');
        if (editForm) {
            editForm.reset();
        }
    }
      handleDateFilter(e) {
        this.filters.date = e.target.value;
        this.refreshUI();
    }

    handleMealFilter(e) {
        this.filters.meal = e.target.value;
        this.ui.renderEntries();
    }

    refreshUI() {
        this.ui.renderEntries();
        this.ui.updateStats();
    }
    
       validateEntry(entry) {
        return this.validateName(entry.name) &&
            this.validateCalories(entry.calories) &&
            this.validateDate(entry.date) &&
            this.validateMealType(entry.mealType);
    }

    validateName(name) {
        if (!name || !name.trim()) {
            this.ui.showError('נא להזין שם מאכל');
            return false;
        }
        return true;
    }

    validateCalories(calories) {
        if (!calories || calories <= 0) {
            this.ui.showError('נא להזין מספר קלוריות חיובי');
            return false;
        }
        return true;
    }

    validateDate(date) {
        if (!date) {
            this.ui.showError('נא לבחור תאריך');
            return false;
        }
        return true;
    }

    validateMealType(mealType) {
        if (!mealType) {
            this.ui.showError('נא לבחור סוג ארוחה');
            return false;
        }
        return true;
    }

}
export default DietActions;