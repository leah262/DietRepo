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
        // document.addEventListener('pageLoaded', (e) => {
        //     if (e.detail.pageName === 'signUp') {
                this.setupSignUpPage();
        //     }
        // });
    }

    setupSignUpPage() {
        // המתנה קצרה לוודא שהעמוד נטען במלואו
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
        
        // אם זה שדה אישור סיסמה, צריך לקחת גם את הסיסמה המקורית
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
        console.log("submit");
        
        e.preventDefault();
        const submitBtn = this.form.querySelector('.submit-btn');
        AuthManager.setButtonLoading(submitBtn, 'רושמת...');
        const formData = AuthManager.collectFormData(this.form);
        const validation = AuthManager.validateSignUpForm(formData);
                    this.processSignUp(formData, submitBtn);
        // if (validation.isValid) {
        //     this.processSignUp(formData, submitBtn);
        // } else {
        //     AuthManager.showFormErrors(this.form, validation.errors);
        //     AuthManager.resetButton(submitBtn);
        // }
    }

    processSignUp(userData, submitBtn) {
        // כאן תטפלי ברישום המשתמש בפועל
        // לדוגמה: שליחה לשרת, שמירה במסד נתונים וכו'
        
        let user =new User(userData.firstName,userData.lastName,userData.email,userData.height,userData.weight,userData.password)
        let fxhr=new FXMLHttpRequest();
        fxhr.addEventListener('onReadyStateChange', (e)=>{
            let fxhr=e.target
            console.log(fxhr.state);
        })
        fxhr.open('GET',"basicURL")
        console.log('User data ready for registration:', userData);
        console.log(user);
        setTimeout(() => {
            this.handleSuccessfulSignUp(submitBtn);
        }, 1500);
    }

    handleSuccessfulSignUp(submitBtn) {
        AuthManager.showSuccessMessage(
            this.form, 
            'הרישום הושלם בהצלחה! ברוכה הבאה לקבוצה שלנו 💖'
        );
        this.form.reset();
        AuthManager.clearFormErrors(this.form);
        AuthManager.resetButton(submitBtn);
        setTimeout(() => {
            alert('ברוכה הבאה! כעת תועברי לעמוד הבית של הקבוצה');
        }, 2000);
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