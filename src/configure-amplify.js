import {Auth, API, Storage} from 'aws-amplify'
const config = require('./config.json');
Auth.configure({
  userPoolId: config.cognito.userPoolId,
  userPoolWebClientId: config.cognito.userPoolWebClientId,
  mandatorySignIn: true,
  region: config.cognito.region
});
API.configure({
  endpoints: [{
    name: 'WallisAPI',
    endpoint: config.api.url,
    custom_header: async () => ({Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`})
  }]
});
Storage.configure({
  AWSS3: {
    bucket: 'wallis-app-dev',
    region: 'eu-west-1'
  }
});