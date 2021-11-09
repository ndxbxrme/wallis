const modal = (name, data) => {
  const modalElm = document.querySelector('modal');
  const open = (ctrl) => {
    modalElm.className = modalElm.className.replace(/\s*hidden/g, '');
    modalElm.children[0].innerHTML = window.app.fillTemplate(window.app.$(`script#modal-${name}-index`).innerText, data);
    document.body.className += ' blurred';
    return new Promise((resolve, reject) => {
      const changePage = (page) => {
        modalElm.children[0].innerHTML = window.app.fillTemplate(window.app.$(`script#modal-${name}-${page}`).innerText, data);
      }
      const close = (shouldReject) => {
        modalElm.className += ' hidden';
        document.body.className = document.body.className.replace(/\s*blurred/g, '');
        if(shouldReject)
          return reject();
        resolve(data);
      }
      window.modal = {changePage, close};
      if(ctrl) ctrl(window.modal, name, data);
    });
  }
  return {open}
}
module.exports = modal;