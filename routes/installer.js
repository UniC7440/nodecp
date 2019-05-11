const { readFileSync } = require('fs');

module.exports = {
  method: 'get',
  route: '/installer',
  exec: function(request, response) {
    let databases = JSON.parse(readFileSync(request.baseDir + '/data/database.json'));

    if (request.WEB_CONFIG.databases.length === databases.installed.length)
      return response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/` : '/');

    // Render the .ejs file with the `request` property
    response.render(`themes/${request.session.THEMES ? request.session.THEMES[0] : request.WEB_CONFIG.themes[0]}/public/install`, {
      request,
      expressFlash: request.flash('success')
    });
  }
};
