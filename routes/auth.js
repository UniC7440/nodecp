const axios = require('axios');

module.exports = {
  method: 'post',
  route: '/auth',
  exec: async function(request, response, next) {
      // If already logged in, throw an error
      if (request.WEB_CONFIG.recaptcha.enabled && request.session.loggedin || request.session.loggedin) {
        request.flash('success', 'alr_loggedin');
        return response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/login` : '/login');
      }

      if (request.WEB_CONFIG.recaptcha.enabled && !request.body['g-recaptcha-response']) {
        request.flash('success', 'no_captcha');
        return response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/login` : '/login');
      } else {
        if (request.WEB_CONFIG.recaptcha.enabled) {
          let gResponse = await axios({
            method: 'post',
            url: `https://www.google.com/recaptcha/api/siteverify?secret=${request.WEB_CONFIG.recaptcha.secretKey}&response=${request.body['g-recaptcha-response']}&remoteip=${request.connection.remoteAddres}`
          });

          if (!gResponse.data.success) {
            request.flash('success', 'captcha_fail');
            response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/login` : '/login');
          }
        }
      }

      if (!request.mysql.has('login', 'userid', request.body.username.toLowerCase())) {
        request.flash('success', 'acc_notexist');
        response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/login` : '/login');

        response.end();
      } else {
        let account = request.mysql.getNoCache('login', 'userid', request.body.username)[0];

        if (request.body.password !== account.user_pass) {
          request.flash('success', 'acc_wrongpass');
          return response.redirect(request.get('referrer'));
        }
        
        if (request.WEB_CONFIG.pincodeEnabled && account.pincode && request.body.pincode !== account.pincode) {
          request.flash('success', 'wrong_pin');
          return response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/login` : '/login');
        };

        request.session.account = account;
        request.session.loggedin = true;

        response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/` : '/');
        response.end();
      }
  }
};
