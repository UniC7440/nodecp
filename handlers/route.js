// Modules
const Moment = require('moment');
const { readFileSync } = require('fs');
const path = require('path');

// Load configs
const SERVER_CONFIG = require('../config/server');

module.exports = {
  exec: function(app, dynamicStatic, RouteData) {
    let WEB_CONFIG = JSON.parse(readFileSync(RouteData.baseDir + '/config/web.json'));
    let route = WEB_CONFIG.baseURI ? `/${WEB_CONFIG.baseURI}${RouteData.route}` : RouteData.route;

    app[RouteData.method.toLowerCase()](route, async function(request, response, next) {

      // Make the config global
      // Had to redefine so it's value is not static.
      request.WEB_CONFIG = JSON.parse(readFileSync(RouteData.baseDir + '/config/web.json'));

      // Check whether we are on renewal or not
      request.isRenewal = SERVER_CONFIG.Renewal || false;

      // Make the Moment Module accessible to every page
      request.moment = Moment;

      // Make the MYSQL Connection available to every page
      request.mysql = RouteData.mysql;

      // Get the version of nodecp
      request.VERSION = require('../package.json').version;

      // Make the baseDir global
      request.baseDir = RouteData.baseDir;

      // Theme handler
      dynamicStatic.setPath(path.resolve(RouteData.baseDir + `/views/themes/${request.session.THEMES ? request.session.THEMES[0] : WEB_CONFIG.themes[0]}`));

      // For install database system
      if (!route.includes('/installer')) {
        for (var database of request.WEB_CONFIG.databases) {
          let databases = JSON.parse(readFileSync(request.baseDir + '/data/database.json')).installed;

          if (!databases.includes(database.name) || !request.mysql.hasTable(database.name)) {
            return response.redirect(`${request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/installer` : '/installer'}`)
            break;
          }
        }
      }

      RouteData.exec(request, response, next);
    });
  }
};
