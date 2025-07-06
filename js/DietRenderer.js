class DietRenderer {
    renderEntries() {
        const entriesList = document.getElementById('entriesList');
        const emptyState = document.getElementById('emptyState');
        const filteredEntries = this.diet.getFilteredEntries();

        if (filteredEntries.length === 0) {
            entriesList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        entriesList.style.display = 'grid';
        emptyState.style.display = 'none';
        
        const sortedEntries = filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
        entriesList.innerHTML = sortedEntries.map(entry => this.createEntryCard(entry)).join('');
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
        // Remove existing listeners by replacing buttons
        ['[data-action="edit"]', '[data-action="delete"]'].forEach(selector => {
            document.querySelectorAll(selector).forEach(button => {
                button.replaceWith(button.cloneNode(true));
            });
        });

        // Add new listeners
        document.querySelectorAll('[data-action="edit"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const entryId = parseInt(e.target.closest('[data-id]').dataset.id);
                this.diet.editEntry(entryId);
            });
        });

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

        const todayCalories = entries
            .filter(entry => entry.date === today)
            .reduce((sum, entry) => sum + entry.calories, 0);

        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const weekEntries = entries.filter(entry => new Date(entry.date) >= weekStart);
        
        const avgCalories = weekEntries.length > 0 
            ? Math.round(weekEntries.reduce((sum, entry) => sum + entry.calories, 0) / 7) 
            : 0;

        // Update display
        document.getElementById('todayCalories').textContent = todayCalories;
        document.getElementById('weekEntries').textContent = weekEntries.length;
        document.getElementById('avgCalories').textContent = avgCalories;

        // Animate all stats
        this.animateAllStats();
    }

    animateAllStats() {
        ['todayCalories', 'weekEntries', 'avgCalories'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.transform = 'scale(1.1)';
                element.style.color = '#ff6b9d';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                    element.style.color = '#d63384';
                }, 300);
            }
        });
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
}

export default DietRenderer;