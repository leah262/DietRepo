// import FXMLHttpRequest from "./FXMLHttpRequest.js";
// import { logout } from './App.js';
// import DietAPI from './DietAPI.js';
// import DietActions from './DietActions.js';
// import DietRenderer from './DietRenderer.js';
// import DietCore from './DietCore.js'
class DietNotifications{
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

export default DietNotifications;