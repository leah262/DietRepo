class DietUI {
    constructor(dietInstance) {
        this.diet = dietInstance;
    }

    renderEntries() {
        const entriesList = document.getElementById('entriesList');
        const emptyState = document.getElementById('emptyState');
        
        // Filter entries
        const filteredEntries = this.diet.getFilteredEntries();
        
        if (filteredEntries.length === 0) {
            entriesList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        entriesList.style.display = 'grid';
        emptyState.style.display = 'none';
        
        // Sort entries by date (newest first)
        const sortedEntries = filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        entriesList.innerHTML = sortedEntries.map(entry => this.createEntryCard(entry)).join('');
        
        // Add event listeners to action buttons
        this.setupEntryActionListeners();
    }

    createEntryCard(entry) {
        const formattedDate = this.formatDate(entry.date);
        const mealIcon = this.getMealIcon(entry.mealType);
        
        return `
            <div class="entry-card" data-entry-id="${entry.id}">
                <div class="entry-header">
                    <div class="meal-type">${mealIcon} ${entry.mealType}</div>
                    <div class="entry-date">${formattedDate}</div>
                </div>
                
                <div class="meal-name">${entry.name}</div>
                
                <div class="calories-info">
                    <span class="calories-number">${entry.calories}</span>
                    <span class="calories-label">קלוריות</span>
                </div>
                
                <div class="entry-actions">
                    <button class="action-btn edit-btn" data-action="edit" data-id="${entry.id}">
                        <span>✏️</span> עריכה
                    </button>
                    <button class="action-btn delete-btn" data-action="delete" data-id="${entry.id}">
                        <span>🗑️</span> מחיקה
                    </button>
                </div>
            </div>
        `;
    }

    setupEntryActionListeners() {
        document.querySelectorAll('[data-action="edit"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const entryId = e.target.closest('[data-id]').dataset.id;
                this.diet.editEntry(entryId);
            });
        });

        document.querySelectorAll('[data-action="delete"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const entryId = e.target.closest('[data-id]').dataset.id;
                this.diet.deleteEntry(entryId);
            });
        });
    }

    updateStats() {
        const entries = this.diet.getEntries();
        
        // Today's calories
        const today = new Date().toISOString().split('T')[0];
        const todayEntries = entries.filter(entry => entry.date === today);
        const todayCalories = todayEntries.reduce((sum, entry) => sum + entry.calories, 0);
        
        // Week entries count
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const weekEntries = entries.filter(entry => new Date(entry.date) >= weekStart);
        
        // Average daily calories (last 7 days)
        const avgCalories = weekEntries.length > 0 ? 
            Math.round(weekEntries.reduce((sum, entry) => sum + entry.calories, 0) / 7) : 0;
        
        // Update DOM
        document.getElementById('todayCalories').textContent = todayCalories;
        document.getElementById('weekEntries').textContent = weekEntries.length;
        document.getElementById('avgCalories').textContent = avgCalories;
        
        // Add animation to updated stats
        this.animateStatUpdate('todayCalories');
        this.animateStatUpdate('weekEntries');
        this.animateStatUpdate('avgCalories');
    }

    animateStatUpdate(elementId) {
        const element = document.getElementById(elementId);
        element.style.transform = 'scale(1.1)';
        element.style.color = '#ff6b9d';
        
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
                return entryDate.toDateString() === today.toDateString();
            case 'week':
                const weekAgo = new Date();
                weekAgo.setDate(today.getDate() - 7);
                return entryDate >= weekAgo;
            case 'month':
                const monthAgo = new Date();
                monthAgo.setMonth(today.getMonth() - 1);
                return entryDate >= monthAgo;
            default:
                return true;
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'היום';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'אתמול';
        } else {
            return date.toLocaleDateString('he-IL', {
                day: 'numeric',
                month: 'short',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
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
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
                <span class="notification-text">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: ${type === 'success' ? 'linear-gradient(135deg, #28a745, #20c997)' : 'linear-gradient(135deg, #dc3545, #fd7e14)'};
            color: white;
            padding: 15px 20px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 4000);
    }

    // Additional utility methods for enhanced UI
    highlightRecentEntry() {
        const entries = document.querySelectorAll('.entry-card');
        if (entries.length > 0) {
            const latestEntry = entries[0];
            latestEntry.style.background = 'linear-gradient(135deg, rgba(214, 51, 132, 0.1), rgba(255, 107, 157, 0.1))';
            latestEntry.style.border = '2px solid rgba(214, 51, 132, 0.3)';
            
            setTimeout(() => {
                latestEntry.style.background = '';
                latestEntry.style.border = '';
            }, 2000);
        }
    }

    addLoadingState(element) {
        element.classList.add('loading');
        element.disabled = true;
    }

    removeLoadingState(element) {
        element.classList.remove('loading');
        element.disabled = false;
    }

    // Enhanced form validation with visual feedback
    validateFormField(field, value, type) {
        const formGroup = field.closest('.form-group');
        const errorMsg = formGroup.querySelector('.field-error');
        
        // Remove existing error
        if (errorMsg) {
            errorMsg.remove();
        }
        
        let isValid = true;
        let message = '';
        
        switch (type) {
            case 'meal':
                if (!value.trim()) {
                    isValid = false;
                    message = 'נא להזין שם מאכל';
                } else if (value.trim().length < 2) {
                    isValid = false;
                    message = 'שם המאכל חייב להכיל לפחות 2 תווים';
                }
                break;
            case 'calories':
                if (!value || value <= 0) {
                    isValid = false;
                    message = 'נא להזין מספר קלוריות חיובי';
                } else if (value > 5000) {
                    isValid = false;
                    message = 'מספר הקלוריות גבוה מדי';
                }
                break;
        }
        
        if (!isValid) {
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
            formGroup.appendChild(errorElement);
            
            field.style.borderColor = '#dc3545';
            field.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
        } else {
            field.style.borderColor = '#28a745';
            field.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
        }
        
        return isValid;
    }
}

export default DietUI;