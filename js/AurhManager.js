class AuthManager {
    constructor() {
        this.validationRules = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            name: /^[א-תa-zA-Z\s]+$/,
            minNameLength: 2,
            minPasswordLength: 6,
            heightRange: { min: 120, max: 220 },
            weightRange: { min: 30, max: 300 }
        };
    }
    validateEmail(email) {
        if (!email || !email.trim()) {
            return { isValid: false, message: 'יש להכניס כתובת מייל' };
        }
        if (!this.validationRules.email.test(email.trim())) {
            return { isValid: false, message: 'כתובת מייל לא תקינה' };
        }
        return { isValid: true };
    }
    validateName(name, fieldName = 'שם') {
        if (!name || !name.trim()) {
            return { isValid: false, message: `יש להכניס ${fieldName}` };
        }
        return { isValid: true };
    }
    validatePassword(password) {
        if (!password) {
            return { isValid: false, message: 'יש להכניס סיסמה' };
        }
        if (password.length < this.validationRules.minPasswordLength) {
            return { isValid: false, message: `סיסמה חייבת להכיל לפחות ${this.validationRules.minPasswordLength} תווים` };
        }
        return { isValid: true };
    }
    validatePasswordMatch(password, confirmPassword) {
        if (!confirmPassword) {
            return { isValid: false, message: 'יש לאשר את הסיסמה' };
        }
        if (password !== confirmPassword) {
            return { isValid: false, message: 'הסיסמאות אינן תואמות' };
        }
        return { isValid: true };
    }
    validateHeight(height) {
        const numHeight = parseInt(height);
        if (!height || isNaN(numHeight)) {
            return { isValid: false, message: 'יש להכניס גובה' };
        }
        const { min, max } = this.validationRules.heightRange;
        if (numHeight < min || numHeight > max) {
            return { isValid: false, message: `גובה חייב להיות בין ${min}-${max} ס"מ` };
        }
        return { isValid: true };
    }
    validateWeight(weight) {
        const numWeight = parseFloat(weight);      
        if (!weight || isNaN(numWeight)) {
            return { isValid: false, message: 'יש להכניס משקל' };
        }  
        const { min, max } = this.validationRules.weightRange;
        if (numWeight < min || numWeight > max) {
            return { isValid: false, message: `משקל חייב להיות בין ${min}-${max} ק"ג` };
        }
        return { isValid: true };
    }
    validateSignUpField(fieldName, value, additionalData = {}) {
        switch (fieldName) {
            case 'firstName':
                return this.validateName(value, 'שם פרטי');
            case 'lastName':
                return this.validateName(value, 'שם משפחה');
            case 'email':
                return this.validateEmail(value);
            case 'password':
                return this.validatePassword(value);
            case 'confirmPassword':
                return this.validatePasswordMatch(additionalData.password, value);
            case 'height':
                return this.validateHeight(value);
            case 'weight':
                return this.validateWeight(value);
            default:
                return { isValid: true };
        }
    }
    validateLoginField(fieldName, value) {
        switch (fieldName) {
            case 'email':
                return this.validateEmail(value);
            case 'password':
                return this.validatePassword(value);
            default:
                return { isValid: true };
        }
    }
    validateSignUpForm(formData) {
        const errors = {};
        let isValid = true;
        const requiredFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'height', 'weight'];
        for (const field of requiredFields) {
            const validation = this.validateSignUpField(field, formData[field], formData);
            if (!validation.isValid) {
                errors[field] = validation.message;
                isValid = false;
            }
        }
        if (!formData.healthyLifestyle) {
            errors.healthyLifestyle = 'יש לאשר את ההתחייבות לאורח חיים בריא';
            isValid = false;
        }
        if (!formData.privacy) {
            errors.privacy = 'יש לאשר את ההתחייבות לשמירה על פרטיות';
            isValid = false;
        }
        return { isValid, errors };
    }

    validateLoginForm(formData) {
        const errors = {};
        let isValid = true;
        const requiredFields = ['email', 'password'];
        for (const field of requiredFields) {
            const validation = this.validateLoginField(field, formData[field]);
            if (!validation.isValid) {
                errors[field] = validation.message;
                isValid = false;
            }
        }
        return { isValid, errors };
    }
    showSuccessMessage(container, message, duration = 5000) {
        let successElement = container.querySelector('.success');
        if (!successElement) {
            successElement = document.createElement('div');
            successElement.className = 'success';
            container.insertBefore(successElement, container.firstChild);
        }
        successElement.textContent = message;
        successElement.style.display = 'block';
        if (duration > 0) {
            setTimeout(() => {
                successElement.style.display = 'none';
            }, duration);
        }
    }
    collectFormData(form) {
        const data = {};
        const formData = new FormData(form);
        formData.forEach((value, key) => {
            data[key] = value.trim();
        });
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            data[checkbox.name] = checkbox.checked;
        });
        return data;
    }
    setButtonLoading(button, loadingText = 'טוען...') {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.textContent = loadingText;
        button.style.opacity = '0.7';
    }
    resetButton(button) {
        button.disabled = false;
        button.textContent = button.dataset.originalText || button.textContent;
        button.style.opacity = '1';
    }
}
export default new AuthManager();