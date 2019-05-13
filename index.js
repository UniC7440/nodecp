// Web Server
const express = require('express');
const app = express();

// For our sessions
const session = require('express-session');

// Extra Modules for Functionallity
const Walk = require('walk');
const RouteHandler = require('./handlers/route');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const Mysql = require('./handlers/mysql');
const { readFileSync, watch } = require('fs');
const dynamicStatic = require('express-dynamic-static')();
const slash = require('express-slash');

// Load configs
const SERVER_CONFIG = require('./config/server');
const WEB_CONFIG = JSON.parse(readFileSync('./config/web.json'));

// Set our View Engine
app.set('view engine', 'ejs');
app.use(dynamicStatic);

// Use the Flash module
app.use(flash());

// Allow usage of sessions
let sessionData = WEB_CONFIG.cacheAge < 1 ? {
  secret: WEB_CONFIG.secret,
	resave: true,
  saveUninitialized: false
} : {
  secret: WEB_CONFIG.secret,
	resave: true,
  saveUninitialized: false,
  cookie: { maxAge: WEB_CONFIG.cacheAge }
};

app.use(session(sessionData));

// Body parser so we read x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());

// Connect to the mysql server ONCE.
const mysql = new Mysql(SERVER_CONFIG.mysql.host, SERVER_CONFIG.mysql.user, SERVER_CONFIG.mysql.pass, SERVER_CONFIG.mysql.port, SERVER_CONFIG.mysql.database);

// Get the routes in /routes
Walk.walk(__dirname + '/routes')
.on('files', function(base, files) {
  for (var file of files) {
    let RouteData = require(`${base}/${file.name}`);

    // Throw an error if they didn't place a method
    if (!RouteData.method)
      throw new Error('invalid method: undefined');

    // If they didn't place a route, make it the home "/"
    if (!RouteData.route) RouteData.route = '/';

    // Don't touch.
    RouteData.mysql = mysql;

    // Base dir
    RouteData.baseDir = __dirname;

    // Route loader
    RouteHandler.exec(app, dynamicStatic, RouteData);
  }
});

// Create the web server.
app.listen(WEB_CONFIG.port, function() {
  console.log(`Now listening to port: ${WEB_CONFIG.port}\nHome Dir is in the /${WEB_CONFIG.baseURI} dir.`);
});
