module.exports = {
  method: 'get',
  route: '/register',
  exec: function(request, response) {
    // Render the .ejs file with the `request` property
    response.render(`themes/${request.session.THEMES ? request.session.THEMES[0] : request.WEB_CONFIG.themes[0]}/public/register`, {
      request,
      expressFlash: request.flash('success')
    });
  }
};
