import AuthManager from './AurhManager.js';
import { switchPage } from './app.js';
import FXMLHttpRequest from './FXMLHttpRequest.js';

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

        const switchToSignUpBtn = document.getElementById('switchToSignUp');
        if (switchToSignUpBtn) {
            switchToSignUpBtn.addEventListener('click', (e) => {
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
            input.addEventListener('focus', () => {
                AuthManager.hideFieldError(input);
            });

            input.addEventListener('blur', () => {
                if (input.value.trim()) {
                    this.validateSingleField(input);
                }
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
        console.log("Login: Form submitted");
        e.preventDefault();

        const submitBtn = this.form.querySelector('.submit-btn');
        if (!submitBtn) {
            console.error("Submit button not found");
            return;
        }

        // איסוף נתוני הטופס
        const formData = AuthManager.collectFormData(this.form);
        console.log("Login: Form data collected", formData);

        // בדיקת תקינות הטופס
        const validation = AuthManager.validateLoginForm(formData);
        if (!validation.isValid) {
            console.log("Login: Form validation failed", validation.errors);
            AuthManager.showFormErrors(this.form, validation.errors);
            return;
        }

        // הצגת טקסט טעינה
        console.log("Login: Setting loading state");
        this.setButtonLoading(submitBtn, 'מתחברת...');

        // עיבוד ההתחברות
        setTimeout(() => {
            this.processLogin(formData, submitBtn);
        }, 50);
    }

    setButtonLoading(button, loadingText) {
        if (button) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.textContent = loadingText;
            button.classList.add('loading');
            console.log("Button set to loading:", loadingText);
        }
    }

    resetButton(button) {
        if (button) {
            button.disabled = false;
            button.textContent = button.dataset.originalText || 'התחברי';
            button.classList.remove('loading');
            console.log("Button reset");
        }
    }

    processLogin(loginData, submitBtn) {
        console.log("Login: Processing login for", loginData.email);

        let fxhr = new FXMLHttpRequest();

        fxhr.addEventListener('onReadyStateChange', (e) => {
            this.onReadyStateChange(e, submitBtn);
        });

        fxhr.open('POST', "https://fake.server/api/Users-Servers/login?method=POST");
        console.log('Login: Sending login data:', loginData);
        fxhr.send(loginData);
        console.log('Login request sent asynchronously');
    }

    onReadyStateChange(e, submitBtn) {
        console.log("Login: State changed to:", e.target.state);
        let fxhr = e.target;

        if (fxhr.state === 4) {
            console.log("Login: Request completed, response:", fxhr.response);

            try {
                let response = fxhr.response;
                if (typeof response === 'string') {
                    response = JSON.parse(response);
                }

                if (response && response.success) {
                    console.log("Login: Login successful");
                    this.handleSuccessfulLogin(submitBtn, response);
                } else {
                    console.error("Login: Login failed:", response);
                    this.resetButton(submitBtn);
                    const errorMsg = response?.error || 'שגיאה בהתחברות. אנא בדקי את הפרטים ונסי שוב.';

                    if (response?.error === 'User not found') {
                        alert('משתמש לא נמצא. אנא בדקי את כתובת המייל או הירשמי.');
                    } else if (response?.error === 'Invalid password') {
                        alert('סיסמה שגויה. אנא נסי שוב.');
                    } else {
                        alert(errorMsg);
                    }
                }
            } catch (error) {
                console.error("Login: Error parsing response:", error);
                this.resetButton(submitBtn);
                alert('אירעה שגיאה בעיבוד התגובה. אנא נסי שוב.');
            }
        }
    }

    handleSuccessfulLogin(submitBtn, response) {
        console.log("Login: Handling successful login");

        // שמירה ב-sessionStorage
        const userData = {
            id: response.data?.id || response.id,
            email: response.data?.email || response.email,
            firstName: response.data?.firstName,
            lastName: response.data?.lastName
        };

        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        console.log("User data saved to sessionStorage:", userData);

        // הצגת הודעת הצלחה
        alert('התחברת בהצלחה! ברוכה השבה 💖');

        // ניקוי הטופס
        this.form.reset();
        AuthManager.clearFormErrors(this.form);
        this.resetButton(submitBtn);

        // מעבר לדף הבית
        setTimeout(() => {
            console.log("Switching to diary page");
            switchPage('diary');
        }, 1000);
    }

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
}

const loginManager = new LoginManager();
loginManager.init();
export default loginManager;