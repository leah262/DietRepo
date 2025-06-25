import AuthManager from './AurhManager.js';
import { switchPage } from './app.js';

class LoginManager {
    constructor() {
        this.form = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        this.bindEvents();
        this.isInitialized = true;
    }

    bindEvents() {
        document.addEventListener('pageLoaded', (e) => {
            if (e.detail.pageName === 'login') {
                this.setupLoginPage();
            }
        });
    }

    setupLoginPage() {
        // המתנה קצרה לוודא שהעמוד נטען במלואו
        setTimeout(() => {
            this.form = document.querySelector('#loginForm');
            
            if (!this.form) {
                console.error('Login form not found');
                return;
            }

            this.attachFormEvents();
        }, 10);
    }

    attachFormEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        const switchToSignupBtn = document.getElementById('switchToSignup');
        if (switchToSignupBtn) {
            switchToSignupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log("Switching to signup page");
                switchPage('signUp');
            });
        }
        
        this.attachFieldValidation();
    }

    attachFieldValidation() {
        const inputs = this.form.querySelectorAll('input');
        inputs.forEach(input => {
            // בדיקה כשעוזבים את השדה
            input.addEventListener('blur', () => {
                this.validateSingleField(input);
            });

            // הסתרת שגיאות כשמתחילים להקליד
            input.addEventListener('input', () => {
                if (AuthManager && AuthManager.hideFieldError) {
                    AuthManager.hideFieldError(input);
                }
            });
        });
    }

    validateSingleField(input) {
        const fieldName = input.name;
        const fieldValue = input.value;
        
        // ולידציה בסיסית
        let isValid = true;
        let message = '';
        
        if (fieldName === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!fieldValue) {
                isValid = false;
                message = 'נא להזין כתובת מייל';
            } else if (!emailRegex.test(fieldValue)) {
                isValid = false;
                message = 'כתובת המייל אינה תקינה';
            }
        } else if (fieldName === 'password') {
            if (!fieldValue) {
                isValid = false;
                message = 'נא להזין סיסמה';
            } else if (fieldValue.length < 6) {
                isValid = false;
                message = 'הסיסמה חייבת להכיל לפחות 6 תווים';
            }
        }

        if (!isValid && AuthManager && AuthManager.showFieldError) {
            AuthManager.showFieldError(input, message);
            return false;
        }

        return true;
    }

    handleSubmit(e) {
        e.preventDefault();
        const submitBtn = this.form.querySelector('.submit-btn');
        
        if (AuthManager && AuthManager.setButtonLoading) {
            AuthManager.setButtonLoading(submitBtn, 'מתחברת...');
        }
        
        const formData = this.collectFormData();
        
        if (this.validateLoginForm(formData)) {
            this.processLogin(formData, submitBtn);
        } else {
            if (AuthManager && AuthManager.resetButton) {
                AuthManager.resetButton(submitBtn);
            }
        }
    }

    collectFormData() {
        const formData = new FormData(this.form);
        return {
            email: formData.get('email'),
            password: formData.get('password')
        };
    }

    validateLoginForm(formData) {
        let isValid = true;
        
        // ולידציה בסיסית
        if (!formData.email || !formData.password) {
            isValid = false;
            console.log('Missing required fields');
        }
        
        return isValid;
    }

    processLogin(userData, submitBtn) {
        // כאן תטפלי בכניסה בפועל
        // לדוגמה: שליחה לשרת, בדיקת פרטי התחברות וכו'
        
        console.log('Login attempt with:', userData);
        
        setTimeout(() => {
            this.handleSuccessfulLogin(submitBtn);
        }, 1500);
    }

    handleSuccessfulLogin(submitBtn) {
        if (AuthManager && AuthManager.showSuccessMessage) {
            AuthManager.showSuccessMessage(
                this.form, 
                'התחברת בהצלחה! ברוכה השבה 💖'
            );
        }
        
        this.form.reset();
        
        if (AuthManager && AuthManager.resetButton) {
            AuthManager.resetButton(submitBtn);
        }
        
        setTimeout(() => {
            alert('ברוכה השבה! כעת תועברי לעמוד הבית של הקבוצה');
            // כאן תוכלי להעביר למסך הראשי של האפליקציה
        }, 2000);
    }

    resetForm() {
        if (this.form) {
            this.form.reset();
            if (AuthManager && AuthManager.clearFormErrors) {
                AuthManager.clearFormErrors(this.form);
            }
        }
    }
}

const loginManager = new LoginManager();
loginManager.init();
export default loginManager;