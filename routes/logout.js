const WEB_CONFIG = require('../config/web');

module.exports = {
  method: 'get',
  route: '/logout',
  exec: function(request, response) {
    if (!request.session.loggedin) {
      response.redirect(WEB_CONFIG.baseURI ? `/${WEB_CONFIG.baseURI}/` : '/');
      return response.end();
    }

    request.session.loggedin = false;
    request.session.username = null;

    response.redirect(WEB_CONFIG.baseURI ? `/${WEB_CONFIG.baseURI}/` : '/');
    return response.end();
  }
};