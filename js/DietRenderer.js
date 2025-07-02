// import FXMLHttpRequest from "./FXMLHttpRequest.js";
// import { logout } from './App.js';
// import DietAPI from './DietAPI.js';
// import DietActions from './DietActions.js';
// import DietNotifications from './DietNotifications.js';
// import DietCore from './DietCore.js'
class DietRenderer {
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
     addDeleteListeners() {
        document.querySelectorAll('[data-action="delete"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const entryId = parseInt(e.target.closest('[data-id]').dataset.id);
                this.diet.deleteEntry(entryId);
            });
        });
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
    showOneEntry(entry) {
        let entryCard = createEntryCard(entry);
        addEntryToList(entryCard, entry.date);
    }
    addEntryToList(entryCard,date) {
        const dateNew = new Date(entry.date);
        const children = container.children;

        // Find the right place to insert
        let inserted = false;
        for (let i = 0; i < children.length; i++) {
            const existingDate = new Date(children[i].dataset.date);
            if (dateNew > existingDate) {
                container.insertBefore(newEl, children[i]);
                inserted = true;
                break;
            }
        }

        if (!inserted) container.appendChild(newEl); // insert at end if needed
        newEl.dataset.date = entry.date; //
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

}
export default DietRenderer