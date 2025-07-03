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
        document.addEventListener('pageLoaded', (e) => {
            if (e.detail.pageName === 'signUp') {
                this.setupSignUpPage();
            }
        });
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
        this.validateSingleField();
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
        const formData = AuthManager.collectFormData(this.form);
        console.log("SignUp: Form data collected", formData);
        console.log("SignUp: Setting loading state");
        this.setButtonLoading(submitBtn, 'רושמת...');
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
        fxhr.open('POST', "https://fake.server/api/Users-Servers/register");
        console.log('SignUp: Sending user data:', user);
        fxhr.send(user);
        console.log('Request sent asynchronously');
    }
    onReadyStateChange(e, submitBtn) {
        console.log("SignUp: State changed to:", e.target.state);
        let fxhr = e.target;

        if (fxhr.state === 4) {
            console.log("SignUp: Request completed, response:", fxhr.response);
            this.processSignUpResponse(fxhr.response, submitBtn);
        }
    }
    processSignUpResponse(response, submitBtn) {
        try {
            let parsed = (typeof response === 'string') ? JSON.parse(response) : response;

            if (parsed && parsed.success) {
                this.handleSuccessfulSignUp(submitBtn, parsed);
            } else {
                this.resetButton(submitBtn);
                const errorMsg = parsed?.error || 'אירעה שגיאה בעת הרישום. אנא נסי שוב.';
                alert(errorMsg);
            }
        } catch (error) {
            console.error("SignUp: Error parsing response:", error);
            this.resetButton(submitBtn);
            alert('אירעה שגיאה בעיבוד התגובה. אנא נסי שוב.');
        }
    }
    handleSuccessfulSignUp(submitBtn, response) {
        console.log("SignUp: Handling successful registration");
        const userData = {
            id: response.data?.id || response.id,
            email: response.data?.email || response.email,
            firstName: response.data?.firstName,
            lastName: response.data?.lastName
        };
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        console.log("User data saved to sessionStorage:", userData);
        alert('הרישום הושלם בהצלחה! ברוכה הבאה לקבוצה שלנו 💖');
        this.form.reset();
        this.resetButton(submitBtn);
        setTimeout(() => {
            console.log("Switching to diary page");
            switchPage('diary');
        }, 1000);
    }
    resetForm() {
        if (this.form) {
            this.form.reset();
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