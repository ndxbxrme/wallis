require('./configure-amplify.js');
import jwt_decode from 'jwt-decode';
const {Auth} = require('aws-amplify');
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import './index.css';
const auth = {user:null};

console.clear();
const App = async () => {
  const base = {name:'', targets:null};
  const useHash = /\.html/.test(document.baseURI);
  let prevPage = null;
  const setState = () => {
    if(prevPage && controllers[prevPage] && controllers[prevPage].unload) controllers[prevPage].unload();
    let [page, ...params] = (useHash && window.location.hash.replace('#', '').replace(/^\//, '') || window.location.pathname.replace(/^\//, '')).replace(base.name, '').split(/\//g);
    prevPage = page;
    console.log('set state', page);
    page = Object.keys(controllers).includes(page) ? page : 'dashboard';
    ['dashboard','login','drawing','editor'].map(page => document.querySelector('#' + page)).forEach(elm => (elm.style.zIndex = -1) || (elm.style.visibility = 'hidden'));
    document.querySelector('#' + page).style.zIndex = 1;
    document.querySelector('#' + page).style.visibility = 'visible';
    if(controllers[page].start) controllers[page].start(params);
  }
  window.addEventListener('popstate', setState);
  const controllers = {}
  controllers.goto = (route) => {
    if(useHash) document.location.hash = route;
    else {
      route = document.location.origin + '/' + route.replace(/^\//, '');
      route !== document.location.pathname && window.history.pushState(route, null, route);
    }
    setState();
  };
  const evalInContext = (str, context) => {
    return (new Function(`with(this) {return ${str}}`)).call(context);
  };
  controllers.evalInContext = evalInContext;
  controllers.fillTemplate = (template, data) => {
    return template.replace(/\{\{(.+?)\}\}/g, function(all, match) {
      return evalInContext(match, data);
    });
  };
  controllers.signOut = async () => {
    await Auth.signOut();
    controllers.goto('login');
  };
  controllers.$ = (selector, elm) => (elm || document).querySelector(selector);
  controllers.$$ = (selector, elm) => Array.from((elm || document).querySelectorAll(selector));
  controllers.login = await require('./components/login.js')(controllers, auth);
  controllers.dashboard = await require('./components/dashboard.js')(controllers, auth);
  controllers.editor = await require('./components/editor.js')(tippy, auth);
  await controllers.editor.start({firstStart:true});
  controllers.drawing = {};
  setTimeout(async () => {
    try {
      auth.user = await Auth.currentAuthenticatedUser();
    } catch(e) {}
    if(auth.user) {
      auth.user.data = jwt_decode(auth.user.signInUserSession.idToken.jwtToken);
      setState();
    }
    else controllers.goto('login');
  })
  return controllers;
}

(async () => {
  window.app = await App();
})();