const {Auth} = require('aws-amplify');
module.exports = async (app, auth) => {
  const submit = async () => {
    event.preventDefault();
    const username = document.querySelector('input[name=username]').value;
    const password = document.querySelector('input[name=password]').value;
    const newPassword = document.querySelector('input[name=newPassword]').value;
    const repeatPassword = document.querySelector('input[name=repeatPassword]').value;
    try {
      let response = null;
      if(newPassword) {
        if(newPassword!==repeatPassword) throw({code:'PasswordMismatch'})
        response = await Auth.completeNewPassword(auth.user, newPassword);
      }
      else {
        response = await Auth.signIn(username, password);
      }
      auth.user = response;
      if(response.challengeName) {
        if(response.challengeName==='NEW_PASSWORD_REQUIRED') {
          document.querySelector('.regularPassword').style.display = 'none';
          document.querySelector('.newPassword').style.display = 'flex';
          throw({code:'NewPasswordRequired'});
        }
      }
      else {
        app.goto('dashboard');
      }
    }
    catch(e) {
      console.log('error', e);
      document.querySelectorAll('.loginError').forEach(div => div.style.display = 'none');
      document.querySelector('.loginError.' + e.code).style.display = 'block';
    }
  }
  return {submit};
}