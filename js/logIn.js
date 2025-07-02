import AuthManager from './AurhManager.js';
import { switchPage } from './App.js';
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
        this.validateSingleField();
    }
    validateSingleField(input) {
        const fieldName = input.name;
        const fieldValue = input.value;
        const validation = AuthManager.validateLoginField(fieldName, fieldValue);
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
        const formData = AuthManager.collectFormData(this.form);
        console.log("Login: Form data collected", formData);
        this.setButtonLoading(submitBtn, 'מתחברת...');
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
            console.log("in state event listner");
            //here try around all  
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
            //check if its 200
            console.log("Login: Request completed, response:", fxhr.response);
            this.processLoginResponse(fxhr.response, submitBtn);
        }
    }

    processLoginResponse(response, submitBtn) {
        try {
            const parsed = (typeof response === 'string') ? JSON.parse(response) : response;

            if (parsed?.success) {
                console.log("Login: Login successful");
                this.handleSuccessfulLogin(submitBtn, parsed);
            } else {
                this.resetButton(submitBtn);
                console.error("Login: Login failed:", parsed);
                this.alertLoginError(parsed?.error);
            }
        } catch (error) {
            console.error("Login: Error parsing response:", error);
            this.resetButton(submitBtn);
            alert('אירעה שגיאה בעיבוד התגובה. אנא נסי שוב.');
        }
    }

    alertLoginError(errorMsg) {
        switch (errorMsg) {
            case 'User not found':
                alert('משתמש לא נמצא. אנא בדקי את כתובת המייל או הירשמי.');
                break;
            case 'Invalid password':
                alert('סיסמה שגויה. אנא נסי שוב.');
                break;
            default:
                alert(errorMsg || 'שגיאה בהתחברות. אנא בדקי את הפרטים ונסי שוב.');
        }
    }
    handleSuccessfulLogin(submitBtn, response) {
        console.log("Login: Handling successful login");
        const userData = {
            id: response.data?.id || response.id,
            email: response.data?.email || response.email,
            firstName: response.data?.firstName,
            lastName: response.data?.lastName
        };
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        console.log("User data saved to sessionStorage:", userData);
        alert('התחברת בהצלחה! ברוכה השבה 💖');
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
        const validation = AuthManager.validateLoginForm(formData);
        return validation.isValid;
    }
}
const loginManager = new LoginManager();
loginManager.init();
export default loginManager;