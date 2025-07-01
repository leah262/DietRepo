class DietUI {
    constructor(dietInstance) {
        this.diet = dietInstance;
    }

    renderEntries() {
        const entriesList = document.getElementById('entriesList');
        const emptyState = document.getElementById('emptyState');
        const filteredEntries = this.diet.getFilteredEntries();
        
        if (filteredEntries.length === 0) {
            this.showEmptyState(entriesList, emptyState);
            return;
        }
        
        this.showEntriesList(entriesList, emptyState);
        this.populateEntriesList(entriesList, filteredEntries);
        this.setupEntryActionListeners();
    }

    showEmptyState(entriesList, emptyState) {
        entriesList.style.display = 'none';
        emptyState.style.display = 'block';
    }

    showEntriesList(entriesList, emptyState) {
        entriesList.style.display = 'grid';
        emptyState.style.display = 'none';
    }

    populateEntriesList(entriesList, filteredEntries) {
        const sortedEntries = this.sortEntriesByDate(filteredEntries);
        entriesList.innerHTML = sortedEntries.map(entry => this.createEntryCard(entry)).join('');
    }

    sortEntriesByDate(entries) {
        return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    createEntryCard(entry) {
        const formattedDate = this.formatDate(entry.date);
        const mealIcon = this.getMealIcon(entry.mealType);
        
        return `
            <div class="entry-card" data-entry-id="${entry.id}">
                ${this.createEntryHeader(mealIcon, entry.mealType, formattedDate)}
                ${this.createMealName(entry.name)}
                ${this.createCaloriesInfo(entry.calories)}
                ${this.createEntryActions(entry.id)}
            </div>
        `;
    }

    createEntryHeader(mealIcon, mealType, formattedDate) {
        return `
            <div class="entry-header">
                <div class="meal-type">${mealIcon} ${mealType}</div>
                <div class="entry-date">${formattedDate}</div>
            </div>
        `;
    }

    createMealName(name) {
        return `<div class="meal-name">${name}</div>`;
    }

    createCaloriesInfo(calories) {
        return `
            <div class="calories-info">
                <span class="calories-number">${calories}</span>
                <span class="calories-label">קלוריות</span>
            </div>
        `;
    }

    createEntryActions(entryId) {
        return `
            <div class="entry-actions">
                ${this.createEditButton(entryId)}
                ${this.createDeleteButton(entryId)}
            </div>
        `;
    }

    createEditButton(entryId) {
        return `
            <button class="action-btn edit-btn" data-action="edit" data-id="${entryId}">
                <span>✏️</span> עריכה
            </button>
        `;
    }

    createDeleteButton(entryId) {
        return `
            <button class="action-btn delete-btn" data-action="delete" data-id="${entryId}">
                <span>🗑️</span> מחיקה
            </button>
        `;
    }

    setupEntryActionListeners() {
        this.removeExistingListeners();
        this.addNewListeners();
    }

    removeExistingListeners() {
        this.replaceButtons('[data-action="edit"]');
        this.replaceButtons('[data-action="delete"]');
    }

    replaceButtons(selector) {
        document.querySelectorAll(selector).forEach(button => {
            button.replaceWith(button.cloneNode(true));
        });
    }

    addNewListeners() {
        this.addEditListeners();
        this.addDeleteListeners();
    }

    addEditListeners() {
        document.querySelectorAll('[data-action="edit"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const entryId = parseInt(e.target.closest('[data-id]').dataset.id);
                this.diet.editEntry(entryId);
            });
        });
    }

    addDeleteListeners() {
        document.querySelectorAll('[data-action="delete"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const entryId = parseInt(e.target.closest('[data-id]').dataset.id);
                this.diet.deleteEntry(entryId);
            });
        });
    }

    updateStats() {
        const entries = this.diet.getEntries();
        const today = new Date().toISOString().split('T')[0];
        
        const todayCalories = this.calculateTodayCalories(entries, today);
        const weekEntries = this.getWeekEntries(entries);
        const avgCalories = this.calculateAverageCalories(weekEntries);
        
        this.updateStatsDisplay(todayCalories, weekEntries.length, avgCalories);
        this.addStatsAnimations();
    }

    calculateTodayCalories(entries, today) {
        const todayEntries = entries.filter(entry => entry.date === today);
        return todayEntries.reduce((sum, entry) => sum + entry.calories, 0);
    }

    getWeekEntries(entries) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        return entries.filter(entry => new Date(entry.date) >= weekStart);
    }

    calculateAverageCalories(weekEntries) {
        return weekEntries.length > 0 ? 
            Math.round(weekEntries.reduce((sum, entry) => sum + entry.calories, 0) / 7) : 0;
    }

    updateStatsDisplay(todayCalories, weekEntriesCount, avgCalories) {
        document.getElementById('todayCalories').textContent = todayCalories;
        document.getElementById('weekEntries').textContent = weekEntriesCount;
        document.getElementById('avgCalories').textContent = avgCalories;
    }

    addStatsAnimations() {
        this.animateStatUpdate('todayCalories');
        this.animateStatUpdate('weekEntries');
        this.animateStatUpdate('avgCalories');
    }

    animateStatUpdate(elementId) {
        const element = document.getElementById(elementId);
        this.applyScaleAnimation(element);
        this.resetScaleAnimation(element);
    }

    applyScaleAnimation(element) {
        element.style.transform = 'scale(1.1)';
        element.style.color = '#ff6b9d';
    }

    resetScaleAnimation(element) {
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = '#d63384';
        }, 300);
    }

    filterByDate(entry, dateFilter) {
        const entryDate = new Date(entry.date);
        const today = new Date();
        
        switch (dateFilter) {
            case 'today':
                return this.isToday(entryDate, today);
            case 'week':
                return this.isWithinWeek(entryDate, today);
            case 'month':
                return this.isWithinMonth(entryDate, today);
            default:
                return true;
        }
    }

    isToday(entryDate, today) {
        return entryDate.toDateString() === today.toDateString();
    }

    isWithinWeek(entryDate, today) {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        return entryDate >= weekAgo;
    }

    isWithinMonth(entryDate, today) {
        const monthAgo = new Date();
        monthAgo.setMonth(today.getMonth() - 1);
        return entryDate >= monthAgo;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = this.getYesterday(today);
        
        if (this.isToday(date, today)) {
            return 'היום';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'אתמול';
        } else {
            return this.formatRegularDate(date, today);
        }
    }

    getYesterday(today) {
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        return yesterday;
    }

    formatRegularDate(date, today) {
        return date.toLocaleDateString('he-IL', {
            day: 'numeric',
            month: 'short',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    }

    getMealIcon(mealType) {
        const icons = {
            'ארוחת בוקר': '🌅',
            'ארוחת צהריים': '☀️',
            'ארוחת ערב': '🌙',
            'חטיף': '🍎'
        };
        return icons[mealType] || '🍽️';
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        this.removeExistingNotifications();
        const notification = this.createNotification(message, type);
        this.displayNotification(notification);
        this.autoRemoveNotification(notification);
    }

    removeExistingNotifications() {
        document.querySelectorAll('.notification').forEach(n => n.remove());
    }

    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = this.getNotificationHTML(message, type);
        this.styleNotification(notification, type);
        return notification;
    }

    getNotificationHTML(message, type) {
        return `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
                <span class="notification-text">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
    }

    styleNotification(notification, type) {
        const backgroundColor = type === 'success' ? 
            'linear-gradient(135deg, #28a745, #20c997)' : 
            'linear-gradient(135deg, #dc3545, #fd7e14)';
            
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: ${backgroundColor};
            color: white;
            padding: 15px 20px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
            font-weight: 500;
        `;
    }

    displayNotification(notification) {
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
    }

    autoRemoveNotification(notification) {
        setTimeout(() => {
            if (notification.parentNode) {
                this.slideOutNotification(notification);
            }
        }, 4000);
    }

    slideOutNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }

    highlightRecentEntry() {
        const entries = document.querySelectorAll('.entry-card');
        if (entries.length > 0) {
            this.applyHighlight(entries[0]);
        }
    }

    applyHighlight(latestEntry) {
        latestEntry.style.background = 'linear-gradient(135deg, rgba(214, 51, 132, 0.1), rgba(255, 107, 157, 0.1))';
        latestEntry.style.border = '2px solid rgba(214, 51, 132, 0.3)';
        this.removeHighlightAfterDelay(latestEntry);
    }

    removeHighlightAfterDelay(entry) {
        setTimeout(() => {
            entry.style.background = '';
            entry.style.border = '';
        }, 2000);
    }

    addLoadingState(element) {
        element.classList.add('loading');
        element.disabled = true;
    }

    removeLoadingState(element) {
        element.classList.remove('loading');
        element.disabled = false;
    }

    validateFormField(field, value, type) {
        const formGroup = field.closest('.form-group');
        this.removeExistingError(formGroup);
        
        const validation = this.performValidation(value, type);
        
        if (!validation.isValid) {
            this.showFieldError(formGroup, validation.message);
            this.styleInvalidField(field);
        } else {
            this.styleValidField(field);
        }
        
        return validation.isValid;
    }

    removeExistingError(formGroup) {
        const errorMsg = formGroup.querySelector('.field-error');
        if (errorMsg) {
            errorMsg.remove();
        }
    }

    performValidation(value, type) {
        switch (type) {
            case 'meal':
                return this.validateMealName(value);
            case 'calories':
                return this.validateCaloriesValue(value);
            default:
                return { isValid: true, message: '' };
        }
    }

    validateMealName(value) {
        if (!value.trim()) {
            return { isValid: false, message: 'נא להזין שם מאכל' };
        } else if (value.trim().length < 2) {
            return { isValid: false, message: 'שם המאכל חייב להכיל לפחות 2 תווים' };
        }
        return { isValid: true, message: '' };
    }

    validateCaloriesValue(value) {
        if (!value || value <= 0) {
            return { isValid: false, message: 'נא להזין מספר קלוריות חיובי' };
        } else if (value > 5000) {
            return { isValid: false, message: 'מספר הקלוריות גבוה מדי' };
        }
        return { isValid: true, message: '' };
    }

    showFieldError(formGroup, message) {
        const errorElement = this.createErrorElement(message);
        formGroup.appendChild(errorElement);
    }

    createErrorElement(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.style.cssText = `
            color: #dc3545;
            font-size: 0.85rem;
            margin-top: 5px;
            display: flex;
            align-items: center;
            gap: 5px;
        `;
        errorElement.innerHTML = `<span>⚠️</span> ${message}`;
        return errorElement;
    }

    styleInvalidField(field) {
        field.style.borderColor = '#dc3545';
        field.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
    }

    styleValidField(field) {
        field.style.borderColor = '#28a745';
        field.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
    }
}

export default DietUI;