// Login functionality
class LoginManager {
    constructor() {
        this.form = null;
        this.isActive = false;
    }

    // Show login template
    show() {
        const template = document.getElementById('login-template');
        const container = document.getElementById('app-container');
        
        // Clear container and add login template
        container.innerHTML = '';
        const clone = template.content.cloneNode(true);
        container.appendChild(clone);
        
        this.form = document.getElementById('loginForm');
        this.isActive = true;
        this.bindEvents();
    }

    // Hide login template
    hide() {
        const container = document.getElementById('app-container');
        container.innerHTML = '';
        this.isActive = false;
        this.form = null;
    }

    // Bind all login events
    bindEvents() {
        if (!this.form) return;

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Switch to signup
        const switchToSignup = document.getElementById('switchToSignup');
        if (switchToSignup) {
            switchToSignup.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToSignup();
            });
        }

        // Forgot password
        const forgotPassword = document.getElementById('forgotPassword');
        if (forgotPassword) {
            forgotPassword.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }

        // Real-time validation
        const inputs = this.form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.hideError(input));
        });

        // Remember me functionality
        this.loadRememberedCredentials();
    }

    // Switch to signup form
    switchToSignup() {
        this.hide();
        if (window.signupManager) {
            window.signupManager.show();
        }
    }

    // Handle forgot password
    handleForgotPassword() {
        const email = document.getElementById('loginEmail').value;
        
        if (!email) {
            alert('אנא הכניסי את כתובת המייל שלך תחילה');
            document.getElementById('loginEmail').focus();
            return;
        }

        if (!this.validateEmail(email)) {
            alert('אנא הכניסי כתובת מייל תקינה');
            return;
        }

        // Simulate password reset email
        alert(`נשלח מייל לאיפוס סיסמה לכתובת: ${email}`);
        console.log(`Password reset requested for: ${email}`);
    }

    // Validation functions
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        return password.length >= 6;
    }

    // Show error message
    showError(input, message) {
        const formGroup = input.closest('.form-group');
        let errorElement = formGroup.querySelector('.error');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error';
            formGroup.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        formGroup.classList.add('error');
    }

    // Hide error message
    hideError(input) {
        const formGroup = input.closest('.form-group');
        const errorElement = formGroup.querySelector('.error');
        
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        formGroup.classList.remove('error');
    }

    // Show success message
    showSuccess(message) {
        let successElement = document.querySelector('.success');
        
        if (!successElement) {
            successElement = document.createElement('div');
            successElement.className = 'success';
            this.form.insertBefore(successElement, this.form.firstChild);
        }
        
        successElement.textContent = message;
        successElement.style.display = 'block';
        
        // Hide after 3 seconds
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    }

    // Individual field validation
    validateField(input) {
        const value = input.value.trim();
        let isValid = true;
        
        switch(input.name) {
            case 'email':
                if (!value) {
                    this.showError(input, 'יש להכניס כתובת מייל');
                    isValid = false;
                } else if (!this.validateEmail(value)) {
                    this.showError(input, 'כתובת מייל לא תקינה');
                    isValid = false;
                }
                break;
                
            case 'password':
                if (!value) {
                    this.showError(input, 'יש להכניס סיסמה');
                    isValid = false;
                } else if (!this.validatePassword(value)) {
                    this.showError(input, 'סיסמה חייבת להכיל לפחות 6 תווים');
                    isValid = false;
                }
                break;
        }
        
        return isValid;
    }

}