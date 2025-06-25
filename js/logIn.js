import AuthManager from './AurhManager';
// import { goToSignUp } from './app.js';

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
        // האזנה לטעינת דף ההתחברות
        document.addEventListener('pageLoaded', (e) => {
            if (e.detail.pageName === 'login') {
                this.setupLoginPage();
            }
        });
    }

    setupLoginPage() {
        this.form = document.querySelector('#loginForm');
        
        if (!this.form) {
            console.error('Login form not found');
            return;
        }

        this.attachFormEvents();
        this.loadRememberedCredentials();
    }

    attachFormEvents() {
        // אירוע שליחת הטופס
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // אירוע מעבר לרישום
        const switchToSignupBtn = document.getElementById('switchToSignup');
        if (switchToSignupBtn) {
            switchToSignupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToSignUp();
            });
        }

        // אירוע שכחתי סיסמה (אם יש כזה כפתור)
        const forgotPasswordBtn = document.getElementById('forgotPassword');
        if (forgotPasswordBtn) {
            forgotPasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }

        // אירועי בדיקה של שדות
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
                AuthManager.hideFieldError(input);
            });
        });
    }

    validateSingleField(input) {
        const fieldName = input.name;
        const fieldValue = input.value;
        
        const validation = AuthManager.validateLoginField(fieldName, fieldValue);
        
        if (!validation.isValid) {
            AuthManager.showFieldError(input, validation.message);
            return false;
        }

        return true;
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const submitBtn = this.form.querySelector('.submit-btn');
        AuthManager.setButtonLoading(submitBtn, 'מתחברת...');

        // איסוף נתוני הטופס
        const formData = AuthManager.collectFormData(this.form);
        
        // בדיקת תקינות הטופס
        const validation = AuthManager.validateLoginForm(formData);

        if (validation.isValid) {
            this.processLogin(formData, submitBtn);
        } else {
            AuthManager.showFormErrors(this.form, validation.errors);
            AuthManager.resetButton(submitBtn);
        }
    }

    processLogin(loginData, submitBtn) {
        // כאן תטפלי בהתחברות המשתמש בפועל
        // לדוגמה: שליחה לשרת, בדיקת סיסמה וכו'
        
        console.log('Login data ready for authentication:', loginData);
        
        // סימולציה של התחברות מוצלחת
        setTimeout(() => {
            this.handleSuccessfulLogin(loginData, submitBtn);
        }, 1500);
    }

    handleSuccessfulLogin(loginData, submitBtn) {
        // הצגת הודעת הצלחה
        AuthManager.showSuccessMessage(
            this.form, 
            'התחברת בהצלחה! ברוכה השבה 💖'
        );

        // שמירת פרטים אם המשתמש בחר (אם יש checkbox זכור אותי)
        this.saveCredentialsIfRequested(loginData);

        AuthManager.resetButton(submitBtn);

        // הפניה לדף הבית
        setTimeout(() => {
            alert('ברוכה השבה! מעבירה אותך לדף הבית');
            // כאן תוכלי להפנות לדף הבית
            // לדוגמה: goToHome()
        }, 2000);
    }

    handleForgotPassword() {
        const emailInput = document.getElementById('loginEmail');
        const email = emailInput ? emailInput.value.trim() : '';
        
        if (!email) {
            alert('אנא הכניסי את כתובת המייל שלך תחילה');
            if (emailInput) emailInput.focus();
            return;
        }

        const emailValidation = AuthManager.validateEmail(email);
        if (!emailValidation.isValid) {
            alert('אנא הכניסי כתובת מייל תקינה');
            return;
        }

        // כאן תטפלי בשליחת מייל לאיפוס סיסמה
        alert(`נשלח מייל לאיפוס סיסמה לכתובת: ${email}`);
        console.log(`Password reset requested for: ${email}`);
    }

    switchToSignUp() {
        goToSignUp();
    }

    // פונקציות עזר לזכירת פרטים
    loadRememberedCredentials() {
        // כאן תוכלי לטעון פרטים שמורים (אם החלטת לשמור)
        // לדוגמה מ-localStorage (אבל לא בתוך artifacts)
        console.log('Loading remembered credentials...');
    }

    saveCredentialsIfRequested(loginData) {
        const rememberMeCheckbox = document.getElementById('rememberMe');
        
        if (rememberMeCheckbox && rememberMeCheckbox.checked) {
            // כאן תוכלי לשמור פרטים (מחוץ ל-artifacts)
            console.log('Saving credentials for future use');
        }
    }

    // פונקציות עזר נוספות
    resetForm() {
        if (this.form) {
            this.form.reset();
            AuthManager.clearFormErrors(this.form);
        }
    }

    isFormValid() {
        if (!this.form) return false;
        
        const formData = AuthManager.collectFormData(this.form);
        const validation = AuthManager.validateLoginForm(formData);
        
        return validation.isValid;
    }

    focusFirstField() {
        if (this.form) {
            const firstInput = this.form.querySelector('input');
            if (firstInput) firstInput.focus();
        }
    }
}

// יצירת instance יחיד
const loginManager = new LoginManager();

// אתחול
loginManager.init();

export default loginManager;