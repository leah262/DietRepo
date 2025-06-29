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
        this.setupSignUpPage();
    }

    setupSignUpPage() {
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
            input.addEventListener('blur', () => {
                this.validateSingleField(input);
            });

            input.addEventListener('input', () => {
                AuthManager.hideFieldError(input);
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

        // השינוי: הצגת טקסט טעינה מיד
        console.log("SignUp: Setting loading state");
        this.setButtonLoading(submitBtn, 'רושמת...');

        const formData = AuthManager.collectFormData(this.form);
        console.log("SignUp: Form data collected", formData);

        // השינוי: המתנה קצרה כדי לוודא שהטקסט מופיע
        setTimeout(() => {
            this.processSignUp(formData, submitBtn);
        }, 50);

    }

    // השינוי: הוספת פונקציה לטיפול בטקסט טעינה
    setButtonLoading(button, loadingText) {
        if (button) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.textContent = loadingText;
            button.classList.add('loading');
            console.log("Button set to loading:", loadingText);
        }
    }

    // השינוי: הוספת פונקציה לאיפוס הכפתור
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
            let fxhr = e.target;
            console.log("SignUp: State changed to:", fxhr.state);

            // השינוי: טיפול בתגובה כשהבקשה הושלמה
            if (fxhr.state === 4) {
                console.log("SignUp: Request completed, response:", fxhr.response);

                if (fxhr.response && fxhr.response.success) {
                    console.log("SignUp: Registration successful");
                    this.handleSuccessfulSignUp(submitBtn);
                } else {
                    console.error("SignUp: Registration failed:", fxhr.response);
                    this.resetButton(submitBtn);
                    // השינוי: הצגת הודעת שגיאה
                    alert('אירעה שגיאה בעת הרישום. אנא נסי שוב.');
                }
            }
        });

        fxhr.open('POST', "https://fake.server/api/Users-Servers/register?method=POST");
        console.log('SignUp: Sending user data:', user);
        fxhr.send(user);
        console.log('please be aasync!!!!!!!!!!!!!!!!!');

    }

    handleSuccessfulSignUp(submitBtn) {
        console.log("SignUp: Handling successful registration");
        // sessionStorage.setItem('currentUser', JSON.stringify(user))
        switchPage('diary')
        // השינוי: שימוש בפונקציה המקומית במקום AuthManager
        if (typeof AuthManager.showSuccessMessage === 'function') {
            AuthManager.showSuccessMessage(
                this.form,
                'הרישום הושלם בהצלחה! ברוכה הבאה לקבוצה שלנו 💖'
            );
        } else {
            // אם אין AuthManager, נציג הודעה פשוטה
            alert('הרישום הושלם בהצלחה! ברוכה הבאה לקבוצה שלנו 💖');
        }

        this.form.reset();

        if (typeof AuthManager.clearFormErrors === 'function') {
            AuthManager.clearFormErrors(this.form);
        }

        this.resetButton(submitBtn);

        setTimeout(() => {
            alert('ברוכה הבאה! כעת תועברי לעמוד הבית של הקבוצה');
            // כאן תוכלי להוסיף מעבר לעמוד הבית
        }, 2000);
    }

    resetForm() {
        if (this.form) {
            this.form.reset();
            if (typeof AuthManager.clearFormErrors === 'function') {
                AuthManager.clearFormErrors(this.form);
            }
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