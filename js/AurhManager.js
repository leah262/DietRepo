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

    // ===== פונקציות בדיקת נכונות =====
    
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
        
        const trimmedName = name.trim();
        
        if (trimmedName.length < this.validationRules.minNameLength) {
            return { isValid: false, message: `${fieldName} חייב להכיל לפחות ${this.validationRules.minNameLength} תווים` };
        }
        
        if (!this.validationRules.name.test(trimmedName)) {
            return { isValid: false, message: `${fieldName} חייב להכיל רק אותיות` };
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

    // ===== פונקציות בדיקה מאוחדות =====
    
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

    // ===== פונקציות בדיקת טופס שלם =====
    
    validateSignUpForm(formData) {
        const errors = {};
        let isValid = true;

        // בדיקת שדות חובה
        const requiredFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'height', 'weight'];
        
        for (const field of requiredFields) {
            const validation = this.validateSignUpField(field, formData[field], formData);
            if (!validation.isValid) {
                errors[field] = validation.message;
                isValid = false;
            }
        }

        // בדיקת צ'קבוקסים
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

    // ===== פונקציות עזר לטיפול בשגיאות UI =====
    
    showFieldError(input, message) {
        // const formGroup = input.closest('.form-group');
        // if (!formGroup) return;

        // // הסרת שגיאות קודמות
        // this.hideFieldError(input);

        // const errorElement = document.createElement('div');
        // errorElement.className = 'error';
        // errorElement.textContent = message;
        // errorElement.style.display = 'block'; // תיקון: הבטחה שהשגיאה תופיע
        
        // formGroup.appendChild(errorElement); // תיקון: הוספה אחרי הקבוצה
        // formGroup.classList.add('error');
    }

    hideFieldError(input) {
        // const formGroup = input.closest('.form-group');
        // if (!formGroup) return;

        // // הסרת כל השגיאות בקבוצה
        // const errorElements = formGroup.querySelectorAll('.error');
        // errorElements.forEach(error => error.remove());
        
        // formGroup.classList.remove('error');
    }

    showFormErrors(form, errors) {
        // נקה שגיאות קודמות
        // this.clearFormErrors(form);

        // // הצג שגיאות חדשות
        // Object.keys(errors).forEach(fieldName => {
        //     const input = form.querySelector(`[name="${fieldName}"]`) || form.querySelector(`#${fieldName}`);
        //     if (input) {
        //         this.showFieldError(input, errors[fieldName]);
        //     } else if (fieldName === 'healthyLifestyle' || fieldName === 'privacy') {
        //         // טיפול בשגיאות צ'קבוקס
        //         alert(errors[fieldName]);
        //     }
        // });
    }

    clearFormErrors(form) {
        // const errorElements = form.querySelectorAll('.error');
        // errorElements.forEach(error => error.remove());
        
        // const errorGroups = form.querySelectorAll('.form-group.error');
        // errorGroups.forEach(group => group.classList.remove('error'));
    }

    // ===== פונקציות עזר נוספות =====
    
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
        
        // איסוף נתונים רגילים
        formData.forEach((value, key) => {
            data[key] = value.trim();
        });

        // איסוף צ'קבוקסים
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            data[checkbox.name] = checkbox.checked;
        });

        return data;
    }

    // ===== פונקציות מצב כפתורים =====
    
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