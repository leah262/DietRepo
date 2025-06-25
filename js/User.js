class User{
    constructor(firstName, lastName,id,height, weight, password){
        this.firstName=firstName;
        this.lastName=lastName;
        this.id=id;
        this.weight=weight;
        this.height=height;
        this.password=password;
        this.bmi=this.calculateBMI();
        this.init();
    }
    init(){
        let fxhr=new FXHRLHttpRequest();
        //writing to db
    }
        calculateBMI() {
        if (this.weight && this.height) {
            const heightInMeters = this.height / 100;
            const bmi = this.weight / (heightInMeters * heightInMeters);
            let bmiCategory = '';
            if (bmi < 18.5) bmiCategory = 'תת משקל';
            else if (bmi < 25) bmiCategory = 'משקל תקין';
            else if (bmi < 30) bmiCategory = 'עודף משקל';
            else bmiCategory = 'השמנה';
            return bmi;
            console.log(`BMI: ${bmi.toFixed(1)} (${bmiCategory})`);
        }
    }

}