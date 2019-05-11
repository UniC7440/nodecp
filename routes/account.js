module.exports = {
  method: 'get',
  route: '/account',
  exec: function(request, response) {

    // If not logged in, throw an error
    if (!request.session.loggedin) {
      request.flash('success', 'not_loggedin');
      return response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/login` : '/login');
    }

    // Render the .ejs file with the `request` property
    response.render(`themes/${request.session.THEMES ? request.session.THEMES[0] : request.WEB_CONFIG.themes[0]}/public/account`, {
      request
    });
  }
};
