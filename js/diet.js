import FXMLHttpRequest from "./FXMLHttpRequest.js";
import DietUI from "./diet2.js";
import { logout } from './app.js';

console.log("loadeddddd");

class Diet {
    constructor() {
        this.initializeProperties();
        this.ui = new DietUI(this);
        console.log("userId", this.userId);
        this.initWhenReady();
    }

    initializeProperties() {
        this.userId = JSON.parse(sessionStorage.getItem('currentUser')).id;
        this.entries = [];
        this.currentEditId = null;
        this.filters = { date: 'all', meal: 'all' };
    }

    initWhenReady() {
        if (document.getElementById('diaryForm')) {
            this.init();
        } else {
            this.waitForPageLoad();
        }
    }

    waitForPageLoad() {
        document.addEventListener('pageLoaded', (e) => {
            if (e.detail.pageName === 'diary') {
                console.log("Diet page loaded, initializing...");
                this.init();
            }
        });
    }

    init() {
        console.log("Diet init called");
        this.loadEntries();
        this.setupEventListeners();
        this.setTodaysDate();
        this.editName();
        this.setupLogoutButton();
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

    clearCurrentInstance() {
        this.entries = [];
        this.currentEditId = null;
    }

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

    handleModalClick(e) {
        if (e.target.id === 'editModal') {
            this.closeModal();
        }
    }

    editName() {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const titleElement = document.getElementById('diary-titles');
        titleElement.textContent = currentUser.firstName;
    }

    setTodaysDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.value = today;
        }
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
            this.processLoadResponse(fxhr);
        }
    }

    processLoadResponse(fxhr) {
        const response = JSON.parse(fxhr.responseText);
        console.log("Load response:", response);
        if (response && response.success) {
            this.updateEntriesFromResponse(response);
        } else {
            this.handleLoadError(response);
        }
    }

    updateEntriesFromResponse(response) {
        this.entries = response.data || [];
        this.ui.renderEntries();
        this.ui.updateStats();
    }

    handleLoadError(response) {
        console.error("Load failed:", response);
        this.ui.showError('שגיאה בטעינת הנתונים');
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

    addEntryToServer(entry) {
        console.log("Sending entry to server:", entry);
        const fxhr = new FXMLHttpRequest();
        fxhr.addEventListener('onReadyStateChange', this.handleAddResponse.bind(this));
        fxhr.open('POST', 'https://fake.server/api/Info-Servers/records?method=POST');
        fxhr.send(entry);
    }

    handleAddResponse(e) {
        const fxhr = e.target;
        if (fxhr.state === 4) {
            this.processAddResponse(fxhr);
        }
    }

    processAddResponse(fxhr) {
        const response = JSON.parse(fxhr.responseText);
        console.log("Add response:", response);
        if (response && response.success) {
            this.handleAddSuccess(response);
        } else {
            this.handleAddError(response);
        }
    }

    handleAddSuccess(response) {
        this.ui.showSuccess('הרשומה נוספה בהצלחה! 🎉');
        this.resetForm();
        this.setTodaysDate();
        this.loadEntries();
    }

    handleAddError(response) {
        console.error("Add failed:", response);
        this.ui.showError('שגיאה בהוספת הרשומה');
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

    updateEntryOnServer(entry) {
        const fxhr = new FXMLHttpRequest();
        fxhr.addEventListener('onReadyStateChange', this.handleUpdateResponse.bind(this));
        fxhr.open('PUT', `https://fake.server/api/Info-Servers/records/${entry.id}?method=PUT`);
        fxhr.send(entry);
    }

    handleUpdateResponse(e) {
        const fxhr = e.target;
        if (fxhr.state === 4) {
            this.processUpdateResponse(fxhr);
        }
    }

    processUpdateResponse(fxhr) {
        const response = JSON.parse(fxhr.responseText);
        console.log("Update response:", response);
        if (response && response.success) {
            this.handleUpdateSuccess();
        } else {
            this.handleUpdateError(response);
        }
    }

    handleUpdateSuccess() {
        this.ui.showSuccess('הרשומה עודכנה בהצלחה! ✨');
        this.closeModal();
        this.loadEntries();
    }

    handleUpdateError(response) {
        console.error("Update failed:", response);
        this.ui.showError('שגיאה בעדכון הרשומה');
    }

    deleteEntry(entryId) {
        if (confirm('את בטוחה שאת רוצה למחוק את הרשומה הזו?')) {
            this.performDelete(entryId);
        }
    }

    performDelete(entryId) {
        const numericId = parseInt(entryId);
        const fxhr = new FXMLHttpRequest();
        fxhr.addEventListener('onReadyStateChange', this.handleDeleteResponse.bind(this));
        fxhr.open('DELETE', `https://fake.server/api/Info-Servers/records/${numericId}?method=DELETE`);
        fxhr.send({ id: numericId, userId: this.userId });
    }

    handleDeleteResponse(e) {
        const fxhr = e.target;
        if (fxhr.state === 4) {
            this.processDeleteResponse(fxhr);
        }
    }

    processDeleteResponse(fxhr) {
        const response = JSON.parse(fxhr.responseText);
        console.log("Delete response:", response);
        if (response && response.success) {
            this.handleDeleteSuccess();
        } else {
            this.handleDeleteError(response);
        }
    }

    handleDeleteSuccess() {
        this.ui.showSuccess('הרשומה נמחקה בהצלחה! 🗑️');
        this.loadEntries();
    }

    handleDeleteError(response) {
        console.error("Delete failed:", response);
        this.ui.showError('שגיאה במחיקת הרשומה');
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

    filterEntries() {
        return this.entries.filter(entry => {
            const dateMatch = this.ui.filterByDate(entry, this.filters.date);
            const mealMatch = this.filters.meal === 'all' || entry.mealType === this.filters.meal;
            return dateMatch && mealMatch;
        });
    }

    getEntries() {
        return this.entries;
    }

    getFilteredEntries() {
        return this.filterEntries();
    }
}

export default Diet;