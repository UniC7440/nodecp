const axios = require('axios');

module.exports = {
  method: 'post',
  route: '/signup',
  exec: async function(request, response, next) {
    if (!request.WEB_CONFIG.allowRegister) {
      request.flash('success', 'signup_disabled');
      return response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/register` : '/register');
    }

    // If already logged in, throw an error
    if (request.WEB_CONFIG.recaptcha.enabled && request.session.loggedin || request.session.loggedin) {
      request.flash('success', 'alr_loggedin');
      return response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/register` : '/register');
    }

    if (request.WEB_CONFIG.recaptcha.enabled && !request.body['g-recaptcha-response']) {
      request.flash('success', 'no_captcha');
      return response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/register` : '/register');
    } else {
      if (request.WEB_CONFIG.recaptcha.enabled) {
        let gResponse = await axios({
          method: 'post',
          url: `https://www.google.com/recaptcha/api/siteverify?secret=${request.WEB_CONFIG.recaptcha.secretKey}&response=${request.body['g-recaptcha-response']}&remoteip=${request.connection.remoteAddres}`
        });

        if (!gResponse.data.success) {
          request.flash('success', 'captcha_fail');
          return response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/login` : '/login');
        }
      }
    }

    if (request.mysql.has('login', 'userid', request.body.username.toLowerCase())) {
      request.flash('success', 'acc_exist');
      response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/register` : '/register');

      response.end();
    } else {
      if (request.WEB_CONFIG.pincodeEnabled && (!request.body.pincode || request.body.pincode.length < 4)) {
        request.flash('success', 'invalid_pin');
        return response.redirect(WEB_CONFIG.baseURI ? `/${WEB_CONFIG.baseURI}/register` : '/register');
      }

      let accountData = [
        {
          column: 'userid',
          value: request.body.username
        },
        {
          column: 'user_pass',
          value: request.body.password
        },
        {
          column: 'sex',
          value: request.body.gender
        },
        {
          column: 'email',
          value: request.body.email
        },
        {
          column: 'birthdate',
          value: request.moment(`${request.body.birthdate_year}-${request.body.birthdate_month}-${request.body.birthdate_day}`).format('YYYY-MM-DD')
        }
      ];

      if (request.WEB_CONFIG.pincodeEnabled) {
        accountData.push({ column: 'pincode', value: request.body.pincode });
      }

      request.mysql.setMultiple('login', accountData);

      request.session.account = request.mysql.getNoCache('login', 'userid', request.body.username)[0];
      request.flash('success', 'acc_done');
      response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/register` : '/register');

      response.end();
    }
  }
};
