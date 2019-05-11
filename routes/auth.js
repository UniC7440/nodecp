const axios = require('axios');

module.exports = {
  method: 'post',
  route: '/auth',
  exec: async function(request, response, next) {
    if (request.WEB_CONFIG.recaptcha.enabled) {

      // If already logged in, throw an error
      if (request.session.loggedin) {
        request.flash('success', 'alr_loggedin');
        return response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/login` : '/login');
      }

      if (!request.body['g-recaptcha-response']) {
        request.flash('success', 'no_captcha');
        return response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/login` : '/login');
      } else {
        let gResponse = await axios({
          method: 'post',
          url: `https://www.google.com/recaptcha/api/siteverify?secret=${request.WEB_CONFIG.recaptcha.secretKey}&response=${request.body['g-recaptcha-response']}&remoteip=${request.connection.remoteAddres}`
        });

        if (!gResponse.data.success) {
          request.flash('success', 'captcha_fail');
          response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/login` : '/login');
        } else {
          if (!request.mysql.has('login', 'userid', request.body.username.toLowerCase())) {
            request.flash('success', 'acc_notexist');
            response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/login` : '/login');

            response.end();
          } else {
            request.session.account = request.mysql.get('login', 'userid', request.body.username)[0];
            request.session.loggedin = true;

            response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/` : '/');
            response.end();
          }
        }
      }
    } else {
      // If already logged in, throw an error
      if (request.session.loggedin) {
        request.flash('success', 'alr_loggedin');
        return response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/login` : '/login');
      }

      if (!request.mysql.has('login', 'userid', request.body.username.toLowerCase())) {
        request.flash('success', 'acc_notexist');
        response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/login` : '/login');

        response.end();
      } else {
        request.session.account = request.mysql.get('login', 'userid', request.body.username)[0];
        request.session.loggedin = true;

        response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/` : '/');
        response.end();
      }
    }
  }
};
