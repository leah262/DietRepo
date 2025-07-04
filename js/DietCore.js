import FXMLHttpRequest from "./FXMLHttpRequest.js";
import { logout } from './app.js';
import DietAPI from './DietAPI.js';
import DietActions from './DietActions.js';
import DietRenderer from './DietRenderer.js';
import DietNotifications from './DietNotifications.js';
class DietCore extends DietAPI {
    constructor() {
        super();
        this.initializeProperties();
        this.renderer = new DietRenderer();
        this.actions = new DietActions();
        this.notifications = new DietNotifications();
        this.renderer.diet = this;
        this.actions.diet = this;
        this.actions.ui = this.notifications;
        this.ui = this.notifications; 
        console.log("userId", this.userId);
        this.initWhenReady();
        this.setupNetworkErrorListener();
    }

    setupNetworkErrorListener() {
        window.addEventListener('networkError', this.handleNetworkError.bind(this));
    }

    handleNetworkError() {
        // עצירת כל עיגולי הטעינה
        this.stopAllLoadingSpinners();
        this.ui.showError('שגיאת רשת - הבקשה נדחתה');
    }

    stopAllLoadingSpinners() {
        const submitBtn = document.querySelector('#diaryForm button[type="submit"]');
        const updateBtn = document.querySelector('#editForm button[type="submit"]');
        const deleteButtons = document.querySelectorAll('[data-action="delete"]');
        
        if (submitBtn) {
            this.ui.removeLoadingSpinner(submitBtn, 'הוסף רשומה');
        }
        if (updateBtn) {
            this.ui.removeLoadingSpinner(updateBtn, 'עדכן רשומה');
        }
        deleteButtons.forEach(btn => {
            this.ui.removeLoadingSpinner(btn, 'מחק');
        });
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
            const submitBtn = document.querySelector('#diaryForm button[type="submit"]');
            this.ui.showLoadingSpinner(submitBtn, 'הוסף רשומה');
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
            const updateBtn = document.querySelector('#editForm button[type="submit"]');
            this.ui.showLoadingSpinner(updateBtn, 'עדכן רשומה');
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
            const deleteBtn = document.querySelector(`[data-action="delete"][data-id="${entryId}"]`);
            this.ui.showLoadingSpinner(deleteBtn, 'מחק');
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
        this.refreshUI();
    }
    refreshUI() {
        this.renderer.renderEntries();
        this.renderer.updateStats();
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
    getEntries() {
        return this.entries;
    }
    getFilteredEntries() {
        return this.filterEntries();
    }
    filterEntries() {
        return this.entries.filter(entry => {
            const dateMatch = this.renderer.filterByDate(entry, this.filters.date);
            const mealMatch = this.filters.meal === 'all' || entry.mealType === this.filters.meal;
            return dateMatch && mealMatch;
        });
    }
    clearCurrentInstance() {
        this.entries = [];
        this.currentEditId = null;
    }
    editName() {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const titleElement = document.getElementById('diary-titles');
        if (titleElement) {
            titleElement.textContent = currentUser.firstName;
        }
    }
    setTodaysDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.value = today;
        }
    }

    // Override של מתודות מ-DietAPI לעדכון ה-UI
    updateEntriesFromResponse(response) {
        this.entries = response.data || [];
        sessionStorage.setItem('userEntries', JSON.stringify(this.entries));
        this.renderer.renderEntries();
        this.renderer.updateStats();
    }
    handleAddSuccess(response) {
        const submitBtn = document.querySelector('#diaryForm button[type="submit"]');
        this.ui.removeLoadingSpinner(submitBtn, 'הוסף רשומה');
        this.ui.showSuccess('הרשומה נוספה בהצלחה! 🎉');
        this.resetForm();
        this.setTodaysDate();
        this.loadEntries();
    }
    handleUpdateSuccess() {
        const updateBtn = document.querySelector('#editForm button[type="submit"]');
        this.ui.removeLoadingSpinner(updateBtn, 'עדכן רשומה');
        this.ui.showSuccess('הרשומה עודכנה בהצלחה! ✨');
        this.closeModal();
        this.loadEntries();
    }
    handleDeleteSuccess() {
        // מוצא את הכפתור המחיקה הנכון
        const deleteBtn = document.querySelector(`[data-action="delete"].loading`);
        if (deleteBtn) {
            this.ui.removeLoadingSpinner(deleteBtn, 'מחק');
        }
        this.ui.showSuccess('הרשומה נמחקה בהצלחה! 🗑️');
        this.loadEntries();
    }
    handleLoadError(response) {
        console.error("Load failed:", response);
        this.ui.showError('שגיאה בטעינת הנתונים');
    }
    handleAddError(response) {
        console.error("Add failed:", response);
        const submitBtn = document.querySelector('#diaryForm button[type="submit"]');
        this.ui.removeLoadingSpinner(submitBtn, 'הוסף רשומה');
        this.ui.showError('שגיאה בהוספת הרשומה');
    }
    handleUpdateError(response) {
        console.error("Update failed:", response);
        const updateBtn = document.querySelector('#editForm button[type="submit"]');
        this.ui.removeLoadingSpinner(updateBtn, 'עדכן רשומה');
        this.ui.showError('שגיאה בעדכון הרשומה');
    }
    handleDeleteError(response) {
        console.error("Delete failed:", response);
        const deleteBtn = document.querySelector(`[data-action="delete"].loading`);
        if (deleteBtn) {
            this.ui.removeLoadingSpinner(deleteBtn, 'מחק');
        }
        this.ui.showError('שגיאה במחיקת הרשומה');
    }
}

export default DietCore;