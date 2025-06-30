import AuthManager from './AurhManager.js';
import { switchPage } from './app.js';
import User from './User.js'
import FXMLHttpRequest from './FXMLHttpRequest.js';

class SignUpManager {
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
        // האזן לטעינת דפים
        document.addEventListener('pageLoaded', (e) => {
            if (e.detail.pageName === 'signUp') {
                this.setupSignUpPage();
            }
        });
    }

    setupSignUpPage() {
        // המתן מעט לוודא שה-DOM עודכן
        setTimeout(() => {
            this.form = document.querySelector('#signupForm');

            if (!this.form) {
                console.error('SignUp form not found');
                return;
            }

            this.attachFormEvents();
        }, 10);
    }

    attachFormEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        const switchToLoginBtn = document.getElementById('switchToLogin');
        if (switchToLoginBtn) {
            switchToLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log("Switching to login page");
                switchPage('login');
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

        const additionalData = {};
        if (fieldName === 'confirmPassword') {
            const passwordField = this.form.querySelector('#password');
            additionalData.password = passwordField ? passwordField.value : '';
        }

        const validation = AuthManager.validateSignUpField(fieldName, fieldValue, additionalData);

        if (!validation.isValid) {
            AuthManager.showFieldError(input, validation.message);
            return false;
        }

        return true;
    }

    handleSubmit(e) {
        console.log("SignUp: Form submitted");
        e.preventDefault();

        const submitBtn = this.form.querySelector('.submit-btn');
        if (!submitBtn) {
            console.error("Submit button not found");
            return;
        }

        // איסוף נתוני הטופס
        const formData = AuthManager.collectFormData(this.form);
        console.log("SignUp: Form data collected", formData);

        // הצגת טקסט טעינה
        console.log("SignUp: Setting loading state");
        this.setButtonLoading(submitBtn, 'רושמת...');

        // עיבוד הרישום
        setTimeout(() => {
            this.processSignUp(formData, submitBtn);
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
            button.textContent = button.dataset.originalText || 'הירשמי';
            button.classList.remove('loading');
            console.log("Button reset");
        }
    }

    processSignUp(userData, submitBtn) {
        console.log("SignUp: Processing registration for", userData.email);

        let user = new User(userData.firstName, userData.lastName, userData.email, userData.height, userData.weight, userData.password);
        let fxhr = new FXMLHttpRequest();

        fxhr.addEventListener('onReadyStateChange', (e) => {
            this.onReadyStateChange(e, submitBtn);
        });

        fxhr.open('POST', "https://fake.server/api/Users-Servers/register?method=POST");
        console.log('SignUp: Sending user data:', user);
        fxhr.send(user);
        console.log('Request sent asynchronously');
    }

    onReadyStateChange(e, submitBtn) {
        console.log("SignUp: State changed to:", e.target.state);
        let fxhr = e.target;

        if (fxhr.state === 4) {
            console.log("SignUp: Request completed, response:", fxhr.response);

            try {
                let response = fxhr.response;
                if (typeof response === 'string') {
                    response = JSON.parse(response);
                }

                if (response && response.success) {
                    console.log("SignUp: Registration successful");
                    this.handleSuccessfulSignUp(submitBtn, response);
                } else {
                    console.error("SignUp: Registration failed:", response);
                    this.resetButton(submitBtn);
                    const errorMsg = response?.error || 'אירעה שגיאה בעת הרישום. אנא נסי שוב.';
                    alert(errorMsg);
                }
            } catch (error) {
                console.error("SignUp: Error parsing response:", error);
                this.resetButton(submitBtn);
                alert('אירעה שגיאה בעיבוד התגובה. אנא נסי שוב.');
            }
        }
    }

    handleSuccessfulSignUp(submitBtn, response) {
        console.log("SignUp: Handling successful registration");

        // שמירה ב-sessionStorage
        const userData = {
            id: response.data?.id || response.id,
            email: response.data?.email || response.email,
            firstName: response.data?.firstName,
            lastName: response.data?.lastName
        };
        console.log(userData);
        
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        console.log("User data saved to sessionStorage:", userData);

        // הצגת הודעת הצלחה
        alert('הרישום הושלם בהצלחה! ברוכה הבאה לקבוצה שלנו 💖');

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
        const validation = AuthManager.validateSignUpForm(formData);

        return validation.isValid;
    }
}

const signUpManager = new SignUpManager();
signUpManager.init();
export default signUpManager;

