import FXMLHttpRequest from "./FXMLHttpRequest";
class AuthManager{
    logIn(userName, userPassword){
        let fxhr=new FXMLHttpRequest();
        fxhr.open('GET',"http/blablabla/login");
    }
}
export default new AuthManager();