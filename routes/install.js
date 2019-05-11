const { readFileSync, writeFile } = require('fs');

module.exports = {
  method: 'post',
  route: '/installer/install',
  exec: function(request, response) {
    let databases = JSON.parse(readFileSync(request.baseDir + '/data/database.json'));

    if (request.WEB_CONFIG.databases.length === databases.installed.length)
      return response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/` : '/');

    if (request.body.password !== request.WEB_CONFIG.installerPassword) {
      request.flash('success', 'wrong_pass');
      return response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/installer` : '/installer');
    } else {
      for (var database of request.WEB_CONFIG.databases) {
        if (databases.installed.includes(database.name) && request.mysql.hasTable(database.name))
          continue;
        else if (databases.installed.includes(database.name) && !request.mysql.hasTable(database.name)) {
          request.mysql.db.query(database.query);
          continue;
        } else if (!databases.installed.includes(database.name) && request.mysql.hasTable(database.name)) {
          databases.installed.push(database.name);
          writeFile(`${request.baseDir}/data/database.json`, JSON.stringify(databases, null, 2), function(err) {
            if (err) {
              console.log(err);
            };
          });
          continue;
        } else {
          databases.installed.push(database.name);
          request.mysql.db.query(database.query);
          writeFile(`${request.baseDir}/data/database.json`, JSON.stringify(databases, null, 2), function(err) {
            if (err) {
              console.log(err);
            };
          });

          continue;
        }
      }

      return response.redirect(request.WEB_CONFIG.baseURI ? `/${request.WEB_CONFIG.baseURI}/` : '/');
    };
  }
};
