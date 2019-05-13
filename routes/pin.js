module.exports = {
  method: 'post',
  route: '/pin',
  exec: function(request, response) {
    if (!request.WEB_CONFIG.pincodeEnabled) {
      request.flash('success', 'pin_disabled');
      return response.redirect(request.get('referrer'));
    } else if (!request.session.loggedin) {
      request.flash('success', 'not_loggedin');
      return response.redirect(request.get('referrer'));
    } else if (request.session.account.user_pass !== request.body.password) {
      request.flash('success', 'acc_wrongpass');
      return response.redirect(request.get('referrer'));
    } else if (request.session.account.pincode && !request.body.old_pincode) {
      request.flash('success', 'wrong_oldpin');
      return response.redirect(request.get('referrer'));
    } else if (!request.session.account.pincode && !request.body.new_pincode) {
      request.flash('success', 'wrong_newpin');
      return response.redirect(request.get('referrer'));
    } else {
      request.mysql.editMultiple('login', 'account_id', request.session.account.account_id, [
        {
          column: 'pincode',
          value: parseInt(request.body.new_pincode)
        }
      ]);
      request.session.account = request.mysql.get('login', 'account_id', request.session.account.account_id)[0];
      request.flash('success', 'done');
      return response.redirect(request.get('referrer'));
    }
  }
};
