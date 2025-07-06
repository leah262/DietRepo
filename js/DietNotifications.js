class DietNotifications {
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = this.createNotification(message, type);
        document.body.appendChild(notification);
        
        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        setTimeout(() => this.removeNotification(notification), 4000);
    }

    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
                <span class="notification-text">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        const backgroundColor = type === 'success' ?
            'linear-gradient(135deg, #28a745, #20c997)' :
            'linear-gradient(135deg, #dc3545, #fd7e14)';

        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            background: ${backgroundColor}; color: white; padding: 15px 20px;
            border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transform: translateX(100%); transition: transform 0.3s ease;
            max-width: 400px; font-weight: 500;
        `;
        
        return notification;
    }

    removeNotification(notification) {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }

    highlightRecentEntry() {
        const latestEntry = document.querySelector('.entry-card');
        if (latestEntry) {
            latestEntry.style.background = 'linear-gradient(135deg, rgba(214, 51, 132, 0.1), rgba(255, 107, 157, 0.1))';
            latestEntry.style.border = '2px solid rgba(214, 51, 132, 0.3)';
            setTimeout(() => {
                latestEntry.style.background = '';
                latestEntry.style.border = '';
            }, 2000);
        }
    }

    validateFormField(field, value, type) {
        const formGroup = field.closest('.form-group');
        const existingError = formGroup.querySelector('.field-error');
        if (existingError) existingError.remove();

        const validation = this.getValidation(value, type);
        
        if (!validation.isValid) {
            this.showFieldError(formGroup, validation.message);
            field.style.borderColor = '#dc3545';
            field.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
        } else {
            field.style.borderColor = '#28a745';
            field.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
        }

        return validation.isValid;
    }

    getValidation(value, type) {
        const validations = {
            meal: () => {
                if (!value.trim()) return { isValid: false, message: 'נא להזין שם מאכל' };
                if (value.trim().length < 2) return { isValid: false, message: 'שם המאכל חייב להכיל לפחות 2 תווים' };
                return { isValid: true, message: '' };
            },
            calories: () => {
                if (!value || value <= 0) return { isValid: false, message: 'נא להזין מספר קלוריות חיובי' };
                if (value > 5000) return { isValid: false, message: 'מספר הקלוריות גבוה מדי' };
                return { isValid: true, message: '' };
            }
        };

        return validations[type] ? validations[type]() : { isValid: true, message: '' };
    }

    showFieldError(formGroup, message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.style.cssText = `
            color: #dc3545; font-size: 0.85rem; margin-top: 5px;
            display: flex; align-items: center; gap: 5px;
        `;
        errorElement.innerHTML = `<span>⚠️</span> ${message}`;
        formGroup.appendChild(errorElement);
    }

    showLoadingSpinner(buttonElement, originalText) {
        if (buttonElement) {
            buttonElement.disabled = true;
            buttonElement.innerHTML = `<div class="spinner"></div> ${originalText}`;
            buttonElement.classList.add('loading');
        }
    }

    removeLoadingSpinner(buttonElement, originalText) {
        if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.innerHTML = originalText;
            buttonElement.classList.remove('loading');
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
}

export default DietNotifications;