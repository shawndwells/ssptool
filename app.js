/*! vim: set et sw=4 :*/

var express = require('express')
  , path = require('path')
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , package = require('./package.json')
  , routes = require('./routes')
  , app = express()
  ;

function basepath (p) { return path.join(__dirname, p); }

/** Add logging middleware based on NODE_ENV
 */
function chooseLogger (app) {
    let env = app.get('env');
    if (env === 'development') {
    	app.use(logger('dev'));
    } else if (env !== 'test') {
    	app.use(logger('combined'));
    }
}

function notFoundHandler (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
};

function errorHandler (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
};

app.set('views', basepath('views'));
app.set('view engine', 'pug');

app.locals.appname = package.name;
app.locals.appversion = package.version;

app.use(favicon(basepath('public/favicon.ico')));
chooseLogger(app);
app.use(express.static(basepath('public'), { maxAge: 1000 * 60 * 60 }));
app.use(routes.router);
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Initialization.
 *
 * @param (opencontrol.Database) db
 * @param config - not yet used
 */

app.initialize = function (db, config) {
    app.set('db', db);
    app.set('sitemap', routes.sitemap(db));
    app.locals.appurl = routes.appurl
}

module.exports = app;
