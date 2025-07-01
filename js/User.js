
class User{
    constructor(firstName, lastName,email,height, weight, password){
        this.firstName=firstName;
        this.lastName=lastName;
        this.email=email;
        this.weight=weight;
        this.height=height;
        this.password=password;
        this.bmi=this.calculateBMI();
        this.bmiCategory=null;
    }
        calculateBMI() {
        if (this.weight && this.height) {
            const heightInMeters = this.height / 100;
            const bmi = this.weight / (heightInMeters * heightInMeters);
            if (bmi < 18.5) this.bmiCategory = 'תת משקל';
            else if (bmi < 25) this.bmiCategory = 'משקל תקין';
            else if (bmi < 30) this.bmiCategory = 'עודף משקל';
            else this.bmiCategory = 'השמנת יתר!!';
            return bmi;
        }
    }

}

export default User;