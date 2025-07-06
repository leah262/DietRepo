import FXMLHttpRequest from "./FXMLHttpRequest.js";
import { logout } from './app.js';
import DietAPI from './DietAPI.js';
import DietRenderer from './DietRenderer.js';
import DietNotifications from './DietNotifications.js';

class DietCore extends DietAPI {
    constructor() {
        super();
        this.initializeProperties();
        this.renderer = new DietRenderer();
        this.notifications = new DietNotifications();
        this.renderer.diet = this;
        this.ui = this.notifications; 
        console.log("userId", this.userId);
        this.initWhenReady();
        this.setupNetworkErrorListener();
    }

    initializeProperties() {
        this.userId = JSON.parse(sessionStorage.getItem('currentUser')).id;
        this.entries = [];
        this.currentEditId = null;
        this.filters = { date: 'all', meal: 'all' };
        this.lastDeletedId = null; // לשמירת ID האחרון שנמחק
    }

    setupNetworkErrorListener() {
        window.addEventListener('networkError', this.handleNetworkError.bind(this));
    }

    handleNetworkError() {
        this.stopAllLoadingSpinners();
        this.ui.showError('שגיאת רשת - הבקשה נדחתה');
    }

    stopAllLoadingSpinners() {
        const buttons = [
            { selector: '#diaryForm button[type="submit"]', text: 'הוסף רשומה' },
            { selector: '#editForm button[type="submit"]', text: 'עדכן רשומה' },
            { selector: '[data-action="delete"]', text: 'מחק' }
        ];
        
        buttons.forEach(btn => {
            const element = document.querySelector(btn.selector);
            if (element) this.ui.removeLoadingSpinner(element, btn.text);
        });
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
        this.setupAllListeners();
        this.setTodaysDate();
        this.editName(); // עדכון שם המשתמש
    }

    setupAllListeners() {
        console.log("Setting up event listeners");
        this.setupFormListener();
        this.setupFilterListeners();
        this.setupModalListeners();
        this.setupLogoutButton();
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
        const filters = [
            { id: 'dateFilter', handler: this.handleDateFilter },
            { id: 'mealFilter', handler: this.handleMealFilter }
        ];

        filters.forEach(filter => {
            const element = document.getElementById(filter.id);
            if (element) {
                element.addEventListener('change', filter.handler.bind(this));
            }
        });
    }

    setupModalListeners() {
        const modalElements = [
            { id: 'closeModal', event: 'click', handler: this.closeModal },
            { id: 'cancelEdit', event: 'click', handler: this.closeModal },
            { id: 'editForm', event: 'submit', handler: this.handleEditEntry },
            { id: 'editModal', event: 'click', handler: this.handleModalClick }
        ];

        modalElements.forEach(element => {
            const el = document.getElementById(element.id);
            if (el) {
                el.addEventListener(element.event, element.handler.bind(this));
            }
        });
    }

    setupLogoutButton() {
        const logoutBtn = document.getElementById('logout-btn');
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
            this.lastDeletedId = entryId; // שמירת ID למחיקה
            const deleteBtn = document.querySelector(`[data-action="delete"][data-id="${entryId}"]`);
            this.ui.showLoadingSpinner(deleteBtn, 'מחק');
            this.performDelete(entryId);
        }
    }

    editEntry(entryId) {
        const numericId = parseInt(entryId);
        const entry = this.entries.find(e => parseInt(e.id) === numericId);
        if (entry) {
            this.populateEditModal(entry, numericId);
        } else {
            console.error('Entry not found:', entryId, 'Available entries:', this.entries);
        }
    }

    populateEditModal(entry, numericId) {
        this.currentEditId = numericId;
        const fields = [
            { id: 'editId', value: numericId },
            { id: 'editMeal', value: entry.name },
            { id: 'editCalories', value: entry.calories },
            { id: 'editDate', value: entry.date },
            { id: 'editMealType', value: entry.mealType }
        ];

        fields.forEach(field => {
            document.getElementById(field.id).value = field.value;
        });
        
        document.getElementById('editModal').style.display = 'flex';
    }

    closeModal() {
        const modal = document.getElementById('editModal');
        if (modal) modal.style.display = 'none';
        
        this.currentEditId = null;
        
        const editForm = document.getElementById('editForm');
        if (editForm) editForm.reset();
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
        const validators = [
            { field: 'name', value: entry.name, message: 'נא להזין שם מאכל' },
            { field: 'calories', value: entry.calories, message: 'נא להזין מספר קלוריות חיובי' },
            { field: 'date', value: entry.date, message: 'נא לבחור תאריך' },
            { field: 'mealType', value: entry.mealType, message: 'נא לבחור סוג ארוחה' }
        ];

        for (const validator of validators) {
            if (!this.validateField(validator.field, validator.value)) {
                this.ui.showError(validator.message);
                return false;
            }
        }
        return true;
    }

    validateField(field, value) {
        switch (field) {
            case 'name':
                return value && value.trim();
            case 'calories':
                return value && value > 0;
            case 'date':
            case 'mealType':
                return value;
            default:
                return true;
        }
    }

    resetForm() {
        const form = document.getElementById('diaryForm');
        if (form) form.reset();
    }

    getEntries() {
        return this.entries;
    }

    getFilteredEntries() {
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
        if (currentUser && currentUser.firstName) {
            const titleElement = document.getElementById('diary-titles');
            if (titleElement) {
                titleElement.textContent = `יומן התזונה של ${currentUser.firstName}`;
            }
        }
    }

    setTodaysDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.value = today;
        }
    }

    // Success handlers - מעודכן ללא טעינה מחדש
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
        // אין צורך לטעון מחדש - כבר עודכן מקומית
    }

    handleUpdateSuccess() {
        const updateBtn = document.querySelector('#editForm button[type="submit"]');
        this.ui.removeLoadingSpinner(updateBtn, 'עדכן רשומה');
        this.ui.showSuccess('הרשומה עודכנה בהצלחה! ✨');
        this.closeModal();
        // אין צורך לטעון מחדש - כבר עודכן מקומית
    }

    handleDeleteSuccess() {
        const deleteBtn = document.querySelector(`[data-action="delete"].loading`);
        if (deleteBtn) {
            this.ui.removeLoadingSpinner(deleteBtn, 'מחק');
        }
        this.ui.showSuccess('הרשומה נמחקה בהצלחה! 🗑️');
        // אין צורך לטעון מחדש - כבר עודכן מקומית
    }

    // Error handlers - טיפול בשגיאות
    handleAddError(response) {
        const submitBtn = document.querySelector('#diaryForm button[type="submit"]');
        this.ui.removeLoadingSpinner(submitBtn, 'הוסף רשומה');
        this.ui.showError('שגיאה בהוספת הרשומה');
    }

    handleUpdateError(response) {
        const updateBtn = document.querySelector('#editForm button[type="submit"]');
        this.ui.removeLoadingSpinner(updateBtn, 'עדכן רשומה');
        this.ui.showError('שגיאה בעדכון הרשומה');
    }

    handleDeleteError(response) {
        const deleteBtn = document.querySelector(`[data-action="delete"].loading`);
        if (deleteBtn) {
            this.ui.removeLoadingSpinner(deleteBtn, 'מחק');
        }
        this.ui.showError('שגיאה במחיקת הרשומה');
    }
}

export default DietCore;