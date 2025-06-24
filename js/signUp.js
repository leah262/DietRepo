// Signup functionality
class SignupManager {
    constructor() {
        this.form = null;
        this.isActive = false;
    }

    // Show signup template
    show() {
        const template = document.getElementById('signup-template');
        const container = document.getElementById('app-container');
        
        // Clear container and add signup template
        container.innerHTML = '';
        const clone = template.content.cloneNode(true);
        container.appendChild(clone);
        
        this.form = document.getElementById('signupForm');
        this.isActive = true;
        this.bindEvents();
    }

    // Hide signup template
    hide() {
        const container = document.getElementById('app-container');
        container.innerHTML = '';
        this.isActive = false;
        this.form = null;
    }

    // Bind all signup events
    bindEvents() {
        if (!this.form) return;

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Switch to login
        const switchToLogin = document.getElementById('switchToLogin');
        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToLogin();
            });
        }

        // Real-time validation
        const inputs = this.form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.hideError(input));
        });

        // BMI calculation
        const weightInput = document.getElementById('weight');
        const heightInput = document.getElementById('height');
        if (weightInput && heightInput) {
            weightInput.addEventListener('input', () => this.calculateBMI());
            heightInput.addEventListener('input', () => this.calculateBMI());
        }
    }

    // Switch to login form
    switchToLogin() {
        this.hide();
        if (window.loginManager) {
            window.loginManager.show();
        }
    }

    // Form validation functions
    validateID(id) {
        if (id.length !== 9 || isNaN(id)) return false;
        
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            let digit = parseInt(id[i]);
            if (i % 2 === 1) {
                digit *= 2;
                if (digit > 9) digit = Math.floor(digit / 10) + (digit % 10);
            }
            sum += digit;
        }
        return sum % 10 === 0;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        return password.length >= 6;
    }

    validateName(name) {
        return name.trim().length >= 2 && /^[א-תa-zA-Z\s]+$/.test(name);
    }

    validateHeight(height) {
        return height >= 120 && height <= 220;
    }

    validateWeight(weight) {
        return weight >= 30 && weight <= 300;
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
        
        // Hide after 5 seconds
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 5000);
    }

    // Individual field validation
    validateField(input) {
        const value = input.value.trim();
        let isValid = true;
        
        switch(input.name) {
            case 'firstName':
            case 'lastName':
                if (!this.validateName(value)) {
                    this.showError(input, 'שם חייב להכיל לפחות 2 תווים ורק אותיות');
                    isValid = false;
                }
                break;
                
            case 'idNumber':
                if (!this.validateID(value)) {
                    this.showError(input, 'מספר תעודת זהות לא תקין');
                    isValid = false;
                }
                break;
                
            case 'email':
                if (!this.validateEmail(value)) {
                    this.showError(input, 'כתובת מייל לא תקינה');
                    isValid = false;
                }
                break;
                
            case 'password':
                if (!this.validatePassword(value)) {
                    this.showError(input, 'סיסמה חייבת להכיל לפחות 6 תווים');
                    isValid = false;
                }
                break;
                
            case 'confirmPassword':
                const password = document.getElementById('password').value;
                if (value !== password) {
                    this.showError(input, 'הסיסמאות אינן תואמות');
                    isValid = false;
                }
                break;
                
            case 'height':
                if (!this.validateHeight(parseInt(value))) {
                    this.showError(input, 'גובה חייב להיות בין 120-220 ס"מ');
                    isValid = false;
                }
                break;
                
            case 'weight':
                if (!this.validateWeight(parseFloat(value))) {
                    this.showError(input, 'משקל חייב להיות בין 30-300 ק"ג');
                    isValid = false;
                }
                break;
        }
        
        return isValid;
    }

    // Calculate BMI
    calculateBMI() {
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value);
        
        if (weight && height) {
            const heightInMeters = height / 100;
            const bmi = weight / (heightInMeters * heightInMeters);
            
            let bmiCategory = '';
            if (bmi < 18.5) bmiCategory = 'תת משקל';
            else if (bmi < 25) bmiCategory = 'משקל תקין';
            else if (bmi < 30) bmiCategory = 'עודף משקל';
            else bmiCategory = 'השמנה';
            
            console.log(`BMI: ${bmi.toFixed(1)} (${bmiCategory})`);
        }
    }

    // Handle form submission
    handleSubmit(e) {
        e.preventDefault();
        
        // Show loading state
        const submitBtn = this.form.querySelector('.submit-btn');
        this.showLoading(submitBtn);
        
        // Validate all fields
        const inputs = this.form.querySelectorAll('input[required]');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });
        
        // Check checkboxes
        const healthyLifestyle = document.getElementById('healthyLifestyle');
        const privacy = document.getElementById('privacy');
        
        if (!healthyLifestyle.checked) {
            alert('יש לאשר את ההתחייבות לאורח חיים בריא');
            isFormValid = false;
        }
        
        if (!privacy.checked) {
            alert('יש לאשר את ההתחייבות לשמירה על פרטיות');
            isFormValid = false;
        }
        
        if (isFormValid) {
            // Simulate server request
            setTimeout(() => {
                // Collect form data
                const formData = new FormData(this.form);
                const userData = {};
                
                for (let [key, value] of formData.entries()) {
                    userData[key] = value;
                }
                
                // Add checkbox values
                userData.healthyLifestyle = healthyLifestyle.checked;
                userData.privacy = privacy.checked;
                
                console.log('User registered:', userData);
                
                // Show success message
                this.showSuccess('הרישום הושלם בהצלחה! ברוכה הבאה לקבוצה שלנו 💖');
                
                // Reset form
                this.form.reset();
                
                // Hide loading state
                this.hideLoading(submitBtn);
                
                // In a real application, you might redirect or show welcome page
                setTimeout(() => {
                    alert('ברוכה הבאה! כעת תועברי לעמוד הבית של הקבוצה');
                }, 2000);
                
            }, 2000); // Simulate 2 second server response
        } else {
            this.hideLoading(submitBtn);
        }
    }

    // Show loading state
    showLoading(button) {
        button.disabled = true;
        button.textContent = 'רושמת...';
        button.style.opacity = '0.7';
    }

    // Hide loading state
    hideLoading(button) {
        button.disabled = false;
        button.textContent = 'הצטרפי עכשיו';
        button.style.opacity = '1';
    }
}

// Create global signup manager instance
window.signupManager = new SignupManager();