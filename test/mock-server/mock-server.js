var express = require('express');
var path = require('path');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');

var handlebars = require('handlebars');
var exphbs = require('express-handlebars');

const chalk = require('chalk');

const { Server } = require('https');

function MockServer(module) {
  var server;
  var routes = require('./routes/index').router;
  var config = require('./routes/index').config;
  var _port;
  var _initializationDoneCallback;

  function init(port = 9999, done) {
    _port = port;
    _initializationDoneCallback = done;
    console.log(chalk.blue(`[MockServer] init with port: ${port}`));
    var app = express();

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
    app.set('view engine', 'handlebars');

    // uncomment after placing your favicon in /public
    //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    //app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    //app.use(express.static(path.join(__dirname, 'public')));

    app.use('/', routes);

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
      console.log(chalk.blue(`[MockServer] Error 404 for: ${req.originalUrl}`));
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
      app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
          message: err.message,
          error: err
        });
      });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: {}
      });
    });

    app.set('port', port);
    server = http.createServer(app);

    /**
     * Listen on provided port, on all network interfaces.
     */

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
  }

  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = typeof _port === 'string'
      ? 'Pipe ' + _port
      : 'Port ' + _port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(chalk.blue(`[Mock-Server] ${bind} requires elevated privileges`));
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(chalk.blue(`[Mock-Server] Port ${bind} is already in use`));
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  /**
   * Event listener for HTTP server "listening" event.
   */

  function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    console.log(chalk.blue('[MockServer] Listening on ' + bind));
    _initializationDoneCallback();
  }


  var self = {
    init: function(port, done) {
      init(port, done);
    },
    reset: function() {
      config.loggedIn = false;
    },
    getServer: function () {
      return server;
    },
    setErrorDuringFetchOfCsrfToken: function (value) {
      config.errorDuringFetchOfCsrfToken = value;
    }
  };
  return self;
}

module.exports = MockServer;